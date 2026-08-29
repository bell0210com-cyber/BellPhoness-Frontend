export default function ProductCardSkeleton() {
  return (
    <article className="product-card product-card-skeleton" aria-hidden="true">
      <div className="product-image-wrap skeleton-box">
        <div className="skeleton-shimmer" />
      </div>
      <div className="product-card-body">
        <div className="skeleton-line skeleton-brand" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-specs" />
        <div className="skeleton-line skeleton-price" />
        <div className="skeleton-actions">
          <div className="skeleton-line skeleton-stock" />
          <div className="skeleton-line skeleton-btn" />
        </div>
      </div>
    </article>
  );
}
