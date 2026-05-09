# Database Schema Documentation: myScheme Data

This document provides the technical specification for the `schemes` table, which stores data scraped from the [myScheme API](https://api.myscheme.gov.in/).

## Table Definition: `schemes`

| Column | Type | Description |
| :--- | :--- | :--- |
| `api_id` | `TEXT` (PK) | The unique identifier from the source API (e.g., `VxezF5gB5uF80_MGIY8p`). |
| `slug` | `TEXT` | A URL-friendly identifier for the scheme (e.g., `sui`). |
| `scheme_name` | `TEXT` | The full title of the scheme. |
| `categories` | `JSONB` | An array of categories (e.g., `["Business & Entrepreneurship", "Women and Child"]`). |
| `raw_data` | `JSONB` | The full original JSON object from the API, containing all fields (description, benefits, eligibility, etc.). |
| `fetched_at` | `TIMESTAMP` | The date and time when the record was last updated. |

---

## Integration Guide

### 1. Backend (SQL Queries)

#### Fetching Business-Related Schemes
To retrieve schemes relevant to new businesses and entrepreneurship:
```sql
SELECT scheme_name, slug, categories
FROM schemes
WHERE categories @> '["Business & Entrepreneurship"]'::jsonb
ORDER BY fetched_at DESC;
```

#### Searching by Name or Description
Since `raw_data` contains the `briefDescription`, you can perform a text search:
```sql
SELECT scheme_name, raw_data->'fields'->>'briefDescription' as description
FROM schemes
WHERE raw_data->'fields'->>'briefDescription' ILIKE '%loan%'
LIMIT 10;
```

### 2. UI (Frontend Integration)

When fetching data for the UI, you should map the `raw_data` fields to your components. Key fields inside `raw_data['fields']` include:

- `schemeShortTitle`: Acronym for the scheme.
- `briefDescription`: A short summary of the scheme.
- `nodalMinistryName`: The ministry responsible.
- `beneficiaryState`: Array of states where the scheme is active.
- `tags`: Array of keywords for searching.

#### Example JSON Object Structure
```json
{
  "api_id": "LBezF5gB5uF80_MGGY81",
  "scheme_name": "Stand-Up India",
  "slug": "sui",
  "categories": ["Business & Entrepreneurship", "Banking,Financial Services and Insurance"],
  "raw_data": {
    "fields": {
      "schemeName": "Stand-Up India",
      "briefDescription": "A scheme by Ministry of Finance for financing SC/ST and Women Entrepreneurs...",
      "nodalMinistryName": "Ministry Of Finance",
      "beneficiaryState": ["All"],
      "tags": ["Loan", "Entrepreneur", "Finance"]
    }
  }
}
```

### 3. Maintenance
To refresh the database with the latest schemes from the API, run the following command in the terminal:
```bash
source venv/bin/activate && python3 fetch_and_store.py
```
This script uses an "upsert" (Insert or Update) strategy, so it will update existing schemes and add new ones without creating duplicates.
Oneclicksathi Complete User Flow
OneClickSathi — Complete End-to-End User Flow

Problem Statement (One Line):
Build an AI-powered compliance and government scheme assistant that helps micro and small businesses track regulatory deadlines, automate filings, and discover personalized subsidies and incentives.

🏗️ Technology Stack
Frontend
React 19
TypeScript
Vite
shadcn/ui
Tailwind CSS
TanStack Query (API data fetching and caching)
TanStack Table (advanced tables)
React Hook Form + Zod (forms and validation)
React Router
Recharts (analytics charts)
Framer Motion (animations)
Backend
Django
Django REST Framework
PostgreSQL
Celery + Redis
JWT Authentication
AI & External Services
Gemini API (AI assistant)
myScheme API / scraped dataset
data.gov.in API
Resend API (email reminders)
Tesseract OCR (document extraction)
Design Philosophy

Inspired by premium SaaS products such as:
Linear
Stripe
Notion
Vercel
UI Principles
- Minimal and clean with bold hero typography
- Rounded cards (rounded-2xl) with layered shadows
- Clear hierarchy and generous spacing
- Fast interactions with meaningful motion
- Mobile-first responsive layouts
- Accessibility-first (contrast, focus, keyboard)

UI References To Implement
- Hero layout: Use the bold hero typography, card overlay, and image collage style shown in the hero reference.
- Header: Use a crisp, minimal header with separated CTA buttons and clean nav spacing; do not reuse the same logo everywhere.
- Logo usage: Use large logo treatment only in hero and onboarding; compact logo in navbar and dashboard.
- Login/Register: Use the government-portal illustration style for a friendly, trustworthy auth page with a side illustration + form card.
- Business profile wizard: Use the wide, calm two-column layout with a form panel and a contextual help area.
- Search/filter cards: Use the soft card grid + filter chips and search bar layout pattern from the reference.
Complete User Journey
Landing Page
    ↓
Sign Up / Login
    ↓
Business Profile Setup Wizard
    ↓
Dashboard
    ├── Compliance Calendar
    ├── Scheme Recommendations
    ├── AI Assistant
    ├── Documents Vault
    ├── Application Tracker
    └── Notifications
1. Landing Page
Purpose

Explain the product and drive users to sign up.

Sections
- Hero
  - Logo: OneClickSathi (large hero usage)
  - Headline: One-Click Compliance & Government Scheme Assistant for MSMEs
  - Subheadline: Track deadlines, automate compliance, and discover subsidies tailored to your business.
  - Primary CTA: Get Started
  - Secondary CTA: Watch Demo
  - Visual: layered collage hero with floating UI cards (per hero reference)
- Feature Cards
  - Compliance Tracker
  - Scheme Discovery
  - AI Guidance
  - Document Management
  - Application Tracker
- Social Proof
  - 1000+ schemes
  - 28 states covered
  - AI support in English & Hindi
- Footer
  - GitHub
  - Documentation
  - Contact
2. Authentication
Screens
- Login
- Register
- Forgot Password
- Email Verification
UX Notes
- Use the government-portal illustration style with a glassy form card on the right.
- Keep fields 2-column on desktop where possible, single-column on mobile.
- Add inline validation and helpful microcopy below inputs.
shadcn Components
Card
Input
Button
Label
Alert
Backend Endpoints
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/refresh/
3. Business Profile Setup Wizard

After login, users complete a guided onboarding.

Step 1: Basic Information
- Business Name
- Industry
- Entity Type (Proprietorship, LLP, Pvt Ltd)
Step 2: Location
- State
- District
Step 3: Ownership Details
- Women-owned?
- SC/ST?
- Startup?
Step 4: Registrations
- GSTIN
- Udyam Registration
- PAN
Step 5: Revenue and Employees
- Annual Turnover
- Number of Employees
Step 6: Goals
- Loan
- Subsidy
- Tax Benefits
- Grants
Result
Personalized dashboard and recommendations.
UX Notes
- Use a two-column wizard layout: left form, right contextual tips and checklist.
- Add progress indicator with step names and completion state.
- Persist data locally so the user can resume later.

4. Main Dashboard

The central workspace.

Layout
┌────────────────────────────────────────────┐
│ Sidebar | Top Navbar                       │
├────────────────────────────────────────────┤
│ KPI Cards                                  │
│ Compliance Calendar                        │
│ Recommended Schemes                        │
│ AI Assistant                               │
│ Recent Notifications                       │
└────────────────────────────────────────────┘
KPI Cards
Upcoming Deadlines
Eligible Schemes
Saved Documents
Active Applications
5. Compliance Calendar
Purpose

Track due dates and filing obligations.

Examples
GST Return
TDS Filing
Income Tax Return
Udyam Renewal
Trade License Renewal
UI Components
- Calendar
- Table
- Status badges
- Reminder toggles
Status Colors
Red = Overdue
Orange = Due Soon
Green = Completed
Backend Logic

Your own rules engine calculates deadlines based on:

Business type
GST registration
State
6. Scheme Recommendations
Purpose

Recommend relevant schemes using your schemes table.

Query Example
SELECT scheme_name, slug, categories
FROM schemes
WHERE categories @> '["Business & Entrepreneurship"]'::jsonb;
Card Layout
- Scheme Name
- Description
- Ministry
- Eligibility Match %
- Benefit Summary
- Apply Now
- Save
Filters
Category
State
Women Entrepreneurs
Loans
Grants
7. Scheme Details Page
Sections
- Overview
- Benefits
- Eligibility
- Required Documents
- Official Application Link
- AI Explanation
- Data Source

From raw_data['fields']:

briefDescription
nodalMinistryName
beneficiaryState
tags
8. AI Assistant (Chatbot)
Example Questions
Which schemes are best for my electronics startup?
What documents do I need for PMEGP?
Explain this scheme in Hindi.
What compliance deadlines are due this month?
Context Sent to Gemini
User business profile
Compliance data
Scheme database
UI
- Chat panel
- Suggested prompts
- Markdown responses
9. Document Vault
Purpose

Store and organize business documents.

Supported Documents
PAN Card
GST Certificate
Udyam Certificate
Bank Statement
Incorporation Certificate
Features
- Upload
- OCR extraction
- Auto-tagging
- Expiry reminders
10. Application Tracker
Purpose

Track scheme applications.

Stages
Draft
Submitted
Under Review
Approved
Subsidy Received
Timeline UI

Vertical progress indicator.

11. Notifications Center
Types
Compliance reminders
New schemes
Document expiry alerts
Application updates
Delivery Channels
In-app
Email (Resend API)
12. Search & Discovery

Global search for:

Schemes
Compliance obligations
Documents
Notifications

Powered by:

PostgreSQL Full Text Search
Optional Elasticsearch
Mobile Experience

Bottom navigation:

Home
Schemes
Calendar
AI Chat
Profile
Database Schema Overview
Existing Table
schemes
api_id
slug
scheme_name
categories (JSONB)
raw_data (JSONB)
fetched_at
Additional Tables
users
business_profiles
compliance_tasks
saved_schemes
documents
applications
notifications
ai_chat_history
API Endpoints
Authentication
POST /api/auth/register/
POST /api/auth/login/
Business Profile
GET /api/profile/
POST /api/profile/
Schemes
GET /api/schemes/
GET /api/schemes/{slug}/
POST /api/schemes/{slug}/save/
Compliance
GET /api/compliance/
POST /api/compliance/{id}/complete/
Documents
POST /api/documents/upload/
AI Assistant
POST /api/ai/chat/
Notifications
GET /api/notifications/
Frontend Folder Structure
src/
├── app/
│   ├── router.tsx
│   ├── query-client.ts
│   └── providers.tsx
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── schemes/
│   ├── compliance/
│   └── ui/
├── features/
│   ├── auth/
│   ├── onboarding/
│   ├── schemes/
│   ├── compliance/
│   ├── documents/
│   └── ai/
├── hooks/
├── lib/
├── types/
└── pages/
Django App Structure
backend/
├── apps/
│   ├── accounts/
│   ├── profiles/
│   ├── schemes/
│   ├── compliance/
│   ├── documents/
│   ├── notifications/
│   └── ai_assistant/
├── config/
└── manage.py
TanStack Query Example Usage
useSchemes.ts
Fetch paginated schemes
Cache results
Enable filters
useComplianceTasks.ts
Fetch deadlines
Auto-refresh
useAIChat.ts
Send chat messages
Optimistic updates
Hackathon Demo Flow
Demo Script
Open landing page.
Register a business.
Complete onboarding.
Show dashboard KPIs.
Display upcoming GST deadline.
Show personalized schemes.
Ask AI: "Which subsidies can help my startup?"
Upload a GST certificate.
Track a saved application.
MVP Development Priority
Phase 1 (Core)
Authentication
Business onboarding
Scheme recommendations
Compliance tracker
Phase 2 (Smart Features)
AI assistant
Notifications
Phase 3 (Advanced)
OCR
Application tracker
Example Real User Flow
User: Priya, Women Entrepreneur in Uttar Pradesh
Priya signs up.
Selects Manufacturing business.
Marks Women-owned.
Adds GST and Udyam details.
Dashboard shows:
GST filing due in 7 days
Stand-Up India scheme
PMEGP subsidy
AI explains eligibility.
Priya saves schemes.
Uploads documents.
Receives email reminders.
Tracks application progress.
Final Outcome

Your platform becomes a digital CFO + compliance officer + subsidy advisor for micro and small businesses.

It helps users:

Stay compliant
Avoid penalties
Discover funding opportunities
Organize documents
Understand government programs
Grow their businesses
Project Tagline

OneClickSathi — Your AI-Powered Compliance and Subsidy Companion for MSMEs.


Feature Implementation Checklist
- Landing page sections complete (hero, features, social proof, footer).
- Auth pages complete (login/register/forgot/email verification) with validation and error states.
- Onboarding wizard complete with progress, save/resume, and step validation.
- Dashboard KPI cards, compliance calendar, scheme cards, AI assistant panel, and notifications list.
- Scheme list filters (category, state, women, loans, grants) and search.
- Scheme detail page with overview, benefits, eligibility, documents, apply link, and AI explanation.
- Document vault with upload, OCR extraction, auto-tagging, and expiry reminders.
- Application tracker with status timeline and updates.
- Notification center with in-app and email channels.
- Global search across schemes, compliance, documents, notifications.
- Mobile bottom navigation with key sections.

Government Type Image Guidance
- Use a public-domain government-building illustration image for the landing/auth hero (clean civic style).
- Optimize for 16:9 and 4:3 crops; provide desktop and mobile variants.
- Ensure the image is license-safe for commercial use; do not mention the source name in UI copy.

AI API Reference
- Use Gemini 2.5 Flash for the assistant. Keep API keys in server-side environment variables only.
- Do not store any API keys in the frontend.

  