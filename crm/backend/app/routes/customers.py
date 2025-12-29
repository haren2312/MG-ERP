from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Customer
from ..schemas import CustomerCreate, CustomerUpdate, CustomerOut
from ..external_auth import require_auth

router = APIRouter()

@router.get("/", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    return db.query(Customer).order_by(Customer.created_at.desc()).all()

@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: str, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = db.query(Customer).filter(Customer.id == customer_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return obj

@router.post("/", response_model=CustomerOut)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = Customer(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: str, data: CustomerUpdate, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = db.query(Customer).filter(Customer.id == customer_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db), user: dict = Depends(require_auth())):
    obj = db.query(Customer).filter(Customer.id == customer_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(obj)
    db.commit()
    return {"deleted": True}