from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Lead
from ..schemas import LeadCreate, LeadUpdate, LeadOut
from ..external_auth import require_auth

router = APIRouter()

@router.get("/", response_model=List[LeadOut])
def list_leads(db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    return db.query(Lead).order_by(Lead.created_at.desc()).all()

@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(lead_id: str, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = db.query(Lead).filter(Lead.id == lead_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    return obj

@router.post("/", response_model=LeadOut)
def create_lead(data: LeadCreate, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = Lead(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: str, data: LeadUpdate, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = db.query(Lead).filter(Lead.id == lead_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    obj.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{lead_id}")
def delete_lead(lead_id: str, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = db.query(Lead).filter(Lead.id == lead_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}