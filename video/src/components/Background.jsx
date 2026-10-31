import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { colors } from '../theme';

// Soft light backdrop with slowly drifting teal and indigo glows, like the app's page background
export const Background = ({ variant = 'light' }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 40;

  if (variant === 'teal') {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(135deg, hsl(174, 70%, 40%) 0%, ${colors.primaryDark} 100%)` }}>
        <Glow color="rgba(255,255,255,0.18)" size={900} x={-200 + drift} y={-300} />
        <Glow color="rgba(99,102,241,0.25)" size={800} x={1300 - drift} y={500} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, #ffffff 0%, ${colors.bg} 55%, hsl(238, 60%, 97%) 100%)` }}>
      <Glow color="hsla(174, 75%, 45%, 0.16)" size={1000} x={-350 + drift} y={-350} />
      <Glow color="hsla(238, 70%, 60%, 0.12)" size={900} x={1350 - drift} y={550} />
    </AbsoluteFill>
  );
};

const Glow = ({ color, size, x, y }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    }}
  />
);
