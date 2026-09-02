import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { useStore } from '../context/StoreContext';
import { productPrice } from '../data/products';
import { orderApi } from '../services/orderApi';
import { tamaraApi } from '../services/tamaraApi';
import { tabbyApi } from '../services/tabbyApi';
import TamaraWidget from '../components/TamaraWidget';
import TabbyWidget from '../components/TabbyWidget';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

const FREE_SHIPPING_THRESHOLD = 2000;
const STANDARD_SHIPPING_FEE = 35;

const isDubai = (emirate) => (emirate || '').trim().toLowerCase() === 'dubai';

function OrderSummary({ items, emirate }) {
  const subtotal = items.reduce((sum, item) => sum + productPrice(item) * item.quantity, 0);
  const hasEmirate = !!emirate;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + (hasEmirate ? shipping : 0);

  return (
    <aside className="order-summary">
      <h2>Order summary</h2>
      <p>
        <span>Subtotal</span>
        <b>{formatPrice(subtotal)}</b>
      </p>
      <p>
        <span>Shipping</span>
        <b>
          {!hasEmirate
            ? 'At checkout'
            : shipping === 0
            ? 'Free'
            : formatPrice(shipping)}
        </b>
      </p>
      <p className="total">
        <span>Total</span>
        <b>{formatPrice(total)}</b>
      </p>
      
      <div style={{ margin: '14px 0 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TamaraWidget amount={total} inline={false} />
        <TabbyWidget amount={total} inline={false} />
      </div>

      <small>
        {subtotal < FREE_SHIPPING_THRESHOLD
          ? `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more to get free shipping.`
          : 'You qualify for free shipping.'}
      </small>
    </aside>
  );
}

const addressFields = [
  'fullName',
  'phone',
  'building',
  'street',
  'area',
  'city',
  'emirate',
  'country',
  'postalCode',
];

const addressLabels = {
  fullName: 'Full Name',
  phone: 'Phone',
  building: 'Building / Villa',
  street: 'Street',
  area: 'Area',
  city: 'City',
  emirate: 'Emirate',
  country: 'Country',
  postalCode: 'Postal Code',
};

function AddressStep({ address, onChange, next }) {
  return (
    <form
      className="address-form"
      onSubmit={(event) => {
        event.preventDefault();
        next();
      }}
    >
      <h2>Delivery address</h2>
      <div className="form-grid">
        {addressFields.map((key) => (
          <label key={key}>
            {addressLabels[key]}
            <input
              required
              value={address[key] || ''}
              onChange={(event) => onChange(key, event.target.value)}
            />
          </label>
        ))}
      </div>
      <button className="button button-gold">Continue to delivery →</button>
    </form>
  );
}

function PaymentStep({ paymentMethod, setPaymentMethod, dubaiOrder, next }) {
  return (
    <div className="checkout-panel">
      <h2>Select payment method</h2>
      <p>Choose your preferred payment method below.</p>

      <div className="payment-options-grid" style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
        {/* Tamara BNPL Option */}
        <label
          className={`payment-option-card ${paymentMethod === 'tamara' ? 'selected' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '16px 18px',
            border: paymentMethod === 'tamara' ? '2px solid var(--gold, #be9a5d)' : '1px solid #d8d1c8',
            background: paymentMethod === 'tamara' ? '#fdfaf5' : '#fff',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="tamara"
            checked={paymentMethod === 'tamara'}
            onChange={() => setPaymentMethod('tamara')}
            style={{ marginTop: 4 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <strong style={{ fontSize: 14, color: '#111' }}>
                Pay via Tamara (Buy Now, Pay Later)
              </strong>
              <span className="tamara-logo-text" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                tamara
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#555', margin: '6px 0 0', lineHeight: 1.4 }}>
              Split your purchase into <strong>4 interest-free monthly installments</strong>. No hidden fees, instant approval.
            </p>
          </div>
        </label>

        {/* Tabby BNPL Option */}
        <label
          className={`payment-option-card ${paymentMethod === 'tabby' ? 'selected' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '16px 18px',
            border: paymentMethod === 'tabby' ? '2px solid var(--gold, #be9a5d)' : '1px solid #d8d1c8',
            background: paymentMethod === 'tabby' ? '#fdfaf5' : '#fff',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="tabby"
            checked={paymentMethod === 'tabby'}
            onChange={() => setPaymentMethod('tabby')}
            style={{ cursor: 'pointer' }}
          />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 14, color: '#111' }}>
              Pay via Tabby
            </strong>
            <span className="tabby-logo-text" style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
              tabby
            </span>
          </div>
        </label>

        {/* Cash on Delivery Option */}
        <label
          className={`payment-option-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            padding: '16px 18px',
            border: paymentMethod === 'cod' ? '2px solid var(--gold, #be9a5d)' : '1px solid #d8d1c8',
            background: paymentMethod === 'cod' ? '#fdfaf5' : '#fff',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
            style={{ marginTop: 4 }}
          />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 14, color: '#111' }}>
              {dubaiOrder ? 'Cash on Delivery (Dubai)' : 'Prepayment on Delivery'}
            </strong>
            <p style={{ fontSize: 12, color: '#555', margin: '6px 0 0', lineHeight: 1.4 }}>
              {dubaiOrder
                ? 'Pay in cash or with card upon delivery to your doorstep.'
                : 'Our team will contact you to arrange payment before order dispatch.'}
            </p>
          </div>
        </label>
      </div>

      <button className="button button-gold" onClick={next}>
        Continue to review →
      </button>
    </div>
  );
}

function InfoStep({ title, text, next, button, disabled }) {
  return (
    <div className="checkout-panel">
      <h2>{title}</h2>
      <p>{text}</p>
      {next ? (
        <button className="button button-gold" onClick={next} disabled={disabled}>
          {disabled ? 'Processing…' : `${button} →`}
        </button>
      ) : (
        <button className="button button-dark" disabled>
          {button}
        </button>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('tamara');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const updateAddress = (key, value) => setAddress((current) => ({ ...current, [key]: value }));

  const dubaiOrder = isDubai(address.emirate);

  const placeOrder = async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setError('Please sign in to place your order.');
      return;
    }
    setPlacing(true);
    setError('');

    try {
      const items = cart.map((item) => {
        const productId = item.productId || (item.cartId ? item.cartId.split(':')[0] : item.id);
        const variantId = item.variantId || item.selectedVariant?.id || (item.cartId ? item.cartId.split(':')[1] : undefined);
        return {
          productId,
          variantId,
          name: item.name || '',
          sku: item.sku || variantId || '',
          unitPrice: Number(item.salePrice ?? item.price ?? 0),
          quantity: Number(item.quantity) || 1,
        };
      });

      if (paymentMethod === 'tamara') {
        // Tamara Checkout flow
        const session = await tamaraApi.createCheckoutSession({
          items,
          shippingAddress: address,
        });

        const redirectUrl = session.checkout_url || session.checkoutUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        } else {
          throw new Error('Tamara did not return a valid checkout URL.');
        }
      } else if (paymentMethod === 'tabby') {
        // Tabby Checkout flow
        const session = await tabbyApi.createCheckoutSession({
          items,
          shippingAddress: address,
        });

        const redirectUrl = session.checkout_url || session.checkoutUrl;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        } else {
          throw new Error('Tabby did not return a valid checkout URL.');
        }
      } else {
        // Standard Cash on Delivery / Direct Order
        const order = await orderApi.create({
          items,
          shippingAddress: address,
          paymentMethod: 'Cash on Delivery',
        });
        setOrderId(order.id);
        clearCart();
        setStep(5);
      }
    } catch (requestError) {
      console.error('Checkout error:', requestError);
      setError(requestError.message || 'An error occurred during checkout.');
      setPlacing(false);
    }
  };


  if (step === 5) {
    return (
      <>
        <Seo title="Order Placed | BELL" description="Your BELL order has been placed." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Order <em>placed.</em></>} />
        <div className="empty-state">
          <span>✦</span>
          <h2>Thank you for your order</h2>
          <p>Your order reference is {orderId}. You can track its status from your account.</p>
          {!dubaiOrder && paymentMethod === 'cod' && (
            <p>
              Since this order is outside Dubai, our team will contact you shortly to arrange
              prepayment before your order is shipped.
            </p>
          )}
          <Link className="button button-gold" to="/orders">
            View my orders <span>→</span>
          </Link>
        </div>
      </>
    );
  }

  if (!cart.length) {
    return (
      <>
        <Seo title="Checkout | BELL" description="Complete your BELL order." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Checkout <em>securely.</em></>} />
        <div className="empty-state">
          <span>✦</span>
          <h2>Your cart is empty</h2>
          <p>Add products before starting checkout.</p>
          <Link className="button button-gold" to="/shop">
            Shop Now <span>→</span>
          </Link>
        </div>
      </>
    );
  }

  const steps = ['Address', 'Delivery', 'Payment', 'Confirm'];

  const deliveryText = !address.emirate
    ? 'Standard delivery across the UAE. Delivery time is confirmed after order confirmation.'
    : dubaiOrder
    ? 'Delivery within Dubai typically takes 2-3 business days.'
    : 'Delivery outside Dubai typically takes 5-7 business days.';

  return (
    <>
      <Seo title="Checkout | BELL" description="Complete your BELL order." />
      <PageHero eyebrow="BELL / CHECKOUT" title={<>Checkout <em>securely.</em></>} />

      <section className="shell checkout-layout">
        <div>
          <div className="checkout-steps">
            {steps.map((label, i) => (
              <button
                key={label}
                className={step === i + 1 ? 'active' : ''}
                onClick={() => setStep(i + 1)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {error && <div className="form-state error">{error}</div>}

          {step === 1 && (
            <AddressStep address={address} onChange={updateAddress} next={() => setStep(2)} />
          )}

          {step === 2 && (
            <InfoStep
              title="Delivery preferences"
              text={deliveryText}
              next={() => setStep(3)}
              button="Continue to payment"
            />
          )}

          {step === 3 && (
            <PaymentStep
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              dubaiOrder={dubaiOrder}
              next={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <InfoStep
              title="Review your order"
              text={
                paymentMethod === 'tamara'
                  ? 'You will be securely redirected to Tamara to complete your 4 interest-free installments.'
                  : paymentMethod === 'tabby'
                  ? 'You will be securely redirected to Tabby to complete your 4 interest-free split payments.'
                  : dubaiOrder
                  ? 'Confirm your order below. Payment will be collected on delivery.'
                  : 'Confirm your order below. Our team will contact you to arrange prepayment before shipping.'
              }
              next={placeOrder}
              button={
                paymentMethod === 'tamara'
                  ? 'Pay with Tamara (Pay in 4)'
                  : paymentMethod === 'tabby'
                  ? 'Pay with Tabby (Split in 4)'
                  : 'Place order'
              }
              disabled={placing}
            />
          )}
        </div>

        <OrderSummary items={cart} emirate={address.emirate} />
      </section>
    </>
  );
}