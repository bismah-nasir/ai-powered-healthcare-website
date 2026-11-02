import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Logo } from './Logo';
import { bodyFont, colors, headingFont, links } from './theme';

const shot = (name) => staticFile(`poster/screenshots/${name}.png`);

function Chip({ children }) {
  return (
    <span
      style={{
        padding: '10px 22px',
        borderRadius: 999,
        background: colors.primarySoft,
        color: colors.primaryDark,
        fontSize: 24,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

/** Light browser window chrome, as in the demo video. */
function BrowserFrame({ width, height, url, children }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 22,
        overflow: 'hidden',
        background: colors.surface,
        border: `1.5px solid ${colors.line}`,
        boxShadow: `0 40px 110px ${colors.shadow}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 22px',
          flexShrink: 0,
          background: '#eef2f3',
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
        <div
          style={{
            marginLeft: 18,
            flex: 1,
            maxWidth: 620,
            height: 32,
            borderRadius: 8,
            background: colors.surface,
            color: colors.muted,
            fontSize: 17,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

/** Thumbnail shown before the demo video plays. */
export function PulseCarePoster() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: bodyFont, color: colors.ink }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 600px at 85% 5%, rgba(24,170,155,0.15), transparent 70%),
            radial-gradient(800px 600px at 5% 100%, rgba(24,170,155,0.08), transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ flexDirection: 'row', alignItems: 'center', padding: '0 0 0 120px' }}>
        <div style={{ width: 800, display: 'flex', flexDirection: 'column', gap: 34, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <Logo size={104} />
            <div style={{ fontFamily: headingFont, fontSize: 100, fontWeight: 700, letterSpacing: -3 }}>
              PulseCare <span style={{ color: colors.primary }}>AI</span>
            </div>
          </div>
          <div style={{ fontFamily: headingFont, fontSize: 52, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}>
            From symptoms to <span style={{ color: colors.primary }}>the right doctor</span>, in one portal
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Chip>AI symptom checker</Chip>
            <Chip>Doctor booking</Chip>
            <Chip>Online pharmacy</Chip>
          </div>
          <div style={{ fontSize: 26, color: colors.muted }}>{links.live}</div>
        </div>

        <div style={{ position: 'relative', flex: 1, height: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: 40,
              top: 200,
              transform: 'perspective(2200px) rotateY(-14deg) rotateX(4deg)',
              transformOrigin: 'left center',
            }}
          >
            <BrowserFrame width={1180} height={680} url={`${links.live}/home`}>
              <Img
                src={shot('home_page')}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
            </BrowserFrame>
          </div>
          {/* Phone with the emergency directory (captured at 390px wide from the live site) */}
          <div
            style={{
              position: 'absolute',
              left: 10,
              top: 400,
              width: 340,
              height: 620,
              borderRadius: 46,
              overflow: 'hidden',
              border: `10px solid ${colors.ink}`,
              background: colors.surface,
              boxShadow: `0 40px 100px ${colors.shadow}`,
            }}
          >
            <Img
              src={shot('emergency-mobile')}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
