import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Redirect to Home Dashboard on successful login
        navigate('/home');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card panel */}
      <div className="w-full max-w-md flex flex-col gap-6 relative z-10 animate-fade-in">
        
        {/* Back Link to Onboarding Splash Screen */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xs text-text-sub hover:text-text-main font-semibold tracking-wide uppercase transition-colors duration-300 font-body self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-main font-headings">
              Welcome Back
            </h2>
            <p className="text-xs text-text-sub font-body mt-1">Sign in to access your PulseCare AI dashboard</p>
          </div>
        </div>

        {/* Login Form Panel (Glassmorphic) */}
        <form onSubmit={handleSubmit} className="w-full glass-panel rounded-3xl p-8 flex flex-col gap-5">
          
          {/* Dynamic Error Banner */}
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-xs font-semibold p-4 rounded-xl font-body">
              {error}
            </div>
          )}

          {/* Email Input Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-sub font-body">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-icon-left focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-text-sub font-body">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:text-primary-hover font-semibold font-body"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-icon-left pr-10 focus:border-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute hover:text-text-main p-0 bg-transparent border-0 outline-none w-5 h-5 flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 mt-2"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <p className="text-center text-xs text-text-sub font-body">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary-hover font-bold">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
