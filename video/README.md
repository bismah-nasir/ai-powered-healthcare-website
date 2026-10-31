# PulseCare AI — Demo Video

A 60-second product video built with [Remotion](https://www.remotion.dev) (React for video). The rendered file is [`docs/demo/pulsecare-demo.mp4`](../docs/demo/pulsecare-demo.mp4).

## Commands

```bash
cd video
npm install
npm run studio   # preview and scrub the video in the browser
npm run render   # render to ../docs/demo/pulsecare-demo.mp4 (1920x1080, 30 fps)
npm run music    # regenerate public/music.wav
```

## How it is put together

| Path | What it holds |
| --- | --- |
| `src/PulseCareDemo.jsx` | The timeline: scene order, lengths and transitions |
| `src/scenes/` | The intro, feature scenes and closing card |
| `src/components/` | Browser window, captions, background, logo, and the typing / click animations (`Interactions.jsx`) |
| `src/hotspots.js` | Where form fields and buttons sit in the screenshots, so typed text and the cursor line up |
| `src/theme.js` | Brand colours (copied from `frontend/src/index.css`), live URL and screenshot sizes |
| `public/screens/` | Screenshots of the app, captured at 2x so zooms stay sharp |
| `scripts/compose-music.mjs` | Composes and synthesizes the background music |

Captions use the app's own fonts, **Outfit** (headings) and **Plus Jakarta Sans** (body), installed from npm so rendering works offline.

To change a caption, edit the scene in `src/scenes/Features.jsx`. To change timing, edit the `SCENES` list in `src/PulseCareDemo.jsx`; the total length updates automatically.

## Screenshots

The screens were captured with Playwright from the app running locally with the seed data (`npm run seed`) at a 1440px wide window and 2x pixel density. To update one, replace the PNG in `public/screens/` and, if its height changed, its size in `src/theme.js`. The Symptom Checker and booking screens are captured with empty text boxes (the video types the text), and their field and button positions, plus the cart's checkout button, are recorded in `src/hotspots.js`; recapture those screens and positions together. The Symptom Checker result is a real Gemini response from the live site.

## Music

`public/music.wav` is an original piano waltz written and synthesized by `scripts/compose-music.mjs`, so it has no licensing restrictions. To use a different track, replace `public/music.wav` (or change the file name in `src/PulseCareDemo.jsx`) with a file you have the rights to use.

## Licence note

Remotion is free for individuals and companies of up to three people. Larger companies need a [company licence](https://www.remotion.dev/license).
