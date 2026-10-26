# FitcoachAI — onboarding & baseline (draft prototype)

> ⚠ **Draft prototype, reference only. Not medical advice.** Not a finished product; nothing here tells you whether exercise is safe for you — check with your doctor.

Single-file, mobile-first web prototype of the FitcoachAI onboarding flow, health check, injury body map, voice-guided baseline check-in, and 2-week starter plan.

**Try it:** https://rudhra6467.github.io/fitcoachai-prototype/ (open in Safari/Chrome; voice control needs mic permission and works best in Chrome; buttons always work).

All data stays in your browser's localStorage. Use the **Reset** button in the banner to clear it.

## What's in the prototype
- Onboarding (S1–S14), health check with stop/pause screens, injury body map, voice-guided baseline check-in, results, and a 2-week starter plan.
- **3D coach mannequin** on the welcome screen (three.js, drag to rotate, idle animation). Loaded lazily; if WebGL or the model can't load, a short message is shown instead.
- **Muscle map** (front/back) showing the muscles each check-in test works, and the muscles near the areas marked on the injury body map.

## Credits & licenses
- **three.js** r170 (MIT) — loaded from jsDelivr (`three@0.170.0`), including `GLTFLoader` and `OrbitControls` examples. https://github.com/mrdoob/three.js
- **assets/Xbot.glb** — copied from the three.js examples (`examples/models/gltf/Xbot.glb`). This model is **Mixamo-derived** (Adobe); it is used here for prototyping only and **must be replaced with a CC0 / properly licensed model before any production use**.
- **js-rich-body-highlighter** v0.1.1 by crmapache (MIT) — vendored in `vendor/rich-body-highlighter/` (built ESM files + body images) with its original `LICENSE`. https://github.com/crmapache/js-rich-body-highlighter
