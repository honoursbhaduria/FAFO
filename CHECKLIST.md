# OneClickSathi Implementation Checklist

This checklist tracks the implementation status of the "OneClickSathi" platform features.

## 1. Authentication & Onboarding
- [x] Landing Page (Hero, Features, Footer)
- [x] Login/Register UI (UI created, logic pending)
- [ ] Business Profile Setup Wizard
  - [x] Basic UI structure (Step 1 & 2 started)
  - [ ] Step 3: Ownership Details
  - [ ] Step 4: Registrations (GSTIN, Udyam)
  - [ ] Step 5: Revenue & Employees
  - [ ] Step 6: Goals
  - [ ] Persistence: Saving profile to DB

## 2. Dashboard (Central Hub)
- [ ] KPI Cards (Upcoming Deadlines, Eligible Schemes, etc.)
- [ ] Dashboard Layout (Sidebar + Top Navbar)
- [ ] Recent Notifications
- [ ] Active Application Progress

## 3. Scheme Discovery
- [x] Scraper: 4,673 schemes in DB
- [x] API: Paginated & Categorized fetch
- [x] Search: Name-based filtering
- [x] Filters: Category-based filtering
- [x] UI: Scheme Cards with Brief Descriptions
- [ ] Scheme Details Page (Dynamic route `[id]`)
- [ ] "Save Scheme" functionality

## 4. Compliance & Regulatory
- [ ] Compliance Calendar UI
- [ ] Compliance Rules Engine (Logic to calculate deadlines)
- [ ] Status Tracking (Completed, Overdue, Due Soon)
- [ ] Filing Reminders (Email integration)

## 5. AI Assistant (OneClickSathi AI)
- [ ] Gemini API Integration
- [ ] Groq API Integration (Backup/Fast)
- [ ] Context-Aware Chat (Using user profile + scheme DB)
- [ ] UI: Chat Panel/Floating Assistant

## 6. Document Management
- [ ] Document Vault UI
- [ ] File Upload (PAN, GST, Udyam)
- [ ] OCR Extraction (Extracting data from certificates)
- [ ] Expiry Reminders

## 7. Application Tracker
- [ ] Tracker UI (Vertical progress)
- [ ] Status Management (Draft, Submitted, Approved)

## 8. Backend & Infrastructure
- [x] Next.js 15+ App Router Setup
- [x] Prisma ORM Integration
- [x] PostgreSQL (Neon) Connection
- [ ] User Profile Table (Prisma)
- [ ] Compliance Tasks Table (Prisma)
- [ ] Documents Table (Prisma)
- [ ] Notifications System

---
*Last Updated: May 9, 2026*
