import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import VariantSelector from '../components/VariantSelector';
import { productPrice, productVariants } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { useStore } from '../context/StoreContext';
import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import ProductReviews from '../components/ProductReviews';
import TamaraPromoCard from '../components/TamaraPromoCard';
import TabbyPromoWidget from '../components/TabbyPromoWidget';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

const COLOR_MAP = {
  // Apple Colors
  'Pacific Blue': '#2d4b5a',
  'Sierra Blue': '#9bb5ce',
  'Deep Purple': '#4c3959',
  'Space Black': '#2e2c2f',
  'Black Titanium': '#2d2c2a',
  'White Titanium': '#f2f1ed',
  'Blue Titanium': '#3b4454',
  'Natural Titanium': '#9e968d',
  'Desert Titanium': '#c4a68a',
  'Alpine Green': '#505e55',
  'Midnight Green': '#4e5851',
  'Graphite': '#54524f',
  'Space Gray': '#4e4f54',
  'Space Grey': '#4e4f54',
  'Silver': '#e2e4e1',
  'Gold': '#fcebd5',
  'Rose Gold': '#e8c0b5',
  'Jet Black': '#0a0a0a',
  'Midnight': '#191f28',
  'Starlight': '#f0ece1',
  'Product Red': '#e11c2a',
  'Red': '#e11c2a',
  'Blue': '#215e7d',
  'Sky Blue': '#87ceeb',
  'Purple': '#d1cdda',
  'Yellow': '#f9e479',
  'Pink': '#fae0d8',
  'Black': '#1c1d1f',
  'White': '#f5f5f7',
  'Green': '#2d5a27',
  'Teal': '#7da0a2',
  'Ultramarine': '#4d5b94',
  'Coral': '#ff6f61',
  
  // Samsung / Android Colors
  'Phantom Black': '#1a1a1a',
  'Titanium Black': '#1f1f1f',
  'Titanium Gray': '#707070',
  'Titanium Grey': '#707070',
  'Titanium Violet': '#58427c',
  'Titanium Yellow': '#f6d155',
  'Cream': '#fffdd0',
  'Lavender': '#e6e6fa',
  'Onyx Black': '#1e1e1e',
  'Marble Gray': '#d3d3d3',
  'Cobalt Violet': '#6a5acd',
  'Amber Yellow': '#ffbf00',
  'Bora Purple': '#896f8e',
  'Burgundy': '#582b35',
  'Lime': '#d6e5a3',
  'Mint': '#bce3cf'
};

function getColorHex(colorName, fallbackHex) {
  if (fallbackHex && fallbackHex.startsWith('#') && fallbackHex !== '#ddd' && fallbackHex !== '#999') {
    return fallbackHex;
  }
  if (!colorName) return '#888888';
  if (COLOR_MAP[colorName]) return COLOR_MAP[colorName];
  const normalized = colorName.trim().toLowerCase();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (key.toLowerCase() === normalized) return val;
  }
  if (normalized.includes('blue')) return '#2d4b5a';
  if (normalized.includes('black') || normalized.includes('dark')) return '#1a1a1a';
  if (normalized.includes('white') || normalized.includes('light')) return '#f5f5f7';
  if (normalized.includes('silver') || normalized.includes('grey') || normalized.includes('gray')) return '#d0d0d0';
  if (normalized.includes('gold')) return '#fcebd5';
  if (normalized.includes('purple') || normalized.includes('violet')) return '#58427c';
  if (normalized.includes('green')) return '#3d5a37';
  if (normalized.includes('red')) return '#e11c2a';
  if (normalized.includes('yellow')) return '#f6d155';
  if (normalized.includes('pink')) return '#fae0d8';
  return fallbackHex || '#888888';
}

