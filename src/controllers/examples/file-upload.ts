import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { filetypemime } from 'magic-bytes.js'
import { createApp } from '../../app'

const app = createApp()

const fileUploadSchema = z.object({
  image: z.instanceof(File)
    .refine(file => file.size <= 1024 * 1024 * 5, 'File size must be less than 5 MB')
    .refine(async file => ['image/jpeg', 'image/png'].includes(
      (filetypemime(new Uint8Array(await file.arrayBuffer())))[0],
    ), 'File must be an image'),
})

app.post('/', zValidator('form', fileUploadSchema), async (c) => {
  return c.json({ message: 'File uploaded successfully' })
})

export default app
