import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { PrivateRoute } from './components/guards/PrivateRoute.tsx';
import AdminRoute from './components/guards/AdminRoute.tsx';

// Páginas
import { Home } from './pages/Landing/Home.tsx';
import { Login } from './pages/Auth/Login.tsx';
import { Register } from './pages/Auth/Register.tsx';
import { Checkout } from './pages/Checkout/Checkout.tsx';
import { CustomerDashboard } from './pages/Dashboard/CustomerDashboard.tsx';
import { AdminDashboard } from './pages/Admin/Dashboard';

// ----- Layout wrapper -----
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // Esconde Navbar E Footer (Login, Register, Admin)
  const hideAllLayout =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  // Esconde APENAS o Footer (Dashboard e Checkout)
  const hideFooterOnly =
    location.pathname === '/minha-conta' ||
    location.pathname.startsWith('/checkout');

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main">
      {!hideAllLayout && <Navbar />}

      <main className="grow">
        {children}
      </main>

      {!hideAllLayout && !hideFooterOnly && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas do Cliente — requer login */}
          <Route path="/checkout/:planId" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
          
          <Route path="/minha-conta" element={
            <PrivateRoute>
              <CustomerDashboard />
            </PrivateRoute>
          } />

          {/* Rotas Admin — requer login + role admin */}
          <Route path="/admin/*" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;