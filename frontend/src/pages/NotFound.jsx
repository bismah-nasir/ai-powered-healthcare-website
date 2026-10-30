import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base/30 py-20 px-6 flex items-center justify-center">
      <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center flex flex-col items-center gap-5 shadow-xl animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider text-primary font-body">Error 404</span>
        <h1 className="text-xl font-bold text-text-main font-headings">Page Not Found</h1>
        <p className="text-xs text-text-sub font-body leading-relaxed max-w-xs">
          The page you are looking for does not exist or may have been moved. Check the address or head back to the dashboard.
        </p>
        <Link to="/home" className="btn btn-primary w-full py-3.5 rounded-2xl text-xs font-semibold mt-2">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
