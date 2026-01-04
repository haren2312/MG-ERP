# Light ERP Module

A lightweight, cross-platform ERP module with POS, Inventory Management, Financial Ledger, and User Management capabilities. Built with FastAPI (backend) and React + TypeScript (frontend), using SQLite for maximum portability.

## 🎯 For Non-Technical Users

**Want a standalone version that anyone can use?**

Simply run:
```powershell
.\BUILD_COMPLETE.ps1
```

This creates a **portable, double-click-to-run application** with:
- ✅ No installation required
- ✅ No Python or Node.js needed
- ✅ No technical knowledge required
- ✅ Just extract and run!

See [USER_GUIDE.md](USER_GUIDE.md) and [VISUAL_GUIDE.md](VISUAL_GUIDE.md) for non-technical documentation.

---

## Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Three user roles with different access levels:
  - **Super Admin**: Full system access including user management
  - **Manager**: Access to inventory, expenses, reports, and POS
  - **Cashier**: Limited to POS and dashboard only
- Role-based UI restrictions
- Secure password hashing with bcrypt

### 📦 Inventory Management
- Add, update, and delete products
- Auto-generate barcodes from product names
- Print barcode labels with ESC/POS thermal printers
- Track stock levels with low-stock alerts
- Search by name, SKU, or barcode
- Categorize products
- Cost and pricing management
- Edit products with pre-filled forms

### 🛒 Point of Sale (POS)
- Quick product selection
- Sales user assignment for each transaction
- Shopping cart management
- Multiple payment methods (Cash, Card, Bank Transfer)
- Discount application
- Real-time stock updates
- Direct receipt printing via Web Serial API
- Transaction history

### 💰 Expense Tracking
- Record business expenses by category
- Categories: Rent, Utilities, Salaries, Supplies, Maintenance, Marketing, Transportation
- Track vendors and receipt numbers
- Automatic ledger integration
- Payment method tracking
- Filter by date range and category
- Manager/Admin access only

### 👥 Sales User Management
- Manage sales staff/cashiers separately from auth users
- Track employee codes, positions, and contact info
- Mark users as active/inactive
- Link POS transactions to specific sales staff
- View transaction history by sales user

### 📝 Ledger Records
- Automatic financial tracking
- Transaction type categorization (Sales, Purchases, Returns, Adjustments)
- Running balance calculation
- Payment method tracking
- Transaction history with filters
- Integration with POS and expenses

### 📊 Reports & Analytics
- Sales reports with date range filtering
- Inventory valuation and stock status
- Financial summaries (Income, Expenses, Profit)
- Dashboard with key metrics
- Manager/Admin access only

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Database**: SQLite (cross-platform, no server required)
- **ORM**: SQLAlchemy 2.0.23
- **Validation**: Pydantic 2.5.0
- **Authentication**: JWT (python-jose) + BCrypt (passlib)
- **Barcode**: python-barcode 0.15.1
- **Printing**: python-escpos for thermal printers

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT interceptors
- **Build Tool**: Vite 5.0.8
- **State Management**: React Context API
- **Printing**: Web Serial API for direct printer communication

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd light\backend
```

2. Create a virtual environment (optional but recommended):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:
```powershell
pip install -r requirements.txt
```

4. Initialize database with authentication and users:
```powershell
python init_database.py
```

This will create:
- All database tables (inventory, POS, ledger, expenses, users, sales_users)
- 3 authentication users: admin/admin123, manager/manager123, cashier/cashier123
- 3 sample sales users for POS transactions

5. (Optional) Add sample inventory for testing:
```powershell
python add_sample_data.py
```

This adds 5 sample products for demo/testing purposes.

**Alternative:** For a complete setup with sample data in one command:
```powershell
python setup_database.py
```

6. Run the backend server:
```powershell
python main.py
```

The API will be available at `http://localhost:8005`
API Documentation at `http://localhost:8005/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```powershell
cd light\frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Run the development server:
```powershell
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Login Credentials

After running `init_database.py` (or `setup_database.py`), use these credentials to login:

### Authentication Users:
- **Super Admin**: `admin` / `admin123`
  - Full access to all features
  - Can manage authentication users
  - Can delete expenses and sales users
  
- **Manager**: `manager` / `manager123`
  - Access to inventory, POS, expenses, sales users, and reports
  - Cannot manage authentication users
  
- **Cashier**: `cashier` / `cashier123`
  - Limited to POS and dashboard only
  - Cannot access inventory, expenses, or reports

### Sample Sales Users (for POS transactions):
- John Smith (EMP001) - Senior Cashier
- Sarah Johnson (EMP002) - Sales Associate
- Mike Davis (EMP003) - Cashier

⚠️ **IMPORTANT**: Change these default passwords before deploying to production!

## Quick Start Options

### Option 1: For End Users (Recommended)
**Build a portable, standalone version:**
```powershell
.\BUILD_COMPLETE.ps1
```
Creates a distributable package in `dist/LightERP/` that anyone can use by double-clicking `LightERP_Launcher.exe`

### Option 2: For Developers
**Run in development mode:**
```powershell
.\start_light.ps1
```

## Database

The application uses **SQLite**, a lightweight, file-based database that:
- ✅ Works on both Windows and Linux
- ✅ Requires no server installation
- ✅ Stores data in a single file (`light_erp.db`)
- ✅ Perfect for small to medium businesses
- ✅ Easy to backup (just copy the .db file)

### Database Location
`light/backend/light_erp.db`

### Backup Your Data
Simply copy the `light_erp.db` file to backup all your data.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/users` - List auth users (Manager+)
- `POST /api/auth/users` - Create auth user (Super Admin)
- `PUT /api/auth/users/{id}` - Update auth user (Super Admin)

