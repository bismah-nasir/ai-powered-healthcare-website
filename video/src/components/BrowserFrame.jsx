import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Lock } from 'lucide-react';
import { colors, fonts, LIVE_URL, screens } from '../theme';
import { ClickCursor, TypedText } from './Interactions';

const BAR_HEIGHT = 52;
const FADE = 15;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// A desktop browser window showing full-page screenshots, like navigating the live site.
// pages: [{ screen, path, at, scroll, zoom, origin, cover, typing, click }] — each page fades in at frame `at`
// (the first is shown from the start) and is hidden once the next page has fully faded in.
// scroll: [startFrame, endFrame, fromFraction, toFraction] of that page's scrollable height.
// zoom: [startFrame, endFrame, fromScale, toScale] towards `origin`, for legibility. origin is a CSS
//   transform-origin string, or { x, y } in CSS px of the page (like the hotspots).
// typing / click: animated text entry and mouse clicks, see Interactions.jsx.
// tilt: degrees the window is turned when it enters, settling flat.
// cover: fill the window height (cropping the sides) for screenshots shorter than the window.
export const BrowserFrame = ({ pages, width, height, enterDelay = 0, tilt = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const viewportHeight = height - BAR_HEIGHT;
  const enter = spring({ frame: frame - enterDelay, fps, config: { damping: 200 }, durationInFrames: 30 });
  const current = [...pages].reverse().find((page) => (page.at ?? 0) <= frame) ?? pages[0];

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        overflow: 'hidden',
        background: colors.white,
        boxShadow: '0 40px 90px -30px rgba(15, 40, 60, 0.35), 0 0 0 1px rgba(15, 40, 60, 0.06)',
        opacity: enter,
        transform: `perspective(2400px) rotateY(${tilt * (1 - enter)}deg) translateY(${(1 - enter) * 40}px) scale(${0.97 + enter * 0.03})`,
        ...style,
      }}
    >
      <div
        style={{
          height: BAR_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '0 20px',
          background: 'hsl(210, 25%, 96%)',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 560,
            margin: '0 auto',
            height: 32,
            borderRadius: 10,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.textSub,
          }}
        >
          <Lock size={13} color={colors.primary} strokeWidth={2.5} />
          <span>
            {LIVE_URL}
            <span style={{ color: colors.textMuted }}>{current.path}</span>
          </span>
        </div>
        <div style={{ width: 55 }} />
      </div>
      <div style={{ height: viewportHeight, overflow: 'hidden', position: 'relative' }}>
        {pages.map((page, i) => {
          const next = pages[i + 1];
          if (next && frame >= next.at + FADE) return null;
          return <Page key={page.screen} page={page} first={i === 0} frame={frame} width={width} viewportHeight={viewportHeight} />;
        })}
      </div>
    </div>
  );
};

const Page = ({ page, first, frame, width, viewportHeight }) => {
  const [imgW, imgH] = screens[page.screen];
  const coverScale = page.cover ? Math.max(1, viewportHeight / ((width * imgH) / imgW)) : 1;
  const imageWidth = width * coverScale;
  const imageHeight = (imageWidth * imgH) / imgW;
  const maxScroll = Math.max(0, imageHeight - viewportHeight);
  const at = page.at ?? 0;
  const opacity = first ? 1 : interpolate(frame, [at, at + FADE], [0, 1], clamp);
  const ease = { ...clamp, easing: Easing.inOut(Easing.cubic) };

  let scrollY = 0;
  if (page.scroll) {
    const [start, end, from, to] = page.scroll;
    scrollY = maxScroll * interpolate(frame, [start, end], [from, to], ease);
  }

  let scale = 1;
  if (page.zoom) {
    const [start, end, from, to] = page.zoom;
    scale = interpolate(frame, [start, end], [from, to], ease);
  }

  // CSS px of the 1440px layout -> on-screen px, and where the image starts horizontally
  const k = imageWidth / 1440;
  const left = (width - imageWidth) / 2;
  const origin = typeof page.origin === 'object' ? `${left + page.origin.x * k}px ${page.origin.y * k - scrollY}px` : page.origin ?? '50% 50%';

  if (opacity === 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform: `scale(${scale})`, transformOrigin: origin }}>
      <div style={{ position: 'absolute', top: 0, left, width: imageWidth, height: imageHeight, transform: `translateY(${-scrollY}px)` }}>
        <Img src={staticFile(`screens/${page.screen}.png`)} style={{ width: imageWidth, height: imageHeight, display: 'block' }} />
        {page.typing && <TypedText typing={page.typing} k={k} />}
        {page.click && <ClickCursor click={page.click} k={k} />}
      </div>
    </div>
  );
};
