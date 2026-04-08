# Event Task Manager

Login and dashboard for the Event Task Manager (full-stack). Add events and tasks later.

## Run the project

### 1. Backend (API)

```bash
cd server
npm install
npm run dev
```

Server runs at **http://localhost:4000**. Optional: copy `server/.env.example` to `server/.env` and set `JWT_SECRET`.

### 2. Frontend (React)

In a new terminal:

```bash
cd client
npm install
npm run dev
```

App runs at **http://localhost:5173**. The Vite dev server proxies `/api` to the backend.

## Demo login

- **Email:** `abc@vemanait.edu.in`
- **Password:** `password123`

After signing in you’ll see the dashboard. Use **Sign out** to return to the login page.

## Project layout

- `server/` – Express API (login, JWT auth)
- `client/` – React (Vite) app: login page + dashboard
