# 📦 How to Package & Distribute Light ERP

## For Developers/Distributors

This guide shows you how to create a standalone, portable version of Light ERP that non-technical users can run with zero setup.

---

## 🎯 The Goal

Create a package that users can:
1. Download/receive as a ZIP file
2. Extract to any folder
3. Double-click one file to start
4. Use immediately without any installation

---

## ⚡ Quick Build (Automated)

### One Command to Rule Them All

```powershell
.\BUILD_COMPLETE.ps1
```

That's it! This script:
- ✅ Builds the React frontend
- ✅ Creates Python executable with PyInstaller
- ✅ Packages everything together
- ✅ Creates launcher GUI
- ✅ Generates user documentation
- ✅ Creates distributable ZIP file

**Time:** 5-10 minutes  
**Result:** Ready-to-share `LightERP_Portable_v1.0.0.zip` in `dist/` folder

---

## 📋 Prerequisites (Development Machine)

To build the portable version, you need:

- ✅ **Python 3.11+** (https://www.python.org)
- ✅ **Node.js 18+** (https://nodejs.org)
- ✅ **Windows PowerShell** (built into Windows)

**Note:** End users don't need any of these! Only you (the developer) need them to build.

---

## 🔨 Manual Build Steps (If Needed)

If you want to understand the process or customize it:

### Step 1: Build Frontend
```powershell
cd frontend
npm install
npm run build
```
This creates `frontend/dist/` with static files.

### Step 2: Setup Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 3: Create Executable
```powershell
pyinstaller light_erp.spec --clean
```
This creates `backend/dist/LightERP.exe`

### Step 4: Create Launcher
```powershell
cd ..
pyinstaller --onefile --windowed --name="LightERP_Launcher" launcher.py
```

### Step 5: Package Everything
```powershell
.\build_portable.ps1
```

---

## 📁 What Gets Created

```
dist/
├── LightERP/                      ← Folder users can run from
│   ├── LightERP_Launcher.exe      ← Main launcher (GUI)
│   ├── Start_LightERP.bat         ← Batch file launcher (fallback)
│   ├── LightERP.exe               ← Backend server (don't run directly)
│   ├── README.txt                 ← Quick start instructions
│   ├── light_erp.db               ← Database (created on first run)
│   └── frontend/
│       └── dist/                  ← UI files
│           ├── index.html
│           └── assets/
├── LightERP_Portable_v1.0.0.zip  ← ZIP for distribution
├── USER_GUIDE.md                  ← Detailed user guide
└── VISUAL_GUIDE.md                ← Picture-based guide
```

---

## 🚀 Distribution Methods

### Method 1: ZIP File (Recommended)
**What to share:**
```
LightERP_Portable_v1.0.0.zip
```

**User instructions:**
1. Extract ZIP to any folder (Desktop, Documents, etc.)
2. Open the extracted `LightERP` folder
3. Double-click `LightERP_Launcher.exe`
4. Click "Start Application"

**Pros:**
- Single file to share
- Easy via email, USB, cloud storage
- Compressed (smaller size)

### Method 2: Folder Copy
**What to share:**
```
LightERP/ folder
```

**User instructions:**
1. Copy the entire `LightERP` folder to your computer
2. Double-click `LightERP_Launcher.exe`
3. Click "Start Application"

**Pros:**
- No extraction needed
- Good for network shares
- Direct USB drive usage

### Method 3: Installer (Optional)
Use the installer creation script:
```powershell
.\create_installer.ps1
```

Creates a PowerShell-based installer with GUI.

---

## 📝 What to Include with Distribution

### Essential Files (Always Include)
- ✅ `LightERP/` folder (or ZIP)
- ✅ `README.txt` (inside LightERP folder)

### Recommended Files
- ✅ `USER_GUIDE.md` - Comprehensive guide
- ✅ `VISUAL_GUIDE.md` - Picture-based guide

### Optional Files
- Installation_Guide.html (if using installer)
- Custom branding/logos
- Your support contact info

---

## 💡 Customization Tips

### Change the Port
Edit `backend/config.py`:
```python
API_PORT = int(os.getenv("API_PORT", "8005"))  # Change 8005
```

### Add Company Logo
1. Create icon file (e.g., `logo.ico`)
2. Edit `backend/light_erp.spec`:
   ```python
   icon='path/to/logo.ico'
   ```
3. Edit launcher.py icon parameter

### Customize Sample Data
Edit `backend/add_sample_data.py` to change or add sample products.

### Change App Name
1. Edit `backend/config.py`: Change `APP_NAME`
2. Edit `launcher.py`: Change window titles
3. Rebuild

---

## 🧪 Testing Before Distribution

### Test Checklist

1. **Extract fresh copy**
   ```powershell
   # Simulate user experience
   cd C:\Temp
   Expand-Archive LightERP_Portable_v1.0.0.zip -DestinationPath .
   cd LightERP
   ```

2. **Run launcher**
   ```
   Double-click LightERP_Launcher.exe
   ```

3. **Verify functionality**
   - [ ] App starts without errors
   - [ ] Browser opens automatically
   - [ ] Dashboard loads
   - [ ] Can add inventory item
   - [ ] Can make a POS sale
   - [ ] Reports display correctly
   - [ ] Can stop application cleanly

4. **Test on clean machine**
   - Use a VM or friend's computer
   - Machine should NOT have Python/Node.js
   - Should work completely standalone

---

## 📊 Size Expectations

**Uncompressed:** ~120-150 MB  
**Compressed (ZIP):** ~40-60 MB

Breakdown:
- Backend executable: ~30 MB
- Frontend files: ~5 MB
- Python runtime (embedded): ~80 MB
- Launcher: ~10 MB

---

## 🔒 Security Notes

### For Public Distribution
- ⚠️ This is a local-only application
- ⚠️ No built-in user authentication
- ⚠️ Data stored in plaintext SQLite
- ⚠️ Suitable for single-user or trusted environments

### Recommendations
- Inform users to backup their `light_erp.db` file
- Warn against using on shared computers without encryption
- Consider adding password protection for sensitive deployments

---

## 🆘 Troubleshooting Build Process

### "PyInstaller not found"
```powershell
pip install pyinstaller
```

### "Frontend build failed"
```powershell
cd frontend
rm -rf node_modules
npm install
npm run build
```

### "Python venv activation fails"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Executable too large"
Use UPX compression:
```powershell
pip install pyinstaller[upx]
# Edit .spec file: upx=True
```

---

## 📮 Distribution Channels

### Email
- ZIP file (if < 25 MB, compress more if needed)
- Include instructions in email body

### Cloud Storage
- Google Drive, Dropbox, OneDrive
- Share link with download instructions

### USB Drive
- Copy entire `LightERP/` folder
- Add autorun info file

### Network Share
- Place on shared drive
- Users can run directly from share

### Website
- Host ZIP file for download
- Add installation guide page

---

## ✅ Pre-Distribution Checklist

Before sharing with users:

- [ ] Built with `BUILD_COMPLETE.ps1`
- [ ] Tested on clean Windows machine
- [ ] Verified no Python/Node.js needed
- [ ] Launcher opens and starts app
- [ ] Sample data loads correctly
- [ ] All features work (POS, Inventory, Reports)
- [ ] README.txt is clear and accurate
- [ ] User guides included
- [ ] Version number is correct
- [ ] File sizes are reasonable
- [ ] ZIP extracts without errors

---

## 🎓 Best Practices

1. **Version Everything**
   - Use semantic versioning (v1.0.0, v1.1.0, etc.)
   - Include date in ZIP filename
   - Keep changelog

2. **Document Changes**
   - List what's new in each version
   - Note any breaking changes
   - Update user guides

3. **Test Thoroughly**
   - Always test on fresh Windows install
   - Test with non-technical user
   - Verify backup/restore process

4. **Provide Support Path**
   - Include contact info
   - Link to FAQ or help page
   - Provide sample data to reset

5. **Keep It Simple**
   - One-click start is best
   - Clear error messages
   - Obvious next steps

---

## 🎉 You're Ready!

You now know how to:
- ✅ Build a portable version
- ✅ Package for distribution
- ✅ Test before sharing
- ✅ Support end users

**Next step:** Run `BUILD_COMPLETE.ps1` and share Light ERP with the world! 🚀

---

<div align="center">

**Questions?**

Refer to the main README.md or check the code comments.

**Light ERP Module** - Making business software accessible to everyone.

</div>
