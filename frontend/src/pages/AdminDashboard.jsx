import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';
import { apiRequest } from '../services/api';
import OrderStatusBadge from '../components/common/OrderStatusBadge';
import { formatAppointmentDate, formatSlotDate, isAppointmentDue } from '../utils/appointmentDate';
import {
  Users, HeartPulse, Calendar, Mail, Clock,
  Shield, Settings, X, CheckCircle,
  ShoppingBag, CreditCard, MapPin,
  Search, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

// Rows shown per page in the full appointment, ticket and order lists
const PAGE_SIZE = 10;

const APPOINTMENT_STATUSES = [
  { value: 'confirmed', label: 'Confirmed', className: 'text-blue-500 bg-blue-500/5 border-blue-500/10' },
  { value: 'completed', label: 'Completed', className: 'text-success bg-success/5 border-success/10' },
  { value: 'cancelled', label: 'Cancelled', className: 'text-text-mute bg-text-mute/5 border-text-mute/10' },
];

// Confirmed appointments are the open ones that can be marked completed
const isOpenAppointment = (appt) => appt.status === 'confirmed';

const TICKET_STATUSES = [
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Doctor names are usually stored with the "Dr." title already; only add it when missing
const formatDoctorName = (name) => {
  if (!name) return 'Specialist';
  return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
};

// Fetch a full admin list, resolving to { data } on success or { error } on failure
const requestList = async (path, token, failMessage) => {
  try {
    const { data: resData } = await apiRequest(path, { token });

    if (resData.success) {
      return { data: resData.data };
    }
    return { error: resData.message || failMessage };
  } catch (err) {
    console.error(`[Admin Dashboard] Fetch ${path} error:`, err.message);
    return { error: 'Failed to connect to the server. Please verify the backend.' };
  }
};

const requestAppointments = (token) => requestList('/api/appointments', token, 'Failed to load doctor bookings.');
const requestTickets = (token) => requestList('/api/contact', token, 'Failed to load support tickets.');
const requestOrders = (token) => requestList('/api/orders', token, 'Failed to load pharmacy orders.');

// Case-insensitive match of the search text against any of the given fields
const matchesSearch = (query, fields) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field && String(field).toLowerCase().includes(needle));
};

// Filter by status and search text, then cut out the requested page
const filterAndPage = (items, { status, query, page }, getSearchFields) => {
  const filtered = items.filter(
    (item) => (status === 'all' || item.status === status) && matchesSearch(query, getSearchFields(item))
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // A status change can shrink the filtered list, so keep the page within range
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    total: filtered.length,
    pageCount,
    currentPage,
    start,
    rows: filtered.slice(start, start + PAGE_SIZE),
  };
};

