# Barcode Features - Inventory Module

## Overview
The Inventory module includes comprehensive barcode generation and dual-mode ESC/POS thermal printing capabilities for product labels.

## Printing Methods

### 1. **USB/Serial Direct Printing (Primary)**
- **Technology**: Web Serial API (Chrome/Edge only)
- **Connection**: Direct USB or serial connection to thermal printer
- **Setup**: Click print, browser prompts to select USB device
- **Speed**: Fastest, no network required
- **Reliability**: Direct hardware connection
- **Browser Support**: Chrome 89+, Edge 89+ (not Firefox/Safari)
- **User Action**: First time requires device selection permission

### 2. **Network IP Printing (Fallback)**
- **Technology**: HTTP POST to network printer
- **Connection**: `http://{IP}:{PORT}` via LAN/WiFi
- **Setup**: Configure in Printer Settings modal
- **Flexibility**: Works across devices on same network
- **Browser Support**: All modern browsers
- **Common Ports**: 9100 (standard), 10631 (simulator)

### Automatic Fallback Logic:
1. Try Web Serial API (USB/Serial) first
2. If not supported or fails → Use network printer
3. User always gets the fastest available method

## Features

### 1. **ESC/POS Thermal Printing**
- **Primary Method**: Direct USB/Serial via Web Serial API
- **Fallback Method**: Network IP connection via HTTP
- Automatic method selection based on browser support
- Configure network printer IP and port in Printer Settings (for fallback)
- Supports common thermal printer ports (9100, 10631)
- Browser prompts for USB device selection on first use
- Native barcode commands for crisp, high-quality output

### 2. **Individual Product Barcodes**
- Click the "Barcode" button on any product row to view its barcode
- Modal displays the barcode with product name and SKU
- **Quantity Input**: Specify how many copies to print (1-50)
- Three action options:
  - **Print (ESC/POS)**: Send specified quantity directly to thermal printer
  - **Download PNG**: Save barcode as image file
  - **Download ESC/POS**: Save raw printer commands as .bin file

### 3. **Batch Barcode Printing**
- Select multiple products using checkboxes in the product table
- Click "Print X Barcodes" button that appears when products are selected
- **Quantity Modal**: Specify how many copies of each barcode (1-100)
- Shows total barcodes that will be printed (products × quantity)
- Sends all barcodes to thermal printer with labels
- Each label includes product name and SKU
- Separated by dashed lines for easy cutting

### 4. **Barcode Formats**
Supports multiple barcode formats:
- **CODE128**: Default format, most versatile (alphanumeric)
- **CODE39**: Alphanumeric barcode
- **EAN13**: 13-digit product barcodes (retail standard)
- **EAN8**: 8-digit compact barcodes
- **UPC-A**: Universal Product Code (12 digits)
- **ITF**: Interleaved 2 of 5
- **CODABAR**: Numeric barcode

### 5. **Barcode Data Source**
The system uses the following priority for barcode data:
1. Product barcode field (if set)
2. Product SKU
3. Product ID (fallback)

## Components

### Files Created
1. **`src/utils/serialBarcodeUtils.ts`** - Web Serial API barcode printer utility
   - `printBarcodeSerial()` - Print single barcode via USB/Serial
   - `printBarcodeSheetSerial()` - Print multiple barcodes via USB/Serial
   - `getSerialPort()` - Request and cache USB port connection
   - `isWebSerialSupported()` - Check browser compatibility
   - `resetSerialPort()` - Reset cached port for reconnection

2. **`src/utils/escPosBarcodeUtils.ts`** - Network ESC/POS thermal printer utility
   - `buildBarcodeCommands()` - Creates ESC/POS barcode commands
   - `buildBarcodeSheetCommands()` - Creates multiple barcode commands
   - `sendToPrinter()` - Sends raw bytes to network printer
   - `printBarcode()` - Prints single barcode to network printer
   - `printBarcodeSheet()` - Prints multiple barcodes to network printer
   - `downloadBarcodeCommands()` - Downloads ESC/POS commands as .bin
   - `getPrinterConfig()` / `savePrinterConfig()` - Manage network printer settings

