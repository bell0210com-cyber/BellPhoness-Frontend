import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { useLocation } from 'react-router-dom';

export default function PageLayout({ children }) {
  const { pathname } = useLocation();
  return <><SiteHeader /><main key={pathname} className="page-transition">{children}</main><SiteFooter /></>;
}
