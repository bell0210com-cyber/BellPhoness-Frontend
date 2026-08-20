import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import { categories, productPrice } from '../data/products';
import { useProducts } from '../context/ProductsContext';

export function ShopPage({ fixedCategory = '' }) {
  const { products } = useProducts();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = params.get('q') || '';
  const category = fixedCategory || params.get('category') || '';
  const brand = params.get('brand') || '';
  const stockOnly = params.get('stock') || '';
  const saleOnly = params.get('sale') || '';
  const storage = params.get('storage') || '';
  const ram = params.get('ram') || '';
  const maxPrice = Number(params.get('maxPrice') || 0);
  const sort = params.get('sort') || 'featured';

  const filtered = [...products]
    .filter((p) => {
      const matchesSearch =
        !search ||
        `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !category ||
        (category === 'deals' ? !!p.salePrice : p.category.toLowerCase() === category.toLowerCase());
      const matchesBrand = !brand || p.brand === brand;
      const matchesStock = !stockOnly || p.stock > 0;
      const matchesSale = !saleOnly || !!p.salePrice;
      const matchesStorage =
        !storage || p.specs.Storage?.replace(/\s+/g, '').toUpperCase() === storage.replace(/\s+/g, '').toUpperCase();
      const matchesRam =
        !ram || p.specs.RAM?.replace(/\s+/g, '').toUpperCase() === ram.replace(/\s+/g, '').toUpperCase();
      const matchesPrice = !maxPrice || productPrice(p) <= maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesStock &&
        matchesSale &&
        matchesStorage &&
        matchesRam &&
        matchesPrice
      );
    })
    .sort((a, b) => {
      if (sort === 'price-low') return productPrice(a) - productPrice(b);
      if (sort === 'price-high') return productPrice(b) - productPrice(a);
      if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sort === 'best') return Number(b.bestseller) - Number(a.bestseller);
      return Number(b.featured) - Number(a.featured);
    });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next);
  };

  const normalize = (value) => value.replace(/\s+/g, '').toUpperCase();

  const storageOptions = [
    ...new Map(
      products
        .map((p) => p.specs.Storage)
        .filter(Boolean)
        .map((s) => [normalize(s), s.replace(/\s+/g, '')])
    ).values()
  ];

  const ramOptions = [
    ...new Map(
      products
        .map((p) => p.specs.RAM)
        .filter(Boolean)
        .map((r) => [normalize(r), r.replace(/\s+/g, '')])
    ).values()
  ];

  const brandOptions = [...new Set(products.map((p) => p.brand))];

  return (
    <>
      <Seo
        title="Shop Premium Technology | BELL"
        description="Shop BELL's selection of smartphones, electronics, and accessories in AED."
      />

      <PageHero
        title={<>Shop <em>technology.</em></>}
        text="Explore a considered selection of smartphones, accessories, and everyday electronics."
      />

      <section className="shell shop-layout">
        <button
          type="button"
          className="filter-toggle"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? 'Hide filters ✕' : 'Filters'}
        </button>

        <aside
          className={`filters ${filtersOpen ? 'filters-open' : ''}`}
          aria-label="Product filters"
        >
          <strong>Filter products</strong>

          <label>
            Search
            <input
              value={search}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search products"
            />
          </label>

          <label>
            Category
            <select
              value={categories.find((c) => c.toLowerCase() === category.toLowerCase()) || category}
              disabled={!!fixedCategory}
              onChange={(e) => updateParam('category', e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            Brand
            <select value={brand} onChange={(e) => updateParam('brand', e.target.value)}>
              <option value="">All brands</option>
              {brandOptions.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>

          <label>
            Price up to
            <select value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)}>
              <option value="">Any price</option>
              <option value="1000">AED 1,000</option>
              <option value="3000">AED 3,000</option>
              <option value="5000">AED 5,000</option>
            </select>
          </label>

          <label>
            Storage
            <select value={storage} onChange={(e) => updateParam('storage', e.target.value)}>
              <option value="">Any storage</option>
              {storageOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            RAM
            <select value={ram} onChange={(e) => updateParam('ram', e.target.value)}>
              <option value="">Any RAM</option>
              {ramOptions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>

          <label>
            Availability
            <select value={stockOnly} onChange={(e) => updateParam('stock', e.target.value)}>
              <option value="">Any availability</option>
              <option value="in-stock">In stock</option>
            </select>
          </label>

          <label className="filter-check">
            <input
              type="checkbox"
              checked={!!saleOnly}
              onChange={(e) => updateParam('sale', e.target.checked ? 'yes' : '')}
            />
            Sale items only
          </label>

          <button className="filter-reset" onClick={() => setParams({})}>
            Reset filters
          </button>
        </aside>

        <div className="shop-results">
          <div className="shop-toolbar">
            <p>{filtered.length} products</p>
            <label>
              Sort
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price low to high</option>
                <option value="price-high">Price high to low</option>
                <option value="best">Best selling</option>
              </select>
            </label>
          </div>

          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((p) => (
                <ProductCard product={p} key={p.id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>✦</span>
              <h2>No products found</h2>
              <p>Try clearing a filter or searching for something else.</p>
              <Link className="button button-gold" to="/shop">
                Explore shop <b>→</b>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function CategoryPage() {
  const { category } = useParams();
  return <ShopPage fixedCategory={category?.toLowerCase()} />;
}