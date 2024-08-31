import { zValidator } from '@hono/zod-validator'
import { ZodError, z } from 'zod'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { alphabet, generateRandomString } from 'oslo/crypto'
import { createDate, isWithinExpirationDate } from 'oslo'
import type { User } from 'lucia'
import { TimeSpan } from 'lucia'
import { emailVerificationCodes, users } from '../../db/schema'
import { db } from '../../db'
import { auth } from '../../middleware/auth'
import { createApp } from '../../app'
import { lucia } from '../../utils/auth'

const emailVerificationCodeSchema = z.object({
  code: z.string().regex(/^\d{8}$/, 'Invalid verification code'),
})

export async function generateEmailVerificationCode(userId: string, email: string) {
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId))
  const code = generateRandomString(8, alphabet('0-9'))
  await db.insert(emailVerificationCodes).values({
    code,
    userId,
    email,
    expiresAt: Number(createDate(new TimeSpan(15, 'm'))),
  })
  return code
}

// TODO: Implement email sending
export async function sendVerificationCode(email: string, code: string) {
  console.log(`Email verification code for ${email}: ${code}`)
}

async function verifyVerificationCode(user: User, code: string) {
  const verificationCode = (await db.select().from(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id)))[0]
  if (!verificationCode || verificationCode.code !== code) {
    return false
  }

  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, user.id))

  if (!isWithinExpirationDate(new Date(verificationCode.expiresAt))) {
    return false
  }
  if (verificationCode.email !== user.email) {
    return false
  }
  return true
}

const app = createApp()

app.post('email-verification', auth, zValidator('form', emailVerificationCodeSchema), async (c) => {
  if (c.get('user').isEmailVerified) {
    return c.json({ message: 'Email already verified' }, 400)
  }

  const { code } = c.req.valid('form')
  const isValidCode = await verifyVerificationCode(c.get('user'), code)
  // Leverage established form error handling to simplify UI implementation.
  // If only there was a way to access context on Zod schemas inside zValidator...
  if (!isValidCode) {
    throw new ZodError([{
      code: 'custom',
      path: ['code'],
      message: 'Invalid verification code',
    }])
  }

  const userId = c.get('user').id

  await lucia.invalidateUserSessions(userId)
  await db.update(users).set({ isEmailVerified: true }).where(eq(users.id, userId))

  const session = await lucia.createSession(userId, {})
  c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize())
  return c.json({ message: 'Email verified' })
})

export default app
