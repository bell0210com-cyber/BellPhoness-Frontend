import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import { useStore } from '../context/StoreContext';
import { tabbyApi } from '../services/tabbyApi';

export default function TabbyCallbackPage() {
  const [params] = useSearchParams();
  const { clearCart } = useStore();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'approved' | 'rejected' | 'canceled' | 'error'
  const [error, setError] = useState('');

  const orderId = params.get('orderId') || params.get('order_id') || params.get('order_reference_id') || '';
  const paymentStatus = (params.get('paymentStatus') || params.get('payment_status') || 'approved').toLowerCase();
  const paymentId = params.get('paymentId') || params.get('payment_id') || '';

  useEffect(() => {
    let mounted = true;

    async function processCallback() {
      // 1. Immediate handling for explicit rejected / failed status
      if (paymentStatus === 'rejected' || paymentStatus === 'failed' || paymentStatus === 'declined') {
        if (orderId) {
          try {
            await tabbyApi.verifyReturn(orderId, paymentStatus, paymentId);
          } catch (e) {
            console.debug('Tabby verifyReturn notice:', e);
          }
        }
        if (mounted) {
          setStatus('rejected');
          setLoading(false);
        }
        return;
      }

      // 2. Immediate handling for explicit canceled status
      if (paymentStatus === 'canceled' || paymentStatus === 'cancelled') {
        if (orderId) {
          try {
            await tabbyApi.verifyReturn(orderId, paymentStatus, paymentId);
          } catch (e) {
            console.debug('Tabby verifyReturn notice:', e);
          }
        }
        if (mounted) {
          setStatus('canceled');
          setLoading(false);
        }
        return;
      }

      if (!orderId) {
        setStatus('error');
        setError('Missing order reference.');
        setLoading(false);
        return;
      }

      try {
        const res = await tabbyApi.verifyReturn(orderId, paymentStatus, paymentId);
        if (mounted) {
          if (paymentStatus === 'approved' || paymentStatus === 'authorized' || res.success) {
            clearCart();
            setStatus('approved');
          } else if (paymentStatus === 'rejected' || paymentStatus === 'failed' || paymentStatus === 'declined') {
            setStatus('rejected');
          } else if (paymentStatus === 'canceled' || paymentStatus === 'cancelled') {
            setStatus('canceled');
          } else {
            setStatus('rejected');
          }
        }
      } catch (err) {
        console.error('Tabby callback verification error:', err);
        if (mounted) {
          if (paymentStatus === 'approved' || paymentStatus === 'authorized') {
            clearCart();
            setStatus('approved');
          } else if (paymentStatus === 'rejected' || paymentStatus === 'failed' || paymentStatus === 'declined') {
            setStatus('rejected');
          } else if (paymentStatus === 'canceled' || paymentStatus === 'cancelled') {
            setStatus('canceled');
          } else {
            setStatus('error');
            setError(err.message || 'Unable to verify payment status with Tabby.');
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
  }, [orderId, paymentStatus, paymentId, clearCart]);

  if (loading) {
    return (
      <>
        <Seo title="Verifying Payment | BELL" description="Verifying Tabby payment status." />
        <PageHero eyebrow="BELL / TABBY" title={<>Verifying <em>payment…</em></>} />
        <div className="shell empty-state">
          <span className="live-pulse" style={{ display: 'inline-block', width: 24, height: 24, margin: '0 auto 16px' }} />
          <h2>Securing your order</h2>
          <p>Please wait while we confirm your transaction with Tabby…</p>
        </div>
      </>
    );
  }

  // Approved Status
  if (status === 'approved') {
    return (
      <>
        <Seo title="Payment Approved | BELL" description="Your Tabby payment was approved." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Order <em>confirmed.</em></>} />
        <div className="shell empty-state">
          <span>✦</span>
          <h2>Payment Approved via Tabby</h2>
          <p>Thank you for your order! Your split payment plan has been activated successfully.</p>
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

  // Cancelled Status
  if (status === 'canceled') {
    return (
      <>
        <Seo title="Payment Cancelled | BELL" description="Tabby payment was cancelled." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Payment <em>cancelled.</em></>} />
        <div className="shell empty-state">
          <span style={{ color: 'var(--gold, #be9a5d)', fontSize: 32 }}>✕</span>
          <h2>Payment was not completed</h2>
          <p>You cancelled the Tabby checkout. Your cart items are still saved.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link className="button button-gold" to="/checkout">
              RETURN TO CHECKOUT →
            </Link>
            <Link className="button button-dark" to="/cart">
              VIEW CART
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Rejected Status (paymentStatus=rejected or failed)
  if (status === 'rejected' || status === 'declined') {
    return (
      <>
        <Seo title="Payment Rejected | BELL" description="Your Tabby payment application was not approved." />
        <PageHero eyebrow="BELL / CHECKOUT" title={<>Payment <em>rejected.</em></>} />
        <div className="shell empty-state">
          <span style={{ color: 'var(--gold, #be9a5d)', fontSize: 32 }}>✕</span>
          <h2>Your Tabby application was not approved.</h2>
          <p>Don&apos;t worry — you can try Tamara or Cash on Delivery instead.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link className="button button-gold" to="/checkout">
              RETURN TO CHECKOUT →
            </Link>
            <Link className="button button-dark" to="/cart">
              VIEW CART
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Generic Error / Fallback Status
  return (
    <>
      <Seo title="Payment Status | BELL" description="Tabby payment status." />
      <PageHero eyebrow="BELL / CHECKOUT" title={<>Payment <em>unsuccessful.</em></>} />
      <div className="shell empty-state">
        <span style={{ color: 'var(--gold, #be9a5d)', fontSize: 32 }}>✕</span>
        <h2>Unable to complete Tabby payment</h2>
        <p>{error || 'The payment could not be processed by Tabby. Please try another payment method or contact support.'}</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Link className="button button-gold" to="/checkout">
            RETURN TO CHECKOUT →
          </Link>
          <Link className="button button-dark" to="/cart">
            VIEW CART
          </Link>
        </div>
      </div>
    </>
  );
}
