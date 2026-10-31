// Color-coded pill for a pharmacy order status (shared by My Orders and the admin dashboard)
const STATUS_STYLES = {
  pending: { label: 'Pending', className: 'text-danger bg-danger/5 border-danger/10' },
  processing: { label: 'Processing', className: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
  shipped: { label: 'Shipped', className: 'text-blue-500 bg-blue-500/5 border-blue-500/10' },
  delivered: { label: 'Delivered', className: 'text-success bg-success/5 border-success/10' },
  cancelled: { label: 'Cancelled', className: 'text-text-mute bg-text-mute/5 border-text-mute/10' },
};

function OrderStatusBadge({ status }) {
  const { label, className } = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider border px-2 py-0.5 rounded-md ${className}`}>
      {label}
    </span>
  );
}

export default OrderStatusBadge;
