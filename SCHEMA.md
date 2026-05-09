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
