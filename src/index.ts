import { serve } from '@hono/node-server'
import { showRoutes } from 'hono/dev'
import { ZodError } from 'zod'
import { HTTPException } from 'hono/http-exception'
import 'dotenv/config'
import { createApp } from './app'
import controllers from './controllers'

const app = createApp()

app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json({ message: 'Validation error', errors: err.flatten().fieldErrors }, 400)
  }
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status)
  }

  console.log(err)
  return c.json({ message: 'Internal server error', errors: err }, 500)
})

app.use(async (c, next) => {
  await next()

  if (c.res.status === 404) {
    return
  }
  const res = await c.res?.json()
  if ('error' in res && 'name' in res.error && res.error?.name === 'ZodError')
    throw new ZodError(res.error.issues)
})

app.route('', controllers)

const port = 3000
console.log(`Server is running on port ${port}. Available routes:`)
showRoutes(app)

serve({
  fetch: app.fetch,
  port,
})