// Color-coded pill for an appointment status
function AppointmentStatusBadge({ status }) {
  const { label, className } = APPOINTMENT_STATUSES.find((s) => s.value === status) || APPOINTMENT_STATUSES[0];

  return (
    <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider border px-2 py-0.5 rounded-md whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
}

// Search box and status filter above a full list
function ListToolbar({ query, onQueryChange, searchLabel, placeholder, status, onStatusChange, statuses, items }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative grow flex items-center">
        <span className="absolute left-4 text-text-mute pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="search"
          aria-label={searchLabel}
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-icon-left py-2.5! text-xs!"
        />
      </div>
      <div className="sm:w-52 shrink-0">
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="py-2.5! text-xs! font-semibold"
        >
          <option value="all">All statuses ({items.length})</option>
          {statuses.map(({ value, label }) => (
            <option key={value} value={value}>
              {label} ({items.filter((item) => item.status === value).length})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// "Showing X-Y of Z" with previous/next page buttons
function ListPagination({ start, rowCount, total, currentPage, pageCount, onPageChange, noun }) {
  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-body text-text-sub">
      <p aria-live="polite">
        Showing <strong className="text-text-main">{start + 1}-{start + rowCount}</strong> of{' '}
        <strong className="text-text-main">{total}</strong> {noun}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg border border-border-color bg-bg-base text-text-sub hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold">
            Page {currentPage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pageCount}
            aria-label="Next page"
            className="p-2 rounded-lg border border-border-color bg-bg-base text-text-sub hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Loading and error placeholders for a full list that is fetched separately from the stats
function ListStatus({ error, onRetry }) {
  if (error) {
    return (
      <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl flex flex-col items-center gap-3">
        <AlertCircle className="w-8 h-8 text-danger" />
        <p className="text-xs text-text-sub font-body">{error}</p>
        <button type="button" onClick={onRetry} className="btn btn-secondary py-2 px-5 rounded-xl text-xs">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 animate-pulse" aria-label="Loading list">
      {[1, 2, 3, 4].map((idx) => (
        <div key={idx} className="h-10 bg-border-color/60 rounded-xl"></div>
      ))}
    </div>
  );
}

function AdminDashboard() {
  const { user, token } = useAuth();
  const { showNotice } = useNotify();

  // Dashboard states
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Full appointment, ticket and order lists (null while loading)
  const [appointments, setAppointments] = useState(null);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [tickets, setTickets] = useState(null);
  const [ticketsError, setTicketsError] = useState('');
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState('');

  // Search, status filter and page of each full list
  const [appointmentView, setAppointmentView] = useState({ status: 'all', query: '', page: 1 });
  const [ticketView, setTicketView] = useState({ status: 'all', query: '', page: 1 });
  const [orderView, setOrderView] = useState({ status: 'all', query: '', page: 1 });

  // Active list tab: 'appointments', 'tickets', 'orders'
  const [activeTab, setActiveTab] = useState('appointments');

  // Appointment waiting for the admin to confirm completion, and the one being completed
  const [completeTargetId, setCompleteTargetId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const completeTarget = appointments?.find((a) => a._id === completeTargetId) || null;

  // Open detail modals (looked up from the lists, so status changes show up in them too)
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const selectedTicket = tickets?.find((t) => t._id === selectedTicketId) || null;
  const selectedOrder = orders?.find((o) => o._id === selectedOrderId) || null;

  // Fetch admin dashboard details and full lists on mount (loading starts as true, so no reset is needed)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data: resData } = await apiRequest('/api/admin/stats', { token });

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

    fetchDashboardStats();

    requestAppointments(token).then(({ data, error }) => {
      if (data) setAppointments(data);
      else setAppointmentsError(error);
    });

    requestTickets(token).then(({ data, error }) => {
      if (data) setTickets(data);
      else setTicketsError(error);
    });

    requestOrders(token).then(({ data, error }) => {
      if (data) setOrders(data);
      else setOrdersError(error);
    });
  }, [token]);

  // Retry a failed list load
  const reloadAppointments = () => {
    setAppointments(null);
    setAppointmentsError('');
    requestAppointments(token).then(({ data, error }) => {
      if (data) setAppointments(data);
      else setAppointmentsError(error);
    });
  };

  const reloadTickets = () => {
    setTickets(null);
    setTicketsError('');
    requestTickets(token).then(({ data, error }) => {
      if (data) setTickets(data);
      else setTicketsError(error);
    });
  };

  const reloadOrders = () => {
    setOrders(null);
    setOrdersError('');
    requestOrders(token).then(({ data, error }) => {
      if (data) setOrders(data);
      else setOrdersError(error);
    });
  };

  // Changing the search or filter goes back to the first page
  const updateAppointmentView = (changes) => setAppointmentView((prev) => ({ ...prev, page: 1, ...changes }));
  const updateTicketView = (changes) => setTicketView((prev) => ({ ...prev, page: 1, ...changes }));
  const updateOrderView = (changes) => setOrderView((prev) => ({ ...prev, page: 1, ...changes }));

  // Show a failed status update; retrying only helps for server-side (5xx) or connection failures
  const notifyStatusError = (message, onRetry) => {
    showNotice({
      message,
      tone: 'danger',
      actions: onRetry ? [{ label: 'Retry', onClick: onRetry }] : [],
    });
  };

  // Update a support ticket status
  const handleStatusChange = async (ticketId, nextStatus) => {
    const retry = () => handleStatusChange(ticketId, nextStatus);

    try {
      const { status, data: resData } = await apiRequest(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus },
      });

      // Session ended: the route guard sends the admin to the login page
      if (status === 401) return;

      if (resData.success) {
        // Update local state list dynamically
        setTickets((prev) => prev.map((t) => (t._id === ticketId ? { ...t, status: nextStatus } : t)));
      } else {
        notifyStatusError(
          resData.message || 'Failed to update ticket status.',
          status >= 500 ? retry : null
        );
      }
    } catch (err) {
      console.error('[Admin Dashboard] Patch status error:', err.message);
      notifyStatusError('Failed to connect to the server. Ticket status was not updated.', retry);
    }
  };

  // Update a pharmacy order status
  const handleOrderStatusChange = async (orderId, nextStatus) => {
    const retry = () => handleOrderStatusChange(orderId, nextStatus);

    try {
      const { status, data: resData } = await apiRequest(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus },
      });

      // Session ended: the route guard sends the admin to the login page
      if (status === 401) return;

      if (resData.success) {
        // Update local state list dynamically (the response has no populated patient, so only copy the status)
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)));
      } else {
        notifyStatusError(
          resData.message || 'Failed to update order status.',
          status >= 500 ? retry : null
        );

        // Another admin changed this order first: load its current status quietly
        if (status === 409) {
          requestOrders(token).then(({ data }) => {
            if (data) setOrders(data);
          });
        }
      }
    } catch (err) {
      console.error('[Admin Dashboard] Patch order status error:', err.message);
      notifyStatusError('Failed to connect to the server. Order status was not updated.', retry);
    }
  };

  // Mark an appointment completed, which frees its slot for the next week
  const handleCompleteAppointment = async (appointmentId) => {
    const retry = () => handleCompleteAppointment(appointmentId);
    setCompletingId(appointmentId);

    try {
      const { status, data: resData } = await apiRequest(`/api/appointments/${appointmentId}/complete`, {
        method: 'PATCH',
        token,
      });

      // Session ended: the route guard sends the admin to the login page
      if (status === 401) return;

      if (resData.success) {
        // The response has no populated patient or doctor, so only copy the status
        setAppointments((prev) => prev.map((a) => (a._id === appointmentId ? { ...a, status: resData.data.status } : a)));
      } else {
        notifyStatusError(
          resData.message || 'Failed to complete appointment.',
          status >= 500 ? retry : null
        );

        // The appointment changed elsewhere (cancelled by the patient, completed by another admin): load its current status quietly
        if (status === 400 || status === 409) {
          requestAppointments(token).then(({ data }) => {
            if (data) setAppointments(data);
          });
        }
      }
    } catch (err) {
      console.error('[Admin Dashboard] Complete appointment error:', err.message);
      notifyStatusError('Failed to connect to the server. Appointment was not completed.', retry);
    } finally {
      setCompletingId(null);
    }
  };

  // Complete button for an open appointment (disabled until its date arrives), or a dash
  const renderCompleteAction = (appt) => {
    if (!isOpenAppointment(appt)) return <span className="text-text-mute">—</span>;

    const isDue = isAppointmentDue(appt);
    return (
      <button
        type="button"
        onClick={() => setCompleteTargetId(appt._id)}
        disabled={!isDue || completingId === appt._id}
        title={isDue ? undefined : `Can be completed from ${formatSlotDate(appt.date)}`}
        aria-label={`Mark appointment of ${appt.patient?.name || 'patient'} as completed`}
        className="inline-flex items-center gap-1 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-success/30 bg-success/5 text-success hover:bg-success/10 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        {completingId === appt._id ? 'Completing...' : 'Complete'}
      </button>
    );
  };

  const confirmCompleteAppointment = () => {
    const appointmentId = completeTargetId;
    setCompleteTargetId(null);
    handleCompleteAppointment(appointmentId);
  };

  const handleOpenTicket = (ticket) => setSelectedTicketId(ticket._id);
  const handleCloseTicket = () => setSelectedTicketId(null);
  const handleOpenOrder = (order) => setSelectedOrderId(order._id);
  const handleCloseOrder = () => setSelectedOrderId(null);

  // Current page of each full list
  const appointmentList = appointments
    ? filterAndPage(appointments, appointmentView, (a) => [a.patient?.name, a.patient?.email, a.doctor?.name, a.doctor?.specialization])
    : null;
  const ticketList = tickets
    ? filterAndPage(tickets, ticketView, (t) => [t.name, t.email, t.subject])
    : null;
  const orderList = orders
    ? filterAndPage(orders, orderView, (o) => [o._id, o.patient?.name, o.patient?.email, o.contactPhone])
    : null;

  // Helpers to color-code statuses
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
          <Link to="/home" className="btn btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold">
            Return Home
          </Link>
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
          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
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
          <div className="bg-bg-base/60 border border-border-color rounded-2xl px-5 py-3 text-xs text-text-sub flex items-center gap-2 whitespace-nowrap shrink-0">
            <Shield className="w-4 h-4 text-primary" />
            Signed in as: <strong className="text-text-main font-semibold">{user?.name}</strong>
          </div>
        </div>

        {/* Dashboard Grid Analytics Counters */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Stat 1: Registered Patients */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col gap-1 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-9 h-9 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalPatients}</p>
              <p className="text-[9px] text-text-mute font-body font-semibold uppercase tracking-wider">Registered Patients</p>
            </div>

            {/* Stat 2: Active Doctors */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col gap-1 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-9 h-9 bg-success/10 text-success rounded-xl flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalDoctors}</p>
              <p className="text-[9px] text-text-mute font-body font-semibold uppercase tracking-wider">Active Doctors</p>
            </div>

            {/* Stat 3: Appts booked */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col gap-1 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-9 h-9 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalAppointments}</p>
              <p className="text-[9px] text-text-mute font-body font-semibold uppercase tracking-wider">Total Appointments</p>
            </div>

            {/* Stat 4: Support tickets */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col gap-1 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-9 h-9 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalTickets}</p>
              <p className="text-[9px] text-text-mute font-body font-semibold uppercase tracking-wider">Support Tickets</p>
            </div>

            {/* Stat 5: Pharmacy Orders (fills the last row on its own in the 2-column phone grid) */}
            <div className="col-span-2 md:col-span-1 glass-panel rounded-3xl p-5 flex flex-col gap-1 relative hover:border-primary/20 transition-all duration-300">
              <div className="w-9 h-9 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-text-main font-headings mt-2">{stats.counts.totalOrders || 0}</p>
              <p className="text-[9px] text-text-mute font-body font-semibold uppercase tracking-wider">Pharmacy Orders</p>
            </div>

          </div>
        )}

        {/* Dashboard Lists Tables Segment */}
        {stats && (
          <div className="w-full flex flex-col gap-6 glass-panel rounded-3xl p-6">
            
            {/* Tabs selector header */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border-color pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-body transition-all duration-300 border flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/15'
                    : 'bg-bg-base/50 text-text-sub border-border-color hover:text-primary hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Doctor Bookings
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-body transition-all duration-300 border flex items-center gap-1.5 ${
                  activeTab === 'tickets'
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/15'
                    : 'bg-bg-base/50 text-text-sub border-border-color hover:text-primary hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                <Mail className="w-4 h-4" />
                Support Tickets
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-body transition-all duration-300 border flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/15'
                    : 'bg-bg-base/50 text-text-sub border-border-color hover:text-primary hover:bg-primary/5 hover:border-primary/30'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Pharmacy Orders
              </button>
            </div>

            {/* TAB CONTENT: DOCTOR BOOKINGS */}
            {activeTab === 'appointments' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold text-text-main font-headings">All Doctor Bookings</h3>
                  <p className="text-xs text-text-sub font-body mt-0.5">Track consultations and mark visits completed to free their slots</p>
                </div>

                {!appointmentList ? (
                  <ListStatus error={appointmentsError} onRetry={reloadAppointments} />
                ) : appointments.length === 0 ? (
                  <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                    <Calendar className="w-8 h-8 text-text-mute mx-auto mb-2" />
                    <p className="text-xs text-text-sub font-body">No doctor bookings registered in database</p>
                  </div>
                ) : (
                  <>
                    <ListToolbar
                      query={appointmentView.query}
                      onQueryChange={(query) => updateAppointmentView({ query })}
                      searchLabel="Search doctor bookings"
                      placeholder="Search by patient, email or doctor..."
                      status={appointmentView.status}
                      onStatusChange={(status) => updateAppointmentView({ status })}
                      statuses={APPOINTMENT_STATUSES}
                      items={appointments}
                    />

                    {appointmentList.total === 0 ? (
                      <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                        <Search className="w-8 h-8 text-text-mute mx-auto mb-2" />
                        <p className="text-xs text-text-sub font-body">No bookings match your search or filter</p>
                      </div>
                    ) : (
                      <>
                        {/* Phones: one card per booking, so the Complete action is visible without side-scrolling */}
                        <ul className="sm:hidden flex flex-col gap-3">
                          {appointmentList.rows.map((appt) => (
                            <li key={appt._id} className="border border-border-color rounded-2xl p-4 flex flex-col gap-3 text-xs font-body">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-text-main truncate">{appt.patient?.name || 'Anonymous User'}</p>
                                  {appt.patient?.email && (
                                    <p className="text-[10px] text-text-mute truncate">{appt.patient.email}</p>
                                  )}
                                </div>
                                <AppointmentStatusBadge status={appt.status} />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="min-w-0">
                                  <p className="text-[10px] text-text-mute uppercase tracking-wider font-semibold">Doctor</p>
                                  <p className="font-semibold text-text-main truncate">{formatDoctorName(appt.doctor?.name)}</p>
                                  {appt.doctor?.specialization && (
                                    <p className="text-[10px] text-text-mute truncate">{appt.doctor.specialization}</p>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] text-text-mute uppercase tracking-wider font-semibold">Scheduled</p>
                                  <p className="font-semibold text-text-main">{formatAppointmentDate(appt)}</p>
                                  <p className="text-[10px] text-text-mute">{appt.time}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border-color/40">
                                <span className="font-extrabold text-primary">Rs {appt.consultationFee}</span>
                                {renderCompleteAction(appt)}
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Tablets and up: table */}
                        <div className="hidden sm:block overflow-x-auto w-full">
                          <table className="w-full text-left text-xs font-body border-collapse min-w-150">
                            <thead>
                              <tr className="border-b border-border-color/60 text-text-mute font-semibold">
                                <th className="py-2.5 pr-3">Patient</th>
                                <th className="py-2.5 pr-3">Doctor Specialist</th>
                                <th className="py-2.5 pr-3">Scheduled</th>
                                <th className="py-2.5 pr-3 text-right">Fee</th>
                                <th className="py-2.5 px-3 text-center">Status</th>
                                <th className="py-2.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {appointmentList.rows.map((appt) => (
                                <tr key={appt._id} className="border-b border-border-color/30 hover:bg-bg-secondary/20 transition-colors">
                                  <td className="py-3 pr-3 max-w-40">
                                    <p className="font-semibold text-text-main truncate">{appt.patient?.name || 'Anonymous User'}</p>
                                    {appt.patient?.email && (
                                      <p className="text-[10px] text-text-mute truncate">{appt.patient.email}</p>
                                    )}
                                  </td>
                                  <td className="py-3 pr-3 max-w-45">
                                    <p className="font-semibold text-text-main truncate">{formatDoctorName(appt.doctor?.name)}</p>
                                    {appt.doctor?.specialization && (
                                      <p className="text-[10px] text-text-mute truncate">{appt.doctor.specialization}</p>
                                    )}
                                  </td>
                                  <td className="py-3 pr-3 whitespace-nowrap">
                                    <p className="text-text-main">{formatAppointmentDate(appt)}</p>
                                    <p className="text-[10px] text-text-mute">{appt.time}</p>
                                  </td>
                                  <td className="py-3 pr-3 text-right font-extrabold text-primary whitespace-nowrap">
                                    Rs {appt.consultationFee}
                                  </td>
                                  <td className="py-3 px-3 text-center">
                                    <AppointmentStatusBadge status={appt.status} />
                                  </td>
                                  <td className="py-3 text-right">
                                    {renderCompleteAction(appt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    <ListPagination
                      start={appointmentList.start}
                      rowCount={appointmentList.rows.length}
                      total={appointmentList.total}
                      currentPage={appointmentList.currentPage}
                      pageCount={appointmentList.pageCount}
                      onPageChange={(page) => setAppointmentView((prev) => ({ ...prev, page }))}
                      noun={appointmentList.total === 1 ? 'booking' : 'bookings'}
                    />
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT: SUPPORT TICKETS */}
            {activeTab === 'tickets' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold text-text-main font-headings">All Support Tickets</h3>
                  <p className="text-xs text-text-sub font-body mt-0.5">Manage user inquiries and resolve tickets</p>
                </div>

                {!ticketList ? (
                  <ListStatus error={ticketsError} onRetry={reloadTickets} />
                ) : tickets.length === 0 ? (
                  <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                    <Mail className="w-8 h-8 text-text-mute mx-auto mb-2" />
                    <p className="text-xs text-text-sub font-body">No support tickets registered in database</p>
                  </div>
                ) : (
                  <>
                    <ListToolbar
                      query={ticketView.query}
                      onQueryChange={(query) => updateTicketView({ query })}
                      searchLabel="Search support tickets"
                      placeholder="Search by name, email or subject..."
                      status={ticketView.status}
                      onStatusChange={(status) => updateTicketView({ status })}
                      statuses={TICKET_STATUSES}
                      items={tickets}
                    />

                    {ticketList.total === 0 ? (
                      <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                        <Search className="w-8 h-8 text-text-mute mx-auto mb-2" />
                        <p className="text-xs text-text-sub font-body">No tickets match your search or filter</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs font-body border-collapse min-w-150">
                          <thead>
                            <tr className="border-b border-border-color/60 text-text-mute font-semibold">
                              <th className="py-2.5">Name</th>
                              <th className="py-2.5">Subject</th>
                              <th className="py-2.5">Received</th>
                              <th className="py-2.5 text-center">Status</th>
                              <th className="py-2.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ticketList.rows.map((ticket) => (
                              <tr
                                key={ticket._id}
                                className="border-b border-border-color/30 hover:bg-bg-secondary/20 transition-colors cursor-pointer group"
                                onClick={() => handleOpenTicket(ticket)}
                              >
                                <td className="py-3 font-semibold text-text-main truncate max-w-30">
                                  {ticket.name}
                                </td>
                                <td className="py-3 text-text-sub truncate max-w-55 group-hover:text-primary transition-colors">
                                  {ticket.subject}
                                </td>
                                <td className="py-3 text-text-sub whitespace-nowrap">
                                  {new Date(ticket.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 text-center">
                                  {getTicketStatusBadge(ticket.status)}
                                </td>
                                <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={ticket.status}
                                    aria-label={`Status of ticket from ${ticket.name}`}
                                    onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                    className="text-[10px]! py-1! px-2.5! rounded-lg border border-border-color bg-bg-base text-text-main font-semibold max-w-28.75 ml-auto"
                                  >
                                    {TICKET_STATUSES.map(({ value, label }) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <ListPagination
                      start={ticketList.start}
                      rowCount={ticketList.rows.length}
                      total={ticketList.total}
                      currentPage={ticketList.currentPage}
                      pageCount={ticketList.pageCount}
                      onPageChange={(page) => setTicketView((prev) => ({ ...prev, page }))}
                      noun={ticketList.total === 1 ? 'ticket' : 'tickets'}
                    />
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT: PHARMACY ORDERS */}
            {activeTab === 'orders' && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold text-text-main font-headings">All Pharmacy Orders</h3>
                  <p className="text-xs text-text-sub font-body mt-0.5">Track sales checkups, shipping, and billing histories</p>
                </div>

                {!orderList ? (
                  <ListStatus error={ordersError} onRetry={reloadOrders} />
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                    <ShoppingBag className="w-8 h-8 text-text-mute mx-auto mb-2" />
                    <p className="text-xs text-text-sub font-body">No pharmacy checkout orders registered in database</p>
                  </div>
                ) : (
                  <>
                    <ListToolbar
                      query={orderView.query}
                      onQueryChange={(query) => updateOrderView({ query })}
                      searchLabel="Search pharmacy orders"
                      placeholder="Search by order ID, patient, email or phone..."
                      status={orderView.status}
                      onStatusChange={(status) => updateOrderView({ status })}
                      statuses={ORDER_STATUSES}
                      items={orders}
                    />

                    {orderList.total === 0 ? (
                      <div className="text-center py-10 bg-bg-secondary/40 border border-border-color rounded-2xl">
                        <Search className="w-8 h-8 text-text-mute mx-auto mb-2" />
                        <p className="text-xs text-text-sub font-body">No orders match your search or filter</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs font-body border-collapse min-w-137.5">
                          <thead>
                            <tr className="border-b border-border-color/60 text-text-mute font-semibold">
                              <th className="py-2.5">Order ID</th>
                              <th className="py-2.5">Patient</th>
                              <th className="py-2.5">Date</th>
                              <th className="py-2.5 text-center">Status</th>
                              <th className="py-2.5 text-right">Total Paid</th>
                              <th className="py-2.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderList.rows.map((order) => (
                              <tr
                                key={order._id}
                                className="border-b border-border-color/30 hover:bg-bg-secondary/20 transition-colors cursor-pointer group"
                                onClick={() => handleOpenOrder(order)}
                              >
                                <td className="py-3 font-mono font-bold text-text-main truncate max-w-25 group-hover:text-primary transition-colors">
                                  {order._id}
                                </td>
                                <td className="py-3 text-text-sub font-semibold">
                                  {order.patient?.name || 'Anonymous User'}
                                </td>
                                <td className="py-3 text-text-sub">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 text-center">
                                  <OrderStatusBadge status={order.status} />
                                </td>
                                <td className="py-3 text-right font-extrabold text-primary">
                                  Rs {order.orderTotal}
                                </td>
                                <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={order.status}
                                    aria-label={`Status of order ${order._id}`}
                                    onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                    className="text-[10px]! py-1! px-2.5! rounded-lg border border-border-color bg-bg-base text-text-main font-semibold max-w-28.75 ml-auto"
                                  >
                                    {ORDER_STATUSES.map(({ value, label }) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <ListPagination
                      start={orderList.start}
                      rowCount={orderList.rows.length}
                      total={orderList.total}
                      currentPage={orderList.currentPage}
                      pageCount={orderList.pageCount}
                      onPageChange={(page) => setOrderView((prev) => ({ ...prev, page }))}
                      noun={orderList.total === 1 ? 'order' : 'orders'}
                    />
                  </>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* COMPLETE APPOINTMENT CONFIRMATION MODAL */}
      {completeTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="m-auto w-full max-w-lg bg-bg-base border border-border-color rounded-3xl p-6 text-center flex flex-col items-center gap-5 shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-text-main font-headings">Mark Appointment Completed?</h3>
              <p className="text-xs text-text-sub font-body leading-relaxed mt-2">
                The consultation of <strong className="text-text-main">{completeTarget.patient?.name || 'this patient'}</strong> with{' '}
                <strong className="text-text-main">{formatDoctorName(completeTarget.doctor?.name)}</strong> on{' '}
                <strong className="text-text-main">{formatAppointmentDate(completeTarget)}</strong> at{' '}
                <strong className="text-text-main">{completeTarget.time}</strong> will be marked completed, and the
                doctor's slot opens again for the following week. This action cannot be undone.
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setCompleteTargetId(null)}
                className="btn btn-secondary flex-1 py-3! px-4! rounded-2xl text-sm! font-semibold whitespace-nowrap"
              >
                Not Yet
              </button>
              <button
                type="button"
                onClick={confirmCompleteAppointment}
                className="btn btn-primary flex-1 py-3! px-4! rounded-2xl text-sm! font-semibold whitespace-nowrap border-0"
              >
                Yes, Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT TICKET VIEW MODAL OVERLAY */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="m-auto w-full max-w-lg bg-bg-base border border-border-color rounded-3xl shadow-2xl relative max-h-[80vh] overflow-hidden flex flex-col animate-scale-in">
            
            {/* Close trigger button */}
            <button
              type="button"
              onClick={handleCloseTicket}
              aria-label="Close ticket details"
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
                  aria-label="Change ticket status"
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

      {/* PHARMACY ORDER RECEIPT VIEW MODAL OVERLAY */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="m-auto w-full max-w-lg bg-bg-base border border-border-color rounded-3xl shadow-2xl relative max-h-[85vh] overflow-hidden flex flex-col animate-scale-in">
            
            {/* Close trigger button */}
            <button
              type="button"
              onClick={handleCloseOrder}
              aria-label="Close order details"
              className="absolute top-5 right-5 text-text-sub hover:text-text-main bg-bg-secondary/85 border border-border-color p-2 rounded-full transition-colors z-20 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable details wrapper */}
            <div className="w-full h-full overflow-y-auto p-8 pr-6 custom-scrollbar flex flex-col gap-5">
              
              <div>
                <span className="self-start inline-block px-2.5 py-0.5 bg-bg-secondary border border-border-color text-text-sub text-[8px] font-bold uppercase rounded-md tracking-wider">
                  Order Invoice
                </span>
                <h2 className="text-base font-mono font-bold text-text-main mt-2">ID: {selectedOrder._id}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-text-mute font-body">Status:</span>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </div>

              {/* Delivery coordinates */}
              <div className="bg-bg-secondary/40 border border-border-color rounded-2xl p-4 flex flex-col gap-2 text-xs font-body text-left">
                <p className="text-text-sub flex justify-between">
                  <span className="text-text-mute">Customer:</span>
                  <strong className="text-text-main">{selectedOrder.patient?.name || 'Anonymous User'}</strong>
                </p>
                <p className="text-text-sub flex justify-between">
                  <span className="text-text-mute">Email:</span>
                  <span className="text-text-main">{selectedOrder.patient?.email || 'N/A'}</span>
                </p>
                <p className="text-text-sub flex justify-between">
                  <span className="text-text-mute">Contact Phone:</span>
                  <a href={`tel:${selectedOrder.contactPhone}`} className="text-primary hover:underline">{selectedOrder.contactPhone}</a>
                </p>
                <p className="text-text-sub flex items-start justify-between gap-4 mt-1 border-t border-border-color/30 pt-2">
                  <span className="text-text-mute shrink-0 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address:</span>
                  <span className="text-text-main text-right">{selectedOrder.shippingAddress}</span>
                </p>
                <p className="text-text-sub flex justify-between mt-1 border-t border-border-color/30 pt-2">
                  <span className="text-text-mute flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Date:</span>
                  <span className="text-text-main">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </p>
                <p className="text-text-sub flex justify-between">
                  <span className="text-text-mute flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Payment Method:</span>
                  <span className="text-text-main font-semibold">{selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card on Delivery'}</span>
                </p>
              </div>

              {/* Items Purchased List */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-text-mute uppercase tracking-wider font-body">Purchased Items</p>
                <div className="bg-bg-secondary/20 border border-border-color/30 rounded-2xl p-4 flex flex-col gap-2 text-xs">
                  {selectedOrder.items.map((item) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <span className="text-text-sub font-semibold">{item.name} <span className="text-text-mute text-[10px]">x{item.quantity}</span></span>
                      <span className="text-text-main">Rs {item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border-color flex justify-between items-center text-text-sub">
                    <span>Subtotal:</span>
                    <span>Rs {selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-sub">
                    <span>Delivery Fee:</span>
                    <span>{selectedOrder.deliveryFee === 0 ? 'Free' : `Rs ${selectedOrder.deliveryFee}`}</span>
                  </div>
                  <div className="mt-1.5 pt-2 border-t border-border-color/60 flex justify-between items-center font-bold text-sm text-text-main">
                    <span>Total Paid:</span>
                    <span className="text-primary font-headings">Rs {selectedOrder.orderTotal}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Trigger */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-border-color">
                <span className="text-[10px] text-text-sub font-bold font-body">Change order status:</span>
                <select
                  value={selectedOrder.status}
                  aria-label="Change order status"
                  onChange={(e) => handleOrderStatusChange(selectedOrder._id, e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl border border-border-color bg-bg-base text-text-main font-semibold w-40"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
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
