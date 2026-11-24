# Department Study Note & PYQ Hub

A full-stack web application for college students and faculty to upload, discover, preview, bookmark, upvote, and verify semester notes and previous-year question papers.

---

## Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS        |
| Backend  | Node.js + Express                     |
| Database | PostgreSQL + Prisma ORM               |
| Auth     | JWT (access + refresh tokens)         |
| PDF View | react-pdf (PDF.js)                    |
| Upload   | Multer (memory) + SHA-256 dedup       |

---

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (default: port 5432)

---

## Setup

### 1. Database

Create the database:
```sql
CREATE DATABASE pyq_hub;
```

### 2. Backend

```bash
cd server
# Copy and edit the env file
copy .env.example .env
# Edit DATABASE_URL with your postgres credentials

# Install dependencies
npm install

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed test data
node prisma/seed.js

# Start the dev server
npm run dev
```

The API runs at **http://localhost:5000**.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The UI runs at **http://localhost:5173**.

---

## Test Accounts (after seeding)

| Role    | Email                | Password    |
|---------|----------------------|-------------|
| Student | student@test.com     | password123 |
| Faculty | faculty@test.com     | password123 |
| Admin   | admin@test.com       | password123 |

---

## Key Features

| Feature                     | Detail                                                              |
|-----------------------------|---------------------------------------------------------------------|
| **Role-based access**       | Student / Faculty / Admin with route-level guards                   |
| **Duplicate detection**     | SHA-256 hash compared before storing; 409 response with existing ID |
| **In-browser PDF viewer**   | react-pdf with page nav + zoom controls                             |
| **Upvotes**                 | One vote per user per resource; toggle on/off; can't vote own       |
| **Bookmarks**               | Toggle save; dedicated "Saved" page                                 |
| **Flagging**                | Modal with reason; flags visible in faculty review queue            |
| **Verification**            | Faculty/admin can mark resources as verified                        |
| **Keyword + facet search**  | Filter by type, semester, subject code, unit, exam year, keyword    |

---

## Project Structure

```
college project/
├── SPEC.md              ← requirements & design spec
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── index.js
│   │   ├── lib/prisma.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── resources.js
│   │       ├── bookmarks.js
│   │       └── flags.js
│   ├── .env
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── context/AuthContext.jsx
    │   ├── lib/api.js
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── ResourceCard.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── PdfViewer.jsx
    │   │   ├── FlagModal.jsx
    │   │   └── ProtectedRoute.jsx
    │   └── pages/
    │       ├── HomePage.jsx
    │       ├── ResourceDetailPage.jsx
    │       ├── UploadPage.jsx
    │       ├── BookmarksPage.jsx
    │       ├── FlagsPage.jsx
    │       ├── LoginPage.jsx
    │       └── RegisterPage.jsx
    ├── vite.config.js
    └── package.json
```

---

## API Reference

### Auth
```
POST /api/auth/register   { name, email, password, role }
POST /api/auth/login      { email, password }
POST /api/auth/refresh    { refreshToken }
```

### Resources
```
GET    /api/resources                   ?type&semester&subject_code&unit&exam_year&q
GET    /api/resources/:id
POST   /api/resources                   multipart/form-data (requires auth)
PATCH  /api/resources/:id/verify        faculty/admin only
DELETE /api/resources/:id               admin only
POST   /api/resources/:id/upvote        auth required
POST   /api/resources/:id/bookmark      auth required
POST   /api/resources/:id/flag          auth required { reason }
```

### Bookmarks & Flags
```
GET    /api/bookmarks                   auth required
GET    /api/flags                       faculty/admin only
DELETE /api/flags/:id                   faculty/admin only
```

---

## Duplicate Detection

When uploading, the server hashes the file buffer with SHA-256 before writing to disk.  
If the hash already exists in `resources.file_hash`, the endpoint returns:

```json
HTTP 409
{
  "error": "duplicate",
  "message": "An identical file already exists.",
  "existingId": "<uuid>",
  "existingTitle": "Data Structures Unit 1 Notes"
}
```

The UI shows this as a warning with a direct link to the existing resource.
