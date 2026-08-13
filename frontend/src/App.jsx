import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Standalone Auth Screens (Full Viewport) */}
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Main Portal Dashboard Routing (Wrapped inside header/footer layout) */}
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/book-doctor/:id" element={<BookDoctor />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/medicines" element={<Medicines />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/cart" element={<Cart />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
