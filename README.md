# FitcoachAI — onboarding & baseline (draft prototype)

> ⚠ **Draft prototype, reference only. Not medical advice.** Not a finished product; nothing here tells you whether exercise is safe for you — check with your doctor.

Single-file, mobile-first web prototype of the FitcoachAI onboarding flow, health check, injury body map, voice-guided baseline check-in, and 2-week starter plan.

**Try it:** https://rudhra6467.github.io/fitcoachai-prototype/ (open in Safari/Chrome; voice control needs mic permission and works best in Chrome; buttons always work).

All data stays in your browser's localStorage. Use **Settings → Reset everything** to clear it.

## What's in the prototype
- Onboarding (S1–S14), health check with stop/pause screens, injury body map, voice-guided baseline check-in, results, and a 2-week starter plan.
- **3D coach mannequin** on the welcome screen (three.js, drag to rotate, idle animation). Loaded lazily; if WebGL or the model can't load, a short message is shown instead.
- **Muscle map** (front/back) showing the muscles each check-in test works, and the muscles near the areas marked on the injury body map.

## Install on iPhone
Open the site in **Safari** → Share → **Add to Home Screen**. It runs full screen and works offline after the first visit (a service worker caches the app, the 3D model and three.js). When a new version is published, a "A new version is ready — Update" bar appears.

## Your data
Everything stays in this browser's localStorage (schema version 2; older prototype data is migrated automatically). **Settings → Export my data** saves a JSON backup; **Settings → Restore from a backup** checks and loads one. Note that the Home Screen app on iPhone has storage separate from Safari — use export/restore to move data.

## Tests
`tests/` holds Playwright scripts (`node tests/<name>.js <url>`): `inv.js` (engine invariants), `test.js` (onboarding/safety), `ui.js` (14 simulated days), `audit.js` (tap counts), `v05.js` (Stop everywhere, resume after reload, offline, backup round-trip, migration, iOS hint).

## Changelog
- **v0.5.2** — iPhone hotfix: app no longer crashes ("Something went wrong") when Safari serves a stale v0.4 config.js (safe defaults + ?v= cache-busting on scripts); buttons and tab bar kept clear of Safari's floating bottom toolbar (svh/dvh heights, extra bottom padding, overlays never intercept taps); SW cache fcai-v0.5.2.
- **v0.5 — Ready to try daily on iPhone (2026-10-26):** Stop button + spoken "stop" on every active-exercise screen, with the verbatim stop wording; pause on backgrounding and resume after a reload, for workouts and the check-in; installable PWA (manifest, PNG icons, iOS meta tags, Add to Home Screen hint, offline service worker with a versioned cache and update prompt); safe areas, 16 px inputs, wake lock, audio unlock; backup restore with validation; versioned storage with migration; onboarding defaults moved into the config as placeholder R18.
- **v0.4 — Simpler (2026-10-26):** shorter onboarding (40→33 taps), bottom tabs, one-tap start, plain "what changed and why", weekly goal, UX audit.
- **v0.3:** integration review and polish; reload during Settings edits fixed.
- **v0.2:** post-onboarding app — Today, session player, adaptive engine, calibration, decision log, reminders, simulated Apple Health, developer day simulation.
- **v0.1:** onboarding, health check, body map, voice baseline, 2-week plan, 3D coach, muscle map.

## Credits & licenses
- **three.js** r170 (MIT) — loaded from jsDelivr (`three@0.170.0`), including `GLTFLoader` and `OrbitControls` examples. https://github.com/mrdoob/three.js
- **assets/Xbot.glb** — copied from the three.js examples (`examples/models/gltf/Xbot.glb`). This model is **Mixamo-derived** (Adobe); it is used here for prototyping only and **must be replaced with a CC0 / properly licensed model before any production use**.
- **js-rich-body-highlighter** v0.1.1 by crmapache (MIT) — vendored in `vendor/rich-body-highlighter/` (built ESM files + body images) with its original `LICENSE`. https://github.com/crmapache/js-rich-body-highlighter
