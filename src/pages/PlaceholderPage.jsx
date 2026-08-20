import { Link, useLocation } from 'react-router-dom';
import Seo from '../components/Seo';

export default function PlaceholderPage({ title: titleProp }) {
  const location = useLocation();

  const derivedTitle = location.pathname
    .slice(1)
    .split('-')
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');

  const title = titleProp || derivedTitle || 'BELL';

  return (
    <section className="placeholder-page shell">
      <Seo
        title={`${title} | BELL`}
        description={`${title} information from BELL.`}
      />
      <p className="eyebrow">BELL</p>
      <h1>{title}</h1>
      <p>This page is ready for its BELL content.</p>
      <Link className="button button-gold" to="/shop">
        Shop Now <span>→</span>
      </Link>
    </section>
  );
}