# MG-ERP CRM Module

Customer Relationship Management module with Customers and Leads tracking.

## Features
- **Customers**: Store customer contact info, address, notes
- **Leads**: Track sales leads with status (new/qualified/won/lost)

## Quick Start

### Docker (Recommended)
```powershell
# Start CRM with dependencies
.\start_crm.ps1

# Or start all services
docker-compose up -d
```

Endpoints:
- Backend API: http://localhost:8006
- Frontend UI: http://localhost:3006

### Local Development

**Backend:**
```bash
cd crm/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8006
```

**Frontend:**
```bash
cd crm/frontend
npm install
npm run dev
```

## API

**Customers:**
- `GET /api/v1/customers/` - List all
- `POST /api/v1/customers/` - Create
- `GET /api/v1/customers/{id}` - Get one
- `PUT /api/v1/customers/{id}` - Update
- `DELETE /api/v1/customers/{id}` - Delete

**Leads:**
- `GET /api/v1/leads/` - List all
- `POST /api/v1/leads/` - Create
- `GET /api/v1/leads/{id}` - Get one
- `PUT /api/v1/leads/{id}` - Update
- `DELETE /api/v1/leads/{id}` - Delete

## Database

Tables: `crm_customers`, `crm_leads`
Schema created automatically on first run.
