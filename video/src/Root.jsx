import './fonts';
import { Composition } from 'remotion';
import { DURATION, PulseCareDemo } from './PulseCareDemo';

export const RemotionRoot = () => (
  <Composition id="PulseCareDemo" component={PulseCareDemo} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
