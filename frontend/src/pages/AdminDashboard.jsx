import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, HeartPulse, Calendar, Mail, FileText, Clock, 
  CheckCircle, AlertTriangle, Shield, Settings, Info, X 
} from 'lucide-react';

function AdminDashboard() {
  const { user } = useAuth();
  
  // Dashboard states
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Ticket modal reader states
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Fetch admin dashboard details
  const fetchDashboardStats = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (resData.success) {
        setStats(resData.data);
      } else {
        setErrorMsg(resData.message || 'Access denied. Administrators only.');
      }
    } catch (err) {
      console.error('[Admin Dashboard] Fetch error:', err.message);
      setErrorMsg('Failed to connect to the server. Please verify the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Update a support ticket status
  const handleStatusChange = async (ticketId, nextStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const resData = await response.json();

      if (resData.success) {
        // Update local state list dynamically
        setStats((prev) => {
          const updatedTickets = prev.recentTickets.map((t) => 
            t._id === ticketId ? { ...t, status: nextStatus } : t
          );
          return {
            ...prev,
            recentTickets: updatedTickets,
          };
        });

        // Update selected modal ticket if open
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket((prev) => ({ ...prev, status: nextStatus }));
        }
      } else {
        alert(resData.message || 'Failed to update ticket status.');
      }
    } catch (err) {
      console.error('[Admin Dashboard] Patch status error:', err.message);
      alert('Failed to connect to the server.');
    }
  };

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setTicketModalOpen(true);
  };

  const handleCloseTicket = () => {
    setTicketModalOpen(false);
    setSelectedTicket(null);
  };

  // Helper to color-code ticket status badges
  const getTicketStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-success bg-success/5 border border-success/10 px-2 py-0.5 rounded-md">
            Resolved
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-yellow-500 bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded-md">
            In Progress
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-md">
            Read
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-danger bg-danger/5 border border-danger/10 px-2 py-0.5 rounded-md">
            Unread
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base/30">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-text-sub font-body">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-base/30 py-20 px-6">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 text-center flex flex-col items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center text-danger">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-main font-headings">Administration Security Alert</h2>
          <p className="text-xs text-text-sub font-body leading-relaxed">{errorMsg}</p>
          <a href="/home" className="btn btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-300 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Banner Header */}
        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 items-start text-center sm:text-left">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main font-headings">
                Admin <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-sm text-text-sub font-body mt-1 leading-relaxed">
                Aggregated system health analytics, database records trackers, and customer support ticket filters.
              </p>
            </div>
          </div>
          <div className="bg-bg-base/60 border border-border-color rounded-2xl px-5 py-3 text-xs text-text-sub flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Signed in as: <strong className="text-text-main font-semibold">{user?.name}</strong>
          </div>
        </div>

        {/* Dashboard Grid Analytics Counters */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Stat 1: Registered Patients */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-2 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalPatients}</p>
              <p className="text-[10px] text-text-mute font-body font-semibold uppercase tracking-wider">Registered Patients</p>
            </div>

            {/* Stat 2: Active Doctors */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-2 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalDoctors}</p>
              <p className="text-[10px] text-text-mute font-body font-semibold uppercase tracking-wider">Active Doctors</p>
            </div>

            {/* Stat 3: Appts booked */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-2 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalAppointments}</p>
              <p className="text-[10px] text-text-mute font-body font-semibold uppercase tracking-wider">Total Appointments</p>
            </div>

            {/* Stat 4: Support tickets */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-2 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalTickets}</p>
              <p className="text-[10px] text-text-mute font-body font-semibold uppercase tracking-wider">Support Tickets</p>
            </div>

          </div>
        )}

        {/* Dashboard Lists Tables Segment */}
        {stats && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Box: Support Tickets Table (7 Cols) */}
            <div className="xl:col-span-7 flex flex-col gap-5 glass-panel rounded-3xl p-6">
              <div>
                <h3 className="text-base font-bold text-text-main font-headings">Recent Support Tickets</h3>
                <p className="text-xs text-text-sub font-body mt-0.5">Manage user inquiries and resolve tickets</p>
              </div>

              {stats.recentTickets.length === 0 ? (
                <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                  <Mail className="w-8 h-8 text-text-mute mx-auto mb-2" />
                  <p className="text-xs text-text-sub font-body">No support tickets registered in database</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs font-body border-collapse min-w-125">
                    <thead>
                      <tr className="border-b border-border-color/60 text-text-mute font-semibold">
                        <th className="py-2.5">Name</th>
                        <th className="py-2.5">Subject</th>
                        <th className="py-2.5 text-center">Status</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentTickets.map((ticket) => (
                        <tr 
                          key={ticket._id}
                          className="border-b border-border-color/30 hover:bg-bg-secondary/20 transition-colors cursor-pointer group"
                          onClick={() => handleOpenTicket(ticket)}
                        >
                          <td className="py-3 font-semibold text-text-main truncate max-w-30">
                            {ticket.name}
                          </td>
                          <td className="py-3 text-text-sub truncate max-w-45 group-hover:text-primary transition-colors">
                            {ticket.subject}
                          </td>
                          <td className="py-3 text-center">
                            {getTicketStatusBadge(ticket.status)}
                          </td>
                          <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                              className="text-[10px] py-1 px-2.5 rounded-lg border border-border-color bg-bg-base text-text-main font-semibold max-w-27.5"
                            >
                              <option value="unread">Unread</option>
                              <option value="read">Read</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Box: Recent Appointments Log (5 Cols) */}
            <div className="xl:col-span-5 flex flex-col gap-5 glass-panel rounded-3xl p-6">
              <div>
                <h3 className="text-base font-bold text-text-main font-headings">Recent Appointments</h3>
                <p className="text-xs text-text-sub font-body mt-0.5">Real-time portal booking tracking</p>
              </div>

              {stats.recentAppointments.length === 0 ? (
                <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                  <Calendar className="w-8 h-8 text-text-mute mx-auto mb-2" />
                  <p className="text-xs text-text-sub font-body">No doctor bookings registered in database</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {stats.recentAppointments.map((appt) => (
                    <div 
                      key={appt._id}
                      className="bg-bg-secondary/35 border border-border-color rounded-2xl p-4 flex flex-col gap-1.5 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center text-xs font-headings">
                        <strong className="text-text-main">{appt.patient?.name || 'Anonymous User'}</strong>
                        <span className="text-[10px] font-extrabold uppercase text-primary">Rs {appt.consultingFeePaid}</span>
                      </div>
                      <div className="flex justify-between items-start text-[10px] text-text-sub font-body">
                        <span>Doctor: Dr. {appt.doctor?.name || 'Dr. Specialist'} ({appt.doctor?.specialization})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-text-mute font-body pt-1.5 border-t border-border-color/30 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Date: {new Date(appt.date).toLocaleDateString()} | Time: {appt.timeSlot}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* SUPPORT TICKET VIEW MODAL OVERLAY */}
      {ticketModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-lg bg-bg-base border border-border-color rounded-3xl shadow-2xl relative max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
            
            {/* Close trigger button */}
            <button
              type="button"
              onClick={handleCloseTicket}
              className="absolute top-5 right-5 text-text-sub hover:text-text-main bg-bg-secondary/85 border border-border-color p-2 rounded-full transition-colors z-20 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable details wrapper */}
            <div className="w-full h-full overflow-y-auto p-8 pr-6 custom-scrollbar flex flex-col gap-5">
              
              <div>
                <span className="self-start inline-block px-2.5 py-0.5 bg-bg-secondary border border-border-color text-text-sub text-[8px] font-bold uppercase rounded-md tracking-wider">
                  Support Ticket
                </span>
                <h2 className="text-lg font-bold text-text-main font-headings mt-2">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-text-mute font-body">Status:</span>
                  {getTicketStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Sender Details Box */}
              <div className="bg-bg-secondary/40 border border-border-color rounded-2xl p-4 flex flex-col gap-1.5 text-xs font-body text-left">
                <p className="text-text-sub"><span className="text-text-mute">Sender:</span> <strong className="text-text-main">{selectedTicket.name}</strong></p>
                <p className="text-text-sub"><span className="text-text-mute">Email:</span> <a href={`mailto:${selectedTicket.email}`} className="text-primary hover:underline">{selectedTicket.email}</a></p>
                {selectedTicket.phone && (
                  <p className="text-text-sub"><span className="text-text-mute">Phone:</span> <a href={`tel:${selectedTicket.phone}`} className="text-primary hover:underline">{selectedTicket.phone}</a></p>
                )}
                <p className="text-text-sub mt-1 pt-1.5 border-t border-border-color/40 flex justify-between text-[9px]">
                  <span>Registered:</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </p>
              </div>

              {/* Message Details */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-text-mute uppercase tracking-wider font-body">Message</p>
                <p className="text-xs text-text-sub font-body leading-relaxed bg-bg-secondary/20 border border-border-color/30 rounded-2xl p-4 text-left whitespace-pre-line min-h-25">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Modal Ticket Actions */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-border-color">
                <span className="text-[10px] text-text-sub font-bold font-body">Change ticket status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl border border-border-color bg-bg-base text-text-main font-semibold w-40"
                >
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
