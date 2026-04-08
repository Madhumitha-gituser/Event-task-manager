# Deploying Event Task Manager

## Overview

- **Frontend:** static build (Vite) — Vercel, Netlify, Cloudflare Pages, S3+CDN, etc.
- **Backend:** Node Express API — Railway, Render, Fly.io, a VPS, etc.

## Backend

1. Set environment variables (see `server/.env.example`):
   - `JWT_SECRET` — strong random string
   - `CLIENT_ORIGIN` — your deployed frontend URL(s), e.g. `https://myapp.vercel.app`
2. Start with `npm start` (or your host’s start command: `node src/index.js`).
3. Note the public API URL (e.g. `https://api.myapp.railway.app`).

## Frontend

1. Set `VITE_API_BASE` to your **public API origin** (no trailing slash), e.g. `https://api.myapp.railway.app`.
2. Build: `cd client && npm run build`.
3. Deploy the `client/dist` folder to your static host.

If the static host can reverse-proxy `/api` to the backend, you can leave `VITE_API_BASE` empty and proxy `/api` → API server (similar to Vite dev server).

## Local production-style check

Terminal 1 — API on 4000 with `CLIENT_ORIGIN=http://localhost:5173`.

Terminal 2:

```bash
cd client
npm run build
npm run preview
```

With empty `VITE_API_BASE`, ensure `vite.config.js` `preview.proxy` points `/api` to your API (already configured for port 4000).

## Tests (API)

```bash
cd server
npm test
```
