import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { FlaskConical, AlertCircle, Calendar, Clock, User, Phone, Droplet, Info } from 'lucide-react';

// Color-coded pill for each lab booking status
const STATUS_STYLES = {
  pending: { label: 'Pending', className: 'text-danger bg-danger/5 border-danger/10' },
  confirmed: { label: 'Confirmed', className: 'text-success bg-success/5 border-success/10' },
  'sample-collected': { label: 'Sample Collected', className: 'text-blue-500 bg-blue-500/5 border-blue-500/10' },
  completed: { label: 'Completed', className: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
  cancelled: { label: 'Cancelled', className: 'text-text-mute bg-text-mute/5 border-text-mute/10' },
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'sample-collected'];

// YYYY-MM-DD in the user's own timezone, comparable with the collection day below
const todayKey = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// The server stores the collection day as midnight UTC, so its first 10 characters are that day
const collectionDayKey = (booking) => String(booking.collectionDate).slice(0, 10);

// Read the collection day back in UTC so it shows the same day that was picked
const formatCollectionDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

const formatBookedDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Fetch the signed-in user's lab bookings, resolving to { data } on success or { error } on failure
const requestLabBookings = async (token) => {
  try {
    const { data: resData } = await apiRequest('/api/lab-bookings/my', { token });

    if (resData.success) {
      return { data: resData.data };
    }
    return { error: resData.message || 'Failed to fetch your lab test bookings.' };
  } catch (err) {
    console.error('[MyLabTests Page] Fetch error:', err.message);
    return { error: 'Failed to connect to the server. Please verify backend is running.' };
  }
};

function StatusBadge({ status }) {
  const { label, className } = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider border px-2 py-0.5 rounded-md ${className}`}>
      {label}
    </span>
  );
}

function MyLabTests() {
  // The route guard only renders this page for a signed-in user
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  // Re-fetch bookings list (retry button)
  const fetchBookings = () => {
    setLoading(true);
    setError('');

    requestLabBookings(token).then(({ data, error: requestError }) => {
      if (data) setBookings(data);
      else setError(requestError);
      setLoading(false);
    });
  };

  // Initial load (state is only updated once the request settles)
  useEffect(() => {
    requestLabBookings(token).then(({ data, error: requestError }) => {
      if (data) setBookings(data);
      else setError(requestError);
      setLoading(false);
    });
  }, [token]);

  // Upcoming: still active and the collection day hasn't passed. Everything else is history.
  const today = todayKey();
  const isUpcoming = (booking) => ACTIVE_STATUSES.includes(booking.status) && collectionDayKey(booking) >= today;
  const upcomingBookings = bookings
    .filter(isUpcoming)
    .sort((a, b) => collectionDayKey(a).localeCompare(collectionDayKey(b))); // Soonest collection first
  const pastBookings = bookings.filter((booking) => !isUpcoming(booking));
  const visibleBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-250 mx-auto flex flex-col gap-8 relative z-10">

        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-main font-headings">
              My <span className="text-primary">Lab Tests</span>
            </h1>
            <p className="text-sm text-text-sub font-body mt-1">Review your scheduled sample collections and past diagnostic bookings</p>
          </div>
          <Link to="/labs" className="btn btn-primary px-6 py-3.5 rounded-2xl text-sm font-semibold sm:self-center">
            Book a Lab Test
          </Link>
        </div>

        {/* Tab Controls Navigation */}
        <div className="flex border-b border-border-color">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-3 text-sm font-bold font-body transition-colors border-0 border-b-2 relative ${
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub hover:text-text-main'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-5 py-3 text-sm font-bold font-body transition-colors border-0 border-b-2 relative ${
              activeTab === 'past'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub hover:text-text-main'
            }`}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        {/* List Content Area */}
        {loading ? (
          /* SKELETAL LIST LOADERS */
          <div className="flex flex-col gap-4">
            {[1, 2].map((idx) => (
              <div key={idx} className="glass-panel rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between gap-4">
                  <div className="h-4 bg-border-color rounded w-1/3"></div>
                  <div className="h-4 bg-border-color rounded w-20"></div>
                </div>
                <div className="h-3 bg-border-color rounded w-1/4"></div>
                <div className="h-3 bg-border-color rounded w-2/3 mt-2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* ERROR CALLOUT */
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-danger" />
            </div>
            <h3 className="text-lg font-bold text-text-main font-headings">Fetch Failed</h3>
            <p className="text-sm text-text-sub font-body leading-relaxed max-w-sm">{error}</p>
            <button type="button" onClick={fetchBookings} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs mt-2">
              Try Again
            </button>
          </div>
        ) : visibleBookings.length === 0 ? (
          /* EMPTY TAB STATE */
          <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-main font-headings">
              {activeTab === 'upcoming' ? 'No Upcoming Lab Tests' : 'No Past Lab Tests'}
            </h3>
            <p className="text-sm text-text-sub font-body leading-relaxed max-w-sm">
              {activeTab === 'upcoming'
                ? 'You have no sample collections scheduled. Browse the diagnostic catalog to book a test.'
                : 'Completed, cancelled and earlier bookings will appear here.'}
            </p>
            <Link to="/labs" className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold mt-2">
              Browse Lab Tests
            </Link>
          </div>
        ) : (
          /* BOOKING CARD LIST */
          <div className="flex flex-col gap-4">
            {visibleBookings.map((booking, idx) => {
              // The test may have been removed from the catalog since; the booking keeps its own name and price
              const test = booking.labTest;

              return (
                <div
                  key={booking._id}
                  style={{ animationDelay: `${(idx % 6) * 75}ms` }}
                  className="glass-panel rounded-3xl p-6 flex flex-col gap-5 hover:border-primary/40 hover:shadow-md transition-all duration-300 animate-slide-up"
                >
                  {/* Summary row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FlaskConical className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <h3 className="font-bold text-base text-text-main font-headings">{booking.testName}</h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        {test?.category && (
                          <p className="text-[10px] font-bold text-text-mute uppercase tracking-wider font-body mt-1">{test.category}</p>
                        )}
                        <p className="text-sm text-text-main font-body mt-2 flex items-center gap-1.5 font-semibold">
                          <Calendar className="w-4 h-4 text-primary" />
                          Collection: {formatCollectionDate(booking.collectionDate)}
                        </p>
                        <p className="text-xs text-text-sub font-body mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-text-mute" />
                          Booked on {formatBookedDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-color">
                      <p className="text-[9px] text-text-mute font-body tracking-wider uppercase font-semibold">Test Fee</p>
                      <p className="text-lg font-extrabold text-primary font-headings">Rs {booking.price}</p>
                    </div>
                  </div>

                  {/* Patient and test details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-border-color text-xs font-body">
                    <p className="text-text-sub flex items-center gap-2 min-w-0">
                      <User className="w-3.5 h-3.5 text-text-mute shrink-0" />
                      <span className="text-text-main truncate">{booking.patientName}</span>
                    </p>
                    <p className="text-text-sub flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-text-mute shrink-0" />
                      <span className="text-text-main">{booking.contactPhone}</span>
                    </p>
                    {test && (
                      <>
                        <p className="text-text-sub flex items-center gap-2">
                          <Droplet className="w-3.5 h-3.5 text-text-mute shrink-0" />
                          <span>{test.sampleType} sample · {test.reportTime}</span>
                        </p>
                        <p className="text-text-sub flex items-center gap-2">
                          <Info className={`w-3.5 h-3.5 shrink-0 ${test.fastingRequired ? 'text-yellow-500' : 'text-text-mute'}`} />
                          <span className={test.fastingRequired ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : ''}>
                            {test.fastingRequired ? '12 hours fasting required' : 'No fasting required'}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyLabTests;
