import { HeartPulse } from 'lucide-react';
import { fonts } from '../theme';

// The app's brand mark: HeartPulse icon in a rounded tile, "PulseCare" with a lighter "AI"
export const Logo = ({ size = 1, light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 22 * size }}>
    <div
      style={{
        width: 96 * size,
        height: 96 * size,
        borderRadius: 26 * size,
        background: light ? 'rgba(255,255,255,0.18)' : 'hsl(174, 75%, 38%)',
        border: light ? '1px solid rgba(255,255,255,0.35)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 40px -12px rgba(0, 60, 55, 0.35)',
      }}
    >
      <HeartPulse size={52 * size} color="#ffffff" strokeWidth={2.2} />
    </div>
    <div style={{ fontFamily: fonts.headings, fontWeight: 800, fontSize: 64 * size, letterSpacing: -1.5 * size, color: light ? '#ffffff' : 'hsl(220, 40%, 15%)' }}>
      PulseCare <span style={{ fontWeight: 400, color: light ? 'rgba(255,255,255,0.85)' : 'hsl(174, 75%, 38%)' }}>AI</span>
    </div>
  </div>
);
