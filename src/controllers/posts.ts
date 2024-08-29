import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { zValidator } from '@hono/zod-validator'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { string } from 'zod'
import { db } from '../db'
import { posts } from '../db/schema'
import { createApp } from '../app'

const createPostSchema = createInsertSchema(posts).extend({
  content: string().min(1).max(1000),
})

const app = createApp()

app.get('/', async (c) => {
  return c.json(await db.select().from(posts))
})

app.get('/:id', zValidator('param', createSelectSchema(posts), (result, c) => {
  if (!result.success) {
    return c.json({ message: 'Post not found' }, 404)
  }
}), async (c) => {
  const { id } = c.req.valid('param')
  const res = (await db.select().from(posts).where(eq(posts.id, id)))[0]
  if (!res) {
    return c.json({ message: 'Post not found' }, 404)
  }
  return c.json(res)
})

app.post('/', zValidator('form', createPostSchema), async (c) => {
  const form = c.req.valid('form')
  return c.json((await db.insert(posts).values(form).returning())[0])
})

export default app
