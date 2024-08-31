import { z } from 'zod'
import { Argon2id } from 'oslo/password'
import { generateId } from 'lucia'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { db } from '../../db'
import { users } from '../../db/schema'
import { lucia } from '../../utils/auth'
import { createApp } from '../../app'
import { auth } from '../../middleware/auth'
import { generateEmailVerificationCode, sendVerificationCode } from './emailVerification'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
const app = createApp()

app.post('register', zValidator('form', authSchema.extend({
  email: authSchema.shape.email.refine(async (email) => {
    return !(await db.select().from(users).where(eq(users.email, email))).length
  }, 'Email address already in use'),
})), async (c) => {
  const { email, password } = c.req.valid('form')
  const userId = generateId(15)
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash: await (new Argon2id({})).hash(password),
  })

  const code = await generateEmailVerificationCode(userId, email)
  await sendVerificationCode(email, code)

  const session = await lucia.createSession(userId, {})
  c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize())
  return c.json({ message: 'Successfully signed up' })
})

app.post('login', zValidator('form', authSchema, ({ success }, c) => !success ? c.json({ message: 'Invalid email or password' }, 401) : undefined), async (c) => {
  const { email, password } = c.req.valid('form')
  const user = (await db.select().from(users).where(eq(users.email, email)))[0]
  if (!user || !await (new Argon2id({})).verify(user.passwordHash, password)) {
    return c.json({ message: 'Invalid email or password' }, 401)
  }

  const session = await lucia.createSession(user.id, {})
  c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize())
  return c.json({ message: 'Successfully logged in' })
})

app.use(auth)

  .get('me', async (c) => {
    return c.json(c.get('user'))
  })

  .post('logout', async (c) => {
    await lucia.invalidateSession(c.get('session').id)
    deleteCookie(c, lucia.sessionCookieName)
    return c.json({ message: 'Successfully logged out' })
  })

export default app
