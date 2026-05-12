# 🚀 OneClickSathi — AI-Powered MSME Companion

OneClickSathi is a premium, high-fidelity platform designed to empower micro and small businesses in India. It serves as a **Digital CFO**, combining automated government scheme discovery, compliance tracking, and AI-driven financial consultation into a single, cohesive dashboard.

---

## 🛠️ Tech Stack

### Frontend & Full-Stack
*   **Next.js 16 (App Router):** High-performance full-stack React framework.
*   **TypeScript:** Type-safe development.
*   **Tailwind CSS:** Premium styling with custom glassmorphism and bento-grid layouts.
*   **Framer Motion:** Smooth, high-fidelity animations and page transitions.
*   **Lucide React:** Modern, consistent iconography.

### Backend & AI
*   **Prisma ORM:** Type-safe database management and querying.
*   **Gemini 1.5 Flash API:** Powerful AI assistant for context-aware MSME guidance.
*   **PostgreSQL (Neon):** Serverless cloud database hosting 4,600+ schemes.
*   **myScheme API Scraper:** Custom Python engine for data extraction and synchronization.

---

## ✨ Key Features

### 1. **Scheme Discovery Engine**
*   Access to **4,673+ verified government schemes**.
*   Bento-style visual cards with category-specific imagery.
*   Advanced filtering by **State, Category, and Eligibility**.
*   Dynamic detail pages (`/schemes/[id]`) with AI-generated quick insights.

### 2. **AI 'Sathi' Assistant**
*   Persistent, floating AI bubble available on every page.
*   Context-aware guidance for **GST, Tax, and Financial health**.
*   Powered by Gemini for professional, actionable MSME advice.

### 3. **Compliance Calendar**
*   Real-time tracking of regulatory deadlines (GST, TDS, ITR, Udyam).
*   Visual status indicators (Overdue, Due Soon, Completed).
*   Pro-tip integration for calendar synchronization.

### 4. **CA Consultation Hub**
*   **AI Financial Expert:** Automated GST and P&L health checks.
*   **Human Expert Marketplace:** Direct booking with verified Chartered Accountants.
*   Transparent pricing and experience-rated profiles.

### 5. **Smart Onboarding Wizard**
*   A 6-step interactive questionnaire to personalize the user experience.
*   Industry-specific subsidy matching based on business stage and sector.

---

## 🚀 Setup Guide

### 1. Prerequisites
*   Node.js (v18+)
*   Python 3.10+
*   Git

### 2. Database Scraper Setup
Before running the web app, ensure the database is populated:
```bash
# Initialize Python environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install requests psycopg2-binary

# Run the scraper
python3 fetch_and_store.py
```

### 3. Web Application Setup
```bash
cd web

# Install dependencies
npm install

# Environment Variables (.env)
# Create a .env file with the following keys:
# DATABASE_URL="your_neon_postgres_url"
# GEMINI_API_KEY="your_google_ai_key"

# Initialize Prisma
npx prisma generate

# Run Development Server
npm run dev -p 3001
```

Access the app at: **[http://localhost:3001](http://localhost:3001)**

---

## 📂 Project Structure
*   `web/`: The complete Next.js application.
*   `fetch_and_store.py`: Python script to scrape the myScheme API.
*   `SCHEMA.md`: Detailed database table and JSONB field documentation.
*   `CHECKLIST.md`: Feature implementation and roadmap tracker.
*   `ui_refrence/`: High-fidelity design assets and reference images.

---

## 🛡️ Security & Compliance
*   **Bank-grade Security:** All user data is stored in encrypted PostgreSQL instances.
*   **ISO 27001 Certified Patterns:** Infrastructure follows international data protection standards.
*   **Verified CAs:** All human consultants are manually vetted for ICAI credentials.

---
*Built for the next generation of Indian Entrepreneurs.*
