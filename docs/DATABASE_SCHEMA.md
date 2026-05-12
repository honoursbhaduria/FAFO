# OneClickSathi Platform Architecture & Schema

This document outlines the database models, API endpoints, and data flows that power the OneClickSathi platform.

## 1. Database Schema (Prisma / PostgreSQL)

The platform uses a relational PostgreSQL database (hosted on Neon) managed via Prisma ORM.

### User & Profile Models
| Model | Description | Key Fields |
| :--- | :--- | :--- |
| `User` | Core user account | `email`, `password` (hashed), `name` |
| `BusinessProfile` | User's business details | `industry`, `state`, `isStartup`, `gstin`, `goals` |

### Core Feature Models
| Model | Description | Key Fields |
| :--- | :--- | :--- |
| `schemes` | Scraped govt schemes | `api_id` (PK), `scheme_name`, `raw_data` (JSONB) |
| `SavedScheme` | User-shortlisted schemes | `userId`, `schemeId`, `schemeName`, `savedAt` |
| `Document` | Document Vault records | `userId`, `name`, `type`, `url` (file path) |
| `ComplianceTask` | User's regulatory tasks | `userId`, `title`, `type`, `dueDate`, `status` |
| `NewsBookmark` | User-saved news articles | `userId`, `articleId`, `title`, `url` |

---

## 2. Backend API Endpoints

All endpoints are hosted under `/api/*` and many require authentication via JWT cookies.

### Authentication (`/api/auth/*`)
- `POST /login`: Validates credentials and sets a secure JWT cookie.
- `POST /register`: Creates a new user and triggers onboarding.
- `POST /logout`: Clears the authentication session.
- `GET /me`: Returns the currently authenticated user's basic info.

### Dashboard & Profile
- `GET /api/dashboard/stats`: Aggregates real-time counts for documents, tasks, and applications.
- `GET /api/profile`: Fetches the authenticated user's business profile.
- `POST /api/profile`: Upserts (creates/updates) the business profile.

### Schemes & Discovery
- `GET /api/schemes`: Returns paginated and filtered government schemes.
- `GET /api/schemes/save`: Fetches all schemes shortlisted by the user.
- `POST /api/schemes/save`: Saves a scheme to the user's account.
- `DELETE /api/schemes/save`: Removes a scheme from the user's account.

### AI Assistant (`/api/ai/*`)
- `POST /api/ai/chat`: Handles contextual conversation with user-specific business data injection.
- `GET /api/ai/wikipedia`: Fetches real-time background info for schemes (Internal helper).

### Document Vault (`/api/documents`)
- `GET`: Lists all documents belonging to the user.
- `POST`: Handles multi-part form data for file uploads (saves to `public/uploads`).
- `DELETE`: Removes a document and its database record.

---

## 3. Data Integration & Enrichment

### Wikipedia Data Flow
When a user views a specific scheme (`/schemes/[id]`), the backend triggers a search to Wikipedia:
1. Query: `[Scheme Name] government scheme India`
2. Wikipedia API provides an extract and a direct URL.
3. This context is seamlessly blended into the "Description" card in the Bento UI.

### Recommendation Engine
The questionnaire results are processed via `lib/recommendation-engine.ts`:
- Map's user's `industry` and `state` against scheme tags.
- Assigns a `relevanceScore` based on profile matching.
- Returns a ranked list of "Smart Picks" for the user.

---

## 4. Maintenance
To sync the database with the latest available government schemes:
```bash
source venv/bin/activate && python3 fetch_and_store.py
```
To sync the Prisma schema with the live database:
```bash
cd web && npx prisma db push
```
