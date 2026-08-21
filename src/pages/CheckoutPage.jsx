import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { useStore } from '../context/StoreContext';
import { productPrice } from '../data/products';
import { orderApi } from '../services/orderApi';

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

function InfoStep({ title, text, next, button, disabled }) {
  return (
    <div className="checkout-panel">
      <h2>{title}</h2>
      <p>{text}</p>
      {next ? (
        <button className="button button-gold" onClick={next} disabled={disabled}>
          {disabled ? 'Placing order…' : `${button} →`}
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
      const items = cart.map((item) => ({
        productId: item.cartId.split(':')[0],
        variantId: item.selectedVariant?.id,
        quantity: item.quantity,
      }));
      const order = await orderApi.create({ items, shippingAddress: address });
      setOrderId(order.id);
      clearCart();
      setStep(5);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
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
          {!dubaiOrder && (
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

  const paymentText = dubaiOrder
    ? 'Cash on delivery is available for orders within Dubai. Online payment options are coming soon.'
    : 'Orders outside Dubai require prepayment before shipping. Our team will contact you after you place your order to arrange payment. Online payment options are coming soon.';

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
            <InfoStep
              title="Payment method"
              text={paymentText}
              next={() => setStep(4)}
              button="Review order"
            />
          )}

          {step === 4 && (
            <InfoStep
              title="Review your order"
              text={
                dubaiOrder
                  ? 'Confirm your order below. Payment will be collected on delivery.'
                  : 'Confirm your order below. Our team will contact you to arrange prepayment before shipping.'
              }
              next={placeOrder}
              button="Place order"
              disabled={placing}
            />
          )}
        </div>

        <OrderSummary items={cart} emirate={address.emirate} />
      </section>
    </>
  );
}