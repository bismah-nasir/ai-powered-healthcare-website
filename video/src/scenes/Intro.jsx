import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background } from '../components/Background';
import { Logo } from '../components/Logo';
import { fonts } from '../theme';

// Teal brand intro, echoing the app's splash screen
export const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const tagline = spring({ frame: frame - 22, fps, config: { damping: 200 } });
  const chip = spring({ frame: frame - 38, fps, config: { damping: 200 } });
  const pulse = interpolate(frame, [10, 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  return (
    <AbsoluteFill>
      <Background variant="teal" />
      {/* Heartbeat trace drawing itself across the screen */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <path
          d="M0 880 H760 l24 -14 l22 14 h20 l18 -120 l26 210 l22 -120 l16 30 h24 l20 -16 l20 16 H1920"
          pathLength={1}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={1 - pulse}
        />
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ transform: `scale(${interpolate(logo, [0, 1], [0.7, 1.25])})`, opacity: logo }}>
          <Logo light />
        </div>
        <div
          style={{
            marginTop: 64,
            opacity: tagline,
            transform: `translateY(${(1 - tagline) * 20}px)`,
            fontFamily: fonts.headings,
            fontWeight: 600,
            fontSize: 50,
            color: '#ffffff',
            letterSpacing: -0.5,
          }}
        >
          AI-Powered Healthcare, Delivered Instantly
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: chip,
            transform: `translateY(${(1 - chip) * 20}px)`,
            padding: '10px 24px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.12)',
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 21,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          Doctors · AI Triage · Pharmacy · Labs · Emergency
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
