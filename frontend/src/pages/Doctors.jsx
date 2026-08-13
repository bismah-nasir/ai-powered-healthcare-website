import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Star, DollarSign, Award, ArrowRight, HeartPulse } from 'lucide-react';

// Department Category List matching Mongoose schema enums
const DEPARTMENTS = [
  'All',
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Gynecology',
  'Ophthalmology'
];

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Fetch doctors dynamically from backend APIs
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError('');
      try {
        // Construct query parameters
        const params = new URLSearchParams();
        if (selectedDept !== 'All') params.append('department', selectedDept);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`http://localhost:5000/api/doctors?${params.toString()}`);
        const resData = await response.json();

        if (resData.success) {
          setDoctors(resData.data);
        } else {
          setError(resData.message || 'Failed to fetch doctors list.');
        }
      } catch (err) {
        console.error('[Doctors Page] Fetch error:', err.message);
        setError('Failed to connect to the server. Please ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    // Simple delay check to prevent flooding the server on keystroke inputs
    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedDept]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('All');
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-300 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Page Title & Intro */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main font-headings">
            Find Clinical <span className="text-primary">Specialists</span>
          </h1>
          <p className="text-sm text-text-sub font-body mt-2 max-w-xl leading-relaxed">
            Search for qualified medical practitioners, browse by specialty department, and book your online appointments instantly.
          </p>
        </div>

        {/* Filters and Search Dashboard Control Bar */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Text Search Bar Input */}
          <div className="relative w-full md:max-w-md shadow-sm rounded-xl overflow-hidden bg-transparent flex items-center">
            <span className="absolute left-4 text-text-mute">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-icon-left py-4 focus:border-primary border-0 w-full rounded-2xl bg-transparent"
            />
          </div>

          {/* Department Selection Selector Dropdown (Mobile visible, tablet hidden) */}
          <div className="w-full md:w-auto md:hidden">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="focus:border-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Browse Layout (Sidebar Departments + Card Grid) */}
        <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Left Sidebar: Departments Filters list */}
          <div className="hidden md:flex lg:flex flex-col gap-2 w-full md:w-64 shrink-0 glass-panel rounded-3xl p-6">
            <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-3 border-b border-border-color pb-2">
              Departments
            </h3>
            <div className="flex flex-col gap-1.5">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`text-left px-4 py-2.5 rounded-xl text-xs font-semibold font-body transition-all duration-300 border-0 ${
                    selectedDept === dept
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-text-sub hover:text-primary hover:bg-primary/5 bg-transparent'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: Doctor Card Grid or States */}
          <div className="grow w-full">
            {loading ? (
              /* SKELETAL LOADER GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-border-color rounded-2xl"></div>
                      <div className="grow flex flex-col gap-2">
                        <div className="h-4 bg-border-color rounded w-3/4"></div>
                        <div className="h-3 bg-border-color rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-3 bg-border-color rounded w-full"></div>
                    <div className="h-3 bg-border-color rounded w-5/6"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-4 bg-border-color rounded w-1/4"></div>
                      <div className="h-10 bg-border-color rounded-2xl w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* CONNECTION ERROR CALLOUT */
              <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold text-text-main font-headings">Error Loading Profiles</h3>
                <p className="text-sm text-text-sub font-body max-w-sm">{error}</p>
                <button type="button" onClick={handleResetFilters} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs">
                  Reload Directory
                </button>
              </div>
            ) : doctors.length === 0 ? (
              /* EMPTY SEARCH RESULTS STATE */
              <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-main font-headings">No Doctors Found</h3>
                <p className="text-sm text-text-sub font-body max-w-sm leading-relaxed">
                  We couldn't find any medical specialists matching your active filters or search terms.
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
              /* DOCTORS GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {doctors.map((doctor, idx) => {
                  const nextSlot = doctor.availableSlots && doctor.availableSlots.length > 0 
                    ? `${doctor.availableSlots[0].day} at ${doctor.availableSlots[0].time}`
                    : 'No slots available';

                  return (
                    <div 
                      key={doctor._id}
                      style={{ animationDelay: `${(idx % 6) * 75}ms` }}
                      className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group animate-slide-up"
                    >
                      {/* Top profile segment */}
                      <div className="flex items-start gap-4">
                        {/* Profile Image with initials fallback */}
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                          {doctor.imageUrl ? (
                            <img 
                              src={doctor.imageUrl} 
                              alt={doctor.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-xl font-extrabold text-primary font-headings">
                              {doctor.name.split(' ').slice(1).map(n => n.charAt(0)).join('') || 'DR'}
                            </span>
                          )}
                        </div>

                        {/* Title details */}
                        <div className="grow min-w-0">
                          {/* Rating badge */}
                          <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-bold text-text-main">{doctor.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-text-mute">({doctor.reviewsCount} reviews)</span>
                          </div>

                          <h3 className="font-bold text-base text-text-main truncate group-hover:text-primary transition-colors font-headings">
                            {doctor.name}
                          </h3>
                          <p className="text-xs text-text-sub font-semibold font-body truncate mt-0.5">
                            {doctor.specialization}
                          </p>
                        </div>
                      </div>

                      {/* Small Bio */}
                      <p className="text-xs text-text-sub font-body leading-relaxed line-clamp-2">
                        {doctor.about}
                      </p>

                      {/* Specialty specifications */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-border-color">
                        {/* Experience */}
                        <div className="flex items-center gap-2 text-xs text-text-sub font-body">
                          <Award className="w-4 h-4 text-primary" />
                          <span>{doctor.experience} Years Experience</span>
                        </div>

                        {/* Next availability slot */}
                        <div className="flex items-center gap-2 text-xs text-text-sub font-body">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span className="truncate">Next Available: <strong className="text-text-main font-semibold">{nextSlot}</strong></span>
                        </div>
                      </div>

                      {/* Footer Actions (Price + Booking Link) */}
                      <div className="flex items-center justify-between mt-1 pt-1">
                        <div>
                          <p className="text-[10px] text-text-mute font-body tracking-wider uppercase font-semibold">Consultation</p>
                          <p className="text-base font-extrabold text-text-main font-headings flex items-center mt-0.5">
                            <span className="text-xs text-primary font-bold mr-0.5">Rs</span>
                            {doctor.consultationFee}
                          </p>
                        </div>

                        {/* Booking redirect button */}
                        <Link 
                          to={`/book-doctor/${doctor._id}`}
                          className="btn btn-primary rounded-xl text-sm! font-semibold flex items-center gap-1.5 transition-all"
                        >
                          Book Now
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
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

export default Doctors;