3. **`src/utils/barcodeGenerator.ts`** - SVG barcode generation utility
   - `generateBarcodeSVG()` - Creates SVG barcode markup for display
   - `generateCODE128()`, `generateEAN13()`, etc. - Format-specific encoders
   - `downloadBarcode()` - Downloads barcode as PNG file

4. **`src/components/BarcodeDisplay.tsx`** - React component for barcode display
   - Renders barcode SVG with product label
   - Three action buttons: Print (auto-detect method), Download PNG, Download ESC/POS
   - Maps barcode types to ESC/POS formats
   - Async printing with loading state
   - Tries Web Serial first, falls back to network

5. **`src/components/PrinterSettings.tsx`** - Network printer configuration modal
   - Configure thermal printer IP address
   - Configure printer port
   - Saves settings to localStorage
   - Validates configuration

### Files Modified
1. **`src/pages/Products.tsx`**
   - Added checkbox column for product selection
   - Added "Printer" button to open printer settings
   - Added "Print X Barcodes" button (appears when products selected)
   - Added "Barcode" action button per product
   - Added barcode viewing modal
   - State management for selected products and printer settings

## Usage

### First-Time Setup (USB/Serial Printer)
1. Navigate to Products page
2. Click "Barcode" button on any product
3. Click "Print" button
4. **Browser prompts to select USB device** - Select your thermal printer
5. Grant permission
6. Barcode prints immediately
7. Future prints use cached connection (no re-selection needed)

### Configure Network Printer (Fallback)
1. Navigate to Products page
2. Click the "Printer" button (🖨️) in the top right
3. Enter your thermal printer's IP address (e.g., 192.168.1.100)
4. Enter the port (usually 9100 for printers, 10631 for simulator)
5. Click "Save Settings"
6. Network printer used automatically if USB/Serial unavailable

### Print Single Barcode
1. Navigate to Products page
2. Click "Barcode" button on any product
3. Enter desired quantity (1-50 copies)
4. Click **Print** button
5. If using USB/Serial: Browser may prompt for device selection (first time only)
6. Barcodes print directly to thermal printer
7. Success message shows "USB/Serial printer" or "network printer"

### Print Multiple Barcodes
1. Navigate to Products page
2. Select products using checkboxes (or select all with header checkbox)
3. Click "Print X Barcodes" button
4. Enter quantity per product (1-100 copies each)
5. Modal shows total: e.g., "3 products × 5 copies = 15 total barcodes"
6. Click "Print Now"
7. If using USB/Serial: Browser may prompt for device selection (first time only)
8. All barcodes print to thermal printer

### Download Barcode
1. Open a product's barcode modal
2. Click "PNG" to download as image
3. OR click "ESC/POS" to download raw printer commands

## ESC/POS Command Details

### Barcode Commands Used
- **Initialize**: `ESC @` - Reset printer
- **Alignment**: `ESC a 1` - Center align
- **Barcode Width**: `GS w n` - Set module width (2-6)
- **Barcode Height**: `GS h n` - Set height in dots (1-255)
- **HRI Position**: `GS H n` - Human readable text position (0-3)
- **Print Barcode**: `GS k m n data` - Print barcode with data

### Barcode Parameters
- **Width**: 3 modules (adjustable 2-6)
- **Height**: 100 dots for single, 80 for batch (adjustable 1-255)
- **HRI**: Below barcode (BELOW = 2)
- **Font**: Font A (smaller, 0)

### Network Communication
- Protocol: HTTP POST
- Content-Type: application/octet-stream
- Body: Raw ESC/POS command bytes (Uint8Array)
- Default ports: 9100 (standard), 10631 (simulator)

## Printer Compatibility