export default function ProductPage() {
  const { id } = useParams();
  const { products, loading, getProduct } = useProducts();
  const navigate = useNavigate();
  const product = getProduct(id);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const variants = useMemo(() => (product ? productVariants(product) : []), [product]);
  const firstVariant = variants[0];

  // Dedicated States for Active Selection
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedRam, setSelectedRam] = useState('');

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showConditionGuide, setShowConditionGuide] = useState(false);

  // Initialize selections when product or variant loads
  useEffect(() => {
    if (firstVariant) {
      setSelectedColor(firstVariant.color || '');
      setSelectedStorage(firstVariant.storage || '');
      setSelectedCondition(firstVariant.condition || '');
      setSelectedRam(firstVariant.ram || '');
      setActiveImage(0);
      setQuantity(1);
    }
  }, [id, firstVariant?.id, firstVariant?.sku, firstVariant?.color]);

  // 1. Dynamic Variant Resolution (Matches current color, storage, condition, ram)
  const currentVariant = useMemo(() => {
    if (!variants.length) return {};

    // 1. Exact match with all selected fields
    const exact = variants.find(
      (v) =>
        (!selectedColor || (v.color && v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase())) &&
        (!selectedStorage || v.storage === selectedStorage) &&
        (!selectedCondition || v.condition === selectedCondition) &&
        (!selectedRam || v.ram === selectedRam)
    );
    if (exact) return exact;

    // 2. Match with selected color and storage
    if (selectedColor && selectedStorage) {
      const match = variants.find(
        (v) =>
          v.color &&
          v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase() &&
          v.storage === selectedStorage
      );
      if (match) return match;
    }

    // 3. Match with selected color
    if (selectedColor) {
      const match = variants.find(
        (v) => v.color && v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase()
      );
      if (match) return match;
    }

    return firstVariant || {};
  }, [variants, selectedColor, selectedStorage, selectedCondition, selectedRam, firstVariant]);

  // 2. Specific matching color variant for dynamic image resolution
  const colorVariant = useMemo(() => {
    if (!selectedColor || !variants.length) return firstVariant || null;
    return (
      variants.find(
        (v) => v.color && v.color.trim().toLowerCase() === selectedColor.trim().toLowerCase()
      ) || firstVariant
    );
  }, [variants, selectedColor, firstVariant]);

  // 3. Dynamic lookup of the current product image corresponding to selectedColor
  const currentImage = useMemo(() => {
    // A. Check exact current variant images
    if (Array.isArray(currentVariant?.images) && currentVariant.images.filter(Boolean).length > 0) {
      const img = currentVariant.images.filter(Boolean)[activeImage] || currentVariant.images.filter(Boolean)[0];
      if (img) return optimizeCloudinaryUrl(img, { width: 800 });
    }
    if (currentVariant?.image) {
      return optimizeCloudinaryUrl(currentVariant.image, { width: 800 });
    }

    // B. Check matching color variant images
    if (Array.isArray(colorVariant?.images) && colorVariant.images.filter(Boolean).length > 0) {
      const img = colorVariant.images.filter(Boolean)[activeImage] || colorVariant.images.filter(Boolean)[0];
      if (img) return optimizeCloudinaryUrl(img, { width: 800 });
    }
    if (colorVariant?.image) {
      return optimizeCloudinaryUrl(colorVariant.image, { width: 800 });
    }

    // C. Fallback: product default images or placeholder
    const fallback =
      (Array.isArray(product?.images) && product.images[0]) ||
      product?.defaultImage ||
      (Array.isArray(firstVariant?.images) && firstVariant.images[0]) ||
      firstVariant?.image ||
      '/placeholder.svg';

    return optimizeCloudinaryUrl(fallback, { width: 800 });
  }, [currentVariant, colorVariant, product, firstVariant, activeImage]);

  // 4. Dynamic Thumbnail List for current variant/color
  const galleryImages = useMemo(() => {
    let list = [];
    if (Array.isArray(currentVariant?.images) && currentVariant.images.filter(Boolean).length > 0) {
      list = currentVariant.images.filter(Boolean);
    } else if (currentVariant?.image) {
      list = [currentVariant.image];
    } else if (Array.isArray(colorVariant?.images) && colorVariant.images.filter(Boolean).length > 0) {
      list = colorVariant.images.filter(Boolean);
    } else if (colorVariant?.image) {
      list = [colorVariant.image];
    } else if (Array.isArray(product?.images) && product.images.filter(Boolean).length > 0) {
      list = product.images.filter(Boolean);
    } else if (product?.defaultImage) {
      list = [product.defaultImage];
    } else {
      list = ['/placeholder.svg'];
    }
    return list.map((img) => optimizeCloudinaryUrl(img, { width: 800 }));
  }, [currentVariant, colorVariant, product]);

  const variantFields = [
    ['color', 'Color'],
    ['storage', 'Storage'],
    ['ram', 'RAM'],
    ['condition', 'Condition'],
  ].filter(([key]) => variants.some((v) => v[key]));

  const optionsFor = (key) => {
    const isColor = key === 'color';
    const uniqueValues = [
      ...new Map(variants.filter((v) => v[key]).map((v) => [v[key], v])).entries(),
    ];

    return uniqueValues.map(([value, v]) => {
      let subLabel = undefined;
      if (key === 'condition') {
        const match = variants.find(
          (v2) =>
            v2.condition === value &&
            (!selectedColor || v2.color === selectedColor) &&
            (!selectedStorage || v2.storage === selectedStorage) &&
            (!selectedRam || v2.ram === selectedRam)
        );
        if (match) subLabel = formatPrice(match.salePrice || match.price);
      }

      const hasVariants = variants.some((v2) => v2[key] === value);
      const hasStock = variants.some((v2) => v2[key] === value && Number(v2.stock) > 0);
      const available = isColor ? (hasStock || hasVariants) : hasVariants;

      return {
        value,
        subLabel,
        hex: isColor ? getColorHex(value, v.colorHex) : undefined,
        available,
      };
    });
  };

  // State Update Handler for Color Swatches and Other Attributes
  const selectOption = (key, value) => {
    if (key === 'color') {
      setSelectedColor(value);
      // Synchronize storage / condition to available variant in this color if needed
      const matchingVariant = variants.find(
        (v) =>
          v.color &&
          v.color.trim().toLowerCase() === value.trim().toLowerCase() &&
          (!selectedStorage || v.storage === selectedStorage)
      ) || variants.find((v) => v.color && v.color.trim().toLowerCase() === value.trim().toLowerCase());

      if (matchingVariant) {
        if (matchingVariant.storage) setSelectedStorage(matchingVariant.storage);
        if (matchingVariant.condition) setSelectedCondition(matchingVariant.condition);
        if (matchingVariant.ram) setSelectedRam(matchingVariant.ram);
      }
    } else if (key === 'storage') {
      setSelectedStorage(value);
    } else if (key === 'condition') {
      setSelectedCondition(value);
    } else if (key === 'ram') {
      setSelectedRam(value);
    }

    setActiveImage(0);
    setQuantity(1);
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
    name: product?.name,
    sku: currentVariant.sku,
    brand: { '@type': 'Brand', name: product?.brand },
    image: galleryImages,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'AED',
      price: productPrice(currentVariant),
      availability: currentVariant.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  if (!product) {
    if (loading) {
      return (
        <section className="shell product-detail" aria-busy="true">
          <div className="gallery-main skeleton-box" style={{ height: 480, borderRadius: 8 }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="product-info" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton-line" style={{ height: 20, width: '30%' }} />
            <div className="skeleton-line" style={{ height: 36, width: '80%' }} />
            <div className="skeleton-line" style={{ height: 28, width: '45%', margin: '10px 0' }} />
            <div className="skeleton-line" style={{ height: 80, width: '100%' }} />
          </div>
        </section>
      );
    }

    return (
      <div className="empty-state">
        <span>✦</span>
        <h2>Product unavailable</h2>
        <p>This product is not available in the current collection.</p>
        <Link className="button button-gold" to="/shop">
          Back to shop <b>→</b>
        </Link>
      </div>
    );
  }

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
            <img
              key={`${currentImage}-${selectedColor}`}
              src={currentImage}
              alt={`${product.name} in ${selectedColor || 'selected variant'}`}
              className="gallery-main-img"
              onError={(e) => {
                if (!e.currentTarget.src.includes('placeholder.svg')) {
                  e.currentTarget.src = '/placeholder.svg';
                }
              }}
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="thumbs">
              {galleryImages.map((img, i) => (
                <button
                  type="button"
                  className={activeImage === i ? 'active' : ''}
                  onClick={() => setActiveImage(i)}
                  key={`${img}-${i}`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    onError={(e) => {
                      if (!e.currentTarget.src.includes('placeholder.svg')) {
                        e.currentTarget.src = '/placeholder.svg';
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
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

          {/* BNPL Options: Restored Tamara Card & Official Tabby Promo Widget */}
          <div
            className="product-bnpl-stack"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              margin: '14px 0 16px',
            }}
          >
            <TamaraPromoCard price={productPrice(currentVariant)} />
            <TabbyPromoWidget price={productPrice(currentVariant)} />
          </div>

          {(() => {
            const features = (product.description || '')
              .split(/[,.\n•]+/)
              .map((item) => item.trim())
              .filter((item) => item.length > 0);

            if (features.length === 0) return null;

            return (
              <div
                className="product-feature-chips"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  margin: '16px 0',
                }}
              >
                {features.map((feature, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#1a1a1a',
                      border: '0.5px solid #2a2a2a',
                      borderRadius: '20px',
                      padding: '5px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        flexShrink: 0,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#cccccc', lineHeight: 1.2 }}>
                      {feature}
                    </span>
                  </span>
                ))}
              </div>
            );
          })()}

              <div className="product-selectors">
                {variantFields.map(([key, label]) => {
                  const selectedValue =
                    key === 'color'
                      ? selectedColor
                      : key === 'storage'
                      ? selectedStorage
                      : key === 'condition'
                      ? selectedCondition
                      : selectedRam;

                  return (
                    <div key={key} style={{ position: 'relative' }}>
                      <VariantSelector
                        type={key}
                        label={label}
                        options={optionsFor(key)}
                        selected={selectedValue}
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
                  );
                })}
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
                import('../utils/animateToCart').then(m => m.animateToCart(e, (currentVariant.images?.[0] || product.variants?.[0]?.images?.[0] || '/placeholder.svg')));
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

      {(() => {
        const specsEntries = Object.entries({
          ...(product.processor ? { 'Chip / Processor': product.processor } : {}),
          ...(product.display ? { 'Display': product.display } : {}),
          ...(product.screenSize ? { 'Screen Size': product.screenSize } : {}),
          ...(product.camera ? { 'Camera System': product.camera } : {}),
          ...(product.battery ? { 'Battery': product.battery } : {}),
          ...(product.os ? { 'Operating System': product.os } : {}),
          ...(product.network ? { 'Network / Connectivity': product.network } : {}),
          ...(product.weight ? { 'Weight': product.weight } : {}),
          ...(product.ram ? { 'RAM': product.ram } : {}),
          ...(currentVariant?.color ? { 'Color': currentVariant.color } : {}),
          ...(currentVariant?.storage ? { 'Storage': currentVariant.storage } : {}),
          ...(currentVariant?.condition ? { 'Condition': currentVariant.condition } : {}),
          ...(product.specs || {}),
        }).filter(([_, value]) => value !== undefined && value !== null && String(value).trim() !== '');

        if (!specsEntries.length && !product.specsIntro) return null;

        return (
          <section className="spec-section">
            <div className="shell">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">TECHNICAL DETAILS</p>
                  <h2>
                    Product <em>specifications.</em>
                  </h2>
                </div>
              </div>

              {product.specsIntro && (
                <p className="spec-intro">{product.specsIntro}</p>
              )}

              <div className="spec-specs-grid">
                {specsEntries.map(([key, value]) => (
                  <div key={key} className="spec-item-card">
                    <div className="spec-item-label-group">
                      <span className="spec-item-bullet" />
                      <span className="spec-item-key">{key}</span>
                    </div>
                    <span className="spec-item-val">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

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