### Inventory
- `GET /api/inventory` - List all items (Manager+)
- `POST /api/inventory` - Create new item (Manager+)
- `GET /api/inventory/{id}` - Get specific item
- `PUT /api/inventory/{id}` - Update item (Manager+)
- `DELETE /api/inventory/{id}` - Delete item (Manager+)

### POS
- `GET /api/pos/transactions` - List all transactions
- `POST /api/pos/transactions` - Create new transaction
- `GET /api/pos/transactions/{id}` - Get specific transaction

### Sales Users
- `GET /api/sales-users` - List all sales users
- `POST /api/sales-users` - Create sales user (Manager+)
- `GET /api/sales-users/{id}` - Get specific sales user
- `PUT /api/sales-users/{id}` - Update sales user (Manager+)
- `DELETE /api/sales-users/{id}` - Delete sales user (Super Admin)

### Expenses
- `GET /api/expenses` - List all expenses (Manager+)
- `POST /api/expenses` - Create expense (Manager+)
- `GET /api/expenses/{id}` - Get specific expense (Manager+)
- `PUT /api/expenses/{id}` - Update expense (Manager+)
- `DELETE /api/expenses/{id}` - Delete expense (Super Admin)

### Ledger
- `GET /api/ledger` - List all ledger records (Manager+)
- `POST /api/ledger` - Create ledger record (Manager+)
- `GET /api/ledger/{id}` - Get specific record (Manager+)

### Reports
- `GET /api/reports/sales` - Get sales report (Manager+)
- `GET /api/reports/inventory` - Get inventory report (Manager+)
- `GET /api/reports/ledger` - Get ledger summary (Manager+)

**Note**: Endpoints marked with (Manager+) require Manager or Super Admin role. All endpoints require authentication via JWT token in Authorization header.

## Configuration

Edit `backend/config.py` to customize:
- API host and port
- Database location
- Tax rate
- CORS origins

## Docker Support

### Build and run with Docker:

```powershell
# Backend
cd light\backend
docker build -t light-backend .
docker run -p 8005:8005 light-backend

# Frontend
cd light\frontend
docker build -t light-frontend .
docker run -p 80:80 light-frontend
```

## Sample Data

Running `python add_sample_data.py` will create sample inventory:

### Sample Inventory:
- Wireless Mouse ($25.99) - Stock: 50
- USB Keyboard ($35.99) - Stock: 30
- Notebook A4 ($3.99) - Stock: 200
- Blue Pen ($0.99) - Stock: 500
- HDMI Cable 2m ($12.99) - Stock: 25

**Note:** Sample data is optional and meant for testing/demo purposes only.

## Usage Tips

### First Login
1. Open the application at `http://localhost:5173`
2. Login with one of the default credentials (see above)
3. Dashboard will show based on your role

### Making a Sale
1. Go to the POS page
2. Select a sales user from the dropdown
3. Click on products to add them to cart
4. Adjust quantities as needed
5. Enter customer name (optional)
6. Enter payment received
7. Click "Complete Sale"
8. Print receipt directly to thermal printer (Web Serial API)

### Managing Inventory
1. Go to Inventory page (Manager/Admin only)
2. Click "+ Add Item" to create new products
3. Barcode is auto-generated from product name
4. Use "Edit" button to modify products
5. Print barcode labels with ESC/POS printer
6. Monitor stock levels (color-coded indicators)

### Tracking Expenses
1. Go to Expenses page (Manager/Admin only)
2. Click "+ Add Expense"
3. Fill in expense details (category, amount, vendor, etc.)
4. Each expense automatically creates a ledger entry
5. Filter by date range and category

### Managing Sales Users
1. Go to Sales Users page (Manager/Admin only)
2. Click "+ Add User"
3. Enter employee details (name, code, position, contact)
4. Mark users as active/inactive
5. Sales users appear in POS dropdown for transaction assignment


### Viewing Reports
1. Go to Reports page (Manager/Admin only)
2. Select date range
3. View sales, inventory, and financial summaries

