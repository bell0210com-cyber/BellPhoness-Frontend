import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { useStore } from '../context/StoreContext';
import { productPrice } from '../data/products';
import TamaraWidget from '../components/TamaraWidget';
import TabbyWidget from '../components/TabbyWidget';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

function OrderSummary({ items, onCheckout, onClear }) {
  const subtotal = items.reduce((sum, item) => sum + productPrice(item) * item.quantity, 0);

  return (
    <aside className="order-summary">
      <h2>Order summary</h2>
      <p>
        <span>Subtotal</span>
        <b>{formatPrice(subtotal)}</b>
      </p>
      <p>
        <span>Shipping</span>
        <b>At checkout</b>
      </p>
      <p className="total">
        <span>Total</span>
        <b>{formatPrice(subtotal)}</b>
      </p>

      <div style={{ margin: '14px 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TamaraWidget amount={subtotal} inline={false} />
        <TabbyWidget amount={subtotal} inline={false} />
      </div>

      <button className="button button-gold full" onClick={onCheckout}>
        Secure checkout →
      </button>
      <button className="text-button" onClick={onClear}>
        Clear cart
      </button>
      <small>Final pricing, shipping, and any discounts are confirmed during checkout.</small>
    </aside>
  );
}

export default function CartPage({ wishlist = false }) {
  const store = useStore();
  const navigate = useNavigate();
  const items = wishlist ? store.wishlist : store.cart;

  return (
    <>
      <Seo
        title={`${wishlist ? 'Wishlist' : 'Cart'} | BELL`}
        description="Manage your BELL selection."
      />

      <PageHero title={wishlist ? <>Your <em>wishlist.</em></> : <>Your <em>cart.</em></>} />

      <section className="shell basket-layout">
        {items.length ? (
          <>
            <div className="basket-items">
              {items.map((item) => (
                <article className="basket-item" key={item.cartId || item.id}>
                  <img
                    src={item.selectedVariant?.images?.[0] || item.variants?.[0]?.images?.[0] || item.images?.[0] || '/placeholder.svg'}
                    alt={item.name}
                    onError={(e) => {
                      if (!e.currentTarget.src.includes('placeholder.svg')) {
                        e.currentTarget.src = '/placeholder.svg';
                      }
                    }}
                  />
                  <div>
                    <p>{item.brand}</p>
                    <h3>{item.name}</h3>
                    {item.color && (
                      <small>
                        {[item.color, item.storage, item.ram, item.condition].filter(Boolean).join(' · ')}
                      </small>
                    )}
                    <strong>{formatPrice(productPrice(item))}</strong>
                  </div>

                  {wishlist ? (
                    <div className="basket-actions">
                      <button
                        className="button button-dark"
                        onClick={() => {
                          store.addToCart(item, item.selectedVariant || item, 1);
                          store.toggleWishlist(item);
                        }}
                      >
                        Move to cart
                      </button>
                      <button onClick={() => store.toggleWishlist(item)}>Remove</button>
                    </div>
                  ) : (
                    <div className="basket-actions">
                      <div className="quantity">
                        <button onClick={() => store.updateQuantity(item.cartId, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => store.updateQuantity(item.cartId, item.quantity + 1)}>+</button>
                      </div>
                      <b>{formatPrice(productPrice(item) * item.quantity)}</b>
                      <button onClick={() => store.removeFromCart(item.cartId)}>Remove</button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {!wishlist && (
              <OrderSummary
                items={items}
                onCheckout={() => navigate('/checkout')}
                onClear={store.clearCart}
              />
            )}
          </>
        ) : (
          <div className="empty-state">
            <span>✦</span>
            <h2>{wishlist ? 'Your wishlist is waiting' : 'Your cart is empty'}</h2>
            <p>
              {wishlist
                ? 'Save products you love and return whenever you are ready.'
                : 'Discover the BELL collection and add something exceptional.'}
            </p>
            <Link className="button button-gold" to="/shop">
              Shop Now <span>→</span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}