import { createApp } from '../app'
import auth from './auth'
import posts from './posts'
import examples from './examples'

const app = createApp()

app.route('/auth', auth)
app.route('/posts', posts)
app.route('/examples', examples)

export default app
