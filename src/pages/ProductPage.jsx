import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import VariantSelector from '../components/VariantSelector';
import { productPrice, productVariants } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { useStore } from '../context/StoreContext';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

export default function ProductPage() {
  const { id } = useParams();
  const { products, getProduct } = useProducts();
  const navigate = useNavigate();
  const product = getProduct(id);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const variants = product ? productVariants(product) : [];
  const firstVariant = variants[0];

  const [selected, setSelected] = useState(() =>
    firstVariant
      ? {
          color: firstVariant.color,
          storage: firstVariant.storage,
          ram: firstVariant.ram,
          condition: firstVariant.condition,
        }
      : {}
  );
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (firstVariant) {
      setSelected({
        color: firstVariant.color,
        storage: firstVariant.storage,
        ram: firstVariant.ram,
        condition: firstVariant.condition,
      });
      setActiveImage(0);
      setQuantity(1);
    }
  }, [id]);

  if (!product) {
    return (
      <div className="empty-state">
        <span>✦</span>
        <h2>Product unavailable</h2>
        <p>This product is not available in the current collection.</p>
      </div>
    );
  }

  const currentVariant =
    variants.find((v) =>
      Object.entries(selected).every(([key, value]) => !value || v[key] === value)
    ) || firstVariant;

  const images = currentVariant.images?.length ? currentVariant.images : product.images;

  const variantFields = [
    ['color', 'Color'],
    ['storage', 'Storage'],
    ['ram', 'RAM'],
    ['condition', 'Condition'],
  ].filter(([key]) => variants.some((v) => v[key]));

  const optionsFor = (key) => [
    ...new Map(variants.filter((v) => v[key]).map((v) => [v[key], v])).entries(),
  ].map(([value, v]) => ({
    value,
    hex: key === 'color' ? v.colorHex : undefined,
    available: variants.some(
      (v2) =>
        v2[key] === value &&
        Object.entries(selected).every(([k, val]) => k === key || !val || v2[k] === val)
    ),
  }));

  const selectOption = (key, value) => {
    const match = variants.find(
      (v) =>
        v[key] === value &&
        Object.entries(selected).every(([k, val]) => k === key || !val || v[k] === val)
    );
    if (match) {
      setSelected({
        color: match.color,
        storage: match.storage,
        ram: match.ram,
        condition: match.condition,
      });
      setActiveImage(0);
      setQuantity(1);
    }
  };

  const discountPercent = currentVariant.salePrice
    ? Math.round((1 - currentVariant.salePrice / currentVariant.price) * 100)
    : 0;

  const stockLabel =
    currentVariant.stock === 0
      ? 'Out of stock'
      : currentVariant.stock <= 3
      ? `Low stock — ${currentVariant.stock} available`
      : `${currentVariant.stock} available to order`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: currentVariant.sku,
    brand: { '@type': 'Brand', name: product.brand },
    image: images,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'AED',
      price: productPrice(currentVariant),
      availability: currentVariant.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <>
      <Seo
        title={`${product.name} | BELL`}
        description={`${product.name} by ${product.brand}. Shop premium technology from BELL.`}
        structuredData={structuredData}
      />

      <section className="shell product-detail">
        <div className="gallery">
          <div className="gallery-main">
            <img src={images[activeImage] || images[0]} alt={`${product.name} in ${currentVariant.color || 'selected option'}`} />
          </div>
          <div className="thumbs">
            {images.map((img, i) => (
              <button className={activeImage === i ? 'active' : ''} onClick={() => setActiveImage(i)} key={img}>
                <img src={img} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <p className="eyebrow">{product.brand}</p>
          <h1>{product.name}</h1>
          <p className="sku">SKU: {currentVariant.sku}</p>

          <div className="detail-price">
            <strong>{formatPrice(productPrice(currentVariant))}</strong>
            {currentVariant.salePrice && (
              <>
                <del>{formatPrice(currentVariant.price)}</del>
                <span>Save {discountPercent}%</span>
              </>
            )}
          </div>

          <p className="description">{product.description}</p>

          <div className="variant-groups">
            {variantFields.map(([key, label]) => (
              <VariantSelector
                key={key}
                label={label}
                type={key === 'color' ? 'color' : 'button'}
                selected={selected[key]}
                options={optionsFor(key)}
                onSelect={(value) => selectOption(key, value)}
              />
            ))}
          </div>

          <p className={currentVariant.stock ? 'stock' : 'out-of-stock'}>{stockLabel}</p>

          <div className="purchase-actions">
            <div className="quantity">
              <button aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={!currentVariant.stock}
                onClick={() => setQuantity((q) => Math.min(currentVariant.stock, q + 1))}
              >
                +
              </button>
            </div>

            <button
              className="button button-gold"
              disabled={!currentVariant.stock}
              onClick={(e) => {
                import('../utils/animateToCart').then(m => m.animateToCart(e, (currentVariant.images || product.images)[0]));
                addToCart(product, currentVariant, quantity);
              }}
            >
              Add to Cart
            </button>

            <button
              className="button button-dark"
              disabled={!currentVariant.stock}
              onClick={() => {
                addToCart(product, currentVariant, quantity);
                navigate('/checkout');
              }}
            >
              Buy Now
            </button>

            <button
              className="icon-button large"
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
            >
              {isWishlisted(id) ? '♥' : '♡'}
            </button>
          </div>

          <div className="detail-assurances">
            <p>
              <b>Delivery information</b>
              Delivery options are shown during checkout.
            </p>
            <p>
              <b>Returns information</b>
              Review the returns policy before purchase.
            </p>
            <p>
              <b>Warranty information</b>
              {product.warranty}
            </p>
          </div>
        </div>
      </section>

      <section className="spec-section">
        <div className="shell">
          <p className="eyebrow">TECHNICAL DETAILS</p>
          <h2>
            Product <em>specifications.</em>
          </h2>
          <div className="spec-table">
            {Object.entries({
              ...product.specs,
              ...(currentVariant.color ? { Color: currentVariant.color } : {}),
              ...(currentVariant.ram ? { RAM: currentVariant.ram } : {}),
              ...(currentVariant.storage ? { Storage: currentVariant.storage } : {}),
              ...(currentVariant.condition ? { Condition: currentVariant.condition } : {}),
            }).map(([key, value]) => (
              <div key={key}>
                <span>{key}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!!related.length && (
        <section className="product-section shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOU MAY ALSO LIKE</p>
              <h2>
                Related <em>technology.</em>
              </h2>
            </div>
            <Link className="text-link" to="/shop">
              View all <span>→</span>
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}