### USB/Serial Printers (Web Serial API)
- ✅ Direct USB connection (Type-A, Type-C, micro-USB)
- ✅ Serial/RS-232 adapters (USB-to-Serial)
- ✅ ESC/POS compatible thermal printers
- ✅ 58mm and 80mm receipt printers
- ✅ Works offline (no network needed)
- ⚠️ **Browser**: Chrome 89+, Edge 89+ only
- ⚠️ **Permission**: User must grant device access on first use
- 📝 **Baud Rate**: 9600 (standard for thermal printers)

### Network Printers (HTTP)
- ✅ Network-connected thermal printers with HTTP interface
- ✅ Print servers with RAW port support
- ✅ ESC/POS simulators
- ✅ All modern browsers
- ⚠️ **Same Network**: Printer must be on same LAN/WiFi
- ⚠️ **CORS**: Printer must accept cross-origin requests

### Tested With
- ESC/POS thermal printers (58mm and 80mm)
- USB thermal printers (via Web Serial API)
- Network-connected printers with HTTP interface
- ESC/POS printer simulators

### Common Printer Ports
- **USB/Serial**: No port needed (direct connection)
- **Network RAW**: 9100 (standard ESC/POS port)
- **Simulator**: 10631 (common for test environments)
- **LPR/LPD**: 515 (not supported, use 9100 instead)

## Technical Details

### Web Serial API Implementation
- **Browser API**: `navigator.serial.requestPort()`
- **Connection**: Direct USB/serial communication
- **Baud Rate**: 9600 (configurable via `port.open()`)
- **Port Caching**: Connection cached for subsequent prints
- **Error Handling**: Graceful fallback to network printing
- **Permissions**: User grants access once per browser session

### Network Communication

### Barcode Encoding
- Native ESC/POS barcode commands (GS k)
- Proper START/STOP patterns handled by printer firmware
- Check digit calculation for EAN/UPC formats
- Supports variable-length and fixed-length formats

### Print Optimization
- Batch printing with separator lines
- Labels include product name and SKU above barcode
- Human readable interpretation (HRI) below barcode
- Automatic paper cut command at end

### Browser Compatibility
- **Web Serial API**: Chrome 89+, Edge 89+ (USB/Serial support)
- **Network Printing**: All modern browsers (Chrome, Firefox, Edge, Safari)
- **Fetch API**: Network communication
- **LocalStorage**: Printer configuration persistence
- **Async/await**: Clean error handling and fallback logic

## Troubleshooting

### USB/Serial Printer Issues

**"Web Serial API is not available"**
- Use Chrome 89+ or Edge 89+
- Firefox and Safari don't support Web Serial
- System will automatically use network printer instead

**"No device selected" or Permission Denied**
- Click Print button again
- Select correct USB device from browser prompt
- Grant permission when asked
- Check USB cable connection

**Device Not Showing in Selection**
- Ensure printer is powered on
- Check USB cable is properly connected
- Try different USB port
- Restart printer and browser

**Print Command Sent But Nothing Prints**
- Check printer has paper
- Verify printer is online (not in error state)
- Some printers need specific baud rate (default is 9600)
- Check printer supports ESC/POS commands

### Network Printer Issues

**Printer Not Responding
1. Check printer IP address and port in Printer Settings
2. Ensure printer is on the same network
3. Test with curl: `curl -X POST --data-binary @barcode.bin http://PRINTER_IP:PORT`
4. Check firewall settings

### Barcode Not Printing Correctly
1. Verify barcode data is valid for the selected format
2. EAN13 requires exactly 12 digits (13th is check digit)
3. CODE128 supports alphanumeric data
4. Try different barcode formats

### Network Issues
- CORS: Printer must support direct HTTP POST
- Simulator: Use 10631 for local testing
- Production: Configure printer's network settings properly

## Future Enhancements

Possible additions:
- QR code support for extended product information
- Barcode scanner integration for inventory management
- Custom label templates with company logo
- Batch barcode generation from CSV import
- Multiple printer profiles
- Print preview before sending to printer
- Barcode verification after printing
