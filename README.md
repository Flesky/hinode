# hinode
[![code style](https://antfu.me/badge-code-style.svg)](https://github.com/antfu/eslint-config)

Hinode is:
- Almost a portmanteau of Hono and Node
- A Japanese noun meaning sunrise 🌅
- sunrise = representation of me learning backend, and therefore;
- **A template for API servers using Hono on Node.js runtime**

## Features
- Slim web framework: Hono on Node.js
- Database: SQLite with Drizzle
- Schema validation: Zod
- Authentication: Lucia
- Prebuilt auth controllers and example API endpoints

## Directory structure
Feel free to move files around and create your directory structure, but for the sake of simplicity:
- controllers - API endpoints
- db - schema, adapter, and migrations
- utils - one file utilities

## How to run
```
npm install
npm run dev
```
The server is now running on `localhost:3000`
