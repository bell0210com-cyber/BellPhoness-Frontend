import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import { useStore } from '../context/StoreContext';
import { tamaraApi } from '../services/tamaraApi';

export default function TamaraCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useStore();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'approved' | 'declined' | 'canceled' | 'error'
  const [error, setError] = useState('');

  const orderId = params.get('orderId') || params.get('order_id') || params.get('order_reference_id') || '';
  const paymentStatus = (params.get('paymentStatus') || params.get('payment_status') || 'approved').toLowerCase();
  const tamaraOrderId = params.get('tamaraOrderId') || params.get('orderId') || '';

  useEffect(() => {
    let mounted = true;

    async function processCallback() {
      if (!orderId) {
        setStatus('error');
        setError('Missing order reference.');
        setLoading(false);
        return;
      }

      try {
        const res = await tamaraApi.verifyReturn(orderId, paymentStatus, tamaraOrderId);
        if (mounted) {
          if (paymentStatus === 'approved' || res.success) {
            clearCart();
            setStatus('approved');
          } else {
            setStatus(paymentStatus === 'canceled' ? 'canceled' : 'declined');
          }
        }
      } catch (err) {
        console.error('Tamara callback verification error:', err);
        if (mounted) {
          if (paymentStatus === 'approved') {
            clearCart();
            setStatus('approved');
          } else {
            setStatus('error');
            setError(err.message || 'Unable to verify payment status.');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    processCallback();

    return () => {
      mounted = false;
    };
  }, [orderId, paymentStatus, tamaraOrderId, clearCart]);

  if (loading) {
    return (
      <>
        <Seo title="Verifying Payment | BELL" description="Verifying Tamara payment status." />
        <PageHero eyebrow="BELL / TAMARA" title={<>Verifying <em>payment…</em></>} />
        <div className="shell empty-state">
          <span className="live-pulse" style={{ display: 'inline-block', width: 24, height: 24, margin: '0 auto 16px' }} />
          <h2>Securing your order</h2>
          <p>Please wait while we confirm your transaction with Tamara…</p>
        </div>
      </>
    );
  }

  if (status === 'approved') {
    return (
      <>
        <Seo title="Payment Approved | BELL" description="Your Tamara payment was approved." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Order <em>confirmed.</em></>} />
        <div className="shell empty-state">
          <span>✦</span>
          <h2>Payment Approved via Tamara</h2>
          <p>Thank you for your order! Your split payment plan has been set up successfully.</p>
          <p>
            Order reference: <strong>{orderId}</strong>
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link className="button button-gold" to="/orders">
              View My Orders →
            </Link>
            <Link className="button button-dark" to="/shop">
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (status === 'canceled') {
    return (
      <>
        <Seo title="Payment Cancelled | BELL" description="Tamara payment was cancelled." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Payment <em>cancelled.</em></>} />
        <div className="shell empty-state">
          <span>✕</span>
          <h2>Payment was not completed</h2>
          <p>You cancelled the Tamara checkout. Your cart items are still saved.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link className="button button-gold" to="/checkout">
              Return to Checkout →
            </Link>
            <Link className="button button-dark" to="/cart">
              View Cart
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title="Payment Status | BELL" description="Tamara payment status." />
      <PageHero eyebrow="BELL / CHECKOUT" title={<>Payment <em>unsuccessful.</em></>} />
      <div className="shell empty-state">
        <span>!</span>
        <h2>Unable to complete Tamara payment</h2>
        <p>{error || 'The payment could not be processed by Tamara. Please try another payment method or contact support.'}</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Link className="button button-gold" to="/checkout">
            Try Again →
          </Link>
          <Link className="button button-dark" to="/contact">
            Contact Support
          </Link>
        </div>
      </div>
    </>
  );
}
