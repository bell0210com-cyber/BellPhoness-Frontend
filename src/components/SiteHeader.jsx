import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { businessConfig } from '../config/businessConfig';

const links = [
  ['Home', '/'], ['Shop', '/shop'], ['iPhone', '/category/iphone'], ['Samsung', '/category/samsung'],
  ['Accessories', '/category/accessories'], ['Deals', '/category/deals'],
];

export default function SiteHeader() {
  const { cart, wishlist } = useStore();
  const { firstName } = useAuth();
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const [bump, setBump] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    if (cartCount > 0) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 300);
      return () => clearTimeout(t);
    }
  }, [cartCount]);

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
        <div className="header-actions"><Link to="/search" aria-label="Search">⌕</Link><Link to="/wishlist" aria-label="Wishlist">♡<i>{wishlist.length}</i></Link><Link to="/cart" aria-label="Cart" id="cart-icon" className={bump ? 'cart-bump' : ''}>Bag<i>{cartCount}</i></Link><Link to="/account" aria-label="Account">{firstName}</Link></div>
      </div>
    </header>
  );
}
