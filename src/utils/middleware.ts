import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import type { Session, User } from 'lucia'
import { lucia } from './auth'

export const authMiddleware = createMiddleware<{
  Variables: {
    user: User
    session: Session
  }
}>(async (c, next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName)
  if (!sessionId) {
    throw new HTTPException(401, { message: 'Not logged in' })
  }

  const { session, user } = await lucia.validateSession(sessionId)
  if (!session) {
    c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), { append: true })
    throw new HTTPException(401, { message: 'Session expired' })
  }
  else if (session.fresh) {
    c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), { append: true })
  }

  c.set('session', session)
  c.set('user', user)
  await next()
})
