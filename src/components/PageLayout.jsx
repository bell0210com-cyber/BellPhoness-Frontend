import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function PageLayout({ children }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /></>;
}
