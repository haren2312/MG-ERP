/**
 * Run ESC/POS Printer Test
 * 
 * Usage:
 * 1. Make sure your ESC/POS simulator is running at 192.168.178.29:10631
 * 2. Run this script from the browser console or import it in your POS app
 */

import { testESCPOSPrinter, createDummyReceiptData, ESCPOSPrinter } from './escPosTest';

// Configuration
const PRINTER_HOST = '192.168.178.29';
const PRINTER_PORT = 10631;

/**
 * Run the test
 */
async function runTest() {
  console.log('='.repeat(50));
  console.log('ESC/POS Printer Test');
  console.log('='.repeat(50));
  console.log(`Printer: ${PRINTER_HOST}:${PRINTER_PORT}`);
  console.log('');

  try {
    // Create dummy receipt with multiple items
    const { data, settings } = createDummyReceiptData();
    
    console.log('Receipt Data:');
    console.log('- Sale Number:', data.saleNumber);
    console.log('- Items:', data.items.length);
    console.log('- Subtotal:', settings.currencySymbol + data.subtotal.toFixed(2));
    console.log('- Tax:', settings.currencySymbol + data.tax.toFixed(2));
    console.log('- Total:', settings.currencySymbol + data.total.toFixed(2));
    console.log('');

    // Print receipt
    const printer = new ESCPOSPrinter({ host: PRINTER_HOST, port: PRINTER_PORT });
    await printer.printReceipt(data, settings);
    
    console.log('');
    console.log('✓ SUCCESS: Receipt sent to printer!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('');
    console.error('✗ ERROR: Failed to send receipt');
    console.error('Details:', error);
    console.error('='.repeat(50));
    
    // Provide helpful troubleshooting info
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check if simulator is running');
    console.log('2. Verify IP address and port');
    console.log('3. Check if simulator accepts HTTP POST requests');
    console.log('4. Check browser console for CORS errors');
  }
}

// Run the test
runTest();
