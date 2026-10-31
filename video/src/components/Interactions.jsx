import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, fonts } from '../theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// Positions are in CSS px of the 1440px layout (see hotspots.js); k converts them to on-screen px.

// When each character appears (seconds after typing starts): uneven gaps and short pauses after
// spaces and punctuation, so it reads like a person typing rather than a ticker
const keystrokeTimes = (text, cps) => {
  const times = [];
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    const jitter = 0.6 + ((text.charCodeAt(i) * 37 + i * 11) % 10) / 12;
    t += jitter / cps;
    if (text[i - 1] === ',' || text[i - 1] === '.') t += 0.18;
    else if (text[i - 1] === ' ') t += 0.03;
    times.push(t);
  }
  return times;
};

// Text appearing in a form field, with a focus ring and a blinking caret.
// typing: { field, text, start, cps, until } — `until` is when the field loses focus (e.g. a click elsewhere).
export const TypedText = ({ typing, k }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { field, text, start, cps = 22, until = Infinity } = typing;
  const times = keystrokeTimes(text, cps);
  const elapsed = (frame - start) / fps;
  const count = times.filter((t) => t <= elapsed).length;
  const doneAt = start + times[times.length - 1] * fps;

  const focusIn = interpolate(frame, [start - 12, start - 4], [0, 1], clamp);
  const focus = frame < until ? focusIn : 0;
  const typingNow = frame >= start && frame < doneAt + 4;
  const caretOn = focus > 0 && (typingNow || Math.floor(frame / 15) % 2 === 0);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: field.x * k,
          top: field.y * k,
          width: field.w * k,
          height: field.h * k,
          borderRadius: 12 * k,
          boxShadow: `0 0 0 ${1.5 * k}px ${colors.primary}, 0 0 0 ${5 * k}px hsla(174, 75%, 38%, 0.15)`,
          opacity: focus,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: (field.x + field.padLeft) * k,
          top: (field.y + field.padTop) * k,
          width: (field.w - field.padLeft - field.padRight) * k,
          fontFamily: fonts.body,
          fontSize: field.fontSize * k,
          lineHeight: `${field.lineHeight * k}px`,
          color: field.color,
          whiteSpace: 'pre-wrap',
        }}
      >
        {text.slice(0, count)}
        <span
          style={{
            display: 'inline-block',
            width: Math.max(1.5, 1.4 * k),
            height: field.lineHeight * 0.8 * k,
            marginLeft: 1,
            verticalAlign: 'text-bottom',
            background: colors.text,
            opacity: caretOn ? 1 : 0,
          }}
        />
      </div>
    </>
  );
};

// A mouse pointer gliding to a button and clicking it (press, button shade and ripple).
// click: { target, start, at, from } — moves from `from` (defaults to below-right of the target) between
// `start` and `at`, clicks at `at`, then fades out.
export const ClickCursor = ({ click, k }) => {
  const frame = useCurrentFrame();
  const { target, start, at } = click;
  const tx = target.x + target.w / 2;
  const ty = target.y + target.h / 2;
  const from = click.from ?? { x: tx + 260, y: ty + 170 };

  const travel = interpolate(frame, [start, at - 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const x = from.x + (tx - from.x) * travel;
  const y = from.y + (ty - from.y) * travel;
  const visible = interpolate(frame, [start - 6, start, at + 18, at + 28], [0, 1, 1, 0], clamp);
  const press = interpolate(frame, [at, at + 3, at + 8], [1, 0.82, 1], clamp);
  const shade = interpolate(frame, [at, at + 2, at + 10], [0, 1, 0], clamp);
  const ripple = interpolate(frame, [at, at + 20], [0, 1], clamp);

  if (visible === 0 && shade === 0) return null;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: target.x * k,
          top: target.y * k,
          width: target.w * k,
          height: target.h * k,
          borderRadius: 12 * k,
          background: 'rgba(0, 40, 35, 0.18)',
          opacity: shade,
        }}
      />
      {frame >= at && (
        <div
          style={{
            position: 'absolute',
            left: tx * k,
            top: ty * k,
            width: 90 * k,
            height: 90 * k,
            marginLeft: -45 * k,
            marginTop: -45 * k,
            borderRadius: '50%',
            border: `${3 * k}px solid rgba(255, 255, 255, 0.9)`,
            background: 'rgba(255, 255, 255, 0.25)',
            transform: `scale(${0.2 + ripple * 0.9})`,
            opacity: 1 - ripple,
          }}
        />
      )}
      <svg
        width={40}
        height={40}
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: x * k,
          top: y * k,
          marginLeft: -7,
          marginTop: -4,
          opacity: visible,
          transform: `scale(${press})`,
          transformOrigin: '7px 4px',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
          overflow: 'visible',
        }}
      >
        <path d="M5 3l14 8.2-6.3 1.4 3.6 6.9-2.8 1.4-3.6-6.9L5 18.5z" fill="#111827" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </>
  );
};
