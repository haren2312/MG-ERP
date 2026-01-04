# Light ERP Module - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    END USER'S COMPUTER                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │         Double-Click: LightERP_Launcher.exe         │   │
│  │                                                     │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │                                               │ │   │
│  │  │         [Start Application] Button            │ │   │
│  │  │                                               │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                        │                            │   │
│  └────────────────────────┼────────────────────────────┘   │
│                           │                                │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              LightERP.exe (Backend)                 │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │         FastAPI Server (Port 8005)          │   │   │
│  │  │                                             │   │   │
│  │  │  • API Endpoints (/api/...)                │   │   │
│  │  │  • Serves Frontend (Static Files)          │   │   │
│  │  │  • Business Logic                          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                        │                            │   │
│  │                        ▼                            │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │       SQLite Database (light_erp.db)        │   │   │
│  │  │                                             │   │   │
│  │  │  • ledger_records                          │   │   │
│  │  │  • inventory_items                         │   │   │
│  │  │  • pos_transactions                        │   │   │
│  │  │  • pos_items                               │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                │
│                           │ HTTP (localhost:8005)          │
│                           ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              Web Browser (Chrome/Edge/etc)          │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │        React Frontend (UI)                  │   │   │
│  │  │                                             │   │   │
│  │  │  📊 Dashboard  📦 Inventory  🛒 POS         │   │   │
│  │  │  📝 Ledger    📈 Reports                    │   │   │
│  │  │                                             │   │   │
│  │  │  • User Interface                           │   │   │
│  │  │  • Makes API calls to backend              │   │   │
│  │  │  • Displays data                           │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Package Structure

```
LightERP/ (Portable Package)
│
├── LightERP_Launcher.exe          ← GUI Launcher (User clicks this!)
│   └── Manages: Start/Stop/Status
│
├── LightERP.exe                    ← Main Application (Backend)
│   ├── Embedded Python Runtime
│   ├── FastAPI Application
│   ├── All Python Dependencies
│   └── API + Static File Serving
│
├── frontend/                       ← Frontend Files
│   └── dist/
│       ├── index.html             ← Main HTML
│       ├── assets/
│       │   ├── *.js               ← React Application
│       │   └── *.css              ← Styles
│       └── ...
│
├── light_erp.db                    ← SQLite Database (Created on first run)
│   └── All user data stored here
│
├── README.txt                      ← User Guide
└── Start_LightERP.bat             ← Alternative launcher
```

---

## 🔄 Data Flow

### Making a Sale (POS Flow)

```
1. User Action
   │
   ▼
[User clicks products in Browser]
   │
   ▼
2. Frontend
   │
   ├─ User adds items to cart
   ├─ Enters payment details
   └─ Clicks "Complete Sale"
   │
   ▼
3. API Request
   │
   POST /api/pos/transactions
   {
     items: [...],
     payment_received: 50.00,
     payment_method: "cash"
   }
   │
   ▼
4. Backend Processing
   │
   ├─ Validate data
   ├─ Check inventory stock
   ├─ Calculate totals
   ├─ Update inventory quantities
   ├─ Create POS transaction
   └─ Create ledger entry
   │
   ▼
5. Database Updates
   │
   ├─ INSERT INTO pos_transactions
   ├─ INSERT INTO pos_items
   ├─ UPDATE inventory_items (quantities)
   └─ INSERT INTO ledger_records
   │
   ▼
6. Response
   │
   Returns transaction details
   │
   ▼
7. Frontend Update
   │
   └─ Shows success message
```

---

## 🏭 Build Process

### From Source to Portable Package

```
Developer's Machine
│
├── 1. Frontend Build
│   │
│   cd frontend/
│   npm install          ← Install dependencies
│   npm run build        ← Vite builds to dist/
│   │
│   Output: frontend/dist/ (optimized static files)
│
├── 2. Backend Package
│   │
│   cd backend/
│   pip install requirements.txt  ← Install Python deps
│   pyinstaller light_erp.spec   ← Create executable
│   │
│   Output: backend/dist/LightERP.exe (50-100 MB)
│           └── Contains: Python + All libraries
│
├── 3. Launcher Build
│   │
│   pyinstaller launcher.py       ← Create launcher
│   │
│   Output: LightERP_Launcher.exe (10-15 MB)
│           └── GUI application with tkinter
│
├── 4. Package Assembly
│   │
│   Copy LightERP.exe              → dist/LightERP/
│   Copy frontend/dist/            → dist/LightERP/frontend/
│   Copy LightERP_Launcher.exe     → dist/LightERP/
│   Create Start_LightERP.bat      → dist/LightERP/
│   Create README.txt              → dist/LightERP/
│   │
│   Output: dist/LightERP/ (120-150 MB uncompressed)
│
└── 5. Distribution
    │
    Compress to ZIP                → LightERP_Portable_v1.0.0.zip
    │
    Output: 40-60 MB (compressed)
            Ready to share!
```

---

## 🎯 User Experience Flow

### First Time User

```
1. Download
   │
   ▼
Receives: LightERP_Portable_v1.0.0.zip
   │
   ▼
2. Extract
   │
Right-click → Extract All
   │
   ▼
3. Navigate
   │
Open extracted LightERP folder
   │
   ▼
4. Launch
   │
Double-click: LightERP_Launcher.exe
   │
   ▼
5. First Run
   │
├─ Database initialized
├─ Sample data loaded
└─ Browser opens automatically
   │
   ▼
6. Explore
   │
├─ View Dashboard
├─ Try sample POS sale
├─ Browse inventory
└─ Check reports
   │
   ▼
7. Customize
   │
├─ Add own products
├─ Process real sales
└─ View own reports
   │
   ▼
8. Daily Use
   │
├─ Start: Double-click launcher
├─ Use: Browser interface
├─ Stop: Click "Stop" in launcher
└─ Backup: Copy light_erp.db (weekly)
```

