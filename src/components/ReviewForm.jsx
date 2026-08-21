import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addReview } from '../services/reviewService';

export default function ReviewForm({ productId, orderId, productName, onSuccess, onCancel }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    
    try {
      await addReview({
        productId,
        customerName: profile?.name || user?.email || 'Anonymous',
        customerUID: user?.uid,
        orderId,
        rating,
        reviewTitle: title,
        reviewText: text,
        verifiedPurchase: true,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Review {productName}</h3>
      {error && <div className="field-error">{error}</div>}
      
      <div className="star-rating-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      
      <label>
        Review Title (Optional)
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Sum up your experience"
          maxLength={100}
        />
      </label>
      
      <label>
        Review Details (Optional)
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="What did you like or dislike?"
          rows="4"
          maxLength={1000}
        ></textarea>
      </label>
      
      <div className="review-form-actions">
        <button type="button" className="button button-outline-dark" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="button button-gold" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
