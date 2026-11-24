# Department Study Note & PYQ Hub — Specification

## 1. Overview

A full-stack web application for college students and faculty to upload, discover, preview, bookmark, upvote, and verify semester notes and previous-year question papers (PYQs).

---

## 2. Technology Stack

| Layer       | Choice                        | Rationale                                                        |
|-------------|-------------------------------|------------------------------------------------------------------|
| Frontend    | React 18 + Vite               | Fast HMR, clean SPA architecture                                 |
| Styling     | Tailwind CSS + shadcn/ui      | Utility-first, accessible component library                      |
| PDF Viewer  | react-pdf (PDF.js wrapper)    | In-browser rendering, no iframe sandbox issues                   |
| Backend     | Node.js + Express             | Familiar, broad ecosystem, easy file handling                    |
| Database    | PostgreSQL + Prisma ORM       | Relational integrity, fast filtered queries, hash uniqueness     |
| File Upload | Multer (memory storage)       | Buffer available for SHA-256 before disk/cloud write             |
| File Store  | Local `/uploads` dir (dev)    | Swappable to S3 via env flag in production                       |
| Auth        | JWT (access + refresh tokens) | Stateless, role-claim in payload                                 |
| Hashing     | Node.js `crypto` (SHA-256)    | Built-in, no extra dependency                                    |

---

## 3. Data Model

### 3.1 `users`
```
id            UUID  PK
name          TEXT  NOT NULL
email         TEXT  UNIQUE NOT NULL
password_hash TEXT  NOT NULL
role          ENUM('student','faculty','admin')  DEFAULT 'student'
created_at    TIMESTAMPTZ DEFAULT now()
```

### 3.2 `resources`
```
id             UUID  PK
title          TEXT  NOT NULL
type           ENUM('notes','pyq')  NOT NULL
semester       INT   NOT NULL  CHECK(1..8)
subject_code   TEXT  NOT NULL
subject_name   TEXT  NOT NULL
unit           INT   NULL  (notes only, 1–10)
exam_year      INT   NULL  (pyq only, e.g. 2023)
file_url       TEXT  NOT NULL
file_hash      TEXT  UNIQUE NOT NULL   ← SHA-256 hex, enforces dedup
upvotes_count  INT   DEFAULT 0
is_verified    BOOL  DEFAULT false
uploaded_by    UUID  FK → users.id
created_at     TIMESTAMPTZ DEFAULT now()
```

### 3.3 `upvotes`
```
id           UUID PK
user_id      UUID FK → users.id
resource_id  UUID FK → resources.id
UNIQUE(user_id, resource_id)             ← one vote per user per resource
```

### 3.4 `bookmarks`
```
id           UUID PK
user_id      UUID FK → users.id
resource_id  UUID FK → resources.id
UNIQUE(user_id, resource_id)
```

### 3.5 `flags`
```
id           UUID PK
user_id      UUID FK → users.id
resource_id  UUID FK → resources.id
reason       TEXT NOT NULL
created_at   TIMESTAMPTZ DEFAULT now()
```

---

## 4. API Contract

### Auth
| Method | Path               | Body                        | Response           |
|--------|--------------------|-----------------------------|--------------------|
| POST   | /api/auth/register | name, email, password, role | { user, tokens }   |
| POST   | /api/auth/login    | email, password             | { user, tokens }   |
| POST   | /api/auth/refresh  | refreshToken                | { accessToken }    |

### Resources
| Method | Path                       | Auth      | Notes                                          |
|--------|----------------------------|-----------|------------------------------------------------|
| GET    | /api/resources             | Optional  | Query: type, semester, subject_code, unit, exam_year, q (search) |
| GET    | /api/resources/:id         | Optional  | Full detail + upvote/bookmark state if authed  |
| POST   | /api/resources             | Required  | multipart/form-data; triggers SHA-256 check    |
| PATCH  | /api/resources/:id/verify  | faculty+  | Sets is_verified = true                        |
| DELETE | /api/resources/:id         | admin     | Hard delete                                    |

### Upvotes
| Method | Path                         | Auth     | Notes                     |
|--------|------------------------------|----------|---------------------------|
| POST   | /api/resources/:id/upvote    | Required | Toggle — adds or removes  |

### Bookmarks
| Method | Path                          | Auth     | Notes                     |
|--------|-------------------------------|----------|---------------------------|
| POST   | /api/resources/:id/bookmark   | Required | Toggle                    |
| GET    | /api/bookmarks                | Required | Paginated saved list       |

### Flags
| Method | Path                        | Auth     | Notes                     |
|--------|-----------------------------|----------|---------------------------|
| POST   | /api/resources/:id/flag     | Required | { reason }                |
| GET    | /api/flags                  | faculty+ | Review queue               |

---

## 5. Error & Edge Cases

| Scenario                           | HTTP   | Response body                                         |
|------------------------------------|--------|-------------------------------------------------------|
| Duplicate file hash on upload      | 409    | `{ error: "duplicate", existingId: "<uuid>" }`        |
| Non-PDF upload                     | 422    | `{ error: "Only PDF files are accepted" }`            |
| Missing required metadata          | 422    | `{ error: "Validation failed", fields: [...] }`       |
| Upvoting own resource              | 403    | `{ error: "Cannot upvote your own resource" }`        |
| Second upvote (toggle off)         | 200    | `{ upvoted: false, upvotes_count: N }`                |
| Verify by non-faculty              | 403    | `{ error: "Insufficient role" }`                      |
| File not found on disk             | 404    | `{ error: "Resource not found" }`                     |
| JWT expired                        | 401    | `{ error: "Token expired" }`                          |

---

## 6. Seed Data Plan

The seed script creates:
- 3 users: one student, one faculty, one admin
- 10 resources across semesters 1–4, mix of notes and PYQs
- 2 resources sharing the same SHA-256 hash → only first stored (demonstrates dedup)
- Pre-seeded upvotes and bookmarks to test filter/sort states
- 1 flagged resource for the faculty review queue
- 1 verified resource (is_verified = true)

---

## 7. Environment Variables

```env
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/pyq_hub
JWT_SECRET=change_me_in_production
JWT_REFRESH_SECRET=change_me_refresh
PORT=5000
UPLOAD_DIR=./uploads
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:5000
```
