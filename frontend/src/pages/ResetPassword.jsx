import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HeartPulse, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Basic empty validations
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields');
      setLoading(false);
      return;
    }

    // 2. Password length validation (mirrors backend rule)
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
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(data.message || 'Password reset successfully! You can now log in.');
      } else {
        setError(data.message || 'Invalid or expired password recovery token.');
      }
    } catch (err) {
      console.error('[Reset Password] Error:', err.message);
      setError('Connection to server failed. Please try again.');
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

        {/* Back Link to Log In page */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-xs text-text-sub hover:text-text-main font-semibold tracking-wide uppercase transition-colors duration-300 font-body self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text-main font-headings">
              Choose a New Password
            </h2>
            <p className="text-xs text-text-sub font-body mt-1">Enter a new password for your account</p>
          </div>
        </div>

        {/* Form Panel (Glassmorphic) */}
        {!successMsg ? (
          <form onSubmit={handleSubmit} className="w-full glass-panel rounded-3xl p-8 flex flex-col gap-5">

            {/* Dynamic Error Callout */}
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-xs font-semibold p-4 rounded-xl font-body">
                {error}
                {/* Expired or used links can't be retried, so point to a fresh request */}
                {error.toLowerCase().includes('token') && (
                  <>
                    {' '}
                    <Link to="/forgot-password" className="underline hover:text-text-main">
                      Request a new link
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* New Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-sub font-body">New Password (Min 6 chars)</label>
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
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text-sub font-body">Confirm New Password</label>
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
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {/* Submit Action button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300 mt-2 disabled:grayscale disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          /* SUCCESS VIEW: Renders after the password has been changed */
          <div className="w-full glass-panel rounded-3xl p-8 flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="w-16 h-16 bg-success/10 flex items-center justify-center rounded-full">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-main font-headings">Password Updated</h3>
              <p className="text-xs text-text-sub font-body mt-2 leading-relaxed">
                {successMsg}
              </p>
            </div>
            <Link
              to="/login"
              className="btn btn-primary w-full py-4 rounded-2xl text-base font-semibold transition-all duration-300"
            >
              Back to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default ResetPassword;
