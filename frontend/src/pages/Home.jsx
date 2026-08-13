import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HeartPulse, Calendar, Pill, ShoppingBag, ShieldAlert, 
  Search, ArrowRight, UserCheck, Activity, Award, ShieldCheck, Heart, Clock
} from 'lucide-react';

const HEALTH_TIPS = [
  {
    title: "Stay Hydrated Daily",
    tip: "Drinking at least 8-10 glasses of water supports kidney functions, keeps your skin clear, and prevents energy fatigue.",
    category: "General Wellness"
  },
  {
    title: "Prioritize Sleep Quality",
    tip: "Aim for 7-8 hours of sound sleep every night. Quality rest helps repair body tissues and supports neurological functions.",
    category: "Mental Health"
  },
  {
    title: "Incorporate Daily Walks",
    tip: "A simple 20-30 minute brisk walk daily improves heart health, raises good cholesterol, and reduces anxiety.",
    category: "Exercise"
  },
  {
    title: "Limit Refined Sugar",
    tip: "Reducing processed sugar intake lowers the risk of Type 2 diabetes, keeps blood sugar stable, and protects heart health.",
    category: "Nutrition"
  }
];

// Dynamic Count Up Timer component using requestAnimationFrame (60fps hardware-accelerated)
function AnimatedCounter({ value, duration = 1500, suffix = "" }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

function Home() {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Dynamic Daily Tip selector
  const [currentTipIdx] = useState(() => Math.floor(Math.random() * HEALTH_TIPS.length));
  const dailyTip = HEALTH_TIPS[currentTipIdx];

  const handleGlobalSearchSubmit = (e) => {
    e.preventDefault();
    if (!globalSearch) return;

    const term = globalSearch.toLowerCase();

    // Contextual routing based on search terms
    if (term.includes('doc') || term.includes('appointment') || term.includes('visit') || term.includes('dermatology') || term.includes('cardi')) {
      navigate(`/doctors?search=${globalSearch}`);
    } else if (term.includes('med') || term.includes('pill') || term.includes('tablet') || term.includes('panadol') || term.includes('pharmacy')) {
      navigate(`/medicines?search=${globalSearch}`);
    } else if (term.includes('test') || term.includes('blood') || term.includes('lab') || term.includes('lipid') || term.includes('checkup')) {
      navigate(`/labs?search=${globalSearch}`);
    } else if (term.includes('emerg') || term.includes('ambul') || term.includes('rescue') || term.includes('hotline')) {
      navigate(`/emergency?search=${globalSearch}`);
    } else {
      // Default to doctor search if ambiguous
      navigate(`/doctors?search=${globalSearch}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-12 px-6 relative overflow-hidden transition-colors duration-300 animate-fade-in">
      {/* Background Decorative Blur circles */}
      <div className="absolute top-[-10%] left-[-15%] w-112.5 h-112.5 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-112.5 h-112.5 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-275 mx-auto flex flex-col gap-12 relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center flex flex-col items-center gap-6 max-w-3xl mx-auto mt-4 animate-slide-up">
          
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase rounded-full font-body tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Next-Gen AI Healthcare Portal
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-main font-headings leading-[1.15]">
            AI-Powered Healthcare,<br />
            <span className="text-primary">Delivered Instantly</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-text-sub font-body leading-relaxed max-w-xl">
            Consult professional practitioners, manage appointments, purchase prescription medicines, and access critical emergency contacts instantly.
          </p>

          {/* Centralized Global Search Bar with pl-icon-left helper */}
          <form 
            onSubmit={handleGlobalSearchSubmit}
            className="w-full max-w-xl flex items-stretch gap-3 mt-3"
          >
            <div className="relative grow shadow-sm rounded-xl overflow-hidden bg-transparent flex items-center">
              <span className="absolute left-4 text-text-mute">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search doctors, medicines, laboratory tests..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-icon-left py-4 focus:border-primary border-0 w-full rounded-2xl bg-transparent"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary px-6 text-sm font-semibold active:scale-[0.97] transition-transform duration-150 shadow-md border-0 shrink-0 flex items-center justify-center"
            >
              Search
            </button>
          </form>

        </div>

        {/* INTERACTIVE SERVICES GRID */}
        <div className="flex flex-col gap-4">
          <div className="text-center md:text-left animate-fade-in delay-100">
            <h2 className="text-xl font-bold text-text-main font-headings">Our Medical Services</h2>
            <p className="text-xs text-text-sub font-body mt-0.5">Explore unified diagnostic and e-commerce solutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
            
            {/* Card 1: Find Doctors */}
            <Link 
              to="/doctors"
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-primary hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer text-left animate-slide-up delay-75"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-base font-bold text-text-main group-hover:text-primary font-headings transition-colors leading-snug">
                  Consult Specialists
                </h3>
                <p className="text-xs text-text-sub font-body leading-relaxed">
                  Browse professional practitioner lists, check live availability slots, and book appointment schedules.
                </p>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1 font-body mt-2">
                Book Visit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Card 2: Pharmacy Store */}
            <Link 
              to="/medicines"
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-secondary hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer text-left animate-slide-up delay-100"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Pill className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-base font-bold text-text-main group-hover:text-secondary font-headings transition-colors leading-snug">
                  Online Pharmacy
                </h3>
                <p className="text-xs text-text-sub font-body leading-relaxed">
                  Order wellness vitamins and prescription medicines directly to your door with real-time stock validations.
                </p>
              </div>
              <span className="text-xs font-bold text-secondary flex items-center gap-1 font-body mt-2">
                Shop Store <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Card 3: Lab Tests */}
            <Link 
              to="/labs"
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-primary hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer text-left animate-slide-up delay-150"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Activity className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-base font-bold text-text-main group-hover:text-primary font-headings transition-colors leading-snug">
                  Diagnostics Labs
                </h3>
                <p className="text-xs text-text-sub font-body leading-relaxed">
                  Schedule blood profiles and health screening tests at home. Check preparation directives and select dates.
                </p>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1 font-body mt-2">
                Book Checkup <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Card 4: Emergency Contacts */}
            <Link 
              to="/emergency"
              className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-6 hover:border-danger hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer text-left animate-slide-up delay-200"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 bg-danger/10 text-danger rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-base font-bold text-text-main group-hover:text-danger font-headings transition-colors leading-snug">
                  Emergency Directory
                </h3>
                <p className="text-xs text-text-sub font-body leading-relaxed">
                  Access verified emergency helplines, trauma centers, and ambulance dispatch numbers instantly.
                </p>
              </div>
              <span className="text-xs font-bold text-danger flex items-center gap-1 font-body mt-2">
                Call Helpline <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

          </div>
        </div>

        {/* DUAL SECTION LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Daily Wellness Tip Callout (7 cols) */}
          <div className="md:col-span-7 animate-slide-up delay-150">
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-5 h-full text-left hover:border-primary/20 transition-all duration-300">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[9px] font-bold uppercase rounded-lg font-body tracking-wide">
                  <Heart className="w-3.5 h-3.5 fill-current animate-pulse" /> Daily Wellness Tip
                </div>
                <h3 className="text-lg font-bold text-text-main font-headings mt-4 leading-snug">
                  {dailyTip.title}
                </h3>
                <p className="text-xs text-text-sub font-body leading-relaxed mt-2.5">
                  {dailyTip.tip}
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-mute font-body border-t border-border-color/30 pt-4 mt-2">
                <span>Category: <strong className="text-text-sub font-semibold">{dailyTip.category}</strong></span>
                <Link to="/blog" className="text-primary font-bold hover:underline flex items-center gap-1">
                  Read Health Blogs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Trust Metrics Grid (5 cols) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 animate-scale-in delay-200">
            
            {/* Metric 1 */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center items-center text-center gap-1.5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-extrabold text-text-main font-headings mt-1">
                <AnimatedCounter value={10000} suffix="+" />
              </h4>
              <p className="text-[9px] text-text-mute font-semibold uppercase tracking-wider font-body">Happy Patients</p>
            </div>

            {/* Metric 2 */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center items-center text-center gap-1.5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-extrabold text-text-main font-headings mt-1">
                <AnimatedCounter value={150} suffix="+" />
              </h4>
              <p className="text-[9px] text-text-mute font-semibold uppercase tracking-wider font-body">Expert Doctors</p>
            </div>

            {/* Metric 3 */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center items-center text-center gap-1.5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-extrabold text-text-main font-headings mt-1">
                <AnimatedCounter value={50} suffix="+" />
              </h4>
              <p className="text-[9px] text-text-mute font-semibold uppercase tracking-wider font-body">Diagnostics Packages</p>
            </div>

            {/* Metric 4 */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col justify-center items-center text-center gap-1.5 hover:-translate-y-1 hover:border-primary/20 transition-all duration-300">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-extrabold text-text-main font-headings mt-1">
                <AnimatedCounter value={20} suffix=" Min" />
              </h4>
              <p className="text-[9px] text-text-mute font-semibold uppercase tracking-wider font-body">Avg Delivery</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Home;
