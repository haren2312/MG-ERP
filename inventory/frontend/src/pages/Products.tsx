import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductForm from '../components/ProductForm'
import BarcodeDisplay from '../components/BarcodeDisplay'
import PrinterSettings from '../components/PrinterSettings'
import { productService, Product, CreateProductRequest } from '../services/productService'
import { 
  printBarcodeSheet, 
  getPrinterConfig,
  ESCPOSBarcodeType 
} from '../utils/escPosBarcodeUtils'
import {
  printBarcodeSheetSerial,
  isWebSerialSupported,
  ESCPOSBarcodeType as SerialBarcodeType
} from '../utils/serialBarcodeUtils'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [viewBarcodeProduct, setViewBarcodeProduct] = useState<Product | null>(null)
  const [showPrinterSettings, setShowPrinterSettings] = useState(false)
  const [showPrintQuantityModal, setShowPrintQuantityModal] = useState(false)
  const [printQuantity, setPrintQuantity] = useState(1)

  useEffect(() => {
    // Check if action=add is in URL params
    if (searchParams.get('action') === 'add') {
      setShowForm(true)
    }
  }, [searchParams])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await productService.getProducts()
      setProducts(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      console.error('Error loading products:', err)
      setProducts([]) // Ensure products is always an array
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (data: any) => {
    setSubmitting(true)
    setError(null)
    try {
      const productData: CreateProductRequest = {
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        material: data.material,
        color: data.color,
        season: data.season,
        categoryId: data.categoryId,
        brandId: data.brandId,
        supplierId: data.supplierId,
        sizes: data.sizes
      }

      await productService.createProduct(productData)
      setShowForm(false)
      // Clear the action parameter from URL
      searchParams.delete('action')
      setSearchParams(searchParams)
      await loadProducts() // Refresh the product list
      
      // Show success message (you could add a toast notification here)
      alert('Product added successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product')
      console.error('Error adding product:', err)
    } finally {
      setSubmitting(false)
    }
  }



  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormMode('edit')
    setShowForm(true)
  }

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return
    
    setSubmitting(true)
    setError(null)
    try {
      const productData = {
        name: data.name,
        description: data.description,
        sku: data.sku,
        barcode: data.barcode,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        material: data.material,
        color: data.color,
        season: data.season,
        categoryId: data.categoryId || null,
        brandId: data.brandId || null,
        supplierId: data.supplierId || null,
        sizes: data.sizes || []
      }
      
      await productService.updateProduct(editingProduct.id, productData)
      await loadProducts()
      handleCloseForm()
      alert('Product updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      console.error('Error updating product:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setError(null)
      await productService.deleteProduct(product.id)
      await loadProducts()
      alert('Product deleted successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      console.error('Error deleting product:', err)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormMode('add')
    setError(null)
    // Clear the action parameter from URL when closing form
    if (searchParams.get('action')) {
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handlePrintSelectedBarcodes = () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    if (selectedProductsList.length === 0) {
      alert('Please select products to print barcodes');
      return;
    }
    setShowPrintQuantityModal(true);
  };

  const handlePrintSerial = async () => {
    if (!isWebSerialSupported()) {
      alert('Web Serial API is not supported in this browser. Use Chrome or Edge.');
      return;
    }

    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    
    try {
      const items = selectedProductsList.flatMap(product => 
        Array(printQuantity).fill({
          data: product.barcode || product.sku || product.id,
          label: `${product.name} - ${product.sku || ''}`
        })
      );

      await printBarcodeSheetSerial(items, {
        type: SerialBarcodeType.CODE128,
        width: 3,
        height: 80
      });

      setShowPrintQuantityModal(false);
      alert(`Successfully sent ${items.length} barcode(s) to USB/Serial printer!`);
    } catch (error) {
      console.error('USB/Serial print error:', error);
      alert('Failed to print to USB/Serial printer. ' + (error instanceof Error ? error.message : 'Check connection.'));
    }
  };

  const handlePrintNetwork = async () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    
    try {
      const items = selectedProductsList.flatMap(product => 
        Array(printQuantity).fill({
          data: product.barcode || product.sku || product.id,
          label: `${product.name} - ${product.sku || ''}`
        })
      );

      const config = getPrinterConfig();
      await printBarcodeSheet(items, config, {
        type: ESCPOSBarcodeType.CODE128,
        width: 3,
        height: 80
      });

      setShowPrintQuantityModal(false);
      alert(`Successfully sent ${items.length} barcode(s) to network printer!`);
    } catch (error) {
      console.error('Network print error:', error);
      alert('Failed to print to network printer. Check printer connection and settings.');
    }
  };

  const handleViewBarcode = (product: Product) => {
    setViewBarcodeProduct(product);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={handleCloseForm}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ← Back to Products
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {formMode === 'edit' ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <ProductForm
            initialData={editingProduct ? {
              name: editingProduct.name,
              description: editingProduct.description || '',
              sku: editingProduct.sku,
              barcode: editingProduct.barcode || '',
              costPrice: editingProduct.costPrice,
              sellingPrice: editingProduct.sellingPrice,
              material: editingProduct.material || '',
              color: editingProduct.color || '',
              season: editingProduct.season || '',
              categoryId: editingProduct.categoryId || '',
              brandId: editingProduct.brandId || '',
              supplierId: editingProduct.supplierId || '',
              sizes: []
            } : undefined}
            onSubmit={formMode === 'edit' ? handleUpdateProduct : handleAddProduct}
            onCancel={handleCloseForm}
            isLoading={submitting}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPrinterSettings(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              title="Configure thermal printer"
            >
              <span>🖨️</span>
              <span>Printer</span>
            </button>
            {selectedProducts.size > 0 && (
              <button
                onClick={handlePrintSelectedBarcodes}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <span>🏷️</span>
                <span>Print {selectedProducts.size} Barcode{selectedProducts.size > 1 ? 's' : ''}</span>
              </button>
            )}
            <button
              onClick={() => {
                setFormMode('add')
                setEditingProduct(null)
                setShowForm(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (products || []).length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📦</span>
            <h3 className="text-lg font-medium text-gray-900 mt-4">No products yet</h3>
            <p className="text-gray-600 mt-2">Get started by creating your first product</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name || 'Unnamed Product'}</div>
                        <div className="text-sm text-gray-500">{product.description || 'No description'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(product.sellingPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        In Stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewBarcode(product)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Barcode
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Barcode Modal */}
      {viewBarcodeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Product Barcode</h2>
              <button
                onClick={() => setViewBarcodeProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Product:</strong> {viewBarcodeProduct.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>SKU:</strong> {viewBarcodeProduct.sku || 'N/A'}
              </p>
            </div>
            <BarcodeDisplay
              data={viewBarcodeProduct.barcode || viewBarcodeProduct.sku || viewBarcodeProduct.id}
              label={`${viewBarcodeProduct.name} - ${viewBarcodeProduct.sku || ''}`}
              type="CODE128"
            />
          </div>
        </div>
      )}

      {/* Printer Settings Modal */}
      {showPrinterSettings && (
        <PrinterSettings onClose={() => setShowPrinterSettings(false)} />
      )}

      {/* Print Quantity Modal */}
      {showPrintQuantityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Print Barcodes</h2>
              <button
                onClick={() => setShowPrintQuantityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                You have selected <strong>{selectedProducts.size}</strong> product(s).
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many copies of each barcode?
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={printQuantity}
                onChange={(e) => setPrintQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <p className="text-xs text-gray-500 mt-2">
                Total barcodes to print: <strong>{selectedProducts.size * printQuantity}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePrintSerial}
                  disabled={!isWebSerialSupported()}
                  className={`px-4 py-2 ${!isWebSerialSupported() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md flex items-center justify-center space-x-2`}
                  title={!isWebSerialSupported() ? 'Not supported in this browser. Use Chrome or Edge.' : 'Print via USB/Serial'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>USB/Serial</span>
                </button>
                <button
                  onClick={handlePrintNetwork}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center space-x-2"
                  title="Print via Network IP"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Network</span>
                </button>
              </div>
              <button
                onClick={() => setShowPrintQuantityModal(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products