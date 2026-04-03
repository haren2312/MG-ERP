import os
import tempfile
import json
from fastapi.testclient import TestClient

# Set up a temporary SQLite file before importing app so metadata.create_all uses it
db_fd, db_path = tempfile.mkstemp(prefix="light_test_", suffix=".db")
os.close(db_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

from main import app
from database import SessionLocal
from models import Refund, LedgerRecord, InventoryItem

client = TestClient(app)


def test_refund_flow_minimal():
    # Create an inventory item
    item_payload = {
        "name": "Test Product",
        "sku": "TP-001",
        "unit_price": 10.0,
        "cost_price": 5.0,
        "quantity": 100,
    }

    r = client.post("/api/inventory", json=item_payload)
    assert r.status_code == 200
    item = r.json()

    # Create a POS transaction for 2 units
    transaction_payload = {
        "items": [{"inventory_id": item["id"], "quantity": 2}],
        "customer_name": "Test Customer",
        "payment_method": "cash",
        "payment_received": 25.0,
        "discount": 0.0,
        "sales_user_id": None
    }

    r = client.post("/api/pos/transactions", json=transaction_payload)
    assert r.status_code == 200
    txn = r.json()
    txn_id = txn["id"]
    total = txn["total"]

    # Perform a refund of part of the transaction
    refund_payload = {"amount": round(total / 2, 2), "reason": "Customer returned 1 item", "restock": True}
    r = client.post(f"/api/pos/transactions/{txn_id}/refund", json=refund_payload)
    assert r.status_code == 200
    refund_resp = r.json()
    assert refund_resp["refunded_amount"] == refund_payload["amount"]

    # Check inventory was restocked (quantity should be original 100 - 2 + 2 if restocked: 100)
    db = SessionLocal()
    try:
        inv = db.query(InventoryItem).filter(InventoryItem.id == item["id"]).first()
        assert inv is not None
        # After sale of 2 and restock True, net quantity should be original 100
        assert inv.quantity == 100

        # Check ledger has a RETURN record for the refunded amount
        ledger = db.query(LedgerRecord).filter(LedgerRecord.reference_id == txn["transaction_number"]).order_by(LedgerRecord.id.desc()).first()
        assert ledger is not None
        assert ledger.transaction_type == "return"
        assert round(ledger.amount, 2) == round(refund_payload["amount"], 2)

        # Check refund record exists
        refund_row = db.query(Refund).filter(Refund.transaction_id == txn_id).first()
        assert refund_row is not None
        assert round(refund_row.amount, 2) == round(refund_payload["amount"], 2)
    finally:
        db.close()

    # Cleanup temporary DB file
    try:
        os.remove(db_path)
    except Exception:
        pass


def test_refund_same_transaction_twice_is_rejected():
    item_payload = {
        "name": "Double Refund Product",
        "sku": "DR-001",
        "unit_price": 20.0,
        "cost_price": 10.0,
        "quantity": 50,
    }

    r = client.post("/api/inventory", json=item_payload)
    assert r.status_code == 200
    item = r.json()

    transaction_payload = {
        "items": [{"inventory_id": item["id"], "quantity": 1}],
        "customer_name": "Refund Twice Test",
        "payment_method": "cash",
        "payment_received": 30.0,
        "discount": 0.0,
        "sales_user_id": None,
    }

    r = client.post("/api/pos/transactions", json=transaction_payload)
    assert r.status_code == 200
    txn = r.json()
    txn_id = txn["id"]

    first_refund_payload = {
        "amount": round(txn["total"], 2),
        "reason": "First refund",
        "restock": False,
    }
    r = client.post(f"/api/pos/transactions/{txn_id}/refund", json=first_refund_payload)
    assert r.status_code == 200

    second_refund_payload = {
        "amount": 1.0,
        "reason": "Second refund should fail",
        "restock": False,
    }
    r = client.post(f"/api/pos/transactions/{txn_id}/refund", json=second_refund_payload)
    assert r.status_code == 409
    assert "already been refunded" in r.json().get("detail", "")
