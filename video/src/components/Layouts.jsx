import { AbsoluteFill } from 'remotion';
import { Background } from './Background';
import { BrowserFrame } from './BrowserFrame';
import { Caption } from './Caption';

const SIDE_MARGIN = 110;
const BROWSER = { width: 1100, height: 840 };

// Caption beside the browser window. side: which side the caption sits on.
export const SplitScene = ({ side = 'left', caption, pages }) => (
  <AbsoluteFill>
    <Background />
    <AbsoluteFill
      style={{
        flexDirection: side === 'left' ? 'row' : 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${SIDE_MARGIN}px`,
      }}
    >
      <Caption width={540} {...caption} />
      {/* Window enters turned slightly towards the caption, then settles flat */}
      <BrowserFrame pages={pages} {...BROWSER} enterDelay={4} tilt={side === 'left' ? 12 : -12} />
    </AbsoluteFill>
  </AbsoluteFill>
);

// Caption centred above the browser window(s)
export const StackedScene = ({ caption, children }) => (
  <AbsoluteFill>
    <Background />
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 64 }}>
      <Caption width={1500} align="center" {...caption} />
      <div style={{ marginTop: 44, display: 'flex', gap: 50 }}>{children}</div>
    </AbsoluteFill>
  </AbsoluteFill>
);
