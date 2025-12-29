import { ReceiptData, ReceiptSettings } from './receiptPrinter';

type WebSerialPort = any;
let cachedPort: WebSerialPort | null = null;

function encoder() {
  return new TextEncoder();
}

function toBytes(str: string): Uint8Array {
  return encoder().encode(str);
}

function cmd(...bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}

function repeat(char: string, count: number): string {
  return char.repeat(count);
}

function formatCurrency(v: number, currencyCode: string): string {
  const value = typeof v === 'number' && !isNaN(v) ? v : 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode || 'USD' }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currencyCode || 'USD'}`;
  }
}

function twoCols(left: string, right: string, width = 48): string {
  const space = width - left.length - right.length;
  const pad = space > 0 ? repeat(' ', space) : ' ';
  return `${left}${pad}${right}`;
}

async function getPort(): Promise<WebSerialPort> {
  if (cachedPort) return cachedPort;
  if (!('serial' in navigator)) {
    throw new Error('Web Serial API is not available in this browser');
  }
  const port = await (navigator as any).serial.requestPort();
  await port.open({ baudRate: 9600 });
  cachedPort = port;
  return port;
}

async function write(port: WebSerialPort, data: Uint8Array | string) {
  const writer = port.writable!.getWriter();
  try {
    const chunk = typeof data === 'string' ? toBytes(data) : data;
    await writer.write(chunk);
  } finally {
    writer.releaseLock();
  }
}

function feed(lines: number) {
  return cmd(0x1B, 0x64, Math.max(1, Math.min(lines, 10)));
}

function alignLeft() { return cmd(0x1B, 0x61, 0); }
function alignCenter() { return cmd(0x1B, 0x61, 1); }
// alignRight is not used currently

function boldOn() { return cmd(0x1B, 0x45, 1); }
function boldOff() { return cmd(0x1B, 0x45, 0); }

function init() { return cmd(0x1B, 0x40); }
function cutPartial() { return cmd(0x1D, 0x56, 0x01); }

function setFontSize(w: number, h: number) {
  const n = ((Math.max(1, w) - 1) << 4) | (Math.max(1, h) - 1);
  return cmd(0x1D, 0x21, n);
}

export async function printReceiptEscPos(receipt: ReceiptData, settings: ReceiptSettings): Promise<void> {
  const port = await getPort();

  const { currencyCode, receiptHeader, receiptFooter, businessName, businessAddress, businessPhone, businessEmail } = settings;

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
  } = receipt;

  await write(port, init());
  await write(port, alignCenter());
  await write(port, setFontSize(2, 2));
  await write(port, boldOn());
  await write(port, `${businessName || 'Store'}\n`);
  await write(port, boldOff());
  await write(port, setFontSize(1, 1));

  if (businessAddress) await write(port, `${businessAddress}\n`);
  if (businessPhone) await write(port, `Tel: ${businessPhone}\n`);
  if (businessEmail) await write(port, `${businessEmail}\n`);
  await write(port, feed(1));

  if (receiptHeader) {
    await write(port, `${receiptHeader}\n`);
    await write(port, feed(1));
  }

  await write(port, alignLeft());
  await write(port, `Sale #: ${saleNumber}\n`);
  await write(port, `Date: ${date.toLocaleString()}\n`);
  if (cashier) await write(port, `Cashier: ${cashier}\n`);
  if (customerName) await write(port, `Customer: ${customerName}\n`);

  await write(port, repeat('-', 48) + '\n');

  for (const item of items) {
    const nameLine = `${item.name}${item.size ? ` (${item.size})` : ''}`;
    await write(port, nameLine + '\n');
    const left = `${item.qty} x ${formatCurrency(item.price, currencyCode)}`;
    const right = `${formatCurrency(item.total, currencyCode)}`;
    await write(port, twoCols(left, right) + '\n');
  }

  await write(port, repeat('-', 48) + '\n');

  await write(port, twoCols('Subtotal', formatCurrency(subtotal, currencyCode)) + '\n');
  if (discount > 0) {
    await write(port, twoCols('Discount', formatCurrency(discount, currencyCode)) + '\n');
  }
  await write(port, twoCols(`Tax${taxRate ? ` (${Math.round(taxRate * 100)}%)` : ''}`, formatCurrency(tax, currencyCode)) + '\n');
  await write(port, boldOn());
  await write(port, twoCols('TOTAL', formatCurrency(total, currencyCode)) + '\n');
  await write(port, boldOff());
  await write(port, twoCols('Payment', paymentMethod) + '\n');

  if (tenderedAmount && typeof tenderedAmount === 'number') {
    await write(port, twoCols('Tendered', formatCurrency(tenderedAmount, currencyCode)) + '\n');
    await write(port, twoCols('Change', formatCurrency(changeAmount || 0, currencyCode)) + '\n');
  }

  await write(port, feed(2));
  await write(port, alignCenter());
  if (receiptFooter) await write(port, `${receiptFooter}\n`);
  await write(port, feed(3));
  try {
    await write(port, cutPartial());
  } catch (_) {
    // Some printers may not support cutting; ignore
  }
}
