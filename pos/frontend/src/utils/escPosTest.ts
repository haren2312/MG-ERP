/**
 * ESC/POS Printer Test Utility
 * Sends ESC/POS commands to a network thermal printer or simulator
 * Uses the same receipt structure as POS.tsx
 */

import type { ReceiptData, ReceiptSettings } from './receiptPrinter';

export interface PrinterConfig {
  host: string;
  port: number;
}

// ESC/POS command constants
const ESC = '\x1B';
const GS = '\x1D';

/**
 * Format currency value
 */
function formatCurrency(v: number, currencyCode: string): string {
  const value = typeof v === 'number' && !isNaN(v) ? v : 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode || 'USD' }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currencyCode || 'USD'}`;
  }
}

/**
 * Create two-column line (label on left, value on right)
 */
function twoColumnLine(label: string, value: string, width: number = 32): string {
  if (label.length + value.length > width) {
    return label.substring(0, width - value.length) + value;
  }
  const spaces = width - label.length - value.length;
  return label + ' '.repeat(spaces) + value;
}

export class ESCPOSPrinter {
  private config: PrinterConfig;

  constructor(config: PrinterConfig) {
    this.config = config;
  }

  /**
   * Build ESC/POS command bytes from receipt data
   * Uses same structure as POS.tsx printReceipt function
   */
  private buildReceiptCommands(receiptData: ReceiptData, settings: ReceiptSettings): Uint8Array {
    const commands: number[] = [];
    const lineWidth = 32; // Typical 58mm thermal printer

    // Initialize printer
    commands.push(...this.textToBytes(ESC + '@'));

    // Set character code table (PC437)
    commands.push(...this.textToBytes(ESC + 't' + String.fromCharCode(0)));

    // Center align
    commands.push(...this.textToBytes(ESC + 'a' + String.fromCharCode(1)));

    // Bold on
    commands.push(...this.textToBytes(ESC + 'E' + String.fromCharCode(1)));

    // Double size text for business name
    commands.push(...this.textToBytes(GS + '!' + String.fromCharCode(0x11)));
    commands.push(...this.textToBytes((settings.businessName || 'STORE').toUpperCase() + '\n'));

    // Normal size
    commands.push(...this.textToBytes(GS + '!' + String.fromCharCode(0)));

    // Bold off
    commands.push(...this.textToBytes(ESC + 'E' + String.fromCharCode(0)));

    // Business details
    if (settings.businessAddress) {
      commands.push(...this.textToBytes(settings.businessAddress + '\n'));
    }
    if (settings.businessPhone) {
      commands.push(...this.textToBytes('Tel: ' + settings.businessPhone + '\n'));
    }
    if (settings.businessEmail) {
      commands.push(...this.textToBytes(settings.businessEmail + '\n'));
    }

    // Receipt header if exists
    if (settings.receiptHeader) {
      commands.push(...this.textToBytes('\n' + settings.receiptHeader + '\n'));
    }

    // Dashed line
    commands.push(...this.textToBytes('\n' + '-'.repeat(lineWidth) + '\n'));

    // Left align for transaction details
    commands.push(...this.textToBytes(ESC + 'a' + String.fromCharCode(0)));

    commands.push(...this.textToBytes('Sale #: ' + receiptData.saleNumber + '\n'));
    commands.push(...this.textToBytes('Date: ' + receiptData.date.toLocaleString() + '\n'));
    
    if (receiptData.cashier) {
      commands.push(...this.textToBytes('Cashier: ' + receiptData.cashier + '\n'));
    }
    
    if (receiptData.customerName) {
      commands.push(...this.textToBytes('Customer: ' + receiptData.customerName + '\n'));
    }

    // Dashed line
    commands.push(...this.textToBytes('-'.repeat(lineWidth) + '\n'));

    // Items
    receiptData.items.forEach(item => {
      // Item name with size
      const itemName = item.name + (item.size ? ' (' + item.size + ')' : '');
      commands.push(...this.textToBytes(itemName + '\n'));
      
      // Quantity x Price and Total
      const qtyPrice = `  ${item.qty} x ${formatCurrency(item.price, settings.currencyCode)}`;
      const total = formatCurrency(item.total, settings.currencyCode);
      commands.push(...this.textToBytes(twoColumnLine(qtyPrice, total, lineWidth) + '\n'));
    });

    // Dashed line
    commands.push(...this.textToBytes('-'.repeat(lineWidth) + '\n'));

    // Subtotal
    commands.push(...this.textToBytes(
      twoColumnLine('Subtotal:', formatCurrency(receiptData.subtotal, settings.currencyCode), lineWidth) + '\n'
    ));

    // Discount if any
    if (receiptData.discount > 0) {
      commands.push(...this.textToBytes(
        twoColumnLine('Discount:', '-' + formatCurrency(receiptData.discount, settings.currencyCode), lineWidth) + '\n'
      ));
    }

    // Tax
    const taxLabel = receiptData.taxRate ? `Tax (${Math.round(receiptData.taxRate * 100)}%):` : 'Tax:';
    commands.push(...this.textToBytes(
      twoColumnLine(taxLabel, formatCurrency(receiptData.tax, settings.currencyCode), lineWidth) + '\n'
    ));

    // Bold on for total
    commands.push(...this.textToBytes(ESC + 'E' + String.fromCharCode(1)));
    commands.push(...this.textToBytes(
      twoColumnLine('TOTAL:', formatCurrency(receiptData.total, settings.currencyCode), lineWidth) + '\n'
    ));
    commands.push(...this.textToBytes(ESC + 'E' + String.fromCharCode(0)));

    // Payment details
    commands.push(...this.textToBytes('\n'));
    commands.push(...this.textToBytes(
      twoColumnLine('Payment:', receiptData.paymentMethod, lineWidth) + '\n'
    ));

    if (receiptData.tenderedAmount !== undefined) {
      commands.push(...this.textToBytes(
        twoColumnLine('Tendered:', formatCurrency(receiptData.tenderedAmount, settings.currencyCode), lineWidth) + '\n'
      ));
      commands.push(...this.textToBytes(
        twoColumnLine('Change:', formatCurrency(receiptData.changeAmount || 0, settings.currencyCode), lineWidth) + '\n'
      ));
    }

    // Center align for footer
    commands.push(...this.textToBytes(ESC + 'a' + String.fromCharCode(1)));
    
    if (settings.receiptFooter) {
      commands.push(...this.textToBytes('\n' + settings.receiptFooter + '\n'));
    }

    // Feed and cut
    commands.push(...this.textToBytes('\n\n\n'));
    commands.push(...this.textToBytes(GS + 'V' + String.fromCharCode(66, 0))); // Partial cut

    return new Uint8Array(commands);
  }

  /**
   * Convert text to byte array
   */
  private textToBytes(text: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i));
    }
    return bytes;
  }

  /**
   * Print receipt using receiptData and settings (same as POS.tsx)
   */
  async printReceipt(receiptData: ReceiptData, settings: ReceiptSettings): Promise<void> {
    const commands = this.buildReceiptCommands(receiptData, settings);
    const url = `http://${this.config.host}:${this.config.port}/`;

    try {
      console.log(`Sending ${commands.length} bytes to ${url}...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: commands as BodyInit,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✓ Receipt printed successfully!');
      const result = await response.text();
      if (result) {
        console.log('Response:', result);
      }
    } catch (error) {
      console.error('Error sending print command:', error);
      throw error;
    }
  }

  /**
   * Send raw ESC/POS commands
   */
  async sendRaw(commands: Uint8Array): Promise<void> {
    const url = `http://${this.config.host}:${this.config.port}/`;

    try {
      console.log(`Sending ${commands.length} bytes to ${url}...`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: commands as BodyInit,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Raw commands sent successfully!');
    } catch (error) {
      console.error('Error sending raw commands:', error);
      throw error;
    }
  }
}

/**
 * Create dummy receipt data with multiple items (same structure as POS.tsx)
 */
export function createDummyReceiptData(): { data: ReceiptData; settings: ReceiptSettings } {
  const data: ReceiptData = {
    saleNumber: 'TEST-' + Date.now().toString().slice(-6),
    date: new Date(),
    cashier: 'Test Cashier',
    customerName: 'John Doe',
    items: [
      {
        name: 'Wireless Mouse',
        qty: 2,
        price: 15.99,
        size: null,
        total: 31.98
      },
      {
        name: 'USB-C Cable',
        qty: 3,
        price: 8.50,
        size: '2m',
        total: 25.50
      },
      {
        name: 'Laptop Stand',
        qty: 1,
        price: 45.00,
        size: 'Aluminum',
        total: 45.00
      },
      {
        name: 'Keyboard (Mechanical)',
        qty: 1,
        price: 89.99,
        size: 'RGB',
        total: 89.99
      },
      {
        name: 'HDMI Cable',
        qty: 2,
        price: 12.75,
        size: '3m',
        total: 25.50
      }
    ],
    subtotal: 217.97,
    discount: 10.00,
    tax: 29.12,
    taxRate: 0.14,
    total: 237.09,
    paymentMethod: 'Cash',
    tenderedAmount: 250.00,
    changeAmount: 12.91
  };

  const settings: ReceiptSettings = {
    currencyCode: 'USD',
    currencySymbol: '$',
    receiptHeader: 'Thank you for shopping with us!',
    receiptFooter: 'Visit us again soon!\nwww.teststore.com',
    businessName: 'MG-ERP Test Store',
    businessAddress: '123 Main Street, Suite 100\nNew York, NY 10001',
    businessPhone: '+1 (555) 123-4567',
    businessEmail: 'info@teststore.com'
  };

  return { data, settings };
}

/**
 * Test function to send a sample receipt to the printer
 * Uses same receipt structure as POS.tsx
 */
export async function testESCPOSPrinter(host: string = '192.168.178.29', port: number = 10631): Promise<void> {
  const printer = new ESCPOSPrinter({ host, port });
  const { data, settings } = createDummyReceiptData();
  
  try {
    console.log('Sending test receipt with ' + data.items.length + ' items...');
    await printer.printReceipt(data, settings);
    console.log('✓ Test receipt sent successfully!');
  } catch (error) {
    console.error('✗ Failed to send test receipt:', error);
    throw error;
  }
}
