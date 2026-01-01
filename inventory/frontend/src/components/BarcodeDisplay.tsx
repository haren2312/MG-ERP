/**
 * Barcode Display Component
 * Shows barcode with ESC/POS thermal printing support (Web Serial + Network)
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
import {
  printBarcodeSerial,
  isWebSerialSupported,
  ESCPOSBarcodeType as SerialBarcodeType,
  HRIPosition as SerialHRIPosition
} from '../utils/serialBarcodeUtils';

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

  const handlePrintSerial = async () => {
    if (!isWebSerialSupported()) {
      alert('Web Serial API is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    try {
      setPrinting(true);
      
      // Map BarcodeType to ESCPOSBarcodeType
      let escPosType = ESCPOSBarcodeType.CODE128;
      if (type === 'EAN13') escPosType = ESCPOSBarcodeType.EAN13;
      else if (type === 'EAN8') escPosType = ESCPOSBarcodeType.EAN8;
      else if (type === 'CODE39') escPosType = ESCPOSBarcodeType.CODE39;
      else if (type === 'UPC') escPosType = ESCPOSBarcodeType.UPC_A;

      for (let i = 0; i < quantity; i++) {
        await printBarcodeSerial(data, {
          type: escPosType as unknown as SerialBarcodeType,
          width: 3,
          height: 100,
          hri: SerialHRIPosition.BELOW,
          label
        });
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      alert(`${quantity} barcode(s) sent to USB/Serial printer successfully!`);
    } catch (error) {
      console.error('USB/Serial print error:', error);
      alert('Failed to print to USB/Serial printer. ' + (error instanceof Error ? error.message : 'Check connection.'));
    } finally {
      setPrinting(false);
    }
  };

  const handlePrintNetwork = async () => {
    try {
      setPrinting(true);
      
      // Map BarcodeType to ESCPOSBarcodeType
      let escPosType = ESCPOSBarcodeType.CODE128;
      if (type === 'EAN13') escPosType = ESCPOSBarcodeType.EAN13;
      else if (type === 'EAN8') escPosType = ESCPOSBarcodeType.EAN8;
      else if (type === 'CODE39') escPosType = ESCPOSBarcodeType.CODE39;
      else if (type === 'UPC') escPosType = ESCPOSBarcodeType.UPC_A;

      const config = getPrinterConfig();
      for (let i = 0; i < quantity; i++) {
        await printBarcode(data, config, {
          type: escPosType,
          width: 3,
          height: 100,
          hri: HRIPosition.BELOW,
          label
        });
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      alert(`${quantity} barcode(s) sent to network printer successfully!`);
    } catch (error) {
      console.error('Network print error:', error);
      alert('Failed to print to network printer. Check printer connection and settings.');
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

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handlePrintSerial}
          disabled={printing || !isWebSerialSupported()}
          className={`px-3 py-2 ${printing || !isWebSerialSupported() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded flex items-center justify-center space-x-1 text-sm`}
          title={!isWebSerialSupported() ? 'Not supported in this browser. Use Chrome or Edge.' : 'Print via USB/Serial'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>{printing ? 'Printing...' : 'USB/Serial'}</span>
        </button>

        <button
          onClick={handlePrintNetwork}
          disabled={printing}
          className={`px-3 py-2 ${printing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded flex items-center justify-center space-x-1 text-sm`}
          title="Print via Network IP"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <span>Network</span>
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