---

## 🔐 Security Model

```
┌─────────────────────────────────────────┐
│         User's Local Computer           │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    LightERP Application           │  │
│  │                                   │  │
│  │  • No network access needed      │  │
│  │  • No cloud services             │  │
│  │  • No user accounts              │  │
│  │  • Localhost only (127.0.0.1)    │  │
│  └───────────────────────────────────┘  │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐  │
│  │    SQLite Database File           │  │
│  │    (light_erp.db)                 │  │
│  │                                   │  │
│  │  • Plain text (no encryption)    │  │
│  │  • File system permissions only  │  │
│  │  • User controls access          │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘

✓ Suitable for: Single user, trusted environment
⚠ Not suitable for: Multi-user, public access, sensitive data
```

---

## 📊 Database Schema

```sql
┌──────────────────────────────────────────────────────────┐
│                    LEDGER_RECORDS                        │
├────────────────────┬─────────────────────────────────────┤
│ id                 │ Primary Key                         │
│ transaction_date   │ DateTime                            │
│ transaction_type   │ sale | purchase | return | adjust  │
│ description        │ Text                                │
│ amount             │ Float                               │
│ balance            │ Float (running balance)             │
│ payment_method     │ cash | card | bank_transfer | other│
└────────────────────┴─────────────────────────────────────┘
                            ▲
                            │
                            │ (ledger_id)
                            │
┌──────────────────────────────────────────────────────────┐
│                  POS_TRANSACTIONS                        │
├────────────────────┬─────────────────────────────────────┤
│ id                 │ Primary Key                         │
│ transaction_number │ Unique (e.g., POS-20260103-ABC123) │
│ transaction_date   │ DateTime                            │
│ subtotal           │ Float                               │
│ tax                │ Float                               │
│ discount           │ Float                               │
│ total              │ Float                               │
│ payment_method     │ Enum                                │
└────────────────────┴─────────────────────────────────────┘
        │                           ▲
        │ (1:N)                     │
        ▼                           │
┌──────────────────────────────────────────────────────────┐
│                     POS_ITEMS                            │
├────────────────────┬─────────────────────────────────────┤
│ id                 │ Primary Key                         │
│ transaction_id     │ Foreign Key → pos_transactions      │
│ inventory_id       │ Foreign Key → inventory_items       │
│ quantity           │ Integer                             │
│ unit_price         │ Float                               │
│ subtotal           │ Float                               │
└────────────────────┴─────────────────────────────────────┘
                            │
                            │ (inventory_id)
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   INVENTORY_ITEMS                        │
├────────────────────┬─────────────────────────────────────┤
│ id                 │ Primary Key                         │
│ name               │ String                              │
│ sku                │ Unique String                       │
│ barcode            │ Unique String (optional)            │
│ category           │ String                              │
│ unit_price         │ Float                               │
│ cost_price         │ Float                               │
│ quantity           │ Integer (current stock)             │
│ reorder_level      │ Integer (low stock threshold)       │
└────────────────────┴─────────────────────────────────────┘
```

---

## 🎨 UI Components

```
Main Layout
│
├── Sidebar Navigation
│   ├── 📊 Dashboard
│   ├── 📦 Inventory
│   ├── 🛒 POS
│   ├── 📝 Ledger
│   └── 📈 Reports
│
└── Main Content Area
    │
    ├── Dashboard Page
    │   ├── Stats Cards (Sales, Balance, Inventory)
    │   └── Quick Summary Table
    │
    ├── Inventory Page
    │   ├── Search Bar
    │   ├── Add Item Button + Form
    │   └── Items Table (CRUD operations)
    │
    ├── POS Page
    │   ├── Product Grid (left)
    │   └── Cart + Checkout (right)
    │
    ├── Ledger Page
    │   ├── Filter Controls
    │   └── Transactions Table
    │
    └── Reports Page
        ├── Date Range Selector
        ├── Sales Report Card
        ├── Inventory Report Card
        └── Ledger Report Card
```

---

## 🚀 Deployment Scenarios

### Scenario 1: Single Computer Shop
```
[Computer with Light ERP]
        │
        ├─ Owner uses POS
        ├─ Tracks inventory
        └─ Views reports
        
Backup: USB drive weekly
```

### Scenario 2: Portable Laptop
```
[Laptop with Light ERP]
        │
        ├─ Use at market stall
        ├─ Use at home office
        └─ No internet needed
        
Backup: Cloud storage (manual copy)
```

### Scenario 3: Multi-Location (Manual Sync)
```
[Location A Computer]    [Location B Computer]
        │                        │
        ├─ Own database          ├─ Own database
        │                        │
        └─ Manual consolidation via reports
```

---

## 💡 Key Design Decisions

### Why SQLite?
- ✅ No server setup required
- ✅ Single file (easy backup)
- ✅ Cross-platform
- ✅ Zero configuration
- ✅ Perfect for small-medium datasets

### Why PyInstaller?
- ✅ Creates standalone executable
- ✅ Bundles Python runtime
- ✅ No Python installation needed
- ✅ Works on Windows/Linux

### Why Single Server?
- ✅ Simpler for users (one port)
- ✅ No CORS issues
- ✅ Easier packaging
- ✅ Reduced attack surface

### Why GUI Launcher?
- ✅ User-friendly
- ✅ Clear start/stop controls
- ✅ Status visibility
- ✅ No command line needed

---

<div align="center">

**Light ERP Architecture**  
*Simple, Portable, Powerful*

Designed for ease of use and distribution 🚀

</div>
