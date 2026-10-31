import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fonts } from '../theme';

// Scene caption in the app's heading style: dark title with the last words in brand teal
export const Caption = ({ eyebrow, title, highlight, body, points = [], align = 'left', width = 560, delay = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = (offset) => spring({ frame: frame - delay - offset, fps, config: { damping: 200 }, durationInFrames: 25 });
  const rise = (p) => ({ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)` });

  return (
    <div style={{ width, textAlign: align, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      {eyebrow && (
        <div
          style={{
            ...rise(at(0)),
            display: 'inline-flex',
            padding: '8px 18px',
            borderRadius: 999,
            background: colors.primaryLight,
            border: '1px solid hsla(174, 75%, 38%, 0.25)',
            color: colors.primary,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          ...rise(at(5)),
          fontFamily: fonts.headings,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          color: colors.text,
        }}
      >
        {title} {highlight && <span style={{ color: colors.primary }}>{highlight}</span>}
      </div>
      {body && (
        <div
          style={{
            ...rise(at(11)),
            marginTop: 22,
            fontFamily: fonts.body,
            fontSize: 25,
            lineHeight: 1.5,
            color: colors.textSub,
          }}
        >
          {body}
        </div>
      )}
      {points.length > 0 && (
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          {points.map((point, i) => (
            <div
              key={point}
              style={{
                ...rise(at(17 + i * 6)),
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 22,
                color: colors.text,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: colors.primary, flexShrink: 0 }} />
              {point}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
