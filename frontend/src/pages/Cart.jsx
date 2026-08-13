import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, Plus, Minus, ShoppingBag, MapPin, Phone, 
  CreditCard, ShieldAlert, CheckCircle, ArrowLeft, Info 
} from 'lucide-react';

function Cart() {
  const { user } = useAuth();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal 
  } = useCart();

  // Shipping & Checkout form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD, Card

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Constants
  const DELIVERY_FEE = cartSubtotal > 1500 ? 0 : 150; // Free delivery for orders above Rs 1500
  const orderTotal = cartSubtotal + DELIVERY_FEE;

  // Check if any cart item requires a prescription (Rx Required)
  const requiresPrescription = cartItems.some((item) => item.requiresPrescription);

  const handleCheckoutSubmit = async (e) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return;

    // Check if user is logged in
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setCheckoutLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress,
          contactPhone,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Construct receipt matching schema return data
        const receipt = {
          orderId: data.data._id,
          items: data.data.items,
          subtotal: data.data.subtotal,
          deliveryFee: data.data.deliveryFee,
          total: data.data.orderTotal,
          address: data.data.shippingAddress,
          phone: data.data.contactPhone,
          payment: data.data.paymentMethod,
          date: new Date(data.data.createdAt).toLocaleDateString(),
        };

        setOrderReceipt(receipt);
        setCheckoutSuccess(true);
        clearCart(); // Reset cart on successful checkout
      } else {
        alert(data.message || 'Checkout failed. Please review your order.');
      }
    } catch (error) {
      console.error('[Checkout Form] Connection Error:', error.message);
      alert('Failed to connect to the server. Please ensure the backend is running.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setCheckoutSuccess(false);
    setOrderReceipt(null);
  };

  // 1. EMPTY CART PLACEHOLDER STATE
  if (cartItems.length === 0 && !checkoutSuccess) {
    return (
      <div className="min-h-screen bg-bg-base/30 py-20 px-6 flex items-center justify-center">
        <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center flex flex-col items-center gap-5 shadow-xl animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-main font-headings">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-text-sub font-body leading-relaxed max-w-xs">
            Browse our pharmacy catalog to add medicines, wellness pills, and vitamins to your checkout tray.
          </p>
          <Link to="/medicines" className="btn btn-primary w-full py-3.5 rounded-2xl text-xs font-semibold mt-2">
            Browse Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-275 mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Back Link */}
        <div>
          <Link to="/medicines" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover font-body transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Pharmacy
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main font-headings mt-2">
            Your Shopping <span className="text-primary">Cart</span>
          </h1>
        </div>

        {/* Prescription Alert for Rx items */}
        {requiresPrescription && (
          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 flex gap-3 text-xs font-body items-start">
            <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-600 dark:text-yellow-500">Prescription (Rx) Required</p>
              <p className="text-text-sub leading-relaxed mt-1">
                One or more medicines in your cart require a valid prescription. Please ensure you have a physical copy or doctor's note ready to show our delivery agent.
              </p>
            </div>
          </div>
        )}

        {/* Two Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Cart Items List & Delivery Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            
            {/* Cart Items Card */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-2">Selected Items</h3>
              
              <div className="flex flex-col">
                {cartItems.map((item, idx) => (
                  <div 
                    key={item._id} 
                    style={{ animationDelay: `${(idx % 6) * 75}ms` }}
                    className="flex gap-4 py-4 border-b border-border-color/20 last:border-b-0 items-start justify-between animate-slide-up"
                  >
                    
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-color shrink-0 bg-bg-secondary/40 flex items-center justify-center text-text-mute">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-primary/20" />
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="grow min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-text-main truncate leading-snug">{item.name}</h4>
                        {item.requiresPrescription && (
                          <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-[7px] font-extrabold uppercase px-1 py-0.5 rounded tracking-wide font-body">Rx</span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-mute font-body mt-0.5">Category: {item.category}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-text-main">Rs {item.price}</span>
                        <span className="text-[10px] text-text-mute font-body">x {item.quantity}</span>
                      </div>
                    </div>

                    {/* Item Actions (Quantity controllers + Remove) */}
                    <div className="flex flex-col items-end gap-3 justify-between self-stretch shrink-0">
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item._id)}
                        className="text-text-mute hover:text-danger bg-transparent border-0 cursor-pointer p-1 rounded transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Quantity Selector buttons */}
                      <div className="flex items-center border border-border-color bg-bg-secondary/30 rounded-xl px-1 py-0.5 text-xs font-body">
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 hover:text-primary transition-colors border-0 bg-transparent"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 font-bold text-text-main select-none">{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 hover:text-primary transition-colors border-0 bg-transparent"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Billing Information Form */}
            <form onSubmit={handleCheckoutSubmit} className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-1">Delivery Information</h3>
              
              {/* Field 1: Shipping Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Delivery Address *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-5 text-text-mute">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <textarea
                    required
                    disabled={checkoutLoading}
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter complete shipping or residential address..."
                    className="pl-icon-left focus:border-primary w-full min-h-20 resize-y py-3.5"
                  />
                </div>
              </div>

              {/* Field 2: Contact Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Contact Phone *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    required
                    disabled={checkoutLoading}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Enter recipient contact phone number..."
                    className="pl-icon-left focus:border-primary w-full"
                  />
                </div>
              </div>

              {/* Field 3: Payment Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Payment Method *</label>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* COD */}
                  <label className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'COD' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border-color hover:border-primary/20 text-text-sub bg-bg-secondary/20'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <CreditCard className="w-4 h-4" />
                      Cash on Delivery
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="hidden" 
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'COD' ? 'border-primary' : 'border-border-color'
                    }`}>
                      {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                    </div>
                  </label>

                  {/* Card (Simulated) */}
                  <label className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'Card' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border-color hover:border-primary/20 text-text-sub bg-bg-secondary/20'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <CreditCard className="w-4 h-4" />
                      Card on Delivery
                    </div>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="Card" 
                      checked={paymentMethod === 'Card'}
                      onChange={() => setPaymentMethod('Card')}
                      className="hidden" 
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'Card' ? 'border-primary' : 'border-border-color'
                    }`}>
                      {paymentMethod === 'Card' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                    </div>
                  </label>

                </div>
              </div>

            </form>
          </div>

          {/* Column 2: Order Pricing Summary Card (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-text-main tracking-wider uppercase font-headings mb-1">Billing Summary</h3>
              
              <div className="flex flex-col gap-3 text-xs font-body border-b border-border-color pb-4">
                <div className="flex justify-between items-center text-text-sub">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-text-main">Rs {cartSubtotal}</span>
                </div>
                <div className="flex justify-between items-center text-text-sub">
                  <span>Standard Delivery Fee</span>
                  <span className="font-bold text-text-main">
                    {DELIVERY_FEE === 0 ? <span className="text-success uppercase font-semibold">Free Delivery</span> : `Rs ${DELIVERY_FEE}`}
                  </span>
                </div>
                {DELIVERY_FEE > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-text-mute">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <span>Free delivery on orders above Rs 1500</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm font-headings font-extrabold py-1">
                <span className="text-text-main">Total Order Cost:</span>
                <span className="text-primary text-base">Rs {orderTotal}</span>
              </div>

              {/* Checkout Trigger */}
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                disabled={checkoutLoading}
                className="btn btn-primary w-full py-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 mt-2 border-0 shadow-lg disabled:grayscale disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                {checkoutLoading ? 'Processing Checkout...' : 'Confirm Order Checkout'}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ORDER SUCCESS RECEIPT DIALOG MODAL */}
      {checkoutSuccess && orderReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-bg-base border border-border-color rounded-3xl p-8 flex flex-col items-center text-center gap-5 shadow-2xl animate-scale-in">
            <div className="w-14 h-14 bg-success/10 flex items-center justify-center rounded-full">
              <CheckCircle className="w-9 h-9 text-success" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-text-main font-headings">Order Confirmed!</h3>
              <p className="text-xs text-text-sub font-body leading-relaxed mt-2 max-w-sm">
                Your medicine purchase has been registered. Order <strong className="text-text-main">{orderReceipt.orderId}</strong> is scheduled for dispatch.
              </p>
            </div>

            {/* Receipt Summary Details */}
            <div className="w-full bg-bg-secondary/40 border border-border-color rounded-2xl p-5 flex flex-col gap-2 text-xs text-left font-body">
              <p className="text-text-mute uppercase tracking-wider font-bold border-b border-border-color pb-1.5">Purchase Receipt</p>
              <p className="text-text-sub">Order ID: <strong className="text-text-main">{orderReceipt.orderId}</strong></p>
              <p className="text-text-sub">Address: <strong className="text-text-main">{orderReceipt.address}</strong></p>
              <p className="text-text-sub">Phone: <strong className="text-text-main">{orderReceipt.phone}</strong></p>
              <p className="text-text-sub">Payment: <strong className="text-text-main">{orderReceipt.payment === 'COD' ? 'Cash on Delivery' : 'Card on Delivery'}</strong></p>
              <p className="text-text-sub">Date: <strong className="text-text-main">{orderReceipt.date}</strong></p>
              
              <div className="mt-1 pt-1.5 border-t border-border-color/60 text-text-sub flex flex-col gap-1">
                {orderReceipt.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-[11px]">
                    <span className="truncate max-w-50">{item.name} (x{item.quantity})</span>
                    <span>Rs {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <p className="text-text-sub mt-1 pt-1.5 border-t border-border-color flex justify-between font-bold">
                <span>Total Paid:</span>
                <span className="text-primary text-sm font-headings">Rs {orderReceipt.total}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseSuccess}
              className="btn btn-primary w-full text-sm! font-semibold"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM AUTH REQUIRED MODAL OVERLAY */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-bg-base border border-border-color rounded-3xl p-8 flex flex-col items-center text-center gap-5 shadow-2xl animate-scale-in">
            <div className="w-14 h-14 bg-danger/10 flex items-center justify-center rounded-full text-danger">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-text-main font-headings">Authentication Required</h3>
              <p className="text-xs text-text-sub font-body leading-relaxed mt-2 max-w-xs mx-auto">
                Please sign in to your PulseCare account to verify your delivery details and complete your checkout.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="btn btn-secondary grow text-sm! font-semibold"
              >
                Cancel
              </button>
              <Link
                to="/login"
                className="btn btn-primary grow text-sm! font-semibold border-0 text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Cart;
