import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Calendar, Clock, Star, DollarSign, Award, ArrowLeft, CheckCircle, FileText } from 'lucide-react';

function BookDoctor() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Doctor detail states
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking wizard states
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch specific doctor profile on load
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:5000/api/doctors/${id}`);
        const resData = await response.json();

        if (resData.success) {
          setDoctor(resData.data);
        } else {
          setError(resData.message || 'Doctor profile not found.');
        }
      } catch (err) {
        console.error('[BookDoctor Page] Fetch error:', err.message);
        setError('Connection to server failed. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  // Form submit handler
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login if user is not signed in
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      alert('Please select an appointment time slot.');
      return;
    }

    setSubmitting(true);
    try {
      // For this phase, we perform a mock successful booking
      // We will replace this with a POST to /api/appointments in Phase 9
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
    } catch (err) {
      alert('Booking request failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    /* SKELETAL PROFILE LOADER */
    return (
      <div className="min-h-screen bg-bg-base/30 py-16 px-6 flex justify-center items-center">
        <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="w-32 h-32 bg-border-color rounded-2xl mx-auto"></div>
            <div className="h-6 bg-border-color rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-border-color rounded w-1/2 mx-auto"></div>
          </div>
          <div className="w-full md:w-2/3 flex flex-col gap-4">
            <div className="h-4 bg-border-color rounded w-full"></div>
            <div className="h-4 bg-border-color rounded w-5/6"></div>
            <div className="h-4 bg-border-color rounded w-4/5"></div>
            <div className="h-12 bg-border-color rounded-2xl w-full mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-bg-base/30 py-16 px-6 flex justify-center items-center">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-danger" />
          </div>
          <h3 className="text-lg font-bold text-text-main font-headings">Profile Loading Failed</h3>
          <p className="text-sm text-text-sub font-body leading-relaxed">{error || 'Doctor not found.'}</p>
          <Link to="/doctors" className="btn btn-primary py-2.5 px-6 rounded-xl text-xs mt-2">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-250 mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Back navigation */}
        <Link 
          to="/doctors" 
          className="flex items-center gap-2 text-xs text-text-sub hover:text-text-main font-semibold tracking-wide uppercase transition-colors duration-300 font-body self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        {/* WIZARD CONTAINER */}
        {!success ? (
          <div className="w-full flex flex-col md:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Doctor Full Profile */}
            <div className="w-full md:w-1/3 flex flex-col gap-6 shrink-0">
              <div className="w-full glass-panel rounded-3xl p-6 flex flex-col items-center text-center gap-4">
                
                {/* Doctor Avatar */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
                  {doctor.imageUrl ? (
                    <img 
                      src={doctor.imageUrl} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-primary font-headings">
                      {doctor.name.split(' ').slice(1).map(n => n.charAt(0)).join('') || 'DR'}
                    </span>
                  )}
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/5 px-3 py-1 rounded-full border border-yellow-500/10">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold text-text-main">{doctor.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-text-mute">({doctor.reviewsCount} Reviews)</span>
                </div>

                {/* Profile detail text */}
                <div>
                  <h2 className="text-xl font-bold text-text-main font-headings">{doctor.name}</h2>
                  <p className="text-xs text-text-sub font-semibold font-body mt-0.5">{doctor.specialization}</p>
                  <span className="inline-block mt-2 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg font-body tracking-wider">
                    {doctor.department}
                  </span>
                </div>

                {/* Meta details list */}
                <div className="w-full flex flex-col gap-3.5 pt-4 border-t border-border-color text-left">
                  <div className="flex items-center gap-3 text-xs text-text-sub font-body">
                    <Award className="w-5 h-5 text-primary shrink-0" />
                    <span>{doctor.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-sub font-body">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <span className="text-sm font-extrabold text-primary">Rs</span>
                    </div>
                    <span>Consultation Fee: <strong className="text-text-main">Rs {doctor.consultationFee}</strong></span>
                  </div>
                </div>
              </div>

              {/* Biography Section */}
              <div className="w-full glass-panel rounded-3xl p-6 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-text-main tracking-wider uppercase font-headings border-b border-border-color pb-1.5">
                  About Physician
                </h3>
                <p className="text-xs text-text-sub font-body leading-relaxed">
                  {doctor.about}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Booking Form & Slots (Glassmorphic Card) */}
            <form onSubmit={handleBookingSubmit} className="grow w-full glass-panel rounded-3xl p-8 flex flex-col gap-6">
              
              {/* Header Title */}
              <div>
                <h3 className="text-lg font-bold text-text-main font-headings">Schedule Appointment</h3>
                <p className="text-xs text-text-sub font-body mt-1">Select an available slot and enter symptoms details</p>
              </div>

              {/* Section 1: Availability time slots */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">
                  Available Slots *
                </label>
                
                {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctor.availableSlots.map((slot) => {
                      const isSelected = selectedSlot && selectedSlot._id === slot._id;
                      
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-body transition-all duration-300 ${
                            slot.isBooked
                              ? 'opacity-40 bg-bg-secondary border-border-color cursor-not-allowed text-text-mute'
                              : isSelected
                                ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                                : 'bg-transparent border-border-color hover:border-primary text-text-sub hover:text-primary'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                            <span className="font-semibold">{slot.day}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-secondary'}`} />
                            <span className="font-bold">{slot.time}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-border-color rounded-2xl bg-bg-secondary/30">
                    <p className="text-xs text-text-mute font-body">No time slots are currently registered for this doctor.</p>
                  </div>
                )}
              </div>

              {/* Section 2: Symptoms input text area */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">
                  Describe Symptoms / Notes (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-text-mute">
                    <FileText className="w-5 h-5" />
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Describe any symptoms, medical history, or details about the booking request..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="pl-icon-left focus:border-primary pt-3"
                  />
                </div>
              </div>

              {/* Section 3: Summary display callout */}
              {selectedSlot && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col gap-2 text-xs font-body">
                  <p className="text-text-mute uppercase tracking-wider font-bold">Booking Summary</p>
                  <p className="text-text-sub">
                    Consultation with <strong className="text-text-main">{doctor.name}</strong> on{' '}
                    <strong className="text-text-main">{selectedSlot.day}</strong> at{' '}
                    <strong className="text-text-main">{selectedSlot.time}</strong>.
                  </p>
                  <p className="text-text-sub">
                    Total Consultation Fee: <strong className="text-primary font-bold text-sm">Rs {doctor.consultationFee}</strong>
                  </p>
                </div>
              )}

              {/* Submit CTA button */}
              <button
                type="submit"
                disabled={submitting || (doctor.availableSlots && doctor.availableSlots.length === 0)}
                className="btn btn-primary w-full py-4 rounded-2xl text-base font-semibold mt-2"
              >
                {submitting ? 'Processing Booking...' : user ? 'Confirm Appointment' : 'Sign In to Book Appointment'}
              </button>

            </form>
          </div>
        ) : (
          /* SUCCESS VIEW: Renders after mock booking completes */
          <div className="w-full max-w-xl mx-auto glass-panel rounded-3xl p-12 flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="w-16 h-16 bg-success/10 flex items-center justify-center rounded-full">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-text-main font-headings">Appointment Scheduled!</h3>
              <p className="text-sm text-text-sub font-body mt-2 leading-relaxed max-w-md">
                Your consultation request with <strong className="text-text-main">{doctor.name}</strong> on{' '}
                <strong className="text-primary">{selectedSlot.day} at {selectedSlot.time}</strong> has been successfully booked.
              </p>
            </div>

            <div className="w-full bg-bg-secondary/40 border border-border-color rounded-2xl p-5 flex flex-col gap-2.5 text-xs text-left font-body">
              <p className="text-text-mute uppercase tracking-wider font-bold border-b border-border-color pb-1.5">Booking Details</p>
              <p className="text-text-sub">Patient name: <strong className="text-text-main">{user?.name}</strong></p>
              <p className="text-text-sub">Consultant: <strong className="text-text-main">{doctor.name}</strong></p>
              <p className="text-text-sub">Specialty: <strong className="text-text-main">{doctor.specialization}</strong></p>
              <p className="text-text-sub">Price paid: <strong className="text-text-main">Rs {doctor.consultationFee}</strong></p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              <Link 
                to="/home" 
                className="btn btn-secondary grow py-3.5 rounded-2xl text-sm font-semibold"
              >
                Go to Dashboard
              </Link>
              <Link 
                to="/doctors" 
                className="btn btn-primary grow py-3.5 rounded-2xl text-sm font-semibold"
              >
                Book Another Doctor
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default BookDoctor;
