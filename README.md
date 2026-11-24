# Student Project Hub
React + Vite + Tailwind client, Node/Express API, MongoDB (Mongoose), JWT auth.

```
npm run install:all     # installs root, server, client
cp .env.example server/.env   # Windows: copy .env.example server\.env
npm run dev             # API :5000 + client :5173 (needs MongoDB running)
npm test                # server tests (uses in-memory MongoDB)
npm run build           # production client build
```
MongoDB: install Community Server, or `docker run -d -p 27017:27017 mongo:7`.
Uploaded files are stored in `server/uploads/` (git-ignored).
**Status:** see `docs/DEVELOPMENT_PROGRESS.md` — code is written but has not yet been run.
Note: `bcryptjs` is used instead of `bcrypt` (same API, no native build on Windows).
