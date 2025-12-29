# CRM Backend (FastAPI)

Endpoints:
- GET/POST/PUT/DELETE /api/v1/customers
- GET/POST/PUT/DELETE /api/v1/leads

Env:
- DATABASE_URL (default postgresql+psycopg2://mguser:mgpassword@postgres:5432/mgerp)

Run locally:
```
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8006
```
