import { useState } from 'react';

// <img> that shows the fallback (initials, icon) when there is no URL or the image fails to load,
// instead of leaving an empty box behind.
function ImageWithFallback({ src, alt, className, fallback = null }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) return fallback;

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />;
}

export default ImageWithFallback;
