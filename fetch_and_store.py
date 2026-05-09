import requests
import psycopg2
from psycopg2.extras import execute_values
import json
import sys
import time

# API Details
API_URL = "https://api.myscheme.gov.in/search/v6/schemes"
API_KEY = "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
BATCH_SIZE = 100

# DB Details
DB_URL = "postgresql://neondb_owner:npg_H3x5anWdNKGk@ep-floral-firefly-apbrpzjv-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def get_headers():
    return {
        "x-api-key": API_KEY,
        "accept": "application/json, text/plain, */*",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
        "origin": "https://www.myscheme.gov.in",
        "referer": "https://www.myscheme.gov.in/"
    }

def fetch_page(offset):
    params = {
        "lang": "en",
        "q": "[]", # Empty filters to fetch everything
        "keyword": "",
        "sort": "",
        "from": offset,
        "size": BATCH_SIZE
    }
    headers = get_headers()
    print(f"Fetching {BATCH_SIZE} schemes starting from offset {offset}...")
    response = requests.get(API_URL, params=params, headers=headers)
    response.raise_for_status()
    return response.json()

def setup_db():
    print("Connecting to database and setting up schema...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # Create schemes table with individual columns and JSONB for raw data
    cur.execute("""
        CREATE TABLE IF NOT EXISTS schemes (
            api_id TEXT PRIMARY KEY,
            slug TEXT,
            scheme_name TEXT,
            categories JSONB,
            raw_data JSONB,
            fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    return conn, cur

def store_schemes(conn, cur, items):
    if not items:
        return
    
    print(f"Storing {len(items)} schemes in the database...")
    
    data_to_insert = []
    for item in items:
        api_id = item.get('id')
        fields = item.get('fields', {})
        slug = fields.get('slug')
        name = fields.get('schemeName')
        categories = fields.get('schemeCategory', [])
        
        data_to_insert.append((
            api_id,
            slug,
            name,
            json.dumps(categories),
            json.dumps(item)
        ))
    
    # Upsert logic: insert or update if api_id exists
    query = """
        INSERT INTO schemes (api_id, slug, scheme_name, categories, raw_data)
        VALUES %s
        ON CONFLICT (api_id) DO UPDATE SET
            slug = EXCLUDED.slug,
            scheme_name = EXCLUDED.scheme_name,
            categories = EXCLUDED.categories,
            raw_data = EXCLUDED.raw_data,
            fetched_at = CURRENT_TIMESTAMP
    """
    
    execute_values(cur, query, data_to_insert)
    conn.commit()

def scrape_all():
    conn, cur = setup_db()
    
    offset = 0
    total = None
    all_fetched_count = 0
    
    try:
        while True:
            data = fetch_page(offset)
            
            # Extract page and items info
            resp_data = data.get('data', {})
            hits = resp_data.get('hits', {})
            items = hits.get('items', [])
            page_info = hits.get('page', {})
            
            if total is None:
                total = page_info.get('total', 0)
                print(f"Total schemes found: {total}")
            
            if not items:
                print("No more items found.")
                break
            
            store_schemes(conn, cur, items)
            
            all_fetched_count += len(items)
            print(f"Progress: {all_fetched_count}/{total}")
            
            offset += BATCH_SIZE
            if offset >= total:
                break
            
            # Tiny sleep to be polite to the API
            time.sleep(0.5)
            
        print(f"\nSuccessfully scraped and stored {all_fetched_count} schemes.")
        
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    try:
        scrape_all()
    except Exception as e:
        print(f"Error during scraping: {e}", file=sys.stderr)
        sys.exit(1)
