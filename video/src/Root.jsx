import './fonts';
import { Composition, Still } from 'remotion';
import { DURATION, PulseCareDemo } from './PulseCareDemo';
import { PulseCarePoster } from './poster/Poster';

export const RemotionRoot = () => (
  <>
    <Composition id="PulseCareDemo" component={PulseCareDemo} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
    <Still id="PulseCarePoster" component={PulseCarePoster} width={1920} height={1080} />
  </>
);
