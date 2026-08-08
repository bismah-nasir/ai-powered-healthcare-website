import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, CalendarCheck, Pill, Bot } from 'lucide-react';

function Splash() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Local state to manage visual loader phase
  const [showLoader, setShowLoader] = useState(false);
  const [initFinished, setInitFinished] = useState(false);

  useEffect(() => {
    // 200ms delay timer to prevent flickering on fast connections
    const delayTimer = setTimeout(() => {
      if (loading) {
        setShowLoader(true);
      }
    }, 200);

    // If global loading has resolved
    if (!loading) {
      clearTimeout(delayTimer);
      setShowLoader(false);
      setInitFinished(true);

      // UX Improvement: If user session exists, route directly to home dashboard
      if (user) {
        navigate('/home');
      }
    }

    return () => clearTimeout(delayTimer);
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* PHASE 1: Splash Loading Screen */}
      {(!initFinished && showLoader) && (
        <div className="w-full max-w-md flex flex-col items-center justify-center animate-fade-in z-20">
          {/* Centralized Brand Logo Wrapper */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20 animate-pulse">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-text-main font-headings">
                PulseCare <span className="text-primary">AI</span>
              </h1>
              <p className="text-xs text-text-mute font-body tracking-wider uppercase font-semibold mt-1">
                AI Medical Portal
              </p>
            </div>
          </div>

          {/* Thin Spinner Loading Indicator */}
          <div className="mt-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* PHASE 2: Welcome / Onboarding Screen (Transitions in after load completes) */}
      {(initFinished && !user) && (
        <div className="w-full max-w-md flex flex-col items-center gap-8 transition-all duration-300 ease-in-out animate-fade-in z-10">
          
          {/* Top Section: Branding Header (Visual Continuity with Phase 1) */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-lg shadow-primary/20">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text-main font-headings">
                PulseCare <span className="text-primary">AI</span>
              </h1>
              <p className="text-xs text-text-mute font-body tracking-wider uppercase font-semibold">AI Medical Portal</p>
            </div>
          </div>

          {/* Center Panel: Glassmorphic Features Dashboard */}
          <div className="w-full glass-panel rounded-3xl p-8 relative z-10">
            <h2 className="text-2xl font-extrabold text-text-main tracking-tight text-center font-headings mb-4">
              Your AI-Powered Healthcare Companion
            </h2>
            <p className="text-text-sub font-body text-center text-sm leading-relaxed mb-6">
              Consult practitioners, schedule appointments, order medicines, and check symptoms instantly using our AI assistant.
            </p>

            {/* Dynamic Feature Highlights using Lucide Icons */}
            <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-text-sub font-body leading-tight">
                  Manage appointments with leading doctors and view live time slots.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <Pill className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs text-text-sub font-body leading-tight">
                  Access prescription medicines and order items directly to your door.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-text-sub font-body leading-tight">
                  Chat with AI Support for automated symptom triage and health tips.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section: Action CTAs */}
          <div className="w-full flex flex-col gap-3">
            <Link 
              to="/signup" 
              className="btn btn-primary w-full py-4 rounded-2xl text-base"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="btn btn-secondary w-full py-4 rounded-2xl text-base"
            >
              Sign In
            </Link>
            <Link 
              to="/home" 
              className="w-full py-3 text-center text-text-mute hover:text-text-main text-xs font-semibold tracking-wide uppercase transition-colors duration-300 font-body"
            >
              Continue as Guest
            </Link>
          </div>

          {/* Footer copyright */}
          <div className="mt-8 text-center text-[10px] text-text-mute font-body tracking-wider uppercase">
            © {new Date().getFullYear()} PulseCare AI. All Rights Reserved.
          </div>
        </div>
      )}
    </div>
  );
}

export default Splash;
