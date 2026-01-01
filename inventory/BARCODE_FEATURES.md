# Barcode Features - Inventory Module

## Overview
The Inventory module includes comprehensive barcode generation and ESC/POS thermal printing capabilities for product labels.

## Features

### 1. **ESC/POS Thermal Printing**
- Direct printing to ESC/POS thermal printers via network
- Configure printer IP and port in Printer Settings
- Print individual or batch barcodes to label printers
- Native barcode commands for crisp, high-quality output
- Supports common thermal printer ports (9100, 10631)

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
1. **`src/utils/escPosBarcodeUtils.ts`** - ESC/POS thermal printer utility
   - `buildBarcodeCommands()` - Creates ESC/POS barcode commands
   - `buildBarcodeSheetCommands()` - Creates multiple barcode commands
   - `sendToPrinter()` - Sends raw bytes to network printer
   - `printBarcode()` - Prints single barcode
   - `printBarcodeSheet()` - Prints multiple barcodes
   - `downloadBarcodeCommands()` - Downloads ESC/POS commands as .bin
   - `getPrinterConfig()` / `savePrinterConfig()` - Manage printer settings

2. **`src/utils/barcodeGenerator.ts`** - SVG barcode generation utility
   - `generateBarcodeSVG()` - Creates SVG barcode markup for display
   - `generateCODE128()`, `generateEAN13()`, etc. - Format-specific encoders
   - `downloadBarcode()` - Downloads barcode as PNG file

3. **`src/components/BarcodeDisplay.tsx`** - React component for barcode display
   - Renders barcode SVG with product label
   - Three action buttons: Print (ESC/POS), Download PNG, Download ESC/POS
   - Maps barcode types to ESC/POS formats
   - Async printing with loading state

4. **`src/components/PrinterSettings.tsx`** - Printer configuration modal
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

### Configure Printer
1. Navigate to Products page
2. Click the "Printer" button (🖨️) in the top right
3. Enter your thermal printer's IP address (e.g., 192.168.1.100)
4. Enter the port (usually 9100 for printers, 10631 for simulator)
5. Click "Save Settings"

### Print Single Barcode
1. Navigate to Products page
2. Click "Barcode" button on any product
3. Enter desired quantity (1-50 copies)
4. Click **Print (ESC/POS)** button
5. Barcodes print directly to thermal printer

### Print Multiple Barcodes
1. Navigate to Products page
2. Select products using checkboxes (or select all with header checkbox)
3. Click "Print X Barcodes" button
4. Enter quantity per product (1-100 copies each)
5. Modal shows total: e.g., "3 products × 5 copies = 15 total barcodes"
6. Click "Print Now"
7. All barcodes print to thermal printer

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

### Tested With
- ESC/POS thermal printers (58mm and 80mm)
- Network-connected printers with HTTP interface
- ESC/POS printer simulators

### Common Printer Ports
- **9100**: Standard RAW printing port
- **10631**: Common for simulators and test environments
- **515**: LPR/LPD protocol (not supported, use 9100)

## Technical Details

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
- Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- Fetch API for network communication
- LocalStorage for printer configuration persistence
- Async/await for clean error handling

## Troubleshooting

### Printer Not Responding
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
