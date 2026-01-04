# 🚀 Light ERP - Portable Edition

## For Non-Technical Users

Light ERP is a **complete business management system** that runs on your computer. No technical knowledge required!

---

## 📦 What's Included?

✅ **Secure Login** - User authentication with 3 role levels  
✅ **Point of Sale (POS)** - Process sales quickly and easily  
✅ **Inventory Management** - Track your products and stock  
✅ **Expense Tracking** - Record business expenses by category  
✅ **Sales User Management** - Track sales staff performance  
✅ **Financial Ledger** - Automatic bookkeeping  
✅ **Reports & Analytics** - Sales, inventory, and performance reports  
✅ **Sample Data** - Pre-loaded examples to help you learn  

---

## 🎯 Quick Start (3 Easy Steps!)

### Step 1: Build the Portable Version
Open PowerShell in the `light` folder and run:
```powershell
.\build_portable.ps1
```

This will create a `dist\LightERP` folder with everything needed.

### Step 2: Distribute
Share the `LightERP` folder (or the ZIP file) with your users.

### Step 3: Users Just Double-Click!
Users simply:
1. Extract the ZIP (if zipped)
2. Double-click `Start_LightERP.bat`
3. Browser opens automatically
4. Done! Login and start using

---

## 👥 For End Users

### Installation (One-Time)

**Option A: Using the Installer**
1. Download and extract the package
2. Double-click `Install_LightERP.bat`
3. Choose where to install (Desktop is recommended)
4. Click "Install"
5. Done!

**Option B: Portable (No Installation)**
1. Extract the ZIP file to any folder
2. Double-click `Start_LightERP.bat`
3. That's it!

### Starting the Application

**Method 1: Desktop Shortcut** (if installed)
- Double-click the "Light ERP" icon on your desktop

**Method 2: Direct Launch**
- Go to the Light ERP folder
- Double-click `Start_LightERP.bat`
- Browser will open automatically

### Your First Steps

1. **Login to the System**
   - Use one of these default credentials:
     - **Admin**: `admin` / `admin123` (Full access)
     - **Manager**: `manager` / `manager123` (Most features)
     - **Cashier**: `cashier` / `cashier123` (POS only)
   - ⚠️ Change passwords after first login!

2. **Explore the Dashboard**
   - See overview of your business
   - View key metrics at a glance
   - Different views based on your role

3. **Check Sample Data** (if using demo setup)
   - Sample products are pre-loaded
   - Sample sales users are ready
   - Try making a test sale

4. **Add Your Products** (Manager/Admin only)
   - Go to "Inventory" section
   - Click "+ Add Item"
   - Fill in product details
   - Save!

5. **Setup Sales Users** (Manager/Admin only)
   - Go to "Sales Users" section
   - Add your staff members
   - Assign employee codes
   - Mark as active/inactive

6. **Make a Sale**
   - Go to "POS" section
   - Select a sales user from dropdown
   - Click products to add to cart
   - Enter payment received
   - Click "Complete Sale"

7. **Track Expenses** (Manager/Admin only)
   - Go to "Expenses" section
   - Record business expenses
   - Categorize by type
   - Automatic ledger integration

8. **View Reports** (Manager/Admin only)
   - Go to "Reports" section
   - See sales, inventory, and financial data
   - Go to "Sales User Report" for staff performance
   - Filter by date range

---

## 💡 Common Questions

### Do I need internet?
**No!** Light ERP runs entirely on your computer. No internet needed.

### Do I need to install anything?
**No!** Everything is included. Just double-click and go.

### Where is my data stored?
Your data is in the `light_erp.db` file in the installation folder.
**Back this up regularly!**

### How do I backup my data?
1. Close the application
2. Copy the `light_erp.db` file to a safe location (USB drive, cloud storage, etc.)
3. That's your backup!

### How do I restore from backup?
1. Close the application
2. Replace `light_erp.db` with your backup file
3. Restart the application

### Can I use it on multiple computers?
Yes! Just:
1. Copy the entire Light ERP folder to another computer
2. Copy your `light_erp.db` file to keep your data
3. Run it!

### How do I stop the application?
- Close the command window that appeared when you started the app
- OR press Ctrl+C in that window

---

## 🎨 Features Explained

### � User Roles & Access
- **Super Admin**: Full system access, user management
- **Manager**: Inventory, POS, expenses, reports, sales users
- **Cashier**: POS and dashboard only
- **Security**: Passwords are encrypted, 8-hour login sessions

### 📊 Dashboard
- **What it is**: Your business overview
- **What you see**: Sales totals, inventory value, current balance
- **Access**: All users
- **When to use**: Daily check-in to see how business is doing

### 📦 Inventory
- **What it is**: Your product catalog
- **What you can do**: 
  - Add new products
  - Edit prices and details
  - Track stock levels
  - Get low-stock alerts
  - Generate barcodes
- **Access**: Manager and Admin only
- **When to use**: When adding new products or checking stock

### 🛒 POS (Point of Sale)
- **What it is**: Your cash register
- **What you can do**:
  - Select sales user (staff member)
  - Ring up sales
  - Apply discounts
  - Accept different payment methods (Cash, Card, Bank Transfer)
  - Automatic receipt generation
  - Print receipts to thermal printer
- **Access**: All users
- **When to use**: Every time you make a sale

