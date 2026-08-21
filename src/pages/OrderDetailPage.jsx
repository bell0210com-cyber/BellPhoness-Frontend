import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import Seo from '../components/Seo';
import { orderApi } from '../services/orderApi';

import ReviewForm from '../components/ReviewForm';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0,
  }).format(value);

const statuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [reviewingProduct, setReviewingProduct] = useState(null);

  useEffect(() => {
    orderApi.get(id).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="empty-state">
        <span>✦</span>
        <h2>Order not found</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <Seo title={`Order ${id} | BELL`} description="Review your BELL order." />
      <PageHero title={<>Order <em>{id.slice(0, 8)}</em></>} />

      <section className="shell order-detail">
        <p className="eyebrow">ORDER DETAILS</p>
        <h2>Order information</h2>

        <div className="status-list">
          {statuses.map((s) => (
            <span key={s} className={order.status === s ? 'active' : ''}>
              {s}
            </span>
          ))}
        </div>

        <div className="spec-table" style={{ marginTop: 30 }}>
          {order.items?.map((item) => (
            <div key={item.variantId} style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name} ({item.sku}) × {item.quantity}</span>
                <b>{formatPrice(item.lineTotal)}</b>
              </div>
              
              {order.status === 'Delivered' && (
                <div style={{ marginTop: 10 }}>
                  {reviewingProduct === item.productId ? (
                    <ReviewForm 
                      productId={item.productId}
                      orderId={order.id}
                      productName={item.name}
                      onCancel={() => setReviewingProduct(null)}
                      onSuccess={() => {
                        setReviewingProduct(null);
                        alert('Review submitted successfully!');
                      }}
                    />
                  ) : (
                    <button 
                      className="button button-outline-dark" 
                      style={{ padding: '8px 12px', fontSize: '10px' }}
                      onClick={() => setReviewingProduct(item.productId)}
                    >
                      Leave a Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          <div>
            <span>Total</span>
            <b>{formatPrice(order.total)}</b>
          </div>
        </div>

        {order.shippingAddress && (
          <>
            <h3 style={{ marginTop: 30 }}>Delivery address</h3>
            <p>
              {[
                order.shippingAddress.fullName,
                order.shippingAddress.building,
                order.shippingAddress.street,
                order.shippingAddress.area,
                order.shippingAddress.city,
                order.shippingAddress.emirate,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </>
        )}
      </section>
    </>
  );
}