from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from .models import LeadStatus

class CustomerCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class CustomerOut(BaseModel):
    id: UUID
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    class Config:
        orm_mode = True

class LeadCreate(BaseModel):
    title: str
    status: Optional[LeadStatus] = LeadStatus.new
    source: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

class LeadUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[LeadStatus] = None
    source: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None

class LeadOut(BaseModel):
    id: UUID
    title: str
    status: LeadStatus
    source: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True