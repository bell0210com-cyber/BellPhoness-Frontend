import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { db } from '../services/firebaseClient';
import { useAuth } from '../context/AuthContext';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort by createdAt descending (newest first)
        fetchedOrders.sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const tB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return tB - tA;
        });

        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load orders: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <Seo title="My Orders | BELL" description="View your BELL order history." />
      <PageHero title={<>Your <em>orders.</em></>} />

      <section className="shell orders-page">
        {error && <div className="form-state error">{error}</div>}

        {!loading && !error && !orders.length && (
          <div className="empty-state">
            <span>✦</span>
            <h2>No orders yet</h2>
            <p>Your order history appears here after you place an order.</p>
            <Link className="button button-gold" to="/shop">
              Shop Now <span>→</span>
            </Link>
          </div>
        )}

        {!!orders.length && (
          <div className="admin-table">
            <div className="admin-row admin-table-head">
              <span>Order</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {orders.map((order) => (
              <div className="admin-row" key={order.id}>
                <span>{order.id.slice(0, 8)}</span>
                <span>{order.items?.length || 0}</span>
                <span>{formatPrice(order.total)}</span>
                <span>{order.status}</span>
                <span>
                  <Link to={`/orders/${order.id}`}>View</Link>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}