/**
 * Receipt Printer Utility
 * Common utility for printing thermal receipts across the application
 */

export interface ReceiptSettings {
  currencyCode: string;
  currencySymbol: string;
  receiptHeader: string;
  receiptFooter: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  size?: string | null;
  total: number;
}

export interface ReceiptData {
  saleNumber: string;
  date: Date;
  cashier?: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate?: number;
  total: number;
  paymentMethod: string;
  tenderedAmount?: number;
  changeAmount?: number;
}

function formatCurrency(v: number, currencyCode: string): string {
  const value = typeof v === 'number' && !isNaN(v) ? v : 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode || 'USD' }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currencyCode || 'USD'}`;
  }
}

export function printReceipt(receiptData: ReceiptData, settings: ReceiptSettings): void {
  const {
    saleNumber,
    date,
    cashier,
    customerName,
    items,
    subtotal,
    discount,
    tax,
    taxRate,
    total,
    paymentMethod,
    tenderedAmount,
    changeAmount
  } = receiptData;

  const {
    currencyCode,
    receiptHeader,
    receiptFooter,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail
  } = settings;

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Receipt - ${saleNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @page {
          size: 80mm 297mm;
          margin: 0;
        }
        @media print {
          html, body {
            width: 80mm !important;
            margin: 0;
            padding: 0;
          }
          body {
            padding: 3mm 5mm !important;
          }
        }
        html {
          width: 80mm;
        }
        body { 
          font-family: 'Courier New', 'Consolas', monospace; 
          width: 80mm;
          margin: 0;
          padding: 3mm 5mm;
          font-size: 14px;
          line-height: 1.5;
          text-align: left;
          background: white;
          color: black;
        }
        .center { text-align: center; }
        .small { font-size: 12px; color: #000; line-height: 1.4; }
        .bold { font-weight: bold; }
        .divider { 
          border-top: 2px dashed #000; 
          margin: 6px 0;
          height: 0;
        }
        .header { 
          font-size: 16px; 
          font-weight: bold; 
          margin: 3px 0;
          text-transform: uppercase;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          font-size: 13px;
        }
        td { 
          padding: 2px 0; 
          vertical-align: top; 
        }
        .totals td { 
          padding: 4px 0; 
          font-size: 14px; 
        }
        .total-row { 
          font-size: 16px; 
          font-weight: bold;
          padding-top: 6px !important;
        }
      </style>
    </head>
    <body>
      <div class="center">
        <div class="header">${businessName || 'Store'}</div>
        ${businessAddress ? `<div class="small">${businessAddress}</div>` : ''}
        ${businessPhone ? `<div class="small">Tel: ${businessPhone}</div>` : ''}
        ${businessEmail ? `<div class="small">${businessEmail}</div>` : ''}
      </div>
      ${receiptHeader ? `<div class="divider"></div><div class="small center">${receiptHeader}</div>` : ''}
      <div class="divider"></div>
      <div>Sale #: ${saleNumber}</div>
      <div class="small">Date: ${date.toLocaleString()}</div>
      ${cashier ? `<div class="small">Cashier: ${cashier}</div>` : ''}
      ${customerName ? `<div class="small">Customer: ${customerName}</div>` : ''}
      <div class="divider"></div>
      <table>
        ${items.map(item => `
          <tr>
            <td colspan="2"><strong>${item.name}${item.size ? ' (' + item.size + ')' : ''}</strong></td>
          </tr>
          <tr>
            <td class="small">${item.qty} x ${formatCurrency(item.price, currencyCode)}</td>
            <td style="text-align:right"><strong>${formatCurrency(item.total, currencyCode)}</strong></td>
          </tr>
        `).join('')}
      </table>
      <div class="divider"></div>
      <table class="totals">
        <tr>
          <td>Subtotal</td>
          <td style="text-align:right">${formatCurrency(subtotal, currencyCode)}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td>Discount</td>
          <td style="text-align:right">${formatCurrency(discount, currencyCode)}</td>
        </tr>` : ''}
        <tr>
          <td>Tax${taxRate ? ' (' + Math.round(taxRate * 100) + '%)' : ''}</td>
          <td style="text-align:right">${formatCurrency(tax, currencyCode)}</td>
        </tr>
        <tr class="total-row">
          <td class="bold">TOTAL</td>
          <td style="text-align:right" class="bold">${formatCurrency(total, currencyCode)}</td>
        </tr>
        <tr>
          <td>Payment</td>
          <td style="text-align:right">${paymentMethod}</td>
        </tr>
        ${tenderedAmount ? `
        <tr>
          <td>Tendered</td>
          <td style="text-align:right">${formatCurrency(tenderedAmount, currencyCode)}</td>
        </tr>
        <tr>
          <td>Change</td>
          <td style="text-align:right">${formatCurrency(changeAmount || 0, currencyCode)}</td>
        </tr>` : ''}
      </table>
      ${receiptFooter ? `<div class="divider"></div><div class="small center">${receiptFooter}</div>` : ''}
    </body>
    <script>
      window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };
    </script>
  </html>`;

  const w = window.open('', '_blank', 'width=350,height=600');
  if (!w) return;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  w.location.href = url;
}

// PDF-friendly print on A4 to allow Save as PDF
export function printReceiptPdf(receiptData: ReceiptData, settings: ReceiptSettings): void {
  const {
    saleNumber,
    date,
    cashier,
    customerName,
    items,
    subtotal,
    discount,
    tax,
    taxRate,
    total,
    paymentMethod,
    tenderedAmount,
    changeAmount
  } = receiptData;

  const {
    currencyCode,
    receiptHeader,
    receiptFooter,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail
  } = settings;

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Receipt (PDF) - ${saleNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 80mm; margin: 5mm 4mm; }
        html, body { width: 80mm; }
        body {
          font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
          font-size: 12pt;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
        }
        .container { width: 80mm; margin: 0; padding: 0; }
        .center { text-align: center; }
        .small { font-size: 10pt; color: #000; }
        .bold { font-weight: 600; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .header { font-size: 14pt; font-weight: 700; margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12pt; }
        td { padding: 3px 0; vertical-align: top; }
        .totals td { padding: 5px 0; }
        .total-row { font-size: 14pt; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="center">
          <div class="header">${businessName || 'Store'}</div>
          ${businessAddress ? `<div class="small">${businessAddress}</div>` : ''}
          ${businessPhone ? `<div class="small">Tel: ${businessPhone}</div>` : ''}
          ${businessEmail ? `<div class="small">${businessEmail}</div>` : ''}
        </div>
        ${receiptHeader ? `<div class="divider"></div><div class="small center">${receiptHeader}</div>` : ''}
        <div class="divider"></div>
        <div class="small">Sale #: ${saleNumber}</div>
        <div class="small">Date: ${date.toLocaleString()}</div>
        ${cashier ? `<div class="small">Cashier: ${cashier}</div>` : ''}
        ${customerName ? `<div class="small">Customer: ${customerName}</div>` : ''}
        <div class="divider"></div>
        <table>
          ${items.map(item => `
            <tr>
              <td colspan="2"><strong>${item.name}${item.size ? ' (' + item.size + ')' : ''}</strong></td>
            </tr>
            <tr>
              <td class="small">${item.qty} x ${formatCurrency(item.price, currencyCode)}</td>
              <td style="text-align:right"><strong>${formatCurrency(item.total, currencyCode)}</strong></td>
            </tr>
          `).join('')}
        </table>
        <div class="divider"></div>
        <table class="totals">
          <tr>
            <td>Subtotal</td>
            <td style="text-align:right">${formatCurrency(subtotal, currencyCode)}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td>Discount</td>
            <td style="text-align:right">${formatCurrency(discount, currencyCode)}</td>
          </tr>` : ''}
          <tr>
            <td>Tax${taxRate ? ' (' + Math.round(taxRate * 100) + '%)' : ''}</td>
            <td style="text-align:right">${formatCurrency(tax, currencyCode)}</td>
          </tr>
          <tr class="total-row">
            <td class="bold">TOTAL</td>
            <td style="text-align:right" class="bold">${formatCurrency(total, currencyCode)}</td>
          </tr>
          <tr>
            <td>Payment</td>
            <td style="text-align:right">${paymentMethod}</td>
          </tr>
          ${tenderedAmount ? `
          <tr>
            <td>Tendered</td>
            <td style="text-align:right">${formatCurrency(tenderedAmount, currencyCode)}</td>
          </tr>
          <tr>
            <td>Change</td>
            <td style="text-align:right">${formatCurrency(changeAmount || 0, currencyCode)}</td>
          </tr>` : ''}
        </table>
        ${receiptFooter ? `<div class="divider"></div><div class="small center">${receiptFooter}</div>` : ''}
      </div>
    </body>
    <script>
      window.onload = function() { window.print(); };
    </script>
  </html>`;

  const w = window.open('', '_blank');
  if (!w) return;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  w.location.href = url;
}
