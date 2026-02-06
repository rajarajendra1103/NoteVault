# NoteVault

NoteVault is a simple Next.js app that provides a small notes and bookmarks backend (API) and a React/Next frontend.

---

**Contents of this README**
- Project overview
- Prerequisites
- Environment variables
- Backend & frontend setup (how to run)
- Brief API documentation (endpoints + examples)

## Prerequisites
- Node.js (v18+ recommended)
- npm (or yarn)
- MongoDB connection (Atlas or local instance)

## Environment
Create a `.env.local` file in the project root and set at minimum:

- `MONGODB_URI` — MongoDB connection string (required)

Example `.env.local`:

```
MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/notevault?retryWrites=true&w=majority"
```

## Install & Run (backend + frontend)
This repository is a single Next.js application that contains both API routes (backend) and pages/components (frontend).

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm start
```

The app will be available at `http://localhost:3000` by default.

## Brief API documentation
Base path: `/api`

Notes endpoints (implemented in `src/app/api/notes`):

- `GET /api/notes` — List all notes (sorted by `updatedAt` desc)
  - Success: `{ success: true, data: [ ...notes ] }`

- `POST /api/notes` — Create a note
  - Body (JSON): `{ title: string, content: string, [optional fields] }`
  - Required: `title`, `content`
  - Success (201): `{ success: true, data: note }`

- `GET /api/notes/:id` — Get a single note by id
  - Success: `{ success: true, data: note }` or 404 if not found

- `PUT /api/notes/:id` — Update a note by id
  - Body: partial or full note fields
  - Success: `{ success: true, data: note }` or 404

- `DELETE /api/notes/:id` — Delete a note by id
  - Success: `{ success: true, message: 'Note deleted successfully' }` or 404

Bookmarks endpoints (implemented in `src/app/api/bookmarks`):

- `GET /api/bookmarks` — List all bookmarks

- `POST /api/bookmarks` — Create a bookmark
  - Body (JSON): `{ title: string, url: string, [optional fields] }`
  - Validates `title` and `url` (basic URL regex)
  - Success (201): `{ success: true, data: bookmark }`

- `GET /api/bookmarks/:id` — Get bookmark by id

- `PUT /api/bookmarks/:id` — Update bookmark (validates `url` if present)

- `DELETE /api/bookmarks/:id` — Delete bookmark by id

Examples (using curl):

Create a note:

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"World"}'
```

List notes:

```bash
curl http://localhost:3000/api/notes
```

Get single note:

```bash
curl http://localhost:3000/api/notes/<noteId>
```

Errors are returned as `{ success: false, message: string }` with an appropriate HTTP status code.

## Notes & recommendations
- The repository currently includes development build artifacts (the `.next` folder). It is recommended to add `.next` to `.gitignore` to avoid committing build output.
- Keep `.env.local` out of the repo — do not commit credentials.

If you want, I can:
- Add or update `.gitignore` to exclude `.next`, `node_modules`, and other artifacts
- Add a small CONTRIBUTING or developer setup script
