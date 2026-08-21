import { Link } from 'react-router-dom';
import { productPrice, productVariants } from '../data/products';
import { useStore } from '../context/StoreContext';

const money = (value) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value);
export { money };
export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore(); const variant = productVariants(product)[0];
  const discount = variant.salePrice ? Math.round((1 - variant.salePrice / variant.price) * 100) : 0;
  return <article className="product-card"><div className="product-image-wrap"><Link to={`/product/${product.id}`}><img src={variant?.images?.[0] || '/placeholder.png'} alt={product.name} loading="lazy" /></Link>{discount > 0 && <span className="product-badge">-{discount}%</span>}<button className={`icon-button wish ${isWishlisted(product.id) ? 'active' : ''}`} onClick={() => toggleWishlist(product)} aria-label={`Toggle ${product.name} wishlist`}>{isWishlisted(product.id) ? '♥' : '♡'}</button><Link className="quick-link" to={`/product/${product.id}`}>Quick view</Link></div><div className="product-card-body"><p>{product.brand}</p><Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link><small>{Object.values(product.specs || {}).slice(0, 2).join(' · ')}</small><div className="price-row"><strong>{money(productPrice(variant))}</strong>{variant.salePrice && <del>{money(variant.price)}</del>}</div><div className="product-actions"><span className={variant.stock ? 'stock' : 'out-of-stock'}>{variant.stock ? 'In stock' : 'Out of stock'}</span><button disabled={!variant.stock} onClick={(e) => { import('../utils/animateToCart').then(m => m.animateToCart(e, variant?.images?.[0] || '/placeholder.png')); addToCart(product, variant); }}>Add +</button></div></div></article>;
}
