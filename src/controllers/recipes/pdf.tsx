import puppeteer from 'puppeteer'
import { stream } from 'hono/streaming'
import { createApp } from '../../app'

const app = createApp()

function render(children: string) {
  return `<script src="https://cdn.tailwindcss.com"></script>
  <body class="p-4">${children}</body>`
}

app.post('/', async (c) => {
  const datetime = new Date().toLocaleString()

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(render(`
    <p>This file was generated on ${datetime}.</p>
  `))
  const pdf = await page.pdf()

  await browser.close()
  c.header('Content-Type', 'application/pdf')
  c.header('Content-Disposition', `attachment; filename="${datetime}.pdf"`)

  return stream(c, async (stream) => {
    stream.onAbort(() => {
      stream.abort()
    })

    await stream.write(pdf)
  })
})

export default app