### 💰 Expenses
- **What it is**: Business expense tracker
- **What you can do**:
  - Record expenses by category (Rent, Utilities, Salaries, etc.)
  - Track vendors and receipt numbers
  - Automatic ledger integration
  - Filter by date and category
- **Access**: Manager and Admin only
- **When to use**: When paying bills or business expenses

### 👥 Sales Users
- **What it is**: Staff/cashier management
- **What you can do**:
  - Add sales staff members
  - Assign employee codes
  - Track positions and contact info
  - Mark users as active/inactive
  - Link transactions to specific staff
- **Access**: Manager and Admin only
- **When to use**: When hiring/managing sales staff

### 📝 Ledger
- **What it is**: Your financial record book
- **What you see**: All money coming in and going out
- **Access**: Manager and Admin only
- **When to use**: To review financial history

### 📈 Reports
- **What it is**: Business analytics
- **What you get**:
  - Sales summaries
  - Inventory valuation
  - Financial summaries (Income, Expenses, Profit)
  - Date range filtering
- **Access**: Manager and Admin only
- **When to use**: End of day, week, or month reviews

### 👤 Sales User Report
- **What it is**: Staff performance tracking
- **What you see**:
  - Transactions per sales user
  - Pieces sold per user
  - Revenue per user
  - Product breakdown by user
  - Rankings with medals for top performers
- **Access**: Manager and Admin only
- **When to use**: To evaluate staff performance and sales targets

---

## 🛠️ Troubleshooting

### Problem: Application won't start
**Solutions:**
- Restart your computer
- Make sure no antivirus is blocking it
- Right-click and "Run as Administrator"

### Problem: Browser doesn't open automatically
**Solution:**
- Open your browser manually
- Type: `http://localhost:8005`
- Press Enter

### Problem: "Port already in use" error
**Solution:**
- Another program is using port 8005
- Restart your computer
- Try again

### Problem: Can't see my data
**Solution:**
- Make sure `light_erp.db` file is in the same folder
- Restore from backup if needed

### Problem: Can't login / Forgot password
**Solution:**
- Try default credentials: admin/admin123, manager/manager123, cashier/cashier123
- Contact your administrator to reset password
- For fresh setup, delete light_erp.db and run init_database.py

### Problem: Can't see certain menu items
**Solution:**
- Check your user role (shown under username on sidebar)
- Cashiers only see Dashboard and POS
- Managers see most features except user management
- Only Super Admins can manage authentication users

### Problem: Application is slow
**Solution:**
- Close other programs
- Restart the application
- Restart your computer

---

## 📋 System Requirements

- **Operating System**: Windows 7 or later
- **RAM**: 2 GB minimum (4 GB recommended)
- **Disk Space**: 100 MB for application + space for your data
- **Internet**: Not required (runs offline)

---

## 🔒 Security & Privacy

✅ **Your data never leaves your computer**  
✅ **No internet connection required**  
✅ **No account signup needed**  
✅ **No monthly fees**  
✅ **You own your data**  

---

## 📁 Folder Structure

```
LightERP/
├── Start_LightERP.bat         ← Double-click this to start!
├── LightERP.exe               ← Main application (runs automatically)
├── light_erp.db               ← YOUR DATA (backup this!)
├── init_database.py           ← Setup script
├── add_sample_data.py         ← Sample data script
├── README.txt                 ← Quick reference
└── frontend/                  ← UI files (don't modify)
```

---

## 🎓 Tips for Success

1. **Secure Your System**
   - Change default passwords immediately
   - Use strong passwords (mix letters, numbers, symbols)
   - Don't share Admin credentials
   - Log out when leaving computer

2. **Make Regular Backups**
   - Weekly backups of `light_erp.db`
   - Store backups in multiple locations
   - Test restore process occasionally

3. **Start with Sample Data**
   - Practice with sample products first
   - Test with sample sales users
   - Delete them when ready for real data

4. **Assign Proper Roles**
   - Give cashiers "Cashier" role (POS only)
   - Give managers "Manager" role (most features)
   - Keep "Admin" role for owners/IT staff only

5. **Setup Sales Users Properly**
   - Use clear employee codes (EMP001, EMP002, etc.)
   - Include positions and contact info
   - Mark inactive users when they leave
   - Review sales user report weekly

6. **Consistent Product Entry**
   - Use clear, descriptive names
   - Always include SKU codes
   - Add barcodes if you have them
   - Set reorder levels for low-stock alerts

7. **Track Expenses Regularly**
   - Record expenses when they occur
   - Use proper categories
   - Keep receipt numbers for reference
   - Review expense reports monthly

8. **Daily Routine**
   - Login at beginning of day
   - Select sales user for each transaction
   - Process sales as they happen
   - Record expenses when paid
   - Logout at end of day
   - Quick backup once a week

9. **Learn Gradually**
   - Master login and POS first
   - Then inventory management
   - Then sales user management
   - Then explore reports
   - Take your time!

---

## 📞 Getting Help

1. **Check README.txt** in the installation folder
2. **Review this guide** for common solutions
3. **Contact your IT support** if provided by your organization

---

## 🎉 You're Ready!

That's it! You now have everything you need to:
- ✅ Install Light ERP
- ✅ Start using it
- ✅ Manage your business
- ✅ Keep your data safe

**Remember**: This is YOUR tool. Explore, experiment, and don't worry - you can't break anything!

---

<div align="center">

**Light ERP Module v1.0.0**  
*Portable Edition - No Installation Required*

Made for small businesses by people who care.

</div>
