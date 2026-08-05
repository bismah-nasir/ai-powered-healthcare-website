import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Splash from './pages/Splash';

// Temporary Home view for testing guest route
const HomePlaceholder = () => (
  <div className="p-8 text-center min-h-screen bg-bg-base flex flex-col justify-center items-center">
    <h1 className="text-3xl font-bold text-primary mb-2 font-headings">PulseCare AI</h1>
    <p className="text-text-sub font-body">Main Application Dashboard (Guest Access Successful)</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<HomePlaceholder />} />
          {/* We will register /login, /signup, /forgot-password routes next */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
