import Seo from '../components/Seo';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import {
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
  sendPasswordReset,
  logout,
  subscribeToAuth,
  getCustomerProfile,
} from '../services/authService';
import { useAuth } from '../context/AuthContext';
export function AuthPage({ type }) {
  const navigate = useNavigate();

  const config = {
    login: [
      'Welcome back.',
      'Sign in to your BELL account.',
      'Sign In',
    ],
    register: [
      'Create your account.',
      'Save your wishlist, track orders, and checkout faster.',
      'Create Account',
    ],
    forgot: [
      'Reset your password.',
      'Enter your email and we will send reset instructions.',
      'Send Reset Link',
    ],
  }[type];

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    remember: false,
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState({
    kind: '',
    message: '',
  });

  const update = (event) => {
    const { name, value, type: inputType, checked } = event.target;

    setValues((current) => ({
      ...current,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      return 'Enter a valid email address.';
    }

    if (type === 'register') {
      if (!values.name.trim()) {
        return 'Enter your full name.';
      }

      if (!/^[+()\d\s-]{7,}$/.test(values.phone.trim())) {
        return 'Enter a valid phone number.';
      }

      if (values.password.length < 8) {
        return 'Use at least 8 characters for your password.';
      }

      if (values.password !== values.confirmPassword) {
        return 'Passwords do not match.';
      }

      if (!values.terms) {
        return 'Please accept the Terms & Conditions to continue.';
      }
    }

    if (type === 'login' && !values.password) {
      return 'Enter your password.';
    }

    return '';
  };

  const submit = async (event) => {
    event.preventDefault();

    const validationMessage = validate();

    if (validationMessage) {
      setState({
        kind: 'error',
        message: validationMessage,
      });
      return;
    }

    setState({
      kind: 'loading',
      message: '',
    });

    try {
      if (type === 'login') {
        await signInWithEmail(
          values.email,
          values.password,
          values.remember
        );

        setState({
          kind: 'success',
          message: 'Login successful. Redirecting...',
        });

        setTimeout(() => {
          navigate('/');
        }, 500);

        return;
      }

      if (type === 'register') {
        await registerWithEmail({
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
        });

        setState({
          kind: 'success',
          message: 'Account created! Please check your email to verify your account before logging in.',
        });

        setTimeout(() => {
          navigate('/login');
        }, 1500);

        return;
      }

      await sendPasswordReset(values.email);

      setState({
        kind: 'success',
        message:
          'If an account exists, password reset instructions have been requested.',
      });
    } catch (error) {
      console.error('Authentication error:', error);

      let message = 'Something went wrong. Please try again.';

      switch (error?.code) {
        case 'auth/email-unverified':
          message = 'Please verify your email address to log in. Check your inbox for the verification link.';
          break;

        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          message = 'Incorrect email or password.';
          break;

        case 'auth/email-already-in-use':
          message = 'An account already exists with this email.';
          break;

        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.';
          break;

        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;

        case 'auth/popup-closed-by-user':
          message = 'Google sign-in was cancelled.';
          break;

        case 'auth/popup-blocked':
          message =
            'Google sign-in popup was blocked by your browser.';
          break;

        case 'auth/operation-not-allowed':
          message =
            'This authentication method is not enabled in Firebase.';
          break;

        default:
          message = error?.message || message;
      }

      setState({
        kind: 'error',
        message,
      });
    }
  };

  const google = async () => {
    setState({
      kind: 'loading',
      message: '',
    });

    try {
      await signInWithGoogle();

      setState({
        kind: 'success',
        message: 'Google login successful. Redirecting...',
      });

      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Google authentication error:', error);

      let message = 'Google sign-in failed. Please try again.';

      switch (error?.code) {
        case 'auth/popup-closed-by-user':
          message = 'Google sign-in was cancelled.';
          break;

        case 'auth/popup-blocked':
          message =
            'Google sign-in popup was blocked by your browser.';
          break;

        case 'auth/account-exists-with-different-credential':
          message =
            'An account already exists with this email using another sign-in method.';
          break;

        case 'auth/operation-not-allowed':
          message =
            'Google Authentication is not enabled in Firebase.';
          break;

        default:
          message = error?.message || message;
      }

      setState({
        kind: 'error',
        message,
      });
    }
  };

  return (
    <>
      <Seo
        title={`${config[0]} | BELL`}
        description="BELL customer account."
      />

      <section className="auth-page">
        <form
          className="auth-card"
          onSubmit={submit}
          noValidate
        >
          <Link className="brand" to="/">
            BELL<span className="brand-dot">.</span>
          </Link>

          <p className="eyebrow">CUSTOMER ACCOUNT</p>

          <h1>{config[0]}</h1>

          <p>{config[1]}</p>

          {state.message && (
            <div
              className={`form-state ${
                state.kind === 'success'
                  ? 'success'
                  : state.kind === 'loading'
                  ? 'loading'
                  : 'error'
              }`}
              role={
                state.kind === 'error'
                  ? 'alert'
                  : 'status'
              }
            >
              {state.message}
            </div>
          )}

          {type === 'register' && (
            <>
              <label>
                Full Name

                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={update}
                  required
                />
              </label>

              <label>
                Phone

                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={update}
                  required
                />
              </label>
            </>
          )}

          <label>
            Email

            <input
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update}
              required
            />
          </label>

          {type !== 'forgot' && (
            <>
              <label>
                Password

                <span className="password-input">
                  <input
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete={
                      type === 'login'
                        ? 'current-password'
                        : 'new-password'
                    }
                    value={values.password}
                    onChange={update}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (show) => !show
                      )
                    }
                    aria-label="Show or hide password"
                  >
                    {showPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </span>
              </label>

              {type === 'register' && (
                <label>
                  Confirm Password

                  <input
                    name="confirmPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={update}
                    required
                  />
                </label>
              )}

              {type === 'login' && (
                <label className="check-label">
                  <input
                    name="remember"
                    type="checkbox"
                    checked={values.remember}
                    onChange={update}
                  />

                  Remember me
                </label>
              )}

              {type === 'register' && (
                <label className="check-label">
                  <input
                    name="terms"
                    type="checkbox"
                    checked={values.terms}
                    onChange={update}
                  />

                  I accept the{' '}
                  <Link to="/terms">
                    Terms & Conditions
                  </Link>
                </label>
              )}
            </>
          )}

          <button
            className="button button-gold full"
            type="submit"
            disabled={state.kind === 'loading'}
          >
            {state.kind === 'loading'
              ? 'Please wait…'
              : config[2]}{' '}
            →
          </button>

          {type !== 'forgot' && (
            <button
              className="google-button"
              type="button"
              onClick={google}
              disabled={state.kind === 'loading'}
            >
              G Continue with Google
            </button>
          )}

          {type === 'login' && (
            <p className="auth-link">
              <Link to="/forgot-password">
                Forgot password?
              </Link>

              <br />

              New to BELL?{' '}
              <Link to="/register">
                Create account
              </Link>
            </p>
          )}

          {type === 'register' && (
            <p className="auth-link">
              Already have an account?{' '}
              <Link to="/login">
                Sign in
              </Link>
            </p>
          )}

          {type === 'forgot' && (
            <p className="auth-link">
              <Link to="/login">
                Back to sign in
              </Link>
            </p>
          )}
        </form>
      </section>
    </>
  );
}
export function AccountPage() {
  const navigate = useNavigate();

  const { user, profile, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logout();

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <>
        <Seo
          title="My Account | BELL"
          description="Manage your BELL account."
        />

        <PageHero
          title={
            <>
              My <em>account.</em>
            </>
          }
        />

        <section className="shell account-dashboard">
          <div className="empty-state">
            <span>✦</span>
            <h2>Loading account...</h2>
            <p>
              Please wait while we load your BELL account.
            </p>
          </div>
        </section>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const customerName =
    profile?.name ||
    user.displayName ||
    'BELL Customer';

  const customerEmail =
    profile?.email ||
    user.email ||
    '';

  const customerPhone =
    profile?.phone ||
    user.phoneNumber ||
    'Not added yet';

  return (
    <>
      <Seo
        title="My Account | BELL"
        description="Manage your BELL account."
      />

      <PageHero
        title={
          <>
            My <em>account.</em>
          </>
        }
      />

      <section className="shell account-dashboard">
        <aside>
          <p className="eyebrow">ACCOUNT</p>

          <h2>
            Welcome, <em>{customerName}</em>
          </h2>

          <p>
            Manage your profile, addresses, orders,
            wishlist, and BELL account.
          </p>

          <button
            className="button button-dark"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? 'Logging out...'
              : 'Logout →'}
          </button>
        </aside>

        <div className="account-panels">
          <article>
            <div>
              <p className="eyebrow">PROFILE</p>

              <h3>Profile information</h3>

              <p>
                <strong>Name:</strong>{' '}
                {customerName}
              </p>

              <p>
                <strong>Email:</strong>{' '}
                {customerEmail}
              </p>

              <p>
                <strong>Phone:</strong>{' '}
                {customerPhone}
              </p>
            </div>

            <Link className="text-link" to="/account/edit">
              Edit profile <span>→</span>
            </Link>
          </article>

          <article>
            <div>
              <p className="eyebrow">ADDRESSES</p>

              <h3>Saved addresses</h3>

              <p>
                Save delivery addresses for a faster
                checkout.
              </p>
            </div>

            <Link className="text-link" to="/account/privacy">
              Manage addresses <span>→</span>
            </Link>
          </article>

          <article>
            <div>
              <p className="eyebrow">ORDERS</p>

              <h3>Order history</h3>

              <p>
                Review your purchases and delivery
                status in one place.
              </p>
            </div>

            <Link
              className="text-link"
              to="/orders"
            >
              View orders <span>→</span>
            </Link>
          </article>

          <article>
            <div>
              <p className="eyebrow">WISHLIST</p>

              <h3>Saved products</h3>

              <p>
                Products saved on this device are
                already available in your wishlist.
              </p>
            </div>

            <Link
              className="text-link"
              to="/wishlist"
            >
              View wishlist <span>→</span>
            </Link>
          </article>

          <article>
            <div>
              <p className="eyebrow">PRIVACY</p>

              <h3>Privacy center</h3>

              <p>
                Manage your data, notification preferences,
                and account deletion.
              </p>
            </div>

            <Link
              className="text-link"
              to="/account/privacy"
            >
              Open privacy center <span>→</span>
            </Link>
          </article>

          <article className="account-logout">
            <div>
              <p className="eyebrow">SESSION</p>

              <h3>Sign out of BELL</h3>

              <p>
                Sign out of your BELL customer account
                on this device.
              </p>
            </div>

            <button
              className="text-button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut
                ? 'Logging out...'
                : 'Logout'}
            </button>
          </article>
        </div>
      </section>
    </>
  );
}