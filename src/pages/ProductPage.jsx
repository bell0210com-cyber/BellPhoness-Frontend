import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import VariantSelector from '../components/VariantSelector';
import { productPrice, productVariants } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { useStore } from '../context/StoreContext';
import ProductReviews from '../components/ProductReviews';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

const COLOR_MAP = {
  'Deep Purple': '#4c3959',
  'Silver': '#e2e4e1',
  'Gold': '#fcebd5',
  'Space Black': '#28272a',
  'Natural Titanium': '#c1c1c1',
  'Black Titanium': '#2e2e2e',
  'White Titanium': '#f2f2f2',
  'Blue Titanium': '#444a57',
  'Desert Titanium': '#c1a690',
  'Midnight Green': '#4e5851',
  'Space Gray': '#4d4d4d',
  'Graphite': '#5c5b57',
  'Pacific Blue': '#2c4157',
  'Sierra Blue': '#9bb5ce',
  'Alpine Green': '#576856',
  'Starlight': '#f9f6ef',
  'Midnight': '#171e27',
  'Blue': '#376288',
  'Pink': '#fadee5',
  'Red': '#c72333',
  'Yellow': '#fae57c',
  'Green': '#aee0cd',
  'Purple': '#d2d3ec',
  'White': '#fbf9f4',
  'Black': '#1f2020',
  'Coral': '#fc6554',
  'Rose Gold': '#fad8d2',
  'Jet Black': '#0a0a0a',
  'Teal': '#7da0a2',
  'Ultramarine': '#4d5b94'
};

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
  const [showConditionGuide, setShowConditionGuide] = useState(false);

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

  const images = currentVariant.images?.length ? currentVariant.images : (product.variants?.[0]?.images || ['/placeholder.png']);

  const variantFields = [
    ['color', 'Color'],
    ['storage', 'Storage'],
    ['ram', 'RAM'],
    ['condition', 'Condition'],
  ].filter(([key]) => variants.some((v) => v[key]));

  const optionsFor = (key) => [
    ...new Map(variants.filter((v) => v[key]).map((v) => [v[key], v])).entries(),
  ].map(([value, v]) => {
    let subLabel = undefined;
    if (key === 'condition') {
      const match = variants.find((v2) => 
        v2.condition === value &&
        (!selected.color || v2.color === selected.color) &&
        (!selected.storage || v2.storage === selected.storage) &&
        (!selected.ram || v2.ram === selected.ram)
      );
      if (match) subLabel = formatPrice(match.salePrice || match.price);
    }
    
    return {
      value,
      subLabel,
      hex: key === 'color' ? (COLOR_MAP[value] || v.colorHex || '#ddd') : undefined,
      available: variants.some(
        (v2) =>
          v2[key] === value &&
          Object.entries(selected).every(([k, val]) => k === key || !val || v2[k] === val)
      ),
    };
  });

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

              <div className="product-selectors">
                {variantFields.map(([key, label]) => (
                  <div key={key} style={{ position: 'relative' }}>
                    <VariantSelector
                      type={key}
                      label={label}
                      options={optionsFor(key)}
                      selected={selected[key]}
                      onSelect={(value) => selectOption(key, value)}
                    />
                    {key === 'condition' && (
                      <button 
                        type="button" 
                        className="condition-guide-link"
                        onClick={() => setShowConditionGuide(true)}
                      >
                        Condition Guide
                      </button>
                    )}
                  </div>
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
                import('../utils/animateToCart').then(m => m.animateToCart(e, (currentVariant.images?.[0] || product.variants?.[0]?.images?.[0] || '/placeholder.png')));
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
              className={`icon-button large wish ${isWishlisted(id) ? 'active' : ''}`}
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

      {product.boxContents && product.boxContents.length > 0 && (
        <section className="box-contents-section shell">
          <p className="eyebrow">UNBOXING</p>
          <h2>
            What's <em>included.</em>
          </h2>
          <div className="box-contents-grid">
            {product.boxContents.map((item, idx) => {
              const lower = item.toLowerCase();
              let icon = '📦';
              if (lower.includes('cable') || lower.includes('charger') || lower.includes('adapter')) icon = '🔌';
              else if (lower.includes('phone') || lower.includes('mobile') || lower.includes('device')) icon = '📱';
              else if (lower.includes('manual') || lower.includes('guide') || lower.includes('document') || lower.includes('paper')) icon = '📖';
              else if (lower.includes('case') || lower.includes('cover')) icon = '🛡️';
              else if (lower.includes('sim') || lower.includes('pin') || lower.includes('ejector')) icon = '📎';
              else if (lower.includes('earphone') || lower.includes('headphone') || lower.includes('pods')) icon = '🎧';

              return (
                <div key={idx} className="box-item">
                  <span className="box-item-icon">{icon}</span>
                  <span className="box-item-label">{item}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="spec-section">
        <div className="shell">
          <p className="eyebrow">TECHNICAL DETAILS</p>
          <h2>
            Product <em>specifications.</em>
          </h2>
          
          <div className="spec-descriptive">
            {product.specsIntro && (
              <p className="spec-intro">{product.specsIntro}</p>
            )}
            
            <ul className="spec-bullets">
              {Object.entries({
                ...(product.processor ? { 'Chip/Processor': product.processor } : {}),
                ...(product.display ? { Display: product.display } : {}),
                ...(product.camera ? { Camera: product.camera } : {}),
                ...(product.battery ? { Battery: product.battery } : {}),
                ...(product.ram ? { 'Base RAM': product.ram } : {}),
                ...(product.screenSize ? { 'Screen Size': product.screenSize } : {}),
                ...(product.os ? { 'Operating System': product.os } : {}),
                ...(product.weight ? { Weight: product.weight } : {}),
                ...(product.specs || {}),
                ...(currentVariant.color ? { Color: currentVariant.color } : {}),
                ...(currentVariant.ram ? { RAM: currentVariant.ram } : {}),
                ...(currentVariant.storage ? { Storage: currentVariant.storage } : {}),
                ...(currentVariant.condition ? { Condition: currentVariant.condition } : {}),
              }).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProductReviews productId={product.id} />

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
      {showConditionGuide && (
        <div className="modal-overlay" onClick={() => setShowConditionGuide(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowConditionGuide(false)}>×</button>
            <h2>Condition Guide</h2>
            <p>Our refurbished devices undergo rigorous testing to ensure 100% functionality. Choose the cosmetic condition that fits your budget:</p>
            <ul className="condition-guide-list">
              <li>
                <strong>Excellent:</strong> Flawless or near-flawless screen and body. Looks almost brand new from arm's length.
              </li>
              <li>
                <strong>Very Good:</strong> Light scratches or minor scuffs visible up close, but invisible when the screen is on.
              </li>
              <li>
                <strong>Good:</strong> Noticeable signs of wear, such as deeper scratches or dents, but fully functional. Best value!
              </li>
              <li>
                <strong>New:</strong> Brand new, sealed in the original manufacturer packaging.
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}