/**
 * Barcode Display Component
 * Shows barcode with print and download options
 */

import { useState, useEffect } from 'react';
import { generateBarcodeSVG, downloadBarcode, printBarcode, BarcodeType } from '../utils/barcodeGenerator';

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

  useEffect(() => {
    if (data) {
      const svg = generateBarcodeSVG(data, type, { width, height, displayValue });
      setSvgContent(svg);
    }
  }, [data, type, width, height, displayValue]);

  const handlePrint = () => {
    printBarcode(data, type, { width, height, displayValue });
  };

  const handleDownload = () => {
    const filename = label ? `barcode-${label}` : `barcode-${data}`;
    downloadBarcode(data, filename, type, { width, height, displayValue });
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

      <div className="flex space-x-2">
        <button
          onClick={handlePrint}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default BarcodeDisplay;
