// The app's fonts, bundled from npm so rendering works offline.
// Rendering waits until every weight is loaded, so no frame is drawn with a fallback font.
import { continueRender, delayRender } from 'remotion';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';

const handle = delayRender('Loading fonts');

Promise.all(
  [
    '400 32px Outfit',
    '600 32px Outfit',
    '700 32px Outfit',
    '800 32px Outfit',
    '400 32px "Plus Jakarta Sans"',
    '500 32px "Plus Jakarta Sans"',
    '600 32px "Plus Jakarta Sans"',
    '700 32px "Plus Jakarta Sans"',
  ].map((font) => document.fonts.load(font))
).then(() => continueRender(handle));
