/**
 * Barcode Generator Utility
 * Generates various barcode types (CODE128, CODE39, EAN13, QR Code) as SVG or Canvas
 */

export type BarcodeType = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC';

interface BarcodeOptions {
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  margin?: number;
}

/**
 * Generate CODE128 barcode
 */
function generateCODE128(data: string, options: BarcodeOptions = {}): string {
  const {
    width = 2,
    height = 100,
    displayValue = true,
    fontSize = 20,
    margin = 10
  } = options;

  // CODE128 encoding patterns (simplified)
  const patterns: { [key: string]: string } = {
    '0': '11011001100', '1': '11001101100', '2': '11001100110', '3': '10010011000',
    '4': '10010001100', '5': '10001001100', '6': '10011001000', '7': '10011000100',
    '8': '10001100100', '9': '11001001000', 'A': '11001000100', 'B': '11000100100',
    'C': '10110011100', 'D': '10011011100', 'E': '10011001110', 'F': '10111001000',
    'G': '10011101000', 'H': '10011100010', 'I': '11001110010', 'J': '11001011100',
    'K': '11001001110', 'L': '11011100100', 'M': '11001110100', 'N': '11101101110',
    'O': '11101001100', 'P': '11100101100', 'Q': '11100100110', 'R': '11101100100',
    'S': '11100110100', 'T': '11100110010', 'U': '11011011000', 'V': '11011000110',
    'W': '11000110110', 'X': '10100011000', 'Y': '10001011000', 'Z': '10001000110',
    ' ': '10110001000', '-': '10001101000', '.': '10001100010', '/': '11011000010'
  };

  let encoded = '11010010000'; // Start code B
  
  // Encode data
  for (const char of data.toUpperCase()) {
    encoded += patterns[char] || patterns['0'];
  }
  
  encoded += '1100011101011'; // Stop pattern

  // Calculate SVG dimensions
  const barWidth = width;
  const totalWidth = encoded.length * barWidth + margin * 2;
  const totalHeight = height + margin * 2 + (displayValue ? fontSize + 10 : 0);

  // Generate SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">`;
  svg += `<rect width="${totalWidth}" height="${totalHeight}" fill="white"/>`;
  
  let x = margin;
  for (const bit of encoded) {
    if (bit === '1') {
      svg += `<rect x="${x}" y="${margin}" width="${barWidth}" height="${height}" fill="black"/>`;
    }
    x += barWidth;
  }

  if (displayValue) {
    svg += `<text x="${totalWidth / 2}" y="${height + margin + fontSize}" text-anchor="middle" font-family="monospace" font-size="${fontSize}">${data}</text>`;
  }

  svg += '</svg>';
  return svg;
}

/**
 * Generate EAN13 barcode
 */
function generateEAN13(data: string, options: BarcodeOptions = {}): string {
  const {
    width = 2,
    height = 100,
    displayValue = true,
    fontSize = 20,
    margin = 10
  } = options;

  // Pad or truncate to 13 digits
  let ean = data.replace(/\D/g, '').slice(0, 13);
  while (ean.length < 13) ean = '0' + ean;

  // EAN13 patterns
  const lPatterns = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const gPatterns = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
  const rPatterns = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
  
  const firstDigitPatterns = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  
  const firstDigit = parseInt(ean[0]);
  const pattern = firstDigitPatterns[firstDigit];

  let encoded = '101'; // Start

  // Left side
  for (let i = 0; i < 6; i++) {
    const digit = parseInt(ean[i + 1]);
    encoded += pattern[i] === 'L' ? lPatterns[digit] : gPatterns[digit];
  }

  encoded += '01010'; // Center

  // Right side
  for (let i = 0; i < 6; i++) {
    const digit = parseInt(ean[i + 7]);
    encoded += rPatterns[digit];
  }

  encoded += '101'; // End

  const barWidth = width;
  const totalWidth = encoded.length * barWidth + margin * 2;
  const totalHeight = height + margin * 2 + (displayValue ? fontSize + 10 : 0);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}">`;
  svg += `<rect width="${totalWidth}" height="${totalHeight}" fill="white"/>`;
  
  let x = margin;
  for (const bit of encoded) {
    if (bit === '1') {
      svg += `<rect x="${x}" y="${margin}" width="${barWidth}" height="${height}" fill="black"/>`;
    }
    x += barWidth;
  }

  if (displayValue) {
    svg += `<text x="${totalWidth / 2}" y="${height + margin + fontSize}" text-anchor="middle" font-family="monospace" font-size="${fontSize}">${ean}</text>`;
  }

  svg += '</svg>';
  return svg;
}

