import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';

import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Doctors from './pages/Doctors';
import BookDoctor from './pages/BookDoctor';
import MyAppointments from './pages/MyAppointments';
import Medicines from './pages/Medicines';
import Labs from './pages/Labs';
import Emergency from './pages/Emergency';
import Blog from './pages/Blog';
import Contact from './pages/Contact';

import Layout from './components/layout/Layout';

// Temporary Home view for testing routing Layout
const HomePlaceholder = () => (
  <div className="py-20 px-6 text-center max-w-150 mx-auto flex flex-col justify-center items-center gap-4">
    <h1 className="text-4xl font-extrabold text-text-main font-headings">Welcome to PulseCare AI</h1>
    <p className="text-text-sub font-body leading-relaxed">
      Your digital healthcare interface is fully configured. You can navigate through the pages in the navbar or toggle the light/dark mode icon to verify CSS styles!
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Standalone Auth Screens (Full Viewport) */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Main Portal Dashboard Routing (Wrapped inside header/footer layout) */}
          <Route element={<Layout />}>
            <Route path="/home" element={<HomePlaceholder />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/book-doctor/:id" element={<BookDoctor />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
