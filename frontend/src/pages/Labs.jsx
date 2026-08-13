import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, Clock, DollarSign, AlertTriangle, ShieldAlert, Check, HeartPulse, FileText, CheckCircle, Info, User, Phone } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Full Body Checkup',
  'Vitamins & Minerals',
  'Heart Health',
  'Diabetes Screen',
  'Thyroid Profile',
  'Kidney & Liver',
  'Infectious Diseases',
  'Allergy Tests'
];

function Labs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Catalog filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout modal states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [bookingDate, setBookingDate] = useState('');
  
  // Checkout flow feedback states
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sync patient details when user state loads
  useEffect(() => {
    if (user) {
      setPatientName(user.name);
      setPatientPhone(user.phone || '');
    }
  }, [user]);

  // Fetch lab tests dynamically from the backend
  useEffect(() => {
    const fetchLabTests = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);

        const response = await fetch(`http://localhost:5000/api/labs?${params.toString()}`);
        const resData = await response.json();

        if (resData.success) {
          setLabTests(resData.data);
        } else {
          setError(resData.message || 'Failed to fetch diagnostic checkups directory.');
        }
      } catch (err) {
        console.error('[Labs Page] Fetch error:', err.message);
        setError('Failed to connect to the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchLabTests();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedCategory]);

  // Trigger Booking wizard checks
  const handleBookTestClick = (test) => {
    if (!user) {
      // Redirect to login if user is not signed in
      navigate('/login');
      return;
    }
    setSelectedTest(test);
    setBookingModalOpen(true);
    // Set default booking date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  };

  // Submit test booking request
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      alert('Please select a booking date.');
      return;
    }

    setBookingSubmitting(true);
    try {
      // Simulate API saving delay
      // In a production app, we write a document to the LabOrders/Appointments collection
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setBookingSuccess(true);
      setBookingModalOpen(false);
    } catch (err) {
      alert('Booking request failed. Please try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleCloseSuccess = () => {
    setBookingSuccess(false);
    setSelectedTest(null);
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-300 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Page Title & Description */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main font-headings">
            Diagnostic <span className="text-primary">Lab Tests</span>
          </h1>
          <p className="text-sm text-text-sub font-body mt-2 max-w-xl leading-relaxed">
            Schedule diagnostic screenings and wellness blood tests online. View specific requirements, fasting rules, and turnaround times for each health profile.
          </p>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md shadow-sm rounded-xl overflow-hidden bg-transparent flex items-center">
            <span className="absolute left-4 text-text-mute">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by test name or specific parameter (e.g. cholesterol)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-icon-left py-4 focus:border-primary border-0 w-full rounded-2xl bg-transparent"
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
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-text-sub hover:text-primary hover:bg-primary/5 bg-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right Segment: Lab Tests Cards Grid */}
          <div className="grow w-full">
            {loading ? (
              /* SKELETAL INVENTORY GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
                    <div className="h-4 bg-border-color rounded w-2/3"></div>
                    <div className="h-3 bg-border-color rounded w-1/3"></div>
                    <div className="h-3 bg-border-color rounded w-full mt-2"></div>
                    <div className="h-3 bg-border-color rounded w-5/6"></div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-4 bg-border-color rounded w-1/4"></div>
                      <div className="h-10 bg-border-color rounded-2xl w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              /* ERROR STATE VIEW */
              <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-danger" />
                </div>
                <h3 className="text-lg font-bold text-text-main font-headings">Error Loading Screenings</h3>
                <p className="text-sm text-text-sub font-body max-w-sm">{error}</p>
                <button type="button" onClick={handleResetFilters} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs">
                  Reload Directory
                </button>
              </div>
            ) : labTests.length === 0 ? (
              /* EMPTY SEARCH RESULTS */
              <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-text-main font-headings">No Lab Tests Found</h3>
                <p className="text-sm text-text-sub font-body max-w-sm leading-relaxed">
                  No diagnostic screenings match your active keyword search or category filters.
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
              /* DIAGNOSTICS DECK GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {labTests.map((test) => {
                  return (
                    <div 
                      key={test._id}
                      className="glass-panel rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-primary hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Top Header details */}
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="font-bold text-base text-text-main group-hover:text-primary transition-colors font-headings line-clamp-2">
                            {test.name}
                          </h3>
                          <span className="shrink-0 inline-block px-2 py-0.5 bg-bg-secondary border border-border-color text-text-sub text-[8px] font-bold uppercase rounded-md font-body tracking-wide">
                            {test.sampleType}
                          </span>
                        </div>

                        <span className="inline-block mt-1 text-[9px] font-bold text-text-mute uppercase tracking-wider">
                          {test.category}
                        </span>

                        <p className="text-xs text-text-sub font-body leading-relaxed line-clamp-3 mt-3 border-t border-border-color/50 pt-2.5">
                          {test.description}
                        </p>
                      </div>

                      {/* Clinical specifications */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-border-color">
                        {/* Report Time TAT */}
                        <div className="flex items-center gap-2 text-[10px] text-text-sub font-body">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span>Report TAT: <strong className="text-text-main font-semibold">{test.reportTime}</strong></span>
                        </div>

                        {/* Fasting Badge */}
                        <div className="flex items-center gap-2 text-[10px] text-text-sub font-body">
                          <Info className={`w-4 h-4 ${test.fastingRequired ? 'text-yellow-500' : 'text-primary'}`} />
                          <span>
                            Preparation: {' '}
                            <strong className={`font-semibold ${test.fastingRequired ? 'text-yellow-600 dark:text-yellow-400' : 'text-text-main'}`}>
                              {test.fastingRequired ? '12 Hours Fasting Required' : 'No Fasting Required'}
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Card Footer segment (Price + Action Button) */}
                      <div className="flex items-center justify-between pt-2 mt-1">
                        <div>
                          <p className="text-[9px] text-text-mute font-body tracking-wider uppercase font-semibold">Test Fee</p>
                          <p className="text-base font-extrabold text-text-main font-headings flex items-center mt-0.5">
                            <span className="text-xs text-primary font-bold mr-0.5">Rs</span>
                            {test.price}
                          </p>
                        </div>

                        {/* Booking Trigger */}
                        <button
                          type="button"
                          onClick={() => handleBookTestClick(test)}
                          className="btn btn-primary rounded-2xl py-3 px-5 text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 border-0 shadow-md shadow-primary/10"
                        >
                          Book Test
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* BOOKING CHECKOUT DIALOG MODAL */}
      {bookingModalOpen && selectedTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <form 
            onSubmit={handleBookingSubmit}
            className="w-full max-w-lg bg-bg-base border border-border-color rounded-3xl p-8 flex flex-col gap-5 shadow-2xl relative"
          >
            {/* Modal Header */}
            <div>
              <h3 className="text-lg font-bold text-text-main font-headings">Diagnostic Checkout</h3>
              <p className="text-xs text-text-sub font-body mt-1">Verify patient details and confirm diagnostic booking</p>
            </div>

            {/* Selection Test Summary box */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex justify-between items-center text-xs font-body">
              <div>
                <p className="font-bold text-text-main text-sm font-headings">{selectedTest.name}</p>
                <p className="text-text-mute mt-0.5">Sample Fluid: {selectedTest.sampleType} | TAT: {selectedTest.reportTime}</p>
              </div>
              <div>
                <p className="text-right text-base font-extrabold text-text-main font-headings flex items-center">
                  <span className="text-xs text-primary font-bold mr-0.5">Rs</span>
                  {selectedTest.price}
                </p>
              </div>
            </div>

            {/* Preparation Alert Box */}
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 flex gap-3 text-xs font-body items-start">
              <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-600 dark:text-yellow-500">Preparation Instructions</p>
                <p className="text-text-sub leading-relaxed mt-1">{selectedTest.preparationInstructions}</p>
              </div>
            </div>

            {/* Input 1: Patient Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Patient Name *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="pl-icon-left focus:border-primary w-full"
                />
              </div>
            </div>

            {/* Input 2: Patient Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Contact Phone *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                  <Phone className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Enter patient phone number..."
                  className="pl-icon-left focus:border-primary w-full"
                />
              </div>
            </div>

            {/* Input 3: Scheduling Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Sample Collection Date *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                  <Calendar className="w-5 h-5" />
                </span>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="pl-icon-left focus:border-primary w-full"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="btn btn-secondary grow py-3.5 rounded-2xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingSubmitting}
                className="btn btn-primary grow py-3.5 rounded-2xl text-xs font-semibold border-0"
              >
                {bookingSubmitting ? 'Processing...' : 'Confirm Lab Booking'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* BOOKING SUCCESS RECEIPT MODAL */}
      {bookingSuccess && selectedTest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-bg-base border border-border-color rounded-3xl p-8 flex flex-col items-center text-center gap-5 shadow-2xl animate-scale-in">
            <div className="w-14 h-14 bg-success/10 flex items-center justify-center rounded-full">
              <CheckCircle className="w-9 h-9 text-success" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-text-main font-headings">Diagnostics Scheduled!</h3>
              <p className="text-xs text-text-sub font-body leading-relaxed mt-2 max-w-sm">
                Your diagnostic booking for <strong className="text-text-main">{selectedTest.name}</strong> has been successfully registered.
              </p>
            </div>

            {/* Receipt Summary details */}
            <div className="w-full bg-bg-secondary/40 border border-border-color rounded-2xl p-5 flex flex-col gap-2 text-xs text-left font-body">
              <p className="text-text-mute uppercase tracking-wider font-bold border-b border-border-color pb-1.5">Checkup Details</p>
              <p className="text-text-sub">Patient: <strong className="text-text-main">{patientName}</strong></p>
              <p className="text-text-sub">Contact: <strong className="text-text-main">{patientPhone}</strong></p>
              <p className="text-text-sub">Scheduled Date: <strong className="text-text-main">{bookingDate}</strong></p>
              <p className="text-text-sub">Preparation: <strong className="text-yellow-600 dark:text-yellow-400">{selectedTest.fastingRequired ? 'Fasting Required' : 'No Fasting'}</strong></p>
              <p className="text-text-sub mt-1 pt-1.5 border-t border-border-color flex justify-between font-bold">
                <span>Total Paid:</span>
                <span className="text-primary text-sm font-headings">Rs {selectedTest.price}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="btn btn-primary w-full py-3.5 rounded-2xl text-xs font-semibold"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Labs;
