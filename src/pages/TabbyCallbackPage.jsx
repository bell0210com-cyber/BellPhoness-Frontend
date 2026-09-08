import { useState, useEffect, useRef } from 'react';
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
  const [rejectionReason, setRejectionReason] = useState('');

  const orderId = params.get('orderId') || params.get('order_id') || params.get('order_reference_id') || '';
  const paymentStatus = (params.get('paymentStatus') || params.get('payment_status') || 'approved').toLowerCase();
  const paymentId = params.get('paymentId') || params.get('payment_id') || '';
  const rawRejectionReason =
    params.get('rejection_reason_code') ||
    params.get('rejection_reason') ||
    params.get('error') ||
    params.get('reason') ||
    '';

  // 1. Ref guard so verify-return executes exactly ONCE upon mounting and cannot re-trigger on re-renders
  const hasVerifiedRef = useRef(false);
  const pollTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const formatRejectionMessage = (rawReason, fallbackMsg) => {
    const lower = (rawReason || '').toLowerCase();
    if (lower.includes('order_amount_too_high') || lower.includes('amount too high') || lower.includes('above your current spending limit')) {
      return 'This purchase is above your current spending limit with Tabby, try a smaller cart or use another payment method.';
    }
    if (lower.includes('order_amount_too_low') || lower.includes('amount too low') || lower.includes('below the minimum amount required')) {
      return 'The purchase amount is below the minimum amount required to use Tabby, try adding more items or use another payment method.';
    }
    return fallbackMsg || 'Sorry, Tabby is unable to approve this purchase, please use an alternative payment method for your order.';
  };

  const isSuccessStatus = (st) => {
    const s = (st || '').toLowerCase();
    return s === 'approved' || s === 'captured' || s === 'paid' || s === 'authorized';
  };

  useEffect(() => {
    // 2. Ref guard so verify-return executes exactly ONCE upon mounting and cannot re-trigger on re-renders
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let mounted = true;

    // 1. Immediately clear interval/timer as soon as first successful response is returned
    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    async function processCallback() {
      // Immediate handling for explicit rejected / failed status in URL
      if (paymentStatus === 'rejected' || paymentStatus === 'failed' || paymentStatus === 'declined') {
        const msg = formatRejectionMessage(
          rawRejectionReason,
          "Don't worry — you can try Tamara or Cash on Delivery instead."
        );
        if (orderId) {
          try {
            const res = await tabbyApi.verifyReturn(orderId, paymentStatus, paymentId, { signal });
            if (res?.rejection_reason || res?.message || res?.error) {
              const resMsg = formatRejectionMessage(
                res.rejection_reason || res.message || res.error,
                msg
              );
              if (mounted) setRejectionReason(resMsg);
            }
          } catch (e) {
            console.debug('Tabby verifyReturn notice:', e);
          }
        }
        if (mounted) {
          setRejectionReason(msg);
          setStatus('rejected');
          setLoading(false);
        }
        return;
      }

      // Immediate handling for explicit canceled status in URL
      if (paymentStatus === 'canceled' || paymentStatus === 'cancelled') {
        if (orderId) {
          try {
            await tabbyApi.verifyReturn(orderId, paymentStatus, paymentId, { signal });
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
        if (mounted) {
          setStatus('error');
          setError('Missing order reference.');
          setLoading(false);
        }
        return;
      }

      // 3. Cap polling to a hard maximum of 3 attempts strictly if the status is pending, and terminate immediately once confirmed
      let attempts = 0;
      const MAX_ATTEMPTS = 3;

      async function attemptVerification() {
        if (!mounted || signal.aborted) return;
        attempts += 1;

        try {
          const res = await tabbyApi.verifyReturn(orderId, paymentStatus, paymentId, { signal });
          const backendStatus = (res?.status || res?.paymentStatus || res?.order?.status || '').toLowerCase();
          const isConfirmed = isSuccessStatus(paymentStatus) || isSuccessStatus(backendStatus) || res?.success;

          if (isConfirmed) {
            // Immediately stop any polling and confirm order
            stopPolling();
            if (mounted) {
              clearCart();
              setStatus('approved');
              setLoading(false);
            }
            return;
          }

          if (backendStatus === 'rejected' || backendStatus === 'failed') {
            stopPolling();
            if (mounted) {
              const msg = formatRejectionMessage(
                res.rejection_reason || res.message || res.error || rawRejectionReason,
                "Don't worry — you can try Tamara or Cash on Delivery instead."
              );
              setRejectionReason(msg);
              setStatus('rejected');
              setLoading(false);
            }
            return;
          }

          if (backendStatus === 'canceled' || backendStatus === 'cancelled') {
            stopPolling();
            if (mounted) {
              setStatus('canceled');
              setLoading(false);
            }
            return;
          }

          // If still pending, retry up to MAX_ATTEMPTS
          if (attempts < MAX_ATTEMPTS) {
            pollTimerRef.current = setTimeout(attemptVerification, 2500);
          } else {
            stopPolling();
            if (mounted) {
              if (isSuccessStatus(paymentStatus)) {
                clearCart();
                setStatus('approved');
              } else {
                setStatus('error');
                setError('Payment verification is pending. Please check your orders page.');
              }
              setLoading(false);
            }
          }
        } catch (err) {
          if (signal.aborted) return;
          console.error('Tabby callback verification error:', err);

          if (attempts < MAX_ATTEMPTS && !isSuccessStatus(paymentStatus)) {
            pollTimerRef.current = setTimeout(attemptVerification, 2500);
          } else {
            stopPolling();
            if (mounted) {
              if (isSuccessStatus(paymentStatus)) {
                clearCart();
                setStatus('approved');
              } else {
                setStatus('error');
                setError('Unable to confirm Tabby payment status. Please check your order history.');
              }
              setLoading(false);
            }
          }
        }
      }

      attemptVerification();
    }

    processCallback();

    // 4. Ensure component unmount cleanup cancels any pending fetch requests or timers
    return () => {
      mounted = false;
      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Run exactly once on mount, guarded by hasVerifiedRef

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
          <p>{rejectionReason || "Don't worry — you can try Tamara or Cash on Delivery instead."}</p>
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
