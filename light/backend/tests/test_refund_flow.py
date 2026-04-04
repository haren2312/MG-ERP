"""Simple test for light backend refund flow."""

from main import app


def test_health_check(client):
    """Test that the app is running."""
    response = client.get("/health")
    assert response.status_code == 200


def test_inventory_crud(client):
    """Test inventory CRUD operations."""
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
    assert item["name"] == "Test Product"
    assert item["sku"] == "TP-001"

    # Get the inventory item
    r = client.get(f"/api/inventory/{item['id']}")
    assert r.status_code == 200

    # Update the inventory item
    update_payload = {
        "name": "Updated Product",
        "unit_price": 15.0,
    }
    r = client.put(f"/api/inventory/{item['id']}", json=update_payload)
    assert r.status_code == 200
    updated = r.json()
    assert updated["name"] == "Updated Product"
    assert updated["unit_price"] == 15.0


def test_pos_transaction(client):
    """Test POS transaction creation."""
    # First create an inventory item
    item_payload = {
        "name": "Transaction Test Product",
        "sku": "TTP-001",
        "unit_price": 20.0,
        "cost_price": 10.0,
        "quantity": 50,
    }
    r = client.post("/api/inventory", json=item_payload)
    assert r.status_code == 200
    item = r.json()

    # Create a POS transaction
    transaction_payload = {
        "items": [{"inventory_id": item["id"], "quantity": 2}],
        "customer_name": "Test Customer",
        "payment_method": "cash",
        "payment_received": 50.0,
        "discount": 0.0,
        "sales_user_id": None
    }

    r = client.post("/api/pos/transactions", json=transaction_payload)
    assert r.status_code == 200
    txn = r.json()
    assert txn["customer_name"] == "Test Customer"
    assert txn["total"] == 40.0  # 2 * 20.0


def test_refund_requires_auth(client):
    """Test that refund endpoint returns 401 without authentication."""
    # Create an inventory item and transaction first
    item_payload = {
        "name": "Refund Auth Test",
        "sku": "RAT-001",
        "unit_price": 10.0,
        "cost_price": 5.0,
        "quantity": 20,
    }
    r = client.post("/api/inventory", json=item_payload)
    assert r.status_code == 200
    item = r.json()

    transaction_payload = {
        "items": [{"inventory_id": item["id"], "quantity": 1}],
        "customer_name": "Test",
        "payment_method": "cash",
        "payment_received": 15.0,
        "discount": 0.0,
        "sales_user_id": None,
    }
    r = client.post("/api/pos/transactions", json=transaction_payload)
    assert r.status_code == 200
    txn = r.json()

    # Try to refund without auth - should get 401
    refund_payload = {"amount": 5.0, "reason": "Test", "restock": False}
    r = client.post(f"/api/pos/transactions/{txn['id']}/refund", json=refund_payload)
    assert r.status_code == 401  # Unauthorized
