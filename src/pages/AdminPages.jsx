import { useEffect, useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult
} from 'firebase/auth';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import Seo from '../components/Seo';
import { firebaseClientReady } from '../services/firebaseClient';
import { adminApi } from '../services/adminApi';
import { createEmptyVariant } from '../data/productSchema';
import { uploadImageToCloudinary } from '../services/cloudinary';

const categories = [
  'iPhone',
  'Samsung',
  'Smartphones',
  'Accessories',
  'Electronics'
];

const emptyProduct = () => ({
  name: '',
  brand: '',
  category: '',
  description: '',
  warranty: '',
  is_active: true,
  featured: false,
  bestseller: false,
  images: [],
  variants: [
    {
      ...createEmptyVariant(),
      id: crypto.randomUUID()
    }
  ]
});

/* =========================================================
   ADMIN SHELL
========================================================= */

const AdminShell = ({ children }) => (
  <div className="admin-shell">
    <aside>
      <Link className="brand" to="/">
        BELL<span className="brand-dot">.</span>
      </Link>

      <p>ADMIN CONSOLE</p>

      {[
        ['Dashboard', '/admin/dashboard'],
        ['Products', '/admin/products'],
        ['Orders', '/admin/orders'],
        ['Customers', '/admin/customers'],
        ['Settings', '/admin/settings']
      ].map(([label, path]) => (
        <Link key={path} to={path}>
          {label}
        </Link>
      ))}
    </aside>

    <main>{children}</main>
  </div>
);

/* =========================================================
   ADMIN GUARD
========================================================= */

const AdminGuard = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        if (!firebaseClientReady) {
          if (mounted) {
            setStatus('unauthorized');
          }
          return;
        }

        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          if (mounted) {
            setStatus('unauthorized');
          }
          return;
        }

        const tokenResult = await getIdTokenResult(user, true);

        const isAdmin = tokenResult.claims?.admin === true;

        if (!isAdmin) {
          await signOut(auth);

          if (mounted) {
            setStatus('unauthorized');
          }

          return;
        }

        if (mounted) {
          setStatus('authorized');
        }
      } catch (error) {
        console.error('Admin authentication check failed:', error);

        try {
          await signOut(getAuth());
        } catch {
          // Ignore sign-out errors.
        }

        if (mounted) {
          setStatus('unauthorized');
        }
      }
    };

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <div className="brand">
            BELL<span className="brand-dot">.</span>
          </div>

          <p className="eyebrow">SECURE ADMIN</p>

          <h1>Verifying access.</h1>

          <p>
            Please wait while BELL verifies your administrator credentials.
          </p>
        </div>
      </section>
    );
  }

  if (status !== 'authorized') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

/* =========================================================
   ERROR NOTICE
========================================================= */

const ErrorNotice = ({ message }) => {
  return message ? <div className="admin-error">{message}</div> : null;
};

/* =========================================================
   ADMIN LOGIN
========================================================= */

