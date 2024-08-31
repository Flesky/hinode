import { createApp } from '../app'
import fileUpload from './examples/file-upload'
import pdf from './examples/pdf'
import posts from './examples/posts'
import sessions from './auth/sessions'
import emailVerification from './auth/emailVerification'

const app = createApp()

app.route('/auth', sessions)
app.route('/auth', emailVerification)

app.route('/examples/file-upload', fileUpload)
app.route('/examples/pdf', pdf)
app.route('/examples/posts', posts)

export default app
