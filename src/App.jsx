import ProductPage from './pages/ProductPage';
import { ShopPage, CategoryPage } from './pages/ShopPage';
import HomePage from './pages/HomePage';
import { Routes, Route } from 'react-router-dom';
import { ProductsProvider } from './context/ProductsContext';
import PageLayout from './components/PageLayout';
import CartPage from './pages/CartPage';

import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import WarrantyPolicyPage from './pages/WarrantyPolicyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import FAQPage from './pages/FAQPage';

import SearchPage from './pages/SearchPage';
import EditProfilePage from './pages/EditProfilePage';
import PrivacyCenterPage from './pages/PrivacyCenterPage';

import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';

import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PlaceholderPage from './pages/PlaceholderPage';

import { StoreProvider } from './context/StoreContext';

import {
  AccountPage,
  AuthPage,
} from './pages/StorefrontPages';

import {
  AdminDashboard,
  AdminLoginPage,
  AdminProductForm,
  AdminProductsPage,
  AdminOrdersPage,
  AdminOrderDetailPage,
  AdminCustomersPage,
  AdminSettingsPage,
  AdminSimplePage,
  AdminReviewsPage,
} from './pages/AdminPages';

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ProductsProvider>
          <PageLayout>
            <ScrollToTop />
            <Routes>

            {/* MAIN */}
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/search" element={<SearchPage />} />
            <Route path="/account/edit" element={<EditProfilePage />} />
            <Route path="/account/privacy" element={<PrivacyCenterPage />} />

            <Route
              path="/shop"
              element={<ShopPage />}
            />

            <Route
              path="/product/:id"
              element={<ProductPage />}
            />
            
            {/* Duplicate checkout route removed for clean code */}

            <Route
              path="/category/:category"
              element={<CategoryPage />}
            />

            <Route
              path="/cart"
              element={<CartPage />}
            />

            <Route
              path="/wishlist"
              element={<CartPage wishlist />}
            />

            {/* AUTH */}
            <Route
              path="/login"
              element={<AuthPage type="login" />}
            />

            <Route
              path="/register"
              element={<AuthPage type="register" />}
            />

            <Route
              path="/forgot-password"
              element={<AuthPage type="forgot" />}
            />

            <Route
              path="/account"
              element={<AccountPage />}
            />

            {/* INFORMATION */}
            <Route
              path="/about"
              element={<AboutPage />}
            />

            <Route
              path="/contact"
              element={<ContactPage />}
            />

            {/* UPDATED ROUTES START HERE */}
            <Route 
              path="/faq" 
              element={<FAQPage />} 
            />
            
            <Route 
              path="/privacy-policy" 
              element={<PrivacyPolicyPage />} 
            />
            
            <Route 
              path="/terms" 
              element={<TermsPage />} 
            />
            
            <Route 
              path="/terms-and-conditions" 
              element={<TermsPage />} 
            />
            
            <Route 
              path="/refund-policy" 
              element={<RefundPolicyPage />} 
            />
            
            <Route 
              path="/shipping-policy" 
              element={<ShippingPolicyPage />} 
            />
            
            <Route 
              path="/warranty-policy" 
              element={<WarrantyPolicyPage />} 
            />
            {/* UPDATED ROUTES END HERE */}

            <Route
              path="/track-order"
              element={<PlaceholderPage title="Track Order" />}
            />

            {/* ADMIN */}
            <Route
              path="/admin/login"
              element={<AdminLoginPage />}
            />

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/products"
              element={<AdminProductsPage />}
            />

            <Route
              path="/admin/products/add"
              element={<AdminProductForm />}
            />

            <Route
              path="/admin/products/edit/:id"
              element={<AdminProductForm />}
            />

            <Route
              path="/admin/orders"
              element={<AdminOrdersPage />}
            />

            <Route
              path="/admin/orders/:id"
              element={<AdminOrderDetailPage />}
            />

            <Route
              path="/admin/customers"
              element={<AdminCustomersPage />}
            />

            <Route
              path="/admin/reviews"
              element={<AdminReviewsPage />}
            />

            <Route
              path="/admin/settings"
              element={<AdminSettingsPage />}
            />

            {/* FALLBACK */}
            <Route
              path="*"
              element={<PlaceholderPage title="Page Not Found" />}
            />

          </Routes>
        </PageLayout>
      </ProductsProvider>
    </StoreProvider>
    </AuthProvider>
  );
}