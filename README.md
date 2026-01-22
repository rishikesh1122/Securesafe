# SecureSafe

SecureSafe is a small full-stack vault for encrypted personal file storage. The backend uses FastAPI, SQLite, JWT auth, and per-app Fernet encryption. The frontend is a React single-page app with an animated login/register experience and a feature-rich dashboard for uploads, previews, notes, folders, trash, and inactivity-aware auto-logout.

## Project Structure
- Backend service: FastAPI under [Backend/](Backend)
- Frontend app: React (Create React App) under [frontend/](frontend)
- Encrypted payloads: written to [Backend/encrypted/](Backend/encrypted)
- Encryption key + SQLite DB: stored in [Backend/storage/](Backend/storage) and [Backend/database.db](Backend/database.db)

## Backend (FastAPI)
- Entrypoint: [Backend/main.py](Backend/main.py); auto-creates tables via SQLAlchemy and exposes REST endpoints.
- Auth: email + password with Argon2 hashing and 1-hour JWTs (see [Backend/auth.py](Backend/auth.py)).
- Data models: users, files, folders (see [Backend/models.py](Backend/models.py)).
- Schemas: Pydantic models for validation/serialization (see [Backend/schemas.py](Backend/schemas.py)).
- Crypto: Fernet symmetric encryption; key persisted at `Backend/storage/fernet.key` (see [Backend/encryption.py](Backend/encryption.py)).
- Storage: encrypted blobs saved as `<filename>.enc` in `Backend/encrypted`; metadata stored in SQLite (`Backend/database.db`).
- Soft delete: files can be moved to trash (`deleted_at` timestamp) and later restored or permanently removed (which also deletes the encrypted blob).
- CORS: allows `http://localhost:3000` and `http://localhost:3001` by default.
- File size limit: 50 MB per upload.

### API Overview (authenticated routes expect `Authorization: Bearer <token>`)
- `POST /register` — create user (email, password)
- `POST /login` — obtain JWT
- `GET /me` — current user info
- `POST /upload` — multipart file upload; encrypt + store
- `GET /download/{filename}` — decrypt + stream file
- `GET /files` — list active files
- `GET /files/deleted` — list trashed files
- `DELETE /delete/{filename}` — soft delete by filename
- `POST /files/{file_id}/restore` — restore from trash
- `DELETE /files/{file_id}/permanent` — hard delete (DB + blob)
- `PATCH /files/{file_id}/notes` — set notes
- `PATCH /files/{file_id}/folder` — set folder name
- `POST /folders` — create folder
- `GET /folders` — list folders
- `DELETE /folders/{folder_id}` — delete folder (moves contained files to root)

### Running the Backend
```bash
cd Backend
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirement.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- SQLite DB (`database.db`) and Fernet key are created on first run.
- To rotate secrets: update `SECRET_KEY` and regenerate `storage/fernet.key` (existing files would become unreadable unless re-encrypted).
- Adjust CORS origins or upload limits in [Backend/main.py](Backend/main.py).

## Frontend (React)
- Entrypoint: [frontend/src/App.js](frontend/src/App.js); routes for login, register, and dashboard.
- Pages: animated auth screens ([frontend/src/Pages/Login.jsx](frontend/src/Pages/Login.jsx), [frontend/src/Pages/Register.jsx](frontend/src/Pages/Register.jsx)); dashboard with uploads, previews, notes, foldering, trash, and inactivity logout ([frontend/src/Pages/Dashboard.jsx](frontend/src/Pages/Dashboard.jsx)).
- API client: Axios instance with automatic Bearer token injection ([frontend/src/api/api.js](frontend/src/api/api.js)); base URL `http://127.0.0.1:8000`.
- Styling: custom CSS + framer-motion animations; Tailwind dependencies are unused (global styles in [frontend/src/index.css](frontend/src/index.css)).

### Running the Frontend
```bash
cd frontend
npm install
npm start
```
- Opens at `http://localhost:3000` (uses backend at `http://127.0.0.1:8000`).
- Tokens persist in `localStorage`; a custom `authChange` event keeps auth state in sync across tabs.

## Typical Flow
1) Register and log in to receive a JWT stored in `localStorage`.
2) Upload a file (≤50 MB). The backend encrypts bytes with Fernet and stores the `.enc` blob plus metadata.
3) Manage files: add notes, move into folders, soft delete/restore, or permanently delete.
4) Download or preview: backend decrypts on the fly and serves with an inferred MIME type.

## Security Notes
- Fernet key and JWT secret are currently hard-coded/persisted locally; externalize to environment variables for production.
- No rate limiting, MFA, or email verification are present.
- Tokens expire in 1 hour; frontend also enforces a 1-minute inactivity logout with a 10-second warning.
- Keep `Backend/storage/` secure; losing `fernet.key` makes encrypted files unreadable.

## Troubleshooting
- CORS errors: update `allow_origins` in [Backend/main.py](Backend/main.py).
- Upload failures: confirm file size (<50 MB) and backend console output.
- Previews: not all MIME types render in-browser; downloads still succeed.
- DB reset: stop the app and delete `Backend/database.db` and `Backend/storage/fernet.key` (this makes existing encrypted files unreadable).

## Next Steps (ideas)
- Move secrets to environment variables and add `.env` loading.
- Add per-user encryption keys or client-side encryption.
- Implement email verification, password reset, and audit logs.
- Add pagination/search server-side for large file sets.
- Write automated tests for auth, upload/download, and folder flows.
