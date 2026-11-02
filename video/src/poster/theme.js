// Outfit and Plus Jakarta Sans are bundled by src/fonts.js, which Root.jsx loads before rendering.
import { fonts } from '../theme';

export const headingFont = fonts.headings;
export const bodyFont = fonts.body;

// Matches the PulseCare app's theme (--color-primary etc. in its Tailwind CSS).
export const colors = {
  bg: '#f6f9fa',
  surface: '#ffffff',
  primary: '#18aa9b',
  primaryDark: '#13867a',
  primarySoft: '#dcf6f2',
  ink: '#0f172a',
  muted: '#5b6577',
  line: 'rgba(15,23,42,0.10)',
  shadow: 'rgba(10,48,44,0.18)',
};

export const links = {
  live: 'the-pulsecare-ai.vercel.app',
  github: 'github.com/bismah-nasir/ai-powered-healthcare-website',
};
