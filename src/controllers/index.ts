import { createApp } from '../app'
import auth from './auth'
import posts from './posts'
import recipes from './recipes'

const app = createApp()

app.route('/auth', auth)
app.route('/posts', posts)
app.route('/recipes', recipes)

export default app
