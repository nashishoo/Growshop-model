import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import Loader from './components/Loader/Loader'; // [NEW] Import Loader
import Hero from './components/Home/Hero'; // [NEW] Import Hero
import Footer from './components/Layout/Footer';

// Admin imports
import LoginPage from './pages/Admin/LoginPage';
import AdminLayout from './components/Admin/AdminLayout';
import DashboardPage from './pages/Admin/DashboardPage';
import OrdersPage from './pages/Admin/OrdersPage';
import ProductsPage from './pages/Admin/ProductsPage';
import ClientsPage from './pages/Admin/ClientsPage';
import SettingsPage from './pages/Admin/SettingsPage';
import CouponsPage from './pages/Admin/CouponsPage';
import ShippingManagement from './pages/Admin/ShippingManagement';
import ShippingQueue from './pages/Admin/ShippingQueue';

// Client Auth imports
import ClientLoginPage from './pages/ClientLoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MyAccountPage from './pages/MyAccountPage';
import PaymentPage from './pages/PaymentPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import VoucherDownloadPage from './pages/VoucherDownloadPage';
import ProtectedClientRoute from './components/ProtectedClientRoute';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (e.g., 2.5 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Store Routes */}
            <Route path="/" element={
              <div className="min-h-screen bg-brand-dark flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Hero />
                  <HomePage />
                </main>
                <Footer />
              </div>
            } />

            <Route path="/catalogo" element={
              <div className="min-h-screen bg-brand-dark flex flex-col">
                <Navbar />
                <main className="flex-grow"><CatalogPage /></main>
                <Footer />
              </div>
            } />

            <Route path="/producto/:slug" element={
              <div className="min-h-screen bg-brand-dark flex flex-col">
                <Navbar />
                <main className="flex-grow"><ProductDetailPage /></main>
                <Footer />
              </div>
            } />

            <Route path="/cart" element={
              <div className="min-h-screen bg-brand-dark flex flex-col">
                <Navbar />
                <main className="flex-grow"><CartPage /></main>
                <Footer />
              </div>
            } />

            <Route path="/checkout" element={
              <div className="min-h-screen bg-brand-dark flex flex-col">
                <Navbar />
                <main className="flex-grow"><CheckoutPage /></main>
                <Footer />
              </div>
            } />

            <Route path="/pedido/:orderId" element={
              <div className="min-h-screen bg-brand-dark flex flex-col">
                <Navbar />
                <main className="flex-grow"><OrderConfirmationPage /></main>
                <Footer />
              </div>
            } />

            {/* Client Authentication Routes */}
            <Route path="/login" element={<ClientLoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
            <Route path="/mi-cuenta" element={
              <ProtectedClientRoute>
                <MyAccountPage />
              </ProtectedClientRoute>
            } />

            {/* Payment Routes (Demo + Real) */}
            <Route path="/pago/:orderId" element={<PaymentPage />} />
            <Route path="/pago/exito" element={<PaymentStatusPage />} />
            <Route path="/pago/error" element={<PaymentStatusPage />} />
            <Route path="/pago/pendiente" element={<PaymentStatusPage />} />

            {/* Public Voucher Download */}
            <Route path="/voucher/:orderId" element={<VoucherDownloadPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="pedidos" element={<OrdersPage />} />
              <Route path="productos" element={<ProductsPage />} />
              <Route path="cupones" element={<CouponsPage />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="envios" element={<ShippingManagement />} />
              <Route path="cola-envios" element={<ShippingQueue />} />
              <Route path="configuracion" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
