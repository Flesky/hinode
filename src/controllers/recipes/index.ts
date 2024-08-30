import { createApp } from '../../app'
import pdf from './pdf'

const app = createApp()

app.route('/pdf', pdf)

export default app
