/**
 * Barcode Display Component
 * Shows barcode with ESC/POS thermal printing support
 */

import { useState, useEffect } from 'react';
import { generateBarcodeSVG, downloadBarcode, BarcodeType } from '../utils/barcodeGenerator';
import { 
  printBarcode, 
  downloadBarcodeCommands,
  getPrinterConfig,
  ESCPOSBarcodeType,
  HRIPosition 
} from '../utils/escPosBarcodeUtils';

interface BarcodeDisplayProps {
  data: string;
  type?: BarcodeType;
  label?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

const BarcodeDisplay = ({ 
  data, 
  type = 'CODE128', 
  label,
  width = 2,
  height = 100,
  displayValue = true 
}: BarcodeDisplayProps) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [printing, setPrinting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (data) {
      const svg = generateBarcodeSVG(data, type, { width, height, displayValue });
      setSvgContent(svg);
    }
  }, [data, type, width, height, displayValue]);

  const handlePrint = async () => {
    try {
      setPrinting(true);
      const config = getPrinterConfig();
      
      // Map BarcodeType to ESCPOSBarcodeType
      let escPosType = ESCPOSBarcodeType.CODE128;
      if (type === 'EAN13') escPosType = ESCPOSBarcodeType.EAN13;
      else if (type === 'EAN8') escPosType = ESCPOSBarcodeType.EAN8;
      else if (type === 'CODE39') escPosType = ESCPOSBarcodeType.CODE39;
      else if (type === 'UPC') escPosType = ESCPOSBarcodeType.UPC_A;

      // Print multiple copies
      for (let i = 0; i < quantity; i++) {
        await printBarcode(data, config, {
          type: escPosType,
          width: 3,
          height: 100,
          hri: HRIPosition.BELOW,
          label
        });
        // Small delay between prints if multiple copies
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      alert(`${quantity} barcode(s) sent to printer successfully!`);
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print barcode. Check printer connection.');
    } finally {
      setPrinting(false);
    }
  };

  const handleDownload = () => {
    const filename = label ? `barcode-${label}` : `barcode-${data}`;
    downloadBarcode(data, filename, type, { width, height, displayValue });
  };

  const handleDownloadESCPOS = () => {
    // Map BarcodeType to ESCPOSBarcodeType
    let escPosType = ESCPOSBarcodeType.CODE128;
    if (type === 'EAN13') escPosType = ESCPOSBarcodeType.EAN13;
    else if (type === 'EAN8') escPosType = ESCPOSBarcodeType.EAN8;
    else if (type === 'CODE39') escPosType = ESCPOSBarcodeType.CODE39;
    else if (type === 'UPC') escPosType = ESCPOSBarcodeType.UPC_A;

    downloadBarcodeCommands(data, {
      type: escPosType,
      width: 3,
      height: 100,
      hri: HRIPosition.BELOW,
      label
    });
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-sm">No barcode data</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && (
        <div className="text-sm font-medium text-gray-700">{label}</div>
      )}
      
      <div className="flex items-center justify-center p-4 bg-white border rounded">
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Print Quantity
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handlePrint}
          disabled={printing}
          className={`flex-1 px-3 py-2 ${printing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded flex items-center justify-center space-x-2 text-sm`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>{printing ? 'Printing...' : 'Print (ESC/POS)'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>PNG</span>
        </button>

        <button
          onClick={handleDownloadESCPOS}
          className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>ESC/POS</span>
        </button>
      </div>
    </div>
  );
};

export default BarcodeDisplay;
