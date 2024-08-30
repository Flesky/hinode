import puppeteer from 'puppeteer'
import { createApp } from '../../app'

const app = createApp()

function htmlTemplate(content: string) {
  return `<script src="https://cdn.tailwindcss.com"></script>
    <style>
    @page {
       size: A4;
       margin: 1in;
    }
    </style>
    <body>${content}</body>`
}

const sampleTable = [
  'Aragami',
  'Stardream',
  'Crossing Delta',
].map((name, i) => (
  <tr>
    <td class="border p-2">
      {name}
    </td>
    <td class="border p-2">John Doe</td>
    <td class="border p-2">
      {(i + 1) * 100}
    </td>
  </tr>
)).join('')

app.post('/', async (c) => {
  const datetime = new Date().toLocaleString()

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlTemplate(`
    <p>This file was generated on ${datetime}.</p>
    <table class="table-auto w-full border border-collapse mt-4">
      <thead>
        <tr>
          <th class="p-2">Title</th>
          <th class="p-2">Author</th>
          <th class="p-2">Views</th>
        </tr>
      </thead>
      <tbody>
        ${sampleTable}
      </tbody>
    </table>
  `))
  const pdf = await page.pdf()
  await browser.close()

  // TODO: Fix "TypeError: Response body object should not be disturbed or locked when stream is aborted." stream.onAbort doesn't work
  return c.body(pdf, { headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${datetime}.pdf"`,
  } })
})

export default app
