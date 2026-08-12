import React, { useState, useEffect } from 'react';
import { Search, Phone, MapPin, AlertCircle, Clock, ShieldAlert, CheckCircle, HeartPulse, Building, Droplets } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Ambulance',
  'Trauma Center',
  'Blood Bank',
  'Helpline'
];

function Emergency() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Directory filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch emergency contacts dynamically from the backend
  useEffect(() => {
    const fetchEmergencies = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`http://localhost:5000/api/emergency?${params.toString()}`);
        const resData = await response.json();

        if (resData.success) {
          setEmergencies(resData.data);
        } else {
          setError(resData.message || 'Failed to fetch emergency contacts directory.');
        }
      } catch (err) {
        console.error('[Emergency Page] Fetch error:', err.message);
        setError('Failed to connect to the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchEmergencies();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  // Helper to render visual icons based on category enums
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Ambulance':
        return <HeartPulse className="w-6 h-6 text-danger" />;
      case 'Trauma Center':
        return <Building className="w-6 h-6 text-primary" />;
      case 'Blood Bank':
        return <Droplets className="w-6 h-6 text-red-500 animate-pulse" />;
      default:
        return <Phone className="w-6 h-6 text-secondary" />;
    }
  };

  // Helper to render color-coded availability badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-success bg-success/5 border border-success/10 px-2 py-0.5 rounded-md">
            Available 24/7
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-yellow-500 bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded-md">
            Busy / Delayed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-text-mute bg-text-mute/5 border border-text-mute/10 px-2 py-0.5 rounded-md">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-300 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Page Title & Emergency Banner */}
        <div className="bg-danger/5 border border-danger/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 items-start text-center md:text-left">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main font-headings">
                Emergency Response <span className="text-danger">Directory</span>
              </h1>
              <p className="text-sm text-text-sub font-body mt-1 leading-relaxed max-w-xl">
                Immediate access to verified local ambulance networks, critical blood banks, 24/7 trauma centers, and medical helplines.
              </p>
            </div>
          </div>
          <a 
            href="tel:1122" 
            className="btn btn-danger px-8 py-4 rounded-2xl text-base font-bold flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Phone className="w-5 h-5 fill-current" />
            Call Emergency: 1122
          </a>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Spaced Search Bar with pl-icon-left helper to prevent overlap */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by facility name, city, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-icon-left focus:border-primary w-full"
            />
          </div>

          {/* Mobile responsive selector dropdown (hidden on desktop) */}
          <div className="w-full md:w-auto md:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="focus:border-primary"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Main Catalog View Grid */}
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Left Sidebar: Categories selection list */}
          <div className="hidden md:flex lg:flex flex-col gap-2 w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-3 border-b border-border-color pb-2">
              Categories
            </h3>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold font-body transition-all duration-300 border-0 ${
                    selectedCategory === cat
                      ? 'bg-danger text-white shadow-md shadow-danger/20'
                      : 'text-text-sub hover:text-danger hover:bg-danger/5 bg-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Segment: Emergency Cards Grid */}
          <div className="grow w-full">
            {loading ? (
              /* SKELETAL INVENTORY GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-border-color rounded-2xl"></div>
                      <div className="grow flex flex-col gap-2">
                        <div className="h-4 bg-border-color rounded w-3/4"></div>
                        <div className="h-3 bg-border-color rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-border-color rounded w-full mt-2"></div>
                    <div className="h-10 bg-border-color rounded-2xl w-full mt-4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* ERROR STATE VIEW */
              <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold text-text-main font-headings">Error Loading Helpline Directory</h3>
                <p className="text-sm text-text-sub font-body max-w-sm">{error}</p>
                <button type="button" onClick={handleResetFilters} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs">
                  Reload Directory
                </button>
              </div>
            ) : emergencies.length === 0 ? (
              /* EMPTY SEARCH RESULTS */
              <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-main font-headings">No Contacts Found</h3>
                <p className="text-sm text-text-sub font-body max-w-sm leading-relaxed">
                  No emergency facilities or helpline contacts match your active filters or location searches.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold mt-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* DIRECTORY DECK GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emergencies.map((item) => {
                  return (
                    <div 
                      key={item._id}
                      className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-danger/40 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Top Header Row */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-bg-secondary border border-border-color rounded-2xl flex items-center justify-center shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="grow min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-base text-text-main group-hover:text-danger transition-colors font-headings truncate">
                              {item.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-block px-2 py-0.5 bg-bg-secondary border border-border-color text-text-sub text-[8px] font-bold uppercase rounded-md font-body tracking-wide">
                              {item.category}
                            </span>
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>

                      {/* Location details */}
                      <div className="flex flex-col gap-2 pt-1 border-t border-border-color/50">
                        <div className="flex items-start gap-2 text-xs text-text-sub font-body leading-relaxed">
                          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>
                            {item.address}, <strong className="text-text-main font-semibold">{item.city}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions (Direct Dial Call Buttons) */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        {/* Primary Click to call */}
                        <a 
                          href={`tel:${item.contactNumber.replace(/[^0-9+]/g, '')}`}
                          className="btn btn-danger py-3 px-5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 w-full justify-center"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          Call: {item.contactNumber}
                        </a>
                        
                        {/* Secondary Alternate Dial Call */}
                        {item.altContactNumber && (
                          <a 
                            href={`tel:${item.altContactNumber.replace(/[^0-9+]/g, '')}`}
                            className="btn btn-secondary py-3 px-5 rounded-2xl text-xs text-text-sub hover:text-text-main font-semibold transition-all w-full justify-center"
                          >
                            Alt Call
                          </a>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default Emergency;