export function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage('');

    if (!firebaseClientReady) {
      setMessage(
        'Firebase client configuration is required before admin sign-in can be enabled.'
      );
      return;
    }

    if (!email.trim() || !password) {
      setMessage('Please enter your admin email and password.');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = credential.user;

      const tokenResult = await getIdTokenResult(user, true);

      if (tokenResult.claims?.admin !== true) {
        await signOut(auth);

        setMessage(
          'Access denied. This Firebase account does not have administrator permissions.'
        );

        return;
      }

      navigate('/admin/dashboard', {
        replace: true
      });
    } catch (error) {
      console.error('Admin login error:', error);

      let errorMessage = 'Unable to sign in. Please check your credentials.';

      switch (error?.code) {
        case 'auth/invalid-credential':
          errorMessage =
            'Invalid email or password. Please check your credentials.';
          break;

        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;

        case 'auth/user-disabled':
          errorMessage =
            'This Firebase account has been disabled.';
          break;

        case 'auth/user-not-found':
          errorMessage =
            'No Firebase account exists with this email address.';
          break;

        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;

        case 'auth/too-many-requests':
          errorMessage =
            'Too many failed login attempts. Please try again later.';
          break;

        case 'auth/network-request-failed':
          errorMessage =
            'Network error. Please check your internet connection.';
          break;

        default:
          errorMessage =
            error?.message || 'Unable to sign in. Please try again.';
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link className="brand" to="/">
          BELL<span className="brand-dot">.</span>
        </Link>

        <p className="eyebrow">SECURE ADMIN</p>

        <h1>Admin access.</h1>

        <p>
          Sign in with your BELL administrator Firebase account.
          Only accounts with the server-verified{' '}
          <code>admin: true</code> custom claim can access the console.
        </p>

        <ErrorNotice message={message} />

        <form onSubmit={handleLogin}>
          <label>
            Admin Email
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="admin@bell.ae"
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="Enter your password"
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
            />
          </label>

          <button
            type="submit"
            className="button button-gold full"
            disabled={loading}
          >
            {loading ? 'VERIFYING ADMIN...' : 'SIGN IN SECURELY'}
          </button>
        </form>

        <Link className="auth-link" to="/login">
          Customer sign in
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.products(),
      adminApi.orders()
    ])
      .then(([productData, orderData]) => {
        setProducts(productData);
        setOrders(orderData);
      })
      .catch((requestError) => {
        setError(requestError.message);
      });
  }, []);

  const lowStock = products.filter((product) =>
    product.variants?.some(
      (variant) =>
        variant.stock > 0 &&
        variant.stock <= 5
    )
  ).length;

  const stats = [
    ['Total products', products.length],

    [
      'Active products',
      products.filter(
        (product) => product.is_active
      ).length
    ],

    [
      'Inactive products',
      products.filter(
        (product) => !product.is_active
      ).length
    ],

    ['Low stock', lowStock],

    [
      'Out of stock',
      products.filter(
        (product) =>
          product.variants?.length > 0 &&
          product.variants.every(
            (variant) => Number(variant.stock) === 0
          )
      ).length
    ],

    ['Total orders', orders.length],

    [
      'Pending orders',
      orders.filter(
        (order) => order.status === 'Pending'
      ).length
    ],

    [
      'Revenue',
      `AED ${orders.reduce(
        (total, order) =>
          total + Number(order.total || 0),
        0
      )}`
    ]
  ];

  return (
    <AdminGuard>
      <AdminShell>
        <Seo
          title="Admin Dashboard | BELL"
          description="BELL admin dashboard."
        />

        <header className="admin-header">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>

          <Link
            className="button button-gold"
            to="/admin/products/add"
          >
            Add product
          </Link>
        </header>

        <ErrorNotice message={error} />

        {!error && (
          <div className="admin-stats">
            {stats.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const reload = () =>
    adminApi
      .products()
      .then(setProducts)
      .catch((requestError) =>
        setError(requestError.message)
      );

  useEffect(() => {
    reload();
  }, []);

  const toggle = async (product) => {
    try {
      await adminApi.setStatus(
        product.id,
        !product.is_active
      );

      reload();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">CATALOG</p>
            <h1>Products</h1>
          </div>

          <Link
            className="button button-gold"
            to="/admin/products/add"
          >
            Add product
          </Link>
        </header>

        <ErrorNotice message={error} />

        <div className="admin-table">
          <div className="admin-row admin-table-head">
            <span>Product</span>
            <span>Category</span>
            <span>Variants</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {products.map((product) => (
            <div
              className="admin-row"
              key={product.id}
            >
              <span>
                <b>{product.name}</b>
                <small>{product.brand}</small>
              </span>

              <span>{product.category}</span>

              <span>
                {product.variants?.length || 0}
              </span>

              <span>
                {product.is_active
                  ? 'Active'
                  : 'Inactive'}
              </span>

              <span>
                <Link
                  to={`/admin/products/edit/${product.id}`}
                >
                  Edit
                </Link>

                <button
                  onClick={() => toggle(product)}
                >
                  {product.is_active
                    ? 'Deactivate'
                    : 'Activate'}
                </button>
              </span>
            </div>
          ))}

          {!products.length && !error && (
            <div className="admin-empty">
              No catalog items are available yet.
              Add a product to Firestore.
            </div>
          )}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   ADMIN PRODUCT FORM
========================================================= */

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] =
    useState(emptyProduct());

  const [message, setMessage] =
    useState('');

  const [uploadingIndex, setUploadingIndex] =
    useState(null);

  useEffect(() => {
    if (id) {
      adminApi
        .product(id)
        .then(setProduct)
        .catch((requestError) =>
          setMessage(requestError.message)
        );
    }
  }, [id]);

  const update = (key, value) => {
    setProduct((current) => ({
      ...current,
      [key]: value
    }));
  };

  const changeVariant = (
    index,
    key,
    value
  ) =>
    setProduct((current) => ({
      ...current,

      variants: current.variants.map(
        (variant, position) =>
          position === index
            ? {
                ...variant,
                [key]: value
              }
            : variant
      )
    }));

  const handleImageUpload = async (
    index,
    file
  ) => {
    if (!file) return;

    setUploadingIndex(index);

    try {
      const url =
        await uploadImageToCloudinary(file);

      setProduct((current) => ({
        ...current,

        variants: current.variants.map(
          (variant, position) =>
            position === index
              ? {
                  ...variant,
                  images: [
                    ...(variant.images || []),
                    url
                  ]
                }
              : variant
        )
      }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (
    index,
    imgIndex
  ) => {
    setProduct((current) => ({
      ...current,

      variants: current.variants.map(
        (variant, position) =>
          position === index
            ? {
                ...variant,
                images: variant.images.filter(
                  (_, i) => i !== imgIndex
                )
              }
            : variant
      )
    }));
  };

  const save = async (event) => {
    event.preventDefault();

    setMessage('Saving product…');

    try {
      const saved = id
        ? await adminApi.updateProduct(
            id,
            product
          )
        : await adminApi.createProduct(
            product
          );

      setMessage('Product saved successfully.');

      if (!id) {
        navigate(
          `/admin/products/edit/${saved.id}`
        );
      }
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  const addVariant = () =>
    setProduct((current) => ({
      ...current,

      variants: [
        ...current.variants,
        {
          ...createEmptyVariant(),
          id: crypto.randomUUID()
        }
      ]
    }));

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">
              CATALOG
            </p>

            <h1>
              {id
                ? 'Edit product'
                : 'Add product'}
            </h1>
          </div>
        </header>

        <form
          className="admin-form"
          onSubmit={save}
        >
          <div className="admin-basic">
            {[
              ['name', 'Product Name'],
              ['brand', 'Brand'],
              ['warranty', 'Warranty']
            ].map(([key, label]) => (
              <label key={key}>
                {label}

                <input
                  required={key !== 'warranty'}
                  value={product[key]}
                  onChange={(event) =>
                    update(
                      key,
                      event.target.value
                    )
                  }
                />
              </label>
            ))}

            <label>
              Category

              <select
                required
                value={product.category}
                onChange={(event) =>
                  update(
                    'category',
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="full-field">
              Description

              <textarea
                value={product.description}
                onChange={(event) =>
                  update(
                    'description',
                    event.target.value
                  )
                }
              />
            </label>

            {[
              ['is_active', 'Active'],
              ['featured', 'Featured'],
              ['bestseller', 'Bestseller']
            ].map(([key, label]) => (
              <label
                className="admin-check"
                key={key}
              >
                <input
                  type="checkbox"
                  checked={product[key]}
                  onChange={(event) =>
                    update(
                      key,
                      event.target.checked
                    )
                  }
                />

                {label}
              </label>
            ))}
          </div>

          <div className="variant-builder">
            <div>
              <p className="eyebrow">
                VARIANTS
              </p>

              <h2>
                Product variants
              </h2>
            </div>

            {product.variants.map(
              (variant, index) => (
                <fieldset
                  key={variant.id}
                >
                  <legend>
                    Variant {index + 1}
                  </legend>

                  <div className="variant-form-grid">
                    {[
                      ['color', 'Color'],
                      ['colorHex', 'Color Hex'],
                      ['ram', 'RAM'],
                      ['storage', 'Storage'],
                      ['condition', 'Condition'],
                      ['sku', 'SKU'],
                      ['price', 'Price'],
                      ['salePrice', 'Sale Price'],
                      ['stock', 'Stock']
                    ].map(
                      ([key, label]) => (
                        <label key={key}>
                          {label}

                          <input
                            required={[
                              'sku',
                              'price',
                              'stock'
                            ].includes(key)}
                            type={[
                              'price',
                              'salePrice',
                              'stock'
                            ].includes(key)
                              ? 'number'
                              : 'text'}
                            min={
                              key === 'stock'
                                ? 0
                                : undefined
                            }
                            value={
                              variant[key] ?? ''
                            }
                            onChange={(event) =>
                              changeVariant(
                                index,
                                key,
                                event.target
                                  .value
                              )
                            }
                          />
                        </label>
                      )
                    )}
                  </div>

                  <div className="variant-image-upload">
                    <label>
                      Images

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleImageUpload(
                            index,
                            event.target
                              .files[0]
                          )
                        }
                        disabled={
                          uploadingIndex ===
                          index
                        }
                      />
                    </label>

                    {uploadingIndex ===
                      index && (
                      <p>
                        Uploading…
                      </p>
                    )}

                    <div className="variant-image-preview">
                      {(
                        variant.images ||
                        []
                      ).map(
                        (
                          img,
                          imgIndex
                        ) => (
                          <div
                            key={img}
                            className="variant-image-thumb"
                          >
                            <img
                              src={img}
                              alt={`Variant ${
                                index + 1
                              } image ${
                                imgIndex + 1
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index,
                                  imgIndex
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      setProduct(
                        (current) => ({
                          ...current,

                          variants:
                            current.variants.filter(
                              (
                                _,
                                position
                              ) =>
                                position !==
                                index
                            )
                        })
                      )
                    }
                    disabled={
                      product.variants
                        .length === 1
                    }
                  >
                    Remove variant
                  </button>
                </fieldset>
              )
            )}

            <button
              type="button"
              className="button button-outline-dark"
              onClick={addVariant}
            >
              Add variant
            </button>
          </div>

          {message && (
            <div
              className={`form-state ${
                message.includes('successfully')
                  ? 'success'
                  : 'error'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="button button-gold"
          >
            Save product
          </button>
        </form>
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   SIMPLE ADMIN PAGE
========================================================= */

export function AdminSimplePage({
  title
}) {
  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">
              ADMIN
            </p>

            <h1>{title}</h1>
          </div>
        </header>

        <div className="admin-empty">
          This secured page is available after
          Firebase configuration and
          administrator authorization are
          complete.
        </div>
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   ADMIN CUSTOMERS
========================================================= */

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .customers()
      .then(setCustomers)
      .catch((requestError) => setError(requestError.message));
  }, []);

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">PEOPLE</p>
            <h1>Customers</h1>
          </div>
        </header>

        <ErrorNotice message={error} />

        <div className="admin-table">
          <div className="admin-row admin-table-head">
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Orders</span>
            <span>Joined</span>
          </div>

          {customers.map((customer) => (
            <div className="admin-row" key={customer.id}>
              <span>{customer.name || '—'}</span>
              <span>{customer.email}</span>
              <span>{customer.phone || '—'}</span>
              <span>{customer.orderCount ?? 0}</span>
              <span>
                {customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString()
                  : '—'}
              </span>
            </div>
          ))}

          {!customers.length && !error && (
            <div className="admin-empty">No customers yet.</div>
          )}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   ADMIN SETTINGS
========================================================= */

export function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    vatPercent: 5
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .settings()
      .then((data) => {
        if (data) setSettings((current) => ({ ...current, ...data }));
      })
      .catch((requestError) => setMessage(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) =>
    setSettings((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setMessage('Saving…');

    try {
      await adminApi.updateSettings(settings);
      setMessage('Settings saved successfully.');
    } catch (requestError) {
      setMessage(requestError.message);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminShell>
          <p>Loading settings…</p>
        </AdminShell>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">ADMIN</p>
            <h1>Settings</h1>
          </div>
        </header>

        <form className="admin-form" onSubmit={save}>
          <div className="admin-basic">
            {[
              ['storeName', 'Store Name'],
              ['contactEmail', 'Contact Email'],
              ['contactPhone', 'Contact Phone'],
              ['address', 'Address'],
              ['vatPercent', 'VAT %']
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type={key === 'vatPercent' ? 'number' : 'text'}
                  value={settings[key]}
                  onChange={(event) => update(key, event.target.value)}
                />
              </label>
            ))}
          </div>

          {message && (
            <div
              className={`form-state ${
                message.includes('successfully') ? 'success' : 'error'
              }`}
            >
              {message}
            </div>
          )}

          <button type="submit" className="button button-gold">
            Save settings
          </button>
        </form>
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   ADMIN ORDERS  (with updated status dropdown)
========================================================= */

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const formatOrderDate = (value) => {
  if (!value) return '—';

  // Firestore Timestamp serialized over JSON looks like { _seconds, _nanoseconds }
  if (typeof value === 'object' && value._seconds) {
    return new Date(value._seconds * 1000).toLocaleDateString();
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const reload = () =>
    adminApi
      .orders()
      .then(setOrders)
      .catch((requestError) => setError(requestError.message));

  useEffect(() => {
    reload();
  }, []);

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await adminApi.updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">SALES</p>
            <h1>Orders</h1>
          </div>
        </header>

        <ErrorNotice message={error} />

        <div className="admin-table">
          <div className="admin-row admin-table-head">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {orders.map((order) => (
            <div className="admin-row" key={order.id}>
              <span>{order.id}</span>
              <span>
                {order.shippingAddress?.fullName ||
                  order.customerName ||
                  order.email ||
                  '—'}
              </span>
              <span>AED {order.total}</span>
              <span>
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) => changeStatus(order.id, e.target.value)}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </span>
              <span>{formatOrderDate(order.createdAt)}</span>
            </div>
          ))}

          {!orders.length && !error && (
            <div className="admin-empty">No orders yet.</div>
          )}
        </div>
      </AdminShell>
    </AdminGuard>
  );
}