import { Hono } from 'hono'
import type { HttpBindings } from '@hono/node-server'

type Bindings = HttpBindings & {}

export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>()

  return app
}
