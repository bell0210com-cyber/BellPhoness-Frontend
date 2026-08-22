import { useProducts } from '../context/ProductsContext';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import ProductCard from '../components/ProductCard';


const whyBell = [
  ['01', 'Curated technology', 'A focused selection for modern life.'],
  ['02', 'Secure shopping', 'A clear, considered checkout experience.'],
  ['03', 'Support when needed', 'Helpful assistance throughout your order journey.'],
];

function ProductSection({ label, title, products }) {
  return (
    <section className="product-section shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{label}</p>
          <h2>{title}</h2>
        </div>
        <Link className="text-link" to="/shop">
          View all <span>→</span>
        </Link>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard product={p} key={p.id} />
        ))}
      </div>
    </section>
  );
}
export default function HomePage() {
  const { products } = useProducts();
  let featured = products.filter((p) => p.featured).slice(0, 4);
  if (featured.length === 0) {
    featured = products.slice(0, 4);
  }
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);

  return (
    <>
      <Seo
        title="BELL | Premium Technology in Dubai"
        description="Discover premium smartphones and technology accessories from BELL, delivered across Dubai."
      />

      <section className="home-hero">
        <div className="shell home-hero-inner">
          <div>
            <p className="eyebrow">BELL / DUBAI</p>
            <h1>
              Premium Technology.
              <br />
              <em>Simply BELL.</em>
            </h1>
            <p>Discover the latest smartphones and premium accessories, delivered across Dubai.</p>
            <div>
              <Link className="button button-gold" to="/shop">
                Shop Now <b>→</b>
              </Link>
              <Link className="button button-outline" to="/category/deals">
                Explore Deals
              </Link>
            </div>
          </div>

          <div className="hero-device">
            <img src="https://res.cloudinary.com/pkotqxwo/image/upload/v1787350499/aewfzyvxrgfgbjzdggfk.jpg" alt="Premium smartphone" />
            <span>
              THE EDIT
              <br />
              <b>2026</b>
            </span>
          </div>
        </div>
      </section>

      <ProductSection
        label="FEATURED"
        title={<>The BELL <em>selection.</em></>}
        products={featured}
      />

      <section className="collection-banner">
        <div className="shell">
          <p className="eyebrow">SMARTPHONE COLLECTIONS</p>
          <div className="collection-grid">
            <Link to="/category/iphone">
              <span>APPLE</span>
              <h2>
                iPhone
                <br />
                <em>collection.</em>
              </h2>
              <b>Explore →</b>
            </Link>
            <Link to="/category/samsung">
              <span>SAMSUNG</span>
              <h2>
                Galaxy
                <br />
                <em>collection.</em>
              </h2>
              <b>Explore →</b>
            </Link>
          </div>
        </div>
      </section>

      <ProductSection
        label="NEW & NOTED"
        title={<>New arrivals and <em>bestsellers.</em></>}
        products={bestsellers}
      />

      <section className="why-home">
        <div className="shell">
          <p className="eyebrow">WHY BELL</p>
          <div className="why-home-grid">
            <h2>
              Considered from <em>click to delivery.</em>
            </h2>
            {whyBell.map(([num, title, text]) => (
              <div key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reviews-section shell">
        <p className="eyebrow">SHOP WITH CLARITY</p>
        <h2>
          Details that help you choose <em>well.</em>
        </h2>
        <p>
          Explore specifications, availability, delivery information, and applicable product
          support before you buy.
        </p>
      </section>

      <section className="newsletter">
        <div className="shell newsletter-inner">
          <div>
            <p className="eyebrow">BELL LIST</p>
            <h2>
              Stay close to <em>what's next.</em>
            </h2>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="newsletter">
              Email address
            </label>
            <input id="newsletter" type="email" placeholder="Your email address" />
            <button className="button button-gold">Join the list →</button>
          </form>
        </div>
      </section>
    </>
  );
}