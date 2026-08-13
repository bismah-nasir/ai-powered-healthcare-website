import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, DollarSign, HeartPulse, User, FileText, AlertCircle, XCircle, CheckCircle } from 'lucide-react';

function MyAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Appointments states
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI States
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch appointments list
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('You must be logged in to view appointments.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/appointments/my', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (resData.success) {
        setAppointments(resData.data);
      } else {
        setError(resData.message || 'Failed to fetch appointments list.');
      }
    } catch (err) {
      console.error('[MyAppointments Page] Fetch error:', err.message);
      setError('Failed to connect to the server. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Cancel booking handler
  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (!selectedAppointment) return;
    
    setCancellingId(selectedAppointment._id);
    setCancelModalOpen(false);
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${selectedAppointment._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (resData.success) {
        // Refresh local listings to update state status
        fetchAppointments();
      } else {
        alert(resData.message || 'Failed to cancel appointment.');
      }
    } catch (err) {
      console.error('[MyAppointments Page] Cancel error:', err.message);
      alert('Connection to server failed. Please try again.');
    } finally {
      setCancellingId(null);
      setSelectedAppointment(null);
    }
  };

  // Filter list into tabs
  const upcomingAppointments = appointments.filter(
    (app) => app.status === 'confirmed' || app.status === 'pending'
  );
  
  const historyAppointments = appointments.filter(
    (app) => app.status === 'completed' || app.status === 'cancelled'
  );

  const activeAppointmentsList = activeTab === 'upcoming' ? upcomingAppointments : historyAppointments;

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/5 border border-success/10 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-danger bg-danger/5 border border-danger/10 px-2.5 py-1 rounded-full">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-mute bg-text-mute/5 border border-text-mute/10 px-2.5 py-1 rounded-full">
            Completed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/5 border border-secondary/10 px-2.5 py-1 rounded-full">
            Pending
          </span>
        );
    }
  };

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
              My <span className="text-primary">Appointments</span>
            </h1>
            <p className="text-sm text-text-sub font-body mt-1">Review schedules, view history, and manage consultations</p>
          </div>
          <Link to="/doctors" className="btn btn-primary px-6 py-3.5 rounded-2xl text-sm font-semibold sm:self-center">
            Book New Consultation
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
            Upcoming Visits ({upcomingAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3 text-sm font-bold font-body transition-colors border-0 border-b-2 relative ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub hover:text-text-main'
            }`}
          >
            Medical History ({historyAppointments.length})
          </button>
        </div>

        {/* List Content Area */}
        {loading ? (
          /* SKELETAL LIST LOADERS */
          <div className="flex flex-col gap-4">
            {[1, 2].map((idx) => (
              <div key={idx} className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row gap-5 animate-pulse">
                <div className="w-14 h-14 bg-border-color rounded-2xl shrink-0 mx-auto sm:mx-0"></div>
                <div className="grow flex flex-col gap-2">
                  <div className="h-4 bg-border-color rounded w-1/3"></div>
                  <div className="h-3 bg-border-color rounded w-1/4"></div>
                  <div className="h-3 bg-border-color rounded w-2/3 mt-2"></div>
                </div>
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
            <button type="button" onClick={fetchAppointments} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs mt-2">
              Try Again
            </button>
          </div>
        ) : activeAppointmentsList.length === 0 ? (
          /* EMPTY TAB STATE */
          <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-main font-headings">No Appointments Scheduled</h3>
            <p className="text-sm text-text-sub font-body leading-relaxed max-w-sm">
              You do not have any {activeTab} consultations. Book a session with our healthcare specialists today.
            </p>
            <Link to="/doctors" className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold mt-2">
              Browse Doctors Directory
            </Link>
          </div>
        ) : (
          /* CARD DECK LIST */
          <div className="flex flex-col gap-4">
            {activeAppointmentsList.map((app, idx) => {
              const docInfo = app.doctor || {};
              const isUpcoming = app.status === 'confirmed' || app.status === 'pending';

              return (
                <div
                  key={app._id}
                  style={{ animationDelay: `${(idx % 6) * 75}ms` }}
                  className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:border-primary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                >
                  {/* Left profile detail segment */}
                  <div className="flex items-start gap-4 w-full sm:w-auto">
                    {/* Doctor Avatar */}
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                      {docInfo.imageUrl ? (
                        <img 
                          src={docInfo.imageUrl} 
                          alt={docInfo.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-lg font-bold text-primary font-headings">
                          {docInfo.name ? docInfo.name.split(' ').slice(1).map(n => n.charAt(0)).join('') : 'DR'}
                        </span>
                      )}
                    </div>

                    <div className="grow min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base text-text-main font-headings truncate">
                          {docInfo.name || 'Unknown Doctor'}
                        </h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-text-sub font-semibold font-body truncate mt-0.5">
                        {docInfo.specialization || 'Consultant'}
                      </p>
                      
                      {/* Schedule detail markers */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-text-sub font-body">
                        <span className="flex items-center gap-1.5 font-semibold text-text-main">
                          <Calendar className="w-4 h-4 text-primary" /> {app.day}
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-text-main">
                          <Clock className="w-4 h-4 text-secondary" /> {app.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-[10px] text-primary font-bold">Rs</span> {app.consultationFee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right segment: Symptoms popup & Cancellation Actions */}
                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-color">
                    
                    {/* Render symptoms notes if present */}
                    {app.symptoms && (
                      <div className="flex items-start gap-1.5 max-w-xs text-left bg-bg-secondary/40 p-2.5 rounded-xl border border-border-color">
                        <FileText className="w-4 h-4 text-text-mute shrink-0 mt-0.5" />
                        <p className="text-[10px] text-text-sub font-body leading-tight line-clamp-2">
                          Symptoms: {app.symptoms}
                        </p>
                      </div>
                    )}

                    {/* Cancel action trigger */}
                    {isUpcoming && (
                      <button
                        type="button"
                        disabled={cancellingId === app._id}
                        onClick={() => handleCancelClick(app)}
                        className="btn btn-secondary w-full sm:w-auto px-4 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 hover:border-danger font-semibold transition-all disabled:grayscale disabled:cursor-not-allowed disabled:pointer-events-none"
                      >
                        {cancellingId === app._id ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* CANCELLATION DIALOG MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 text-center flex flex-col items-center gap-5 shadow-2xl">
            <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-text-main font-headings">Cancel Appointment?</h3>
              <p className="text-xs text-text-sub font-body leading-relaxed mt-2">
                Are you sure you want to cancel your consultation with{' '}
                <strong className="text-text-main">{selectedAppointment?.doctor?.name}</strong> on{' '}
                <strong className="text-text-main">{selectedAppointment?.day}</strong> at{' '}
                <strong className="text-text-main">{selectedAppointment?.time}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="btn btn-secondary grow py-3 rounded-2xl text-xs font-semibold"
              >
                No, Keep Booking
              </button>
              <button
                type="button"
                onClick={confirmCancellation}
                className="btn btn-primary bg-danger hover:bg-danger-hover text-white grow py-3 rounded-2xl text-xs font-semibold border-0"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyAppointments;
