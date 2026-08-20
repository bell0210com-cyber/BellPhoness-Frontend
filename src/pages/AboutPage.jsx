import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

const benefits = [
  ['Curated selection', 'Premium devices and practical accessories, chosen for everyday performance.'],
  ['Clear AED pricing', 'Straightforward pricing to help you shop with confidence.'],
  ['Helpful support', 'A customer-first team ready to assist before and after your order.'],
  ['Secure shopping', 'A considered online experience designed with checkout security in mind.'],
  ['Convenient delivery', 'Delivery information is made clear so you can plan your purchase.'],
  ['Support where applicable', 'Warranty and product support information is shared where available.'],
];

const categories = ['iPhone', 'Samsung', 'Smartphones', 'Accessories', 'Electronics'];

export default function AboutPage() {
  return (
    <>
      <Seo title="About BELL | Premium Technology in the UAE" description="Discover BELL, a premium UAE online destination for mobile devices, accessories, and technology." />
      <section className="about-hero">
        <div className="shell about-hero-grid">
          <div>
            <p className="eyebrow">BELL / UAE TECHNOLOGY</p>
            <h1>About <em>BELL</em></h1>
            <p className="hero-copy">Technology should feel exceptional from the moment you discover it. BELL brings a considered way to shop for the devices that move your day forward.</p>
            <Link className="button button-gold" to="/shop">Explore the collection <span>→</span></Link>
          </div>
          <div className="hero-art" aria-label="Abstract premium technology visual">
            <div className="orb orb-one" /><div className="orb orb-two" /><div className="phone-silhouette"><span /></div>
            <p>DESIGNED<br />FOR THE<br /><strong>NOW.</strong></p>
          </div>
        </div>
      </section>

      <section className="section shell story-section">
        <div className="section-label">01 / OUR STORY</div>
        <div className="story-content">
          <h2>A refined home for <em>everyday technology.</em></h2>
          <div>
            <p>BELL is a Dubai, UAE-based e-commerce brand focused on mobile devices, electronics, and the accessories that make technology more useful. We believe buying tech online should be simple, informed, and enjoyable.</p>
            <p>Our approach is grounded in a carefully presented collection, clear product information, and a service experience that respects your time. Whether you are choosing a new smartphone or an essential accessory, BELL is built to make the decision feel easy.</p>
          </div>
        </div>
      </section>

      <section className="mission-band">
        <div className="shell mission-grid">
          <div><p className="eyebrow">02 / OUR MISSION</p><h2>Make premium technology <em>more effortless.</em></h2></div>
          <div className="mission-points">
            {['Quality technology products', 'A premium customer experience', 'Reliable, considered service', 'Convenient online shopping'].map((item, index) => <div key={item}><span>0{index + 1}</span>{item}</div>)}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">03 / WHY BELL</p><h2>Chosen with <em>intention.</em></h2></div><p>Details matter. Our experience is designed around the things that make online technology shopping feel reassuring.</p></div>
        <div className="benefit-grid">{benefits.map(([title, text], index) => <article className="benefit-card" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="section categories-section"><div className="shell"><p className="eyebrow">04 / OUR CATEGORIES</p><div className="category-row">{categories.map((category, index) => <Link to={`/${category.toLowerCase().replace(' ', '-')}`} key={category} className="category-item"><span>0{index + 1}</span>{category}<b>↗</b></Link>)}</div></div></section>

      <section className="trust-band"><div className="shell trust-grid">
        {[['Secure checkout', 'A protected checkout experience for a confident purchase.'], ['Customer support', 'Guidance when you need it, from product questions to order help.'], ['Delivery information', 'Clear delivery details to keep your order journey simple.'], ['Returns & warranty', 'Relevant returns and warranty information, where applicable.']].map(([title, text]) => <div key={title}><div className="trust-icon">✦</div><h3>{title}</h3><p>{text}</p></div>)}
      </div></section>

      <section className="cta-section"><div className="shell cta-inner"><p className="eyebrow">BELL / YOUR NEXT UPGRADE</p><h2>Ready to upgrade your <em>technology?</em></h2><div><Link className="button button-gold" to="/shop">Shop Now <span>→</span></Link><Link className="button button-outline" to="/contact">Contact Us</Link></div></div></section>
    </>
  );
}
