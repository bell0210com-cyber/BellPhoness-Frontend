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
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <Link className="brand" to="/" aria-label={`${businessConfig.brandName} home`}>
          {businessConfig.brandName}
          <span className="brand-dot">.</span>
        </Link>

        <nav
          id="primary-navigation"
          className={`main-nav ${menuOpen ? 'open' : ''}`}
          aria-label="Primary navigation"
        >
          {links.map(([label, href]) => (
            <NavLink onClick={() => setMenuOpen(false)} key={href} to={href}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/search" aria-label="Search" className="header-action-btn search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>

          <Link to="/wishlist" aria-label="Wishlist" className="header-action-btn wishlist-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlist.length > 0 && <i className="header-badge">{wishlist.length}</i>}
          </Link>

          <Link
            to="/cart"
            aria-label="Cart"
            id="cart-icon"
            className={`header-action-btn cart-btn ${bump ? 'cart-bump' : ''}`}
          >
            <span className="cart-text">Bag</span>
            <svg className="cart-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartCount > 0 && <i className="header-badge">{cartCount}</i>}
          </Link>

          <Link
            to="/account"
            aria-label="Account"
            className={`header-action-btn account-link ${firstName === null ? 'account-link--loading' : ''}`}
          >
            <span className="account-text">{firstName ?? <span className="account-skeleton" />}</span>
            <svg className="account-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
