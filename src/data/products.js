const image = (id, width = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const products = [];

export const categories = ['iPhone', 'Samsung', 'Accessories', 'Electronics'];
export const getProduct = (id) => products.find((product) => product.id === id);
export const productPrice = (product) => product.salePrice ?? product.price;
export const productVariants = (product) => {
  const variants = product.variants?.length 
    ? product.variants 
    : [{ id: `${product.id}-default`, sku: product.sku, price: product.price, salePrice: product.salePrice, stock: product.stock, images: product.images }];
  
  return variants.map(v => ({
    ...v,
    condition: v.condition || 'Excellent'
  }));
};
