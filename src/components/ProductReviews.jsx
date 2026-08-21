import { useEffect, useState } from 'react';
import { getProductReviews } from '../services/reviewService';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      getProductReviews(productId)
        .then(setReviews)
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (loading) {
    return <div className="admin-empty">Loading reviews...</div>;
  }

  const average = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <section className="reviews-section shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CUSTOMER FEEDBACK</p>
          <h2>
            Product <em>reviews.</em>
          </h2>
        </div>
      </div>
      
      {reviews.length > 0 ? (
        <>
          <div className="reviews-summary">
            <strong>{average} out of 5</strong>
            <span> based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                    ))}
                  </div>
                  <span className="review-date">
                    {review.date instanceof Date ? review.date.toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                
                {review.reviewTitle && <h4 className="review-title">{review.reviewTitle}</h4>}
                {review.reviewText && <p className="review-text">{review.reviewText}</p>}
                
                <div className="review-author">
                  <span className="author-name">{review.customerName}</span>
                  {review.verifiedPurchase && <span className="verified-badge">✓ Verified Purchase</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <span>★</span>
          <p>No reviews yet. Be the first to review this product after purchase!</p>
        </div>
      )}
    </section>
  );
}
