import { useEffect, useState } from 'react';
import { getAuth, getIdTokenResult, signOut } from 'firebase/auth';
import { Link, Navigate } from 'react-router-dom';
import { firebaseClientReady } from '../services/firebaseClient';
import { adminAuthApi } from '../services/adminAuthApi';

const OTP_SESSION_KEY = 'bell_admin_otp_session';

export default function AdminGuard({ children }) {
  const [firebaseStatus, setFirebaseStatus] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized'
  const [otpVerified, setOtpVerified] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(OTP_SESSION_KEY) || '{}');
      return Boolean(stored?.verified);
    } catch {
      return false;
    }
  });

  // OTP Form State
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // 1. Firebase Administrator Authentication Check
  useEffect(() => {
    let mounted = true;

    if (!firebaseClientReady) {
      setFirebaseStatus('unauthorized');
      return;
    }

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!mounted) return;

      if (!user) {
        setFirebaseStatus('unauthorized');
        return;
      }

      try {
        const tokenResult = await getIdTokenResult(user);
        const isAdmin = tokenResult.claims?.admin === true;

        if (!isAdmin) {
          await signOut(auth);
          if (mounted) setFirebaseStatus('unauthorized');
          return;
        }

        if (mounted) setFirebaseStatus('authorized');
      } catch (error) {
        console.error('Admin authentication check failed:', error);
        if (mounted) setFirebaseStatus('unauthorized');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Handler: Request / Resend OTP to Admin Gmail
  const handleSendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSendingOtp(true);

    try {
      const data = await adminAuthApi.sendOtp();
      setSuccessMsg(data.message || 'Verification code sent to your admin email.');
      if (data.emailMasked) setMaskedEmail(data.emailMasked);
      setCooldown(60); // 60s cooldown
    } catch (err) {
      console.error('Send OTP error:', err);
      setErrorMsg(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Handler: Verify 6-digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otpInput.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await adminAuthApi.verifyOtp(cleanOtp);
      if (res.verified) {
        // Save session in sessionStorage (expires automatically when tab is closed)
        const sessionPayload = {
          verified: true,
          token: res.token,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(sessionPayload));
        setOtpVerified(true);
      } else {
        setErrorMsg('Verification failed. Please check your code.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setErrorMsg(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // State A: Checking Firebase Auth
  if (firebaseStatus === 'checking') {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <div className="brand">
            BELL<span className="brand-dot">.</span>
          </div>
          <p className="eyebrow">SECURE ADMIN</p>
          <h1>Verifying credentials.</h1>
          <p>Please wait while BELL verifies your administrator permissions…</p>
        </div>
      </section>
    );
  }

  // State B: Not signed in as Admin -> Redirect to login
  if (firebaseStatus !== 'authorized') {
    return <Navigate to="/admin/login" replace />;
  }

  // State C: Signed in, but Session OTP Not Verified -> Show Minimalist OTP Lock Screen
  if (!otpVerified) {
    return (
      <section className="auth-page" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '440px', width: '100%', margin: '0 auto', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Link className="brand" to="/" style={{ fontSize: 24, fontWeight: 800, textDecoration: 'none' }}>
              BELL<span className="brand-dot" style={{ color: '#be9a5d' }}>.</span>
            </Link>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', background: '#f5efe6', color: '#be9a5d', padding: '4px 8px', borderRadius: 4 }}>
              2FA Security
            </span>
          </div>

          <p className="eyebrow" style={{ color: '#be9a5d', fontSize: 12, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '4px 0 8px' }}>
            Two-Factor Authentication
          </p>

          <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 10px', color: '#111' }}>
            Admin Verification
          </h1>

          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, margin: '0 0 20px' }}>
            Every new browser session requires an OTP verification code sent to your registered Gmail address.
          </p>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 13, marginBottom: 16 }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleVerifyOtp}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 8 }}>
              6-Digit Security OTP
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                placeholder="• • • • • •"
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
                required
                style={{
                  fontSize: 22,
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '12px',
                  borderRadius: 8,
                  border: '1.5px solid #d8d1c8',
                  width: '100%',
                  marginTop: 6,
                  boxSizing: 'border-box',
                }}
              />
            </label>

            <button
              type="submit"
              className="button button-gold full"
              disabled={loading || otpInput.trim().length !== 6}
              style={{ marginTop: 14, width: '100%', padding: '12px', fontWeight: 600 }}
            >
              {loading ? 'VERIFYING CODE…' : 'UNLOCK CONSOLE →'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || cooldown > 0}
              style={{
                background: 'none',
                border: 'none',
                color: cooldown > 0 ? '#999' : '#be9a5d',
                fontSize: 13,
                fontWeight: 600,
                cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                padding: 0,
              }}
            >
              {sendingOtp ? 'Sending code…' : cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Send OTP to Gmail'}
            </button>

            <button
              type="button"
              onClick={() => {
                getAuth().signOut();
                sessionStorage.removeItem(OTP_SESSION_KEY);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </section>
    );
  }

  // State D: Authorized & Verified via OTP -> Render Admin Dashboard / Console
  return children;
}
