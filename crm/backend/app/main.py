from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.customers import router as customers_router
from .routes.leads import router as leads_router

app = FastAPI(title="MG-ERP CRM", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(customers_router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(leads_router, prefix="/api/v1/leads", tags=["leads"])