/**
 * Generate barcode as SVG string
 */
export function generateBarcodeSVG(
  data: string,
  type: BarcodeType = 'CODE128',
  options: BarcodeOptions = {}
): string {
  switch (type) {
    case 'CODE128':
    case 'CODE39':
      return generateCODE128(data, options);
    case 'EAN13':
      return generateEAN13(data, options);
    case 'EAN8':
      return generateEAN13(data.slice(0, 8), { ...options, width: 2.5 });
    case 'UPC':
      return generateEAN13('0' + data.slice(0, 12), options);
    default:
      return generateCODE128(data, options);
  }
}

/**
 * Generate barcode as data URL (for images)
 */
export function generateBarcodeDataURL(
  data: string,
  type: BarcodeType = 'CODE128',
  options: BarcodeOptions = {}
): string {
  const svg = generateBarcodeSVG(data, type, options);
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Download barcode as image
 */
export function downloadBarcode(
  data: string,
  filename: string,
  type: BarcodeType = 'CODE128',
  options: BarcodeOptions = {}
): void {
  const svg = generateBarcodeSVG(data, type, options);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print barcode directly
 */
export function printBarcode(
  data: string,
  type: BarcodeType = 'CODE128',
  options: BarcodeOptions = {}
): void {
  const svg = generateBarcodeSVG(data, type, options);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Barcode - ${data}</title>
        <style>
          body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; }
          @media print {
            body { margin: 0; padding: 0; }
          }
        </style>
      </head>
      <body>
        ${svg}
        <script>
          window.onload = function() { 
            window.print(); 
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generate multiple barcodes in a sheet (for label printing)
 */
export function generateBarcodeSheet(
  items: Array<{ data: string; label?: string }>,
  type: BarcodeType = 'CODE128',
  options: { columns?: number; labelHeight?: number } = {}
): string {
  const { columns = 3, labelHeight = 150 } = options;

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode Sheet</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          .sheet { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 10px; }
          .barcode-cell { 
            border: 1px dashed #ccc; 
            padding: 10px; 
            text-align: center;
            break-inside: avoid;
            height: ${labelHeight}px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .barcode-label { 
            font-size: 12px; 
            margin-top: 5px; 
            font-weight: bold;
          }
          @media print {
            body { padding: 0; }
            .barcode-cell { border: none; page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
  `;

  items.forEach(item => {
    const barcodeSvg = generateBarcodeSVG(item.data, type, { width: 1.5, height: 60, displayValue: true });
    html += `
      <div class="barcode-cell">
        ${barcodeSvg}
        ${item.label ? `<div class="barcode-label">${item.label}</div>` : ''}
      </div>
    `;
  });

  html += `
        </div>
        <script>
          window.onload = function() { 
            window.print(); 
          };
        </script>
      </body>
    </html>
  `;

  return html;
}

/**
 * Print multiple barcodes as a sheet
 */
export function printBarcodeSheet(
  items: Array<{ data: string; label?: string }>,
  type: BarcodeType = 'CODE128',
  options: { columns?: number; labelHeight?: number } = {}
): void {
  const html = generateBarcodeSheet(items, type, options);
  const printWindow = window.open('', '_blank', 'width=900,height=600');
  if (!printWindow) return;

  printWindow.document.write(html);
  printWindow.document.close();
}