## Barcode & Printing Features

### Barcode Generation
- Barcodes are automatically generated when creating products
- 12-digit format compatible with EAN13 standard
- Regenerate button available if needed
- Barcode field is editable for custom codes

### Thermal Printer Support
The application supports direct printing to ESC/POS thermal printers via Web Serial API:
- Print barcode labels (58mm thermal paper)
- Print POS receipts
- Works with Chrome, Edge, and Opera browsers
- Requires HTTPS in production (works on localhost for development)

**To use thermal printing:**
1. Connect ESC/POS compatible thermal printer via USB
2. Click "Print Barcode" or "Print Receipt" button
3. Browser will prompt for printer selection
4. Grant permission and select your printer
5. Label/receipt will print directly

## Role-Based Access Control

### Super Admin
- Full access to all features
- User management (create/edit/delete auth users)
- Delete expenses and sales users
- All manager permissions

### Manager
- Dashboard and reports
- Inventory management (add/edit/delete products)
- POS transactions
- Expense tracking (add/edit expenses)
- Sales user management (add/edit users)
- Ledger access

### Cashier
- Dashboard (read-only)
- POS transactions only
- Cannot access inventory, expenses, reports, or user management

## Security Notes

✅ **Security Features Implemented:**
- JWT-based authentication with 8-hour token expiration
- BCrypt password hashing
- Role-based access control (3 user levels)
- Protected API endpoints
- Automatic token validation on frontend
- Secure password storage (never stored in plain text)

⚠️ **Important Production Considerations:**
- Change all default passwords immediately
- Use HTTPS in production (required for Web Serial API)
- Keep SECRET_KEY in config.py secure and unique
- Consider using environment variables for secrets
- Regular database backups
- Monitor user access logs
- For multi-location deployment, consider PostgreSQL instead of SQLite

**Current Implementation:**
- Suitable for: Small to medium businesses, single location
- Users: Up to 10-20 concurrent users
- Database: SQLite (file-based, no server needed)

**For Enterprise Deployment:**
- Use PostgreSQL or MySQL
- Implement Redis for session management
- Add rate limiting
- Enable audit logging
- Use SSL/TLS certificates
- Implement 2FA for admin users

## Troubleshooting

### Backend won't start
- Check if Python 3.11+ is installed: `python --version`
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8005 is available

### Frontend won't start
- Check if Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check if port 5173 is available

### Database errors
- Delete `light_erp.db` and run `python setup_database.py` to recreate
- Check database file permissions
- Ensure SQLite is properly installed with Python

### Authentication issues
- Clear browser localStorage and cookies
- Check if token is expired (8-hour validity)
- Verify username/password match default credentials
- Ensure backend is running and accessibinit_database.py` to recreate
- For testing with sample data, also run `python add_sample_data.py`

### Reports not loading
- Verify you're logged in as Manager or Admin
- Check browser console for errors
- Ensure all database tables exist (run `python update_schema.py`)

### Thermal printer not working
- Use Chrome, Edge, or Opera (Firefox/Safari not supported)
- Ensure printer is connected via USB
- Grant browser permission when prompted
- Use HTTPS in production (localhost works for development)

### Schema migration errors
**For existing databases** after pulling updates with new database fields:
```powershell
cd light\backend
python update_schema.py
```
**Note**: Fresh installations using `setup_database.py` already include all schema changes and don't need this step.

## 📦 Distribution Guide

### For Software Distributors

1. **Build the portable version:**
   ```powershellinit
   .\BUILD_COMPLETE.ps1
   ```

2. **Share with users:**
   - Distribute the `dist/LightERP_Portable_v1.0.0_XXXXXXXX.zip` file
   - Or share the `dist/LightERP/` folder directly

3. **User instructions:**
   - Extract the ZIP file
   - Double-click `LightERP_Launcher.exe`
   - Click "Start Application"
   - Done!

### What Gets Created

```
dist/
├── LightERP/
│   ├── LightERP_Launcher.exe     ← Users double-click this!
│   ├── Start_LightERP.bat         ← Alternative launcher
│   ├── LightERP.exe               ← Main application
│   ├── README.txt                 ← Quick start guide
│   └── frontend/                  ← UI files
├── LightERP_Portable_v1.0.0.zip  ← Ready to share
├── USER_GUIDE.md                  ← Comprehensive guide
└── VISUAL_GUIDE.md                ← Picture-based guide
```

## 📚 Documentation for Non-Technical Users

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete guide with tips and troubleshooting
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Picture-based step-by-step guide
- **README.txt** - Quick reference (included in portable package)

## Support

For issues or questions, refer to the main MG-ERP project documentation or the user guides provided
## License

This is a sample/demo application. Modify as needed for your use case.

## Support

For issues or questions, refer to the main MG-ERP project documentation.
