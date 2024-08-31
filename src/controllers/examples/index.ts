import { createApp } from '../../app'
import fileUpload from './file-upload'
import pdf from './pdf'
import posts from './posts'

const app = createApp()

app.route('/file-upload', fileUpload)
app.route('/pdf', pdf)
app.route('/posts', posts)

export default app
