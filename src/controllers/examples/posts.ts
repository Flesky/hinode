import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { db } from '../../db'
import { posts } from '../../db/schema'
import { createApp } from '../../app'
import { auth } from '../../middleware/auth'

const selectPostSchema = z.object({
  id: z.string().transform(id => Number(id)).pipe(z.number().min(1)),
})

const selectPostByUserSchema = z.object({
  userId: z.string().length(15),
})

const postSchema = createInsertSchema(posts).omit({
  userId: true,
}).extend({
  content: z.string().min(1, 'Content is required').max(1000, 'Content is too long'),
})

const app = createApp()

app.get('/', async (c) => {
  return c.json(await db.select().from(posts))
})

app.get('/:id', zValidator('param', selectPostSchema, ({ success }, c) => !success ? c.json({ message: 'Post not found' }, 404) : undefined), async (c) => {
  const id = Number(c.req.valid('param').id)
  const res = (await db.select().from(posts).where(eq(posts.id, id)))[0]
  if (!res) {
    return c.json({ message: 'Post not found' }, 404)
  }
  return c.json(res)
})

app.get('/user/:userId', zValidator('param', selectPostByUserSchema, ({ success }, c) => !success ? c.json({ message: 'Post not found' }, 404) : undefined), async (c) => {
  const userId = c.req.param('userId')
  const res = await db.select().from(posts).where(eq(posts.userId, userId))
  return c.json(res)
})

app.post('/', auth, zValidator('form', postSchema), async (c) => {
  const form = c.req.valid('form')
  return c.json({ message: 'Post created', post: (await db.insert(posts).values({ ...form, userId: c.get('user').id }).returning())[0] })
})

app.put('/:id', auth, zValidator('param', selectPostSchema, ({ success }, c) => !success ? c.json({ message: 'Post not found' }, 404) : undefined), zValidator('form', postSchema), async (c) => {
  const id = Number(c.req.valid('param').id)
  const form = c.req.valid('form')

  const existingPost = (await db.select().from(posts).where(eq(posts.id, id)))[0]
  if (!existingPost) {
    return c.json({ message: 'Post not found' }, 404)
  }
  if (existingPost.userId !== c.get('user').id) {
    return c.json({ message: 'Cannot edit another user\'s post' }, 403)
  }

  const res = (await db.update(posts).set(form).where(eq(posts.id, id)).returning())[0]
  return c.json({ message: 'Post updated', post: res })
})

app.delete('/:id', auth, zValidator('param', selectPostSchema, ({ success }, c) => !success ? c.json({ message: 'Post not found' }, 404) : undefined), async (c) => {
  const id = Number(c.req.valid('param').id)

  const existingPost = (await db.select().from(posts).where(eq(posts.id, id)))[0]
  if (!existingPost) {
    return c.json({ message: 'Post not found' }, 404)
  }
  if (existingPost.userId !== c.get('user').id) {
    return c.json({ message: 'Cannot delete another user\'s post' }, 403)
  }

  await db.delete(posts).where(eq(posts.id, id))
  return c.json({ message: 'Post deleted' })
})

export default app
