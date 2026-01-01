/**
 * ESC/POS Barcode Printing Utility
 * Sends ESC/POS barcode commands to thermal printer
 */

export interface PrinterConfig {
  host: string;
  port: number;
}

// ESC/POS command constants
const ESC = '\x1B';
const GS = '\x1D';

// Barcode types for ESC/POS
export enum ESCPOSBarcodeType {
  UPC_A = 0,
  UPC_E = 1,
  EAN13 = 2,
  EAN8 = 3,
  CODE39 = 4,
  ITF = 5,
  CODABAR = 6,
  CODE93 = 7,
  CODE128 = 73
}

// HRI (Human Readable Interpretation) position
export enum HRIPosition {
  NOT_PRINTED = 0,
  ABOVE = 1,
  BELOW = 2,
  BOTH = 3
}

export interface BarcodeOptions {
  type?: ESCPOSBarcodeType;
  width?: number; // 2-6 (module width)
  height?: number; // 1-255 (barcode height in dots)
  hri?: HRIPosition;
  label?: string;
}

/**
 * Convert string to byte array
 */
function textToBytes(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    bytes.push(text.charCodeAt(i));
  }
  return bytes;
}

/**
 * Build ESC/POS commands for printing a single barcode
 */
export function buildBarcodeCommands(
  data: string,
  options: BarcodeOptions = {}
): Uint8Array {
  const commands: number[] = [];
  
  const {
    type = ESCPOSBarcodeType.CODE128,
    width = 3,
    height = 100,
    hri = HRIPosition.BELOW,
    label
  } = options;

  // Initialize printer
  commands.push(...textToBytes(ESC + '@'));

  // Center align
  commands.push(...textToBytes(ESC + 'a' + String.fromCharCode(1)));

  // If label exists, print it above barcode
  if (label) {
    commands.push(...textToBytes(ESC + 'E' + String.fromCharCode(1))); // Bold on
    commands.push(...textToBytes(label + '\n'));
    commands.push(...textToBytes(ESC + 'E' + String.fromCharCode(0))); // Bold off
  }

  // Set barcode width
  commands.push(...textToBytes(GS + 'w' + String.fromCharCode(width)));

  // Set barcode height
  commands.push(...textToBytes(GS + 'h' + String.fromCharCode(height)));

  // Set HRI position
  commands.push(...textToBytes(GS + 'H' + String.fromCharCode(hri)));

  // Set HRI font (Font A - smaller)
  commands.push(...textToBytes(GS + 'f' + String.fromCharCode(0)));

  // Print barcode
  if (type === ESCPOSBarcodeType.CODE128) {
    // CODE128 format: GS k m n d1...dn
    // m = 73 (CODE128)
    // n = length of data
    commands.push(...textToBytes(GS + 'k'));
    commands.push(type);
    commands.push(data.length);
    commands.push(...textToBytes(data));
  } else {
    // Other formats: GS k m d1...dn NUL
    commands.push(...textToBytes(GS + 'k'));
    commands.push(type);
    commands.push(...textToBytes(data));
    commands.push(0); // NUL terminator
  }

  // Add some spacing
  commands.push(...textToBytes('\n\n'));

  // Feed and cut
  commands.push(...textToBytes(GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0)));

  return new Uint8Array(commands);
}

/**
 * Build ESC/POS commands for printing multiple barcodes
 */
export function buildBarcodeSheetCommands(
  items: Array<{ data: string; label?: string }>,
  options: BarcodeOptions = {}
): Uint8Array {
  const commands: number[] = [];
  
  const {
    type = ESCPOSBarcodeType.CODE128,
    width = 3,
    height = 80,
    hri = HRIPosition.BELOW
  } = options;

  // Initialize printer
  commands.push(...textToBytes(ESC + '@'));

  // Set character code table
  commands.push(...textToBytes(ESC + 't' + String.fromCharCode(0)));

  items.forEach((item, index) => {
    // Center align
    commands.push(...textToBytes(ESC + 'a' + String.fromCharCode(1)));

    // Print label if exists
    if (item.label) {
      commands.push(...textToBytes(ESC + 'E' + String.fromCharCode(1))); // Bold on
      commands.push(...textToBytes(item.label + '\n'));
      commands.push(...textToBytes(ESC + 'E' + String.fromCharCode(0))); // Bold off
    }

    // Set barcode parameters
    commands.push(...textToBytes(GS + 'w' + String.fromCharCode(width)));
    commands.push(...textToBytes(GS + 'h' + String.fromCharCode(height)));
    commands.push(...textToBytes(GS + 'H' + String.fromCharCode(hri)));
    commands.push(...textToBytes(GS + 'f' + String.fromCharCode(0)));

    // Print barcode
    if (type === ESCPOSBarcodeType.CODE128) {
      commands.push(...textToBytes(GS + 'k'));
      commands.push(type);
      commands.push(item.data.length);
      commands.push(...textToBytes(item.data));
    } else {
      commands.push(...textToBytes(GS + 'k'));
      commands.push(type);
      commands.push(...textToBytes(item.data));
      commands.push(0);
    }

    // Add spacing between labels
    commands.push(...textToBytes('\n'));
    
    // Add dashed line separator (except for last item)
    if (index < items.length - 1) {
      commands.push(...textToBytes('-'.repeat(32) + '\n'));
    }
  });

  // Feed and cut at the end
  commands.push(...textToBytes('\n'));
  commands.push(...textToBytes(GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0)));

  return new Uint8Array(commands);
}

/**
 * Send raw bytes to thermal printer
 */
export async function sendToPrinter(
  commands: Uint8Array,
  config: PrinterConfig
): Promise<void> {
  const url = `http://${config.host}:${config.port}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: commands as BodyInit,
    });

    if (!response.ok) {
      throw new Error(`Printer returned status ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to send to printer:', error);
    throw error;
  }
}

/**
 * Print a single barcode
 */
export async function printBarcode(
  data: string,
  config: PrinterConfig,
  options: BarcodeOptions = {}
): Promise<void> {
  const commands = buildBarcodeCommands(data, options);
  await sendToPrinter(commands, config);
}

/**
 * Print multiple barcodes
 */
export async function printBarcodeSheet(
  items: Array<{ data: string; label?: string }>,
  config: PrinterConfig,
  options: BarcodeOptions = {}
): Promise<void> {
  const commands = buildBarcodeSheetCommands(items, options);
  await sendToPrinter(commands, config);
}

/**
 * Download barcode commands as .bin file
 */
export function downloadBarcodeCommands(
  data: string,
  options: BarcodeOptions = {}
): void {
  const commands = buildBarcodeCommands(data, options);
  const blob = new Blob([commands as BlobPart], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `barcode-${data}-escpos.bin`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get printer config from localStorage or use default
 */
export function getPrinterConfig(): PrinterConfig {
  const stored = localStorage.getItem('escpos_printer_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to default
    }
  }
  return {
    host: '192.168.178.29',
    port: 10631
  };
}

/**
 * Save printer config to localStorage
 */
export function savePrinterConfig(config: PrinterConfig): void {
  localStorage.setItem('escpos_printer_config', JSON.stringify(config));
}
