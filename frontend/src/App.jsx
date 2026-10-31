import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import BookDoctor from './pages/BookDoctor';
import MyAppointments from './pages/MyAppointments';
import MyOrders from './pages/MyOrders';
import MyLabTests from './pages/MyLabTests';
import Medicines from './pages/Medicines';
import Labs from './pages/Labs';
import Emergency from './pages/Emergency';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import SymptomChecker from './pages/SymptomChecker';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import PageTransition from './components/layout/PageTransition';
import ScrollToTop from './components/layout/ScrollToTop';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Standalone Auth Screens (Full Viewport) */}
        <Route path="/" element={<PageTransition><Splash /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />

        {/* Main Portal Dashboard Routing (Wrapped inside header/footer layout) */}
        <Route element={<Layout />}>
          <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/doctors" element={<PageTransition><Doctors /></PageTransition>} />
          <Route path="/book-doctor/:id" element={<PageTransition><BookDoctor /></PageTransition>} />
          <Route path="/medicines" element={<PageTransition><Medicines /></PageTransition>} />
          <Route path="/labs" element={<PageTransition><Labs /></PageTransition>} />
          <Route path="/emergency" element={<PageTransition><Emergency /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/symptom-checker" element={<PageTransition><SymptomChecker /></PageTransition>} />

          {/* Signed-in users only (guests are sent to /login and brought back afterwards) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-appointments" element={<PageTransition><MyAppointments /></PageTransition>} />
            <Route path="/my-orders" element={<PageTransition><MyOrders /></PageTransition>} />
            <Route path="/my-lab-tests" element={<PageTransition><MyLabTests /></PageTransition>} />
          </Route>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          </Route>

          {/* Any unknown address */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AnimatedRoutes />
          </Router>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
