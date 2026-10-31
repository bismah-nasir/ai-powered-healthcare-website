import { AbsoluteFill, Audio, Easing, staticFile } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { Intro } from './scenes/Intro';
import { Admin, Doctors, Home, LabsEmergency, Pharmacy, SymptomChecker } from './scenes/Features';
import { Outro } from './scenes/Outro';

const TRANSITION = 20;

// Scene lengths in frames (30 fps) and how each scene enters. Each transition overlaps two scenes, so the
// video is sum(SCENES) - TRANSITION * (SCENES.length - 1) = 1940 - 140 = 1800 frames (60 seconds).
const SCENES = [
  [Intro, 150],
  [Home, 220, fade()],
  [Doctors, 285, slide({ direction: 'from-right' })],
  [SymptomChecker, 260, slide({ direction: 'from-right' })],
  [Pharmacy, 320, slide({ direction: 'from-right' })],
  [LabsEmergency, 200, slide({ direction: 'from-bottom' })],
  [Admin, 240, slide({ direction: 'from-right' })],
  [Outro, 265, fade()],
];

export const DURATION = SCENES.reduce((sum, [, frames]) => sum + frames, 0) - TRANSITION * (SCENES.length - 1);

const timing = linearTiming({ durationInFrames: TRANSITION, easing: Easing.inOut(Easing.cubic) });

export const PulseCareDemo = () => (
  <AbsoluteFill style={{ background: '#ffffff' }}>
    <TransitionSeries>
      {SCENES.flatMap(([Scene, frames, presentation], i) => [
        i > 0 && <TransitionSeries.Transition key={`t${i}`} presentation={presentation} timing={timing} />,
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={frames}>
          <Scene />
        </TransitionSeries.Sequence>,
      ]).filter(Boolean)}
    </TransitionSeries>
    {/* Original piano piece from scripts/compose-music.mjs; fades are baked into the file */}
    <Audio src={staticFile('music.wav')} volume={0.55} />
  </AbsoluteFill>
);
