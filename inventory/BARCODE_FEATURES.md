# Barcode Features - Inventory Module

## Overview
The Inventory module now includes comprehensive barcode generation and printing capabilities for product labels.

## Features

### 1. **Individual Product Barcodes**
- Click the "Barcode" button on any product row to view its barcode
- Modal displays the barcode with product name and SKU
- Print or download individual barcodes directly from the modal

### 2. **Batch Barcode Printing**
- Select multiple products using the checkboxes in the product table
- Click "Print X Barcodes" button that appears when products are selected
- Prints all selected barcodes in a 3-column sheet layout optimized for label printers

### 3. **Barcode Generation**
Supports multiple barcode formats:
- **CODE128**: Default format, most versatile (alphanumeric)
- **CODE39**: Alphanumeric barcode
- **EAN13**: 13-digit product barcodes (retail standard)
- **EAN8**: 8-digit compact barcodes
- **UPC**: Universal Product Code (12 digits)

### 4. **Barcode Data Source**
The system uses the following priority for barcode data:
1. Product barcode field (if set)
2. Product SKU
3. Product ID (fallback)

## Components

### Files Created
1. **`src/utils/barcodeGenerator.ts`** - Core barcode generation utility
   - `generateBarcodeSVG()` - Creates SVG barcode markup
   - `generateCODE128()`, `generateEAN13()`, etc. - Format-specific encoders
   - `downloadBarcode()` - Downloads barcode as PNG file
   - `printBarcode()` - Prints single barcode
   - `printBarcodeSheet()` - Prints multiple barcodes in grid layout

2. **`src/components/BarcodeDisplay.tsx`** - React component for barcode display
   - Renders barcode SVG with product label
   - Print and Download action buttons
   - Responsive design

### Files Modified
1. **`src/pages/Products.tsx`**
   - Added checkbox column for product selection
   - Added "Print Selected Barcodes" button
   - Added "Barcode" action button per product
   - Added barcode viewing modal
   - State management for selected products

## Usage

### View Single Barcode
1. Navigate to Products page
2. Click "Barcode" button on any product
3. Modal opens showing barcode with print/download options

### Print Multiple Barcodes
1. Navigate to Products page
2. Select products using checkboxes (or select all with header checkbox)
3. Click "Print X Barcodes" button
4. Browser print dialog opens with barcode sheet
5. Print to label printer or save as PDF

### Download Barcode
1. Open a product's barcode modal
2. Click "Download" button
3. PNG image file downloads with format: `barcode-{data}.png`

## Label Printer Settings

For best results with label printers:
- **Paper Size**: Custom (adjust to your label size)
- **Margins**: Minimum or None
- **Scale**: Fit to page or 100%
- **Sheet Layout**: 3 columns by default (configurable)
- **Label Height**: 150px default (configurable)

## Technical Details

### Barcode Encoding
- Pure TypeScript implementation (no external dependencies)
- SVG-based rendering for crisp output at any size
- Proper check digit calculation for EAN/UPC formats
- START/STOP patterns and quiet zones included

### Print Optimization
- CSS print media queries for clean output
- Page break avoidance for individual barcodes
- Grid layout with configurable columns
- Dashed borders in preview, removed in print

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Edge, Safari)
- Uses native SVG rendering
- HTML5 Canvas API for PNG export

## Future Enhancements

Possible additions:
- QR code support for extended product information
- Barcode scanner integration for inventory management
- Custom label templates with company logo
- Batch barcode generation from CSV import
- Integration with ESC/POS thermal printers (like POS module)
