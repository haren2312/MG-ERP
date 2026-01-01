/**
 * Web Serial API Barcode Printer Utility
 * Direct USB/Serial connection to ESC/POS thermal printers
 */

type WebSerialPort = any;
let cachedPort: WebSerialPort | null = null;

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
  width?: number;
  height?: number;
  hri?: HRIPosition;
  label?: string;
}

/**
 * Convert string to bytes
 */
function toBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

/**
 * Get or request serial port
 */
async function getSerialPort(): Promise<WebSerialPort> {
  if (cachedPort) return cachedPort;
  
  if (!('serial' in navigator)) {
    throw new Error('Web Serial API is not available in this browser. Use Chrome or Edge.');
  }
  
  const port = await (navigator as any).serial.requestPort();
  await port.open({ baudRate: 9600 });
  cachedPort = port;
  return port;
}

/**
 * Write data to serial port
 */
async function writeToPort(port: WebSerialPort, data: Uint8Array | string) {
  const writer = port.writable!.getWriter();
  try {
    const chunk = typeof data === 'string' ? toBytes(data) : data;
    await writer.write(chunk);
  } finally {
    writer.releaseLock();
  }
}

/**
 * Build ESC/POS commands for printing a single barcode
 */
function buildBarcodeCommands(
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
  commands.push(...Array.from(toBytes(ESC + '@')));

  // Center align
  commands.push(...Array.from(toBytes(ESC + 'a' + String.fromCharCode(1))));

  // If label exists, print it above barcode
  if (label) {
    commands.push(...Array.from(toBytes(ESC + 'E' + String.fromCharCode(1)))); // Bold on
    commands.push(...Array.from(toBytes(label + '\n')));
    commands.push(...Array.from(toBytes(ESC + 'E' + String.fromCharCode(0)))); // Bold off
  }

  // Set barcode width
  commands.push(...Array.from(toBytes(GS + 'w' + String.fromCharCode(width))));

  // Set barcode height
  commands.push(...Array.from(toBytes(GS + 'h' + String.fromCharCode(height))));

  // Set HRI position
  commands.push(...Array.from(toBytes(GS + 'H' + String.fromCharCode(hri))));

  // Set HRI font (Font A - smaller)
  commands.push(...Array.from(toBytes(GS + 'f' + String.fromCharCode(0))));

  // Print barcode
  if (type === ESCPOSBarcodeType.CODE128) {
    commands.push(...Array.from(toBytes(GS + 'k')));
    commands.push(type);
    commands.push(data.length);
    commands.push(...Array.from(toBytes(data)));
  } else {
    commands.push(...Array.from(toBytes(GS + 'k')));
    commands.push(type);
    commands.push(...Array.from(toBytes(data)));
    commands.push(0);
  }

  // Add some spacing
  commands.push(...Array.from(toBytes('\n\n')));

  // Feed and cut
  commands.push(...Array.from(toBytes(GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0))));

  return new Uint8Array(commands);
}

/**
 * Print single barcode via Web Serial API
 */
export async function printBarcodeSerial(
  data: string,
  options: BarcodeOptions = {}
): Promise<void> {
  const port = await getSerialPort();
  const commands = buildBarcodeCommands(data, options);
  await writeToPort(port, commands);
}

/**
 * Print multiple barcodes via Web Serial API
 */
export async function printBarcodeSheetSerial(
  items: Array<{ data: string; label?: string }>,
  options: BarcodeOptions = {}
): Promise<void> {
  const port = await getSerialPort();
  
  const {
    type = ESCPOSBarcodeType.CODE128,
    width = 3,
    height = 80,
    hri = HRIPosition.BELOW
  } = options;

  // Initialize printer
  await writeToPort(port, toBytes(ESC + '@'));
  await writeToPort(port, toBytes(ESC + 't' + String.fromCharCode(0)));

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Center align
    await writeToPort(port, toBytes(ESC + 'a' + String.fromCharCode(1)));

    // Print label if exists
    if (item.label) {
      await writeToPort(port, toBytes(ESC + 'E' + String.fromCharCode(1))); // Bold on
      await writeToPort(port, toBytes(item.label + '\n'));
      await writeToPort(port, toBytes(ESC + 'E' + String.fromCharCode(0))); // Bold off
    }

    // Set barcode parameters
    await writeToPort(port, toBytes(GS + 'w' + String.fromCharCode(width)));
    await writeToPort(port, toBytes(GS + 'h' + String.fromCharCode(height)));
    await writeToPort(port, toBytes(GS + 'H' + String.fromCharCode(hri)));
    await writeToPort(port, toBytes(GS + 'f' + String.fromCharCode(0)));

    // Print barcode
    if (type === ESCPOSBarcodeType.CODE128) {
      await writeToPort(port, toBytes(GS + 'k'));
      await writeToPort(port, new Uint8Array([type, item.data.length]));
      await writeToPort(port, toBytes(item.data));
    } else {
      await writeToPort(port, toBytes(GS + 'k'));
      await writeToPort(port, new Uint8Array([type]));
      await writeToPort(port, toBytes(item.data));
      await writeToPort(port, new Uint8Array([0]));
    }

    // Add spacing between labels
    await writeToPort(port, toBytes('\n'));
    
    // Add dashed line separator (except for last item)
    if (i < items.length - 1) {
      await writeToPort(port, toBytes('-'.repeat(32) + '\n'));
    }
  }

  // Feed and cut at the end
  await writeToPort(port, toBytes('\n'));
  await writeToPort(port, toBytes(GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0)));
}

/**
 * Check if Web Serial API is available
 */
export function isWebSerialSupported(): boolean {
  return 'serial' in navigator;
}

/**
 * Reset cached port (for reconnecting)
 */
export function resetSerialPort(): void {
  cachedPort = null;
}
