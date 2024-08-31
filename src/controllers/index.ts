import { createApp } from '../app'
import auth from './auth'
import examples from './examples'

const app = createApp()

app.route('/auth', auth)
app.route('/examples', examples)

export default app
