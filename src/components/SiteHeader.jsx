import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { businessConfig } from '../config/businessConfig';

const links = [
  ['Home', '/'], ['Shop', '/shop'], ['iPhone', '/category/iphone'], ['Samsung', '/category/samsung'],
  ['Accessories', '/category/accessories'], ['Deals', '/category/deals'],
];

export default function SiteHeader() {
  const { cart, wishlist } = useStore();
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label="Toggle navigation">{menuOpen ? '×' : '☰'}</button>
        <Link className="brand" to="/" aria-label={`${businessConfig.brandName} home`}>
          {businessConfig.brandName}<span className="brand-dot">.</span>
        </Link>
        <nav id="primary-navigation" className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Primary navigation">
          {links.map(([label, href]) => <NavLink onClick={() => setMenuOpen(false)} key={href} to={href}>{label}</NavLink>)}
        </nav>
        <div className="header-actions"><Link to="/search" aria-label="Search">⌕</Link><Link to="/wishlist" aria-label="Wishlist">♡<i>{wishlist.length}</i></Link><Link to="/cart" aria-label="Cart">Bag<i>{cartCount}</i></Link><Link to="/account" aria-label="Account">Account</Link></div>
      </div>
    </header>
  );
}
