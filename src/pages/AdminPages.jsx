import { useEffect, useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  getIdTokenResult
} from 'firebase/auth';
import { collection, onSnapshot, query, where, getCountFromServer } from 'firebase/firestore';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import Seo from '../components/Seo';
import { firebaseClientReady, db } from '../services/firebaseClient';
import { adminApi } from '../services/adminApi';
import { createEmptyVariant } from '../data/productSchema';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { getAllReviews, deleteReview } from '../services/reviewService';
import { fetchDashboardSummaryAggregations } from '../services/dashboardAggregation';

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

export const AdminShell = ({ children }) => (
  <div className="admin-shell">
    <aside>
      <Link className="brand" to="/">
        BELL<span className="brand-dot">.</span>
      </Link>

      <p>ADMIN CONSOLE</p>

      {[
        ['Dashboard', '/admin/dashboard'],
        ['Hero Slides', '/admin/hero'],
        ['Products', '/admin/products'],
        ['Orders', '/admin/orders'],
        ['Customers', '/admin/customers'],
        ['Reviews', '/admin/reviews'],
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

export const AdminGuard = ({ children }) => children;

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
  // Dedicated Independent Summary Metrics State (Zero dummy values, Zero paginated array dependencies)
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [activeProductsCount, setActiveProductsCount] = useState(0);
  const [inactiveProductsCount, setInactiveProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Firestore Real-time & Aggregated Counts
  useEffect(() => {
    let isMounted = true;

    async function fetchAggregateCounts() {
      // 1. Fetch full unpaginated aggregates from backend
      try {
        const statsData = await adminApi.stats();
        if (statsData && isMounted) {
          if (statsData.totalProducts != null) setTotalProductsCount(statsData.totalProducts);
          if (statsData.activeProducts != null) setActiveProductsCount(statsData.activeProducts);
          if (statsData.inactiveProducts != null) setInactiveProductsCount(statsData.inactiveProducts);
          if (statsData.totalOrders != null) setTotalOrdersCount(statsData.totalOrders);
          if (statsData.pendingOrders != null) setPendingOrdersCount(statsData.pendingOrders);
          if (statsData.lowStock != null) setLowStockCount(statsData.lowStock);
          if (statsData.outOfStock != null) setOutOfStockCount(statsData.outOfStock);
          if (statsData.revenue != null) setTotalRevenue(statsData.revenue);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Backend stats API note:', apiErr);
      }

      // 2. Direct Firestore fallback (Sums all catalog products & valid revenue)
      try {
        if (db) {
          const [prodsSnap, ordersSnap] = await Promise.all([
            getDocs(collection(db, 'products')),
            getDocs(collection(db, 'orders'))
          ]);

          let totalP = 0;
          let activeP = 0;
          let lowS = 0;
          let outS = 0;

          prodsSnap.docs.forEach((doc) => {
            const data = doc.data();
            const isActive = data.is_active === true;
            const variants = Array.isArray(data.variants) && data.variants.length > 0 ? data.variants : [{}];
            totalP += variants.length;
            if (isActive) activeP += variants.length;

            if (Array.isArray(data.variants) && data.variants.length > 0) {
              const totalStock = data.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
              if (totalStock === 0) outS++;
              else if (totalStock <= 5) lowS++;
            }
          });

          let totalO = ordersSnap.size;
          let pendingO = 0;
          let rev = 0;

          ordersSnap.docs.forEach((doc) => {
            const data = doc.data();
            const status = (data.status || '').toLowerCase();
            const payStatus = (data.paymentStatus || '').toLowerCase();
            if (data.status === 'Pending') pendingO++;
            if (status !== 'cancelled' && payStatus !== 'failed') {
              rev += Number(data.total) || 0;
            }
          });

          if (isMounted) {
            setTotalProductsCount(totalP);
            setActiveProductsCount(activeP);
            setInactiveProductsCount(Math.max(0, totalP - activeP));
            setTotalOrdersCount(totalO);
            setPendingOrdersCount(pendingO);
            setLowStockCount(lowS);
            setOutOfStockCount(outS);
            setTotalRevenue(rev);
          }
        }
      } catch (err) {
        console.error('Direct Firestore aggregation error:', err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAggregateCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatAED = (amount) =>
    `AED ${Number(amount || 0).toLocaleString()}`;

  // Summary Metrics — strictly bound to true counts (NO array.length or string formatting)
  const stats = [
    { label: 'Total products', value: totalProductsCount },
    { label: 'Active products', value: activeProductsCount },
    { label: 'Inactive products', value: inactiveProductsCount },
    { label: 'Low stock', value: lowStockCount },
    { label: 'Out of stock', value: outOfStockCount },
    { label: 'Total orders', value: totalOrdersCount },
    { label: 'Pending orders', value: pendingOrdersCount },
    { label: 'Revenue', value: formatAED(totalRevenue) }
  ];

  return (
    <AdminGuard>
      <AdminShell>
        <Seo
          title="Admin Dashboard | BELL"
          description="BELL admin dashboard overview."
        />

        <header className="admin-header">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>
          <Link className="button button-gold" to="/admin/products/add">
            ADD PRODUCT
          </Link>
        </header>

        <ErrorNotice message={error} />

        {loading ? (
          <div className="dash-empty-state">Loading dashboard analytics and data…</div>
        ) : (
          <div className="admin-stats">
            {stats.map(({ label, value }) => (
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
              ['bestseller', 'Bestseller'],
              ['isNewArrival', 'New Arrival']
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

          <div className="admin-basic" style={{ marginTop: '20px' }}>
            <div className="full-field">
              <p className="eyebrow">SPECIFICATIONS</p>
              <h2>Technical Details</h2>
            </div>
            
            <label className="full-field">
              Introductory Paragraph (Optional)
              <textarea
                value={product.specsIntro || ''}
                onChange={(event) => update('specsIntro', event.target.value)}
                placeholder="The iPhone 11 combines advanced technology..."
              />
            </label>

            <label className="full-field">
              What's Included in the Box? (Comma separated)
              <input
                value={Array.isArray(product.boxContents) ? product.boxContents.join(', ') : ''}
                onChange={(event) => update('boxContents', event.target.value.split(',').map(s => s.trim()))}
                placeholder="e.g. Phone, Charging Cable, Manual"
              />
            </label>

            {[
              ['processor', 'Chip/Processor (e.g. A14 Bionic)'],
              ['display', 'Display (e.g. 6.7-inch Super Retina)'],
              ['camera', 'Camera (e.g. Triple 12MP)'],
              ['battery', 'Battery (e.g. Up to 20 hours)'],
              ['ram', 'RAM (e.g. 6GB)'],
              ['screenSize', 'Screen Size (e.g. 6.7 inch)'],
              ['os', 'Operating System (e.g. iOS 18)'],
              ['weight', 'Weight (e.g. 238g)']
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={product[key] || ''}
                  onChange={(event) => update(key, event.target.value)}
                />
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

            <div className="admin-variants-table-container">
              <table className="admin-variants-table">
                <thead>
                  <tr>
                    <th>Color</th>
                    <th>Hex</th>
                    <th>RAM</th>
                    <th>Storage</th>
                    <th>Condition</th>
                    <th>SKU*</th>
                    <th>Price*</th>
                    <th>Sale Price</th>
                    <th>Stock*</th>
                    <th>Images</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant, index) => (
                    <tr key={variant.id || index}>
                      <td><input type="text" value={variant.color ?? ''} onChange={e => changeVariant(index, 'color', e.target.value)} placeholder="e.g. Blue" /></td>
                      <td><input type="text" value={variant.colorHex ?? ''} onChange={e => changeVariant(index, 'colorHex', e.target.value)} placeholder="#000" /></td>
                      <td><input type="text" value={variant.ram ?? ''} onChange={e => changeVariant(index, 'ram', e.target.value)} placeholder="8GB" /></td>
                      <td><input type="text" value={variant.storage ?? ''} onChange={e => changeVariant(index, 'storage', e.target.value)} placeholder="256GB" /></td>
                      <td>
                        <select value={variant.condition ?? ''} onChange={e => changeVariant(index, 'condition', e.target.value)}>
                          <option value="">-</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Very Good">Very Good</option>
                          <option value="Good">Good</option>
                          <option value="New">New</option>
                        </select>
                      </td>
                      <td><input required type="text" value={variant.sku ?? ''} onChange={e => changeVariant(index, 'sku', e.target.value)} /></td>
                      <td><input required type="number" min="0" value={variant.price ?? ''} onChange={e => changeVariant(index, 'price', e.target.value)} /></td>
                      <td><input type="number" min="0" value={variant.salePrice ?? ''} onChange={e => changeVariant(index, 'salePrice', e.target.value)} /></td>
                      <td><input required type="number" min="0" value={variant.stock ?? ''} onChange={e => changeVariant(index, 'stock', e.target.value)} /></td>
                      <td className="compact-image-cell">
                        <input type="file" accept="image/*" onChange={e => handleImageUpload(index, e.target.files[0])} disabled={uploadingIndex === index} title="Upload Image" />
                        <div className="compact-thumbs">
                          {(variant.images || []).map((img, imgIndex) => (
                            <div key={img} className="compact-thumb">
                              <img src={img} alt="" />
                              <button type="button" onClick={() => removeImage(index, imgIndex)}>×</button>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <button type="button" className="text-button remove-variant-btn" onClick={() => setProduct(curr => ({...curr, variants: curr.variants.filter((_, p) => p !== index)}))} disabled={product.variants.length === 1} title="Remove variant">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  useEffect(() => {
    if (!db) {
      setError('Database not available.');
      setLoadingCustomers(false);
      return;
    }
    // Real-time Firestore listener — updates instantly when new customers sign up
    const q = query(collection(db, 'customers'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
            // normalize Firestore Timestamp to JS Date
            createdAt: docSnap.data().createdAt?.toDate?.() ?? docSnap.data().createdAt,
          }))
          // sort newest first client-side (handles missing createdAt gracefully)
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });
        setCustomers(data);
        setLoadingCustomers(false);
      },
      (err) => {
        setError(err.message);
        setLoadingCustomers(false);
      }
    );

    // Real-time Firestore listener for orders to dynamically calculate counts
    const qOrders = query(collection(db, 'orders'));
    const unsubOrders = onSnapshot(
      qOrders,
      (snapshot) => {
        setOrders(snapshot.docs.map((docSnap) => docSnap.data()));
      },
      (err) => {
        console.error('Failed to load orders for counts:', err.message);
      }
    );

    return () => {
      unsub();
      unsubOrders();
    };
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

        {loadingCustomers ? (
          <div className="admin-empty">Loading customers…</div>
        ) : (
          <div className="admin-table">
            <div className="admin-row admin-table-head">
              <span>Name</span>
              <span>Email</span>
              <span>Phone</span>
              <span>Orders</span>
              <span>Joined</span>
            </div>

            {customers.map((customer) => {
              const orderCount = orders.filter((o) => o.userId === customer.id || o.shippingAddress?.email === customer.email).length;
              return (
                <div className="admin-row" key={customer.id}>
                  <span>{customer.name || '—'}</span>
                  <span>{customer.email || '—'}</span>
                  <span>{customer.phone || '—'}</span>
                  <span>{orderCount}</span>
                  <span>
                    {customer.createdAt instanceof Date
                      ? customer.createdAt.toLocaleDateString()
                      : customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : '—'}
                  </span>
                </div>
              );
            })}

            {!customers.length && !error && (
              <div className="admin-empty">No customers yet.</div>
            )}
          </div>
        )}
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
   ADMIN ORDERS  (with status dropdown + View link)
========================================================= */

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

const formatOrderDate = (value) => {
  if (!value) return '—';

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
            <span>Details</span>
          </div>

          {orders.map((order) => (
            <div className="admin-row" key={order.id}>
              <span><Link to={`/admin/orders/${order.id}`}>{order.id}</Link></span>
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
              <span>
                <Link to={`/admin/orders/${order.id}`}>View</Link>
              </span>
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

/* =========================================================
   ADMIN ORDER DETAIL
========================================================= */

const formatOrderDate2 = (value) => {
  if (!value) return '—';
  if (typeof value === 'object' && value._seconds) {
    return new Date(value._seconds * 1000).toLocaleString();
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    adminApi
      .order(id)
      .then(setOrder)
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      await adminApi.updateOrderStatus(id, status);
      setOrder((current) => ({ ...current, status }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">SALES</p>
            <h1>Order details</h1>
          </div>

          <Link className="text-button" to="/admin/orders">
            ← Back to orders
          </Link>
        </header>

        <ErrorNotice message={error} />

        {!order && !error && <p>Loading…</p>}

        {order && (
          <div className="admin-order-detail">
            <section className="admin-detail-block">
              <h2>Order info</h2>
              <div className="admin-detail-grid">
                <div>
                  <span>Order ID</span>
                  <b>{order.id}</b>
                </div>
                <div>
                  <span>Placed on</span>
                  <b>{formatOrderDate2(order.createdAt)}</b>
                </div>
                <div>
                  <span>Status</span>
                  <select
                    value={order.status}
                    disabled={updating}
                    onChange={(e) => changeStatus(e.target.value)}
                  >
                    {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </section>

            <section className="admin-detail-block">
              <h2>Payment</h2>
              <div className="admin-detail-grid">
                <div>
                  <span>Payment method</span>
                  <b>{order.paymentMethod || '—'}</b>
                </div>
                <div>
                  <span>Payment status</span>
                  <b>{order.paymentStatus || '—'}</b>
                </div>
              </div>
            </section>

            <section className="admin-detail-block">
              <h2>Pricing</h2>
              <div className="admin-detail-grid">
                <div>
                  <span>Subtotal</span>
                  <b>AED {order.subtotal}</b>
                </div>
                <div>
                  <span>Shipping</span>
                  <b>{order.shipping === 0 ? 'Free' : `AED ${order.shipping}`}</b>
                </div>
                <div>
                  <span>Discount</span>
                  <b>AED {order.discount || 0}</b>
                </div>
                <div>
                  <span>Total</span>
                  <b>AED {order.total}</b>
                </div>
              </div>
            </section>

            <section className="admin-detail-block">
              <h2>Shipping address</h2>
              <div className="admin-detail-grid">
                <div>
                  <span>Name</span>
                  <b>{order.shippingAddress?.fullName || '—'}</b>
                </div>
                <div>
                  <span>Phone</span>
                  <b>{order.shippingAddress?.phone || '—'}</b>
                </div>
                <div>
                  <span>Building/Villa</span>
                  <b>{order.shippingAddress?.building || '—'}</b>
                </div>
                <div>
                  <span>Street</span>
                  <b>{order.shippingAddress?.street || '—'}</b>
                </div>
                <div>
                  <span>Area</span>
                  <b>{order.shippingAddress?.area || '—'}</b>
                </div>
                <div>
                  <span>City</span>
                  <b>{order.shippingAddress?.city || '—'}</b>
                </div>
                <div>
                  <span>Emirate</span>
                  <b>{order.shippingAddress?.emirate || '—'}</b>
                </div>
                <div>
                  <span>Country</span>
                  <b>{order.shippingAddress?.country || '—'}</b>
                </div>
                <div>
                  <span>Postal Code</span>
                  <b>{order.shippingAddress?.postalCode || '—'}</b>
                </div>
              </div>
            </section>

            <section className="admin-detail-block">
              <h2>Items</h2>
              <div className="admin-table">
                <div className="admin-row admin-table-head">
                  <span>Product</span>
                  <span>SKU</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Line Total</span>
                </div>
                {(order.items || []).map((item, i) => (
                  <div className="admin-row" key={i}>
                    <span>{item.name}</span>
                    <span>{item.sku}</span>
                    <span>{item.quantity}</span>
                    <span>AED {item.unitPrice}</span>
                    <span>AED {item.lineTotal}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}

/* =========================================================
   ADMIN REVIEWS
========================================================= */

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoading(true);
    getAllReviews()
      .then(setReviews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <AdminGuard>
      <AdminShell>
        <header className="admin-header">
          <div>
            <p className="eyebrow">MODERATION</p>
            <h1>Reviews</h1>
          </div>
        </header>

        <ErrorNotice message={error} />

        {loading ? (
          <div className="admin-empty">Loading reviews...</div>
        ) : (
          <div className="admin-table">
            <div className="admin-row admin-table-head" style={{ gridTemplateColumns: '1.5fr 1fr .8fr 2fr 1fr' }}>
              <span>Product ID</span>
              <span>Customer</span>
              <span>Rating</span>
              <span>Review</span>
              <span>Actions</span>
            </div>

            {reviews.map((r) => (
              <div className="admin-row" key={r.id} style={{ gridTemplateColumns: '1.5fr 1fr .8fr 2fr 1fr' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.productId}>
                  {r.productId}
                </span>
                <span>
                  {r.customerName}
                  {r.verifiedPurchase && <small>Verified</small>}
                </span>
                <span>{r.rating} / 5</span>
                <span>
                  <strong>{r.reviewTitle}</strong>
                  <br />
                  <span style={{ fontSize: '11px', color: '#777' }}>{r.reviewText}</span>
                </span>
                <span>
                  <button onClick={() => handleDelete(r.id)} style={{ color: '#8f2b20' }}>
                    Delete
                  </button>
                </span>
              </div>
            ))}

            {!reviews.length && !error && (
              <div className="admin-empty">No reviews yet.</div>
            )}
          </div>
        )}
      </AdminShell>
    </AdminGuard>
  );
}