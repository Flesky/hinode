import { createApp } from '../app'
import auth from './auth'
import posts from './posts'

const app = createApp()

app.route('/auth', auth)
app.route('/posts', posts)

export default app
