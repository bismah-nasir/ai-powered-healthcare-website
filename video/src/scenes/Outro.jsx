import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Globe } from 'lucide-react';
import { Background } from '../components/Background';
import { Logo } from '../components/Logo';
import { colors, fonts, LIVE_URL, REPO_URL } from '../theme';

const STACK = ['React 19', 'Vite', 'Tailwind CSS v4', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Vercel'];

// Closing card with the live URL
export const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (delay) => spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 30 });
  const rise = (p) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px)` });
  const url = spring({ frame: frame - 24, fps, config: { damping: 12, mass: 0.7 } });

  return (
    <AbsoluteFill>
      <Background variant="teal" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={rise(at(0))}>
          <Logo light size={0.85} />
        </div>
        <div style={{ ...rise(at(12)), marginTop: 56, fontFamily: fonts.headings, fontWeight: 800, fontSize: 92, color: '#ffffff', letterSpacing: -2 }}>
          Try it live
        </div>
        <div
          style={{
            marginTop: 34,
            opacity: url,
            transform: `scale(${interpolate(url, [0, 1], [0.85, 1])})`,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '24px 44px',
            borderRadius: 24,
            background: '#ffffff',
            boxShadow: '0 30px 60px -20px rgba(0, 40, 40, 0.45)',
            fontFamily: fonts.headings,
            fontWeight: 700,
            fontSize: 56,
            color: colors.primaryDark,
          }}
        >
          <Globe size={50} color={colors.primary} strokeWidth={2.2} />
          {LIVE_URL}
        </div>
        <div style={{ ...rise(at(40)), marginTop: 30, fontFamily: fonts.body, fontWeight: 500, fontSize: 25, color: 'rgba(255,255,255,0.85)' }}>
          Source code: {REPO_URL}
        </div>
        <div style={{ marginTop: 56, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1400 }}>
          {STACK.map((tech, i) => (
            <div
              key={tech}
              style={{
                ...rise(at(52 + i * 4)),
                padding: '12px 24px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.12)',
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 22,
                color: '#ffffff',
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
