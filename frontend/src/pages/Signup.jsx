import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, Mail, Lock, Phone, ArrowLeft } from 'lucide-react';

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Basic empty validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // 2. Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // 3. Confirm password check
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(name, email, password, phone);

      if (result.success) {
        // Redirect to Home Dashboard on successful signup
        navigate('/home');
      } else {
        setError(result.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      setError('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card panel */}
      <div className="w-full max-w-md flex flex-col gap-6 relative z-10 animate-fade-in">
        
        {/* Back Link to Onboarding Splash */}
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
              Create Account
            </h2>
            <p className="text-xs text-text-sub font-body mt-1">Join PulseCare AI to manage your wellness journey</p>
          </div>
        </div>

        {/* Signup Form Panel (Glassmorphic) */}
        <form onSubmit={handleSubmit} className="w-full glass-panel rounded-3xl p-8 flex flex-col gap-4">
          
          {/* Dynamic Error Callout */}
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-xs font-semibold p-4 rounded-xl font-body">
              {error}
            </div>
          )}

          {/* Full Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-sub font-body">Full Name *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-icon-left focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Email Address Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-sub font-body">Email Address *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-icon-left focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Phone Number Input (Optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-sub font-body">Phone Number</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <Phone className="w-5 h-5" />
              </span>
              <input
                type="tel"
                placeholder="1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-icon-left focus:border-primary"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-sub font-body">Password * (Min 6 chars)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-icon-left focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-sub font-body">Confirm Password *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-mute">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-icon-left focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 mt-2"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        {/* Footer Navigation Link */}
        <p className="text-center text-xs text-text-sub font-body">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-bold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;
