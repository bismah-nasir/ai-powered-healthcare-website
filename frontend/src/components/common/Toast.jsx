import { useEffect } from 'react';
import { TriangleAlert, CircleAlert, X } from 'lucide-react';

const AUTO_DISMISS_MS = 4500;

const TONES = {
  warning: { Icon: TriangleAlert, accent: 'bg-warning', icon: 'text-warning bg-warning/10' },
  danger: { Icon: CircleAlert, accent: 'bg-danger', icon: 'text-danger bg-danger/10' },
};

// In-app alert shown at the bottom of the screen. Alerts with actions stay open until dismissed.
function Toast({ message, tone = 'warning', actions = [], onClose }) {
  const { Icon, accent, icon } = TONES[tone] || TONES.warning;
  const hasActions = actions.length > 0;

  useEffect(() => {
    if (hasActions) return;
    const timer = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [hasActions, onClose]);

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96 z-60 pointer-events-none">
      <div
        role="alert"
        aria-live="assertive"
        className="pointer-events-auto relative overflow-hidden bg-bg-base border border-border-color rounded-2xl shadow-2xl p-4 pl-5 flex gap-3 items-start animate-slide-up"
      >
        <span className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} aria-hidden="true"></span>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${icon}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="grow min-w-0">
          <p className="text-xs text-text-main font-body leading-relaxed pt-1.5">{message}</p>

          {hasActions && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary border-0'} text-xs! py-2! px-4! rounded-xl!`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-text-mute hover:text-text-main bg-transparent border-0 cursor-pointer p-1 rounded transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
