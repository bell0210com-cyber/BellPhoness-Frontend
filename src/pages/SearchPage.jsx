import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';

export default function SearchPage() {
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  const results = query
    ? products.filter((p) =>
        `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const runSearch = (event) => {
    event.preventDefault();
    setParams(query ? { q: query } : {});
  };

  return (
    <>
      <Seo title="Search | BELL" description="Search BELL technology." />
      <PageHero title={<>Search <em>BELL.</em></>} />

      <section className="shell search-page">
        <form onSubmit={runSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search phones, accessories, electronics"
          />
          <button className="button button-gold">Search →</button>
        </form>

        {query && !results.length && (
          <div className="empty-state">
            <span>✦</span>
            <h2>No results for "{query}"</h2>
            <p>Try a different search term.</p>
          </div>
        )}

        {!!results.length && (
          <div className="product-grid">
            {results.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}