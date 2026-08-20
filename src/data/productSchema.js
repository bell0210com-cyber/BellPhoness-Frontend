export const productVariantFields = [
  { key: 'color', label: 'Color', type: 'text', optional: true },
  { key: 'colorHex', label: 'Color hex', type: 'text', optional: true },
  { key: 'ram', label: 'RAM', type: 'text', optional: true },
  { key: 'storage', label: 'Storage', type: 'text', optional: true },
  { key: 'condition', label: 'Condition', type: 'text', optional: true },
  { key: 'price', label: 'Price', type: 'number', required: true },
  { key: 'salePrice', label: 'Sale price', type: 'number', optional: true },
  { key: 'stock', label: 'Stock', type: 'number', required: true },
  { key: 'sku', label: 'SKU', type: 'text', required: true },
  { key: 'images', label: 'Images', type: 'image-list', optional: true },
];

export const createEmptyVariant = () => ({ id: '', sku: '', color: '', colorHex: '', ram: '', storage: '', condition: '', price: '', salePrice: '', stock: 0, images: [] });
