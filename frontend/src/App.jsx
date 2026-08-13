import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import BookDoctor from './pages/BookDoctor';
import MyAppointments from './pages/MyAppointments';
import Medicines from './pages/Medicines';
import Labs from './pages/Labs';
import Emergency from './pages/Emergency';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';

import Layout from './components/layout/Layout';
import PageTransition from './components/layout/PageTransition';

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

        {/* Main Portal Dashboard Routing (Wrapped inside header/footer layout) */}
        <Route element={<Layout />}>
          <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/doctors" element={<PageTransition><Doctors /></PageTransition>} />
          <Route path="/book-doctor/:id" element={<PageTransition><BookDoctor /></PageTransition>} />
          <Route path="/my-appointments" element={<PageTransition><MyAppointments /></PageTransition>} />
          <Route path="/medicines" element={<PageTransition><Medicines /></PageTransition>} />
          <Route path="/labs" element={<PageTransition><Labs /></PageTransition>} />
          <Route path="/emergency" element={<PageTransition><Emergency /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
