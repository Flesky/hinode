import { createApp } from '../../app'
import fileUpload from './file-upload'
import pdf from './pdf'

const app = createApp()

app.route('/file-upload', fileUpload)
app.route('/pdf', pdf)

export default app
