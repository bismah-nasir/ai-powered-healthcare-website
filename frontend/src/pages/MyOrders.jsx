import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import OrderStatusBadge from '../components/common/OrderStatusBadge';
import {
  ShoppingBag, AlertCircle, MapPin, Phone, CreditCard, Clock,
  ChevronDown, Package, XCircle, Check
} from 'lucide-react';

// Delivery progress shown on each order (cancelled orders show a notice instead)
const PROGRESS_STEPS = [
  { status: 'pending', label: 'Placed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

const ACTIVE_STATUSES = ['pending', 'processing', 'shipped'];

// Fetch the signed-in user's orders, resolving to { data } on success or { error } on failure
const requestOrders = async (token) => {
  try {
    const { data: resData } = await apiRequest('/api/orders/my-orders', { token });

    if (resData.success) {
      return { data: resData.data };
    }
    return { error: resData.message || 'Failed to fetch your orders.' };
  } catch (err) {
    console.error('[MyOrders Page] Fetch error:', err.message);
    return { error: 'Failed to connect to the server. Please verify backend is running.' };
  }
};

const formatOrderDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Short reference for card headers; the full ID is shown in the order details
const shortOrderId = (id) => String(id).slice(-8).toUpperCase();

function MyOrders() {
  // The route guard only renders this page for a signed-in user
  const { token } = useAuth();

  // Orders states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI States
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'past'
  const [expandedId, setExpandedId] = useState(null);

  // Re-fetch orders list (retry button)
  const fetchOrders = () => {
    setLoading(true);
    setError('');

    requestOrders(token).then(({ data, error: requestError }) => {
      if (data) setOrders(data);
      else setError(requestError);
      setLoading(false);
    });
  };

  // Initial load (state is only updated once the request settles)
  useEffect(() => {
    requestOrders(token).then(({ data, error: requestError }) => {
      if (data) setOrders(data);
      else setError(requestError);
      setLoading(false);
    });
  }, [token]);

  // Filter list into tabs
  const activeOrders = orders.filter((order) => ACTIVE_STATUSES.includes(order.status));
  const pastOrders = orders.filter((order) => !ACTIVE_STATUSES.includes(order.status));
  const visibleOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const toggleDetails = (orderId) => {
    setExpandedId((prev) => (prev === orderId ? null : orderId));
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
              My <span className="text-primary">Orders</span>
            </h1>
            <p className="text-sm text-text-sub font-body mt-1">Track deliveries and review your pharmacy purchases</p>
          </div>
          <Link to="/medicines" className="btn btn-primary px-6 py-3.5 rounded-2xl text-sm font-semibold sm:self-center">
            Continue Shopping
          </Link>
        </div>

        {/* Tab Controls Navigation */}
        <div className="flex border-b border-border-color">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-5 py-3 text-sm font-bold font-body transition-colors border-0 border-b-2 relative ${
              activeTab === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub hover:text-text-main'
            }`}
          >
            Active Orders ({activeOrders.length})
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
            Past Orders ({pastOrders.length})
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
                <div className="h-2 bg-border-color rounded w-full mt-2"></div>
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
            <button type="button" onClick={fetchOrders} className="btn btn-secondary py-2.5 px-6 rounded-xl text-xs mt-2">
              Try Again
            </button>
          </div>
        ) : visibleOrders.length === 0 ? (
          /* EMPTY TAB STATE */
          <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-main font-headings">
              {activeTab === 'active' ? 'No Active Orders' : 'No Past Orders'}
            </h3>
            <p className="text-sm text-text-sub font-body leading-relaxed max-w-sm">
              {activeTab === 'active'
                ? 'You have no orders on the way. Browse the pharmacy to order medicines to your door.'
                : 'Delivered and cancelled orders will appear here.'}
            </p>
            <Link to="/medicines" className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold mt-2">
              Browse Pharmacy
            </Link>
          </div>
        ) : (
          /* ORDER CARD LIST */
          <div className="flex flex-col gap-4">
            {visibleOrders.map((order, idx) => {
              const isExpanded = expandedId === order._id;
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const currentStep = PROGRESS_STEPS.findIndex((step) => step.status === order.status);
              const detailsId = `order-details-${order._id}`;

              return (
                <div
                  key={order._id}
                  style={{ animationDelay: `${(idx % 6) * 75}ms` }}
                  className="glass-panel rounded-3xl p-6 flex flex-col gap-5 hover:border-primary/40 hover:shadow-md transition-all duration-300 animate-slide-up"
                >
                  {/* Summary row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <h3 className="font-bold text-base text-text-main font-headings">
                            Order <span className="font-mono">#{shortOrderId(order._id)}</span>
                          </h3>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-text-sub font-body mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-text-mute" />
                          Placed on {formatOrderDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-text-sub font-body mt-1 truncate">
                          {itemCount} item{itemCount === 1 ? '' : 's'}: {order.items.map((item) => item.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-color">
                      <p className="text-lg font-extrabold text-primary font-headings">Rs {order.orderTotal}</p>
                      <button
                        type="button"
                        onClick={() => toggleDetails(order._id)}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        className="btn btn-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                      >
                        {isExpanded ? 'Hide Details' : 'View Details'}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Delivery progress tracker */}
                  {order.status === 'cancelled' ? (
                    <div className="flex items-center gap-2 text-xs font-body text-text-sub bg-bg-secondary/40 border border-border-color rounded-2xl px-4 py-3">
                      <XCircle className="w-4 h-4 text-text-mute shrink-0" />
                      This order was cancelled. Any payment due on delivery will not be collected.
                    </div>
                  ) : (
                    <ol className="grid grid-cols-4 gap-2" aria-label="Delivery progress">
                      {PROGRESS_STEPS.map((step, stepIdx) => {
                        const reached = stepIdx <= currentStep;
                        return (
                          <li key={step.status} className="flex flex-col gap-1.5" aria-current={stepIdx === currentStep ? 'step' : undefined}>
                            <span className={`h-1.5 rounded-full transition-colors ${reached ? 'bg-primary' : 'bg-border-color'}`}></span>
                            <span className={`text-[9px] sm:text-[10px] font-bold font-body uppercase sm:tracking-wider flex items-center gap-1 ${reached ? 'text-primary' : 'text-text-mute'}`}>
                              {reached && <Check className="w-3 h-3 shrink-0 hidden sm:block" />}
                              {step.label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  {/* Expanded order details */}
                  {isExpanded && (
                    <div id={detailsId} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-color animate-fade-in">
                      {/* Items purchased */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-text-mute uppercase tracking-wider font-body">Purchased Items</p>
                        <div className="bg-bg-secondary/20 border border-border-color/30 rounded-2xl p-4 flex flex-col gap-2 text-xs font-body">
                          {order.items.map((item) => (
                            <div key={item._id} className="flex justify-between items-center gap-3">
                              <span className="text-text-sub font-semibold min-w-0 truncate">
                                {item.name} <span className="text-text-mute text-[10px]">x{item.quantity}</span>
                              </span>
                              <span className="text-text-main shrink-0">Rs {item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="mt-2 pt-2 border-t border-border-color flex justify-between items-center text-text-sub">
                            <span>Subtotal:</span>
                            <span>Rs {order.subtotal}</span>
                          </div>
                          <div className="flex justify-between items-center text-text-sub">
                            <span>Delivery Fee:</span>
                            <span>{order.deliveryFee === 0 ? 'Free' : `Rs ${order.deliveryFee}`}</span>
                          </div>
                          <div className="mt-1.5 pt-2 border-t border-border-color/60 flex justify-between items-center font-bold text-sm text-text-main">
                            <span>Total:</span>
                            <span className="text-primary font-headings">Rs {order.orderTotal}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery and payment */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-text-mute uppercase tracking-wider font-body">Delivery & Payment</p>
                        <div className="bg-bg-secondary/40 border border-border-color rounded-2xl p-4 flex flex-col gap-2.5 text-xs font-body">
                          <p className="text-text-sub flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-text-mute shrink-0 mt-0.5" />
                            <span className="text-text-main wrap-break-word min-w-0">{order.shippingAddress}</span>
                          </p>
                          <p className="text-text-sub flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-text-mute shrink-0" />
                            <span className="text-text-main">{order.contactPhone}</span>
                          </p>
                          <p className="text-text-sub flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-text-mute shrink-0" />
                            <span className="text-text-main">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card on Delivery'}</span>
                          </p>
                          <p className="text-text-sub mt-1 pt-2 border-t border-border-color/40 flex justify-between gap-3 text-[10px]">
                            <span className="text-text-mute">Order ID:</span>
                            <span className="font-mono text-text-main break-all text-right">{order._id}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyOrders;
