import { Link } from 'react-router-dom';
import { businessConfig } from '../config/businessConfig';

const navigation = [
  ['Home', '/'], ['Shop', '/shop'], ['iPhone', '/category/iphone'], ['Samsung', '/category/samsung'],
  ['Accessories', '/category/accessories'], ['Deals', '/category/deals'], ['About BELL', '/about'], ['Contact Us', '/contact'],
];
const policies = [
  ['FAQ', '/faq'], ['Shipping Policy', '/shipping-policy'], ['Refund Policy', '/refund-policy'],
  ['Warranty Policy', '/warranty-policy'], ['Privacy Policy', '/privacy-policy'], ['Terms & Conditions', '/terms-and-conditions'],
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-intro">
          <Link className="brand" to="/">{businessConfig.brandName}<span className="brand-dot">.</span></Link>
          <p>Elevated technology, selected for modern life in the UAE.</p>
          <small>Business details are configured in one place for easy updates.</small>
        </div>
        <div>
          <h3>Explore</h3>
          <ul>{navigation.map(([label, href]) => <li key={href}><Link to={href}>{label}</Link></li>)}</ul>
        </div>
        <div>
          <h3>Customer Care</h3>
          <ul>{policies.map(([label, href]) => <li key={href}><Link to={href}>{label}</Link></li>)}</ul>
        </div>
        <div>
          <h3>Stay in touch</h3>
          <p className="footer-location">{businessConfig.city}, {businessConfig.country}</p>
          <Link to="/contact" className="text-link">Contact BELL <span>→</span></Link>
        </div>
      </div>
      <div className="shell footer-bottom">© {new Date().getFullYear()} {businessConfig.brandName}. All rights reserved.</div>
    </footer>
  );
}
