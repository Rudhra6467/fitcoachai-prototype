# FitcoachAI — Audit handoff (prototype v0.9.2)

For: co-founder review and an AI-assisted audit (Claude). Date: October 27, 2026.

- **Live prototype:** https://rudhra6467.github.io/fitcoachai-prototype/ (add `?dev=1` for developer tools)
- **Repo:** https://github.com/Rudhra6467/fitcoachai-prototype (branch `main`)
- **Key docs in the repo:** `docs/CORE-PRODUCT-LOGICS.docx` (locked product logic), `docs/ONBOARDING-SPEC.md` / `.docx` (onboarding spec, PROPOSED except items marked APPROVED), `README.md` (changelog, credits), `RESEARCH-FLAGS.md` (every undecided number), `UX-AUDIT.md` (tap counts, Lighthouse before/after).

> This is a **draft prototype for reference only**. It is not medical advice and not the product. It exists so we can try the logic on a phone and decide things.

---

## 1. What FitcoachAI is

- **Vision:** a voice-guided home fitness coach that starts where the user really is and adapts in small, explained steps. It is built for real lives: shift workers, new parents, people returning after pregnancy, people with injuries, adaptive users, people with little or no equipment (onboarding spec §0.7).
- **Locked Core Product Logics doc:** `docs/CORE-PRODUCT-LOGICS.docx` is the source of truth for product logic. The prototype must stay within it. Anything it does not settle is a placeholder (see §4), never a locked choice.
- **iPhone-first.** The target product is native SwiftUI (spec header). This prototype is a web PWA tested for iPhone Safari and Home Screen use.
- **Everything on the device:** no accounts, no backend, and no LLM in the MVP. All logic is deterministic JavaScript, and data stays in the browser's localStorage.
- **Safety first:** when unsure, choose the cautious option. "Not sure" counts as "yes" on the health check, and missing data counts as unknown (spec §0.2). The fixed safety statements (spec §0.1; `SAFE` in `index.html` ~line 91: REF, DOC, STOP, PAIN, FOOD) are shown word for word and the engine never edits them.
- **Honest:** no promises about weight loss, pain relief or timelines. Food guidance stays general (spec §0.8).

## 2. What was built, version by version

From `README.md` → Changelog and `git log`:

| Version | Commit | What |
|---|---|---|
| v0.1 | `ffd63b7`, `eeacd31` | Onboarding, health check, body map, voice baseline, 2-week plan; 3D coach (three.js + a Mixamo-derived Xbot, replaced in v0.7.1) and muscle-map highlighter. |
| v0.2 | `6122bfc` | App after onboarding: Today, session player, adaptive engine, calibration, decision log, reminders, simulated Apple Health, developer day simulation, research flags. |
| v0.3 | (in `6122bfc`) | Integration review and polish; fixed a reload during Settings edits. |
| v0.4 | `4b04f34`, `3d23fc5` | Simpler: onboarding cut from 40 to 33 taps, bottom tabs, one-tap start, plain "what changed and why", weekly goal, UX audit. |
| v0.5 | `16f0e96` | Ready to try daily on iPhone: Stop button and spoken "stop" on every active screen; pause/resume after reload; installable offline PWA; iPhone fixes; backup restore; storage migration. |
| v0.5.2 | `a86441e` | iPhone hotfix: crash guard for a stale cached config.js, `?v=` cache-busting, buttons kept clear of Safari's floating toolbar. |
| v0.6.0 | `f814396` | Calibration phase: everyone starts at beginner level; data-driven "Getting to know you: X of 6 sessions" meter (no fixed day count); per-set timing; one-line reasons for ±1 changes; post-session check-in; Performance Score; plan built from calibration data; WebKit tests. |
| v0.7.0 | `06a729f`, `cbfc3aa` | A "Hard" session or "Low" energy makes the next session lighter (same level, slightly lower target, can be declined). "Change something" (swap / skip / shorten with a reason, counter-offer first). "Why this workout" line. Root-cause fixes for two WebKit bugs; three.js vendored for offline use; lazy 3D; Lighthouse accessibility 95 → 100. Schema 4. |
| v0.7.1 | `7fcb5b5` | 3D coach swapped to a CC0 Quaternius mannequin (366 KB, was the 2.93 MB Mixamo-derived Xbot). Idle animation only, as before. |
| v0.7.2 | `8958a16` | Polish: coach auto-framing, runtime palette tint, ground shadow, loading placeholder, fade-in, failure fallback, reduced motion; caption bar no longer hides Stop on iPhone SE; small layout fixes. Lighthouse numbers in UX-AUDIT.md. |
| v0.8.0 | `01d9eb7` | Sit-to-stand 3D demo (CC0 Quaternius `Sitting_Exit`/`Sitting_Enter` on a simple chair) on the intro and active screens of the 3 sit-to-stand steps. No other exercise has an honest CC0 clip, so they are listed as X9. Model 502 KB. |
| v0.9.0 | `5301692` | Decision Round 1 applied: 35 approved values moved to `FC_CONFIG.APPROVED`, 9 items deferred; placeholder labels removed; R12 +15 s rest button; R25 repeat-skip note; OQ-18 health copy; OQ-1a interim C-section line; `R21-placeholder` → `R21` migration. |
| v0.9.1 | `2235d65` | Pre-native review (`docs/PRE-NATIVE-REVIEW.md`): doc drift fixed (retired 7-day floor, test lists, stale placeholder sections), Health screen shows only the approved read types, "Delete my data" button matches the privacy copy, removed/updated body areas kept in `bodyAreaHistory`. Decision Round 2 opened for the product conflicts with the locked doc. |
| v0.9.2 | (this release) | Decision Round 2 applied: amendments A1–A5 to the locked doc (`docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md`); ability summary; "Something else" counter-offer after calibration; accept note; Easier/Harder ±1 during calibration (`js/v092.js`). |

## 3. How it was built

### Process
1. **Design round first.** Each milestone was proposed in writing and approved by the founder before any code was written.
2. **Research flags, not locked choices.** Any number or rule not settled by the locked doc goes into config as a labelled placeholder (`FC_CONFIG.RESEARCH_NEEDED`), gets an entry in `RESEARCH-FLAGS.md`, and is marked "placeholder" in the UI.
3. **Integration review and polish each milestone:** a full flow walk-through, copy pass, tap counts (`tests/audit.js`), Lighthouse, and every test suite on Chromium and WebKit before pushing.
4. **Constraints held each time:** no LLM, append-only event log, safety wording unchanged, honest copy, permissive licenses only, no features beyond the approved list.

### Architecture
- A vanilla JS PWA with no build step. Classic scripts share globals and load in this order: inline script in `index.html` (onboarding, health check, baseline, storage, migration) → `js/config.js` → `js/engine.js` → `js/app.js` → `js/v05.js` → `js/v06.js` → `js/v07.js`.
- Later version files are **override layers**: they wrap or replace earlier functions and screens (`SC.<screen>`). `js/v07.js` runs the boot and the first full render. Some v0.6 overrides were folded back into the base files in v0.7.
- `js/engine.js` is **pure**: no clock, no randomness, and no DOM (checked by `tests/inv.js`). It also loads in Node.
- `sw.js` is a same-origin service worker with a versioned cache (`fcai-v0.9.2`) that precaches the app, three.js and the 3D model.

### File map
| Path | Role |
|---|---|
| `index.html` | UI shell, CSS, `SAFE` wording, storage keys and `migrateState`, onboarding S1–S14, health check, body map, baseline tests (`variantFor`), readiness, plan builder, 3D coach |
| `js/config.js` | `FC_CONFIG.APPROVED` and `FC_CONFIG.RESEARCH_NEEDED` (every placeholder, labelled R-numbers) |
| `js/engine.js` | Adaptation engine: `init`, `prescribe`, `applySession`, `tighten`, `calibration`, `tier`, `tolerance`, `score`, `perfScore`; decision codes with plain messages (`MSG`) |
| `js/app.js` | Today, check-in and triage, session player, rest day, Learned, Settings, reminders, simulated Health, dev tools |
| `js/v05.js` | Stop everywhere, pause/resume, PWA/update bar, backup export/restore, iPhone fixes |
| `js/v06.js` | Calibration phase, set timing, post-session check-in, reason lines, Performance Score screen, plan-ready |
| `js/v07.js` | Lighter next session, modification path, "Why this workout", migrated-user note, boot |
| `sw.js`, `manifest.json`, `icons/` | PWA |
| `assets/coach-mannequin.glb` | 3D mannequin (Quaternius, CC0): idle loop, plus stand-up/sit-down clips for the sit-to-stand demo |
| `vendor/three/`, `vendor/rich-body-highlighter/` | Vendored MIT libraries with their LICENSE files |
| `tests/` | Playwright scripts (see below) |
| `RESEARCH-FLAGS.md`, `UX-AUDIT.md`, `README.md`, `docs/` | Documentation |

### Data model and migrations
- `localStorage` key `fcai_proto_state_v1` holds the state `S` (screen, history, and `S.p` = profile, plan, engine state `eng`, sessions, check-ins, calibration `calib`, `ease`, `mods`).
- `fcai_proto_log_v1` holds the append-only event log (UTC ISO timestamps plus device time zone). Simulated events are tagged.
- `migrateState()` (`index.html` ~line 120) fills missing fields and never deletes data. Schemas so far: 1 (v0.1–v0.4, no version field), 2 (v0.5), 3 (v0.6: calibration state), 4 (v0.7: `ease`, `mods`). It logs `storage_migrated`. If old data already meets calibration on upgrade, it logs `calibration_complete_from_history` and the user sees an honest note.
- Settings → Export saves the full state plus the log as JSON. Restore validates the file before loading.

### Engine rules (see `js/engine.js` `applySession`, ~lines 67–117, and the `MSG` table)
- Each movement pattern (squat, push, hinge, core, balance, cardio) has its own level on a 4-step ladder, with readiness tracked per pattern.
- Double progression: reps rise within a range, then a level step-up that must hold up the next time (`STEP_VERIFIED` / `STEP_VERIFY_FAIL_REVERT`).
- Levels move by at most ±1. There is an anti-thrash minimum gap between changes (R5).
- **One bad day never lowers a level** (`BAD_DAY_RETAIN`). Only repeated hard sessions revise volume, then level (`REVISE_VOLUME`, `REVISE_LEVEL_DOWN`, R4).
- **Pain:** the pattern stops and goes on hold (`PAIN_STOP_PATTERN`). The injury gate returns it one step only after 3 pain-free sessions over 7 or more days (`INJURY_GATE_STEP`), and there is no instant clearance.
- **Gentle mode** caps levels (`GENTLE_CAP`, R7) and uses gentler ranges.
- Short (`TRIAGE_NO_PROGRESS`), lighter (`EASED_HOLD`, v0.7) and swapped (`SWAPPED`, v0.7) sessions never move a level.
- Calibration ends on data quality, never on time (R19).

### Tests and how to run them
```
python3 -m http.server 8765            # in the repo root
npm i -g playwright-core               # tests use playwright-core + system Chrome (/usr/bin/google-chrome)
export NODE_PATH=$(npm root -g)
node tests/v07.js http://localhost:8765/
BROWSER=webkit node tests/v07.js http://localhost:8765/   # WebKit; WEBKIT_PATH overrides the binary (tests/launch.js)
```
Suites: `inv.js` (engine invariants), `test.js` (onboarding and safety stops), `ui.js` (14 simulated days), `audit.js` (tap counts), `v05.js` (Stop, resume, offline, backup, migration), `v080.js` (sit-to-stand demo), `v090.js` (Decision Round 1), `v091.js` (pre-native fixes), `v092.js` (Decision Round 2), `v06.js` (calibration), `v07.js` (lighter session, modification, why line, schema 4), `v072.js` (3D coach reduced motion / fit / fallback, caption bar vs Stop). At v0.9.2 all 12 suites pass on Chromium and WebKit (see README for the runner).

### Developer tools (`?dev=1`)
On Today: **+1 day / +7 days** (moves the app clock), **Auto-play 14 days** (synthetic workouts), **Auto-play 6 sessions** (clean or messy calibration), **Real date**, and **Fast timers**. Tap the version line in Settings for more. Simulated data is tagged in the log.

## 4. The plan ahead

### Still open after Decision Round 1 (`RESEARCH-FLAGS.md`, `docs/DECISION-ROUND-1.md`)
- **Deferred (9):** X6 injury-map physio review; X9 demo animation budget; R24 experience → tone; OQ-1a pelvic-floor physio review (interim C-section line shipped); OQ-5 legal/clinical wording review; OQ-15 regulatory review; OQ-11 backups (native build); OQ-12 first name (pilot); OQ-16 screen count (user testing).
- **Approved but needing review before launch:** R7, OQ-17 (physio); R11, X2 (clinical); X8 (design); R17 (pilot comparison); OQ-13 (pilot measurement).
- **Decision Round 2** (`docs/PRE-NATIVE-REVIEW.md`): all approved on 2026-10-27. The amendments to the locked doc are in `docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md`, and the deferred parts are in RESEARCH-FLAGS (D2-2b, D2-4 legal, D2-6b/c, D2-9, D2-10b).

### Next steps
- **Native SwiftUI app.** The prototype logic (engine, config, copy) is the reference to port. The web-specific parts (service worker, Safari workarounds, localStorage) do not carry over.
- **Real-iPhone testing.** All automated testing so far is Playwright Chromium and WebKit; nothing is verified on a physical iPhone. Check voice, audio unlock, wake lock, Home Screen storage, the offline update flow and 3D performance.
- **Expert review** of placeholders and safety: coach / sports science, physio (including pelvic floor), clinical and legal.

## 5. What to look for — prioritised audit checklist

**P0 — Safety**
1. The `SAFE` statements in `index.html` are word for word with spec §0.1 and appear wherever the spec requires them (health-check stops, pain, during sessions, food).
2. Health-check logic: "not sure" counts as yes; stop screens for under 18, chest pain, fainting, pregnancy and the other spec stops (`tests/test.js` covers four).
3. A Stop button and spoken "stop" on every active exercise screen; sharp pain ends the session.
4. Pain paths (check-in, during the set, post-session, modification reason "pain", in-session skip with pain) all put the pattern on hold and never swap a painful movement for another.
5. Postpartum and gentle-mode rules match the spec and the locked doc.

**P0 — Engine invariants** (`js/engine.js`, `tests/inv.js`)
6. A level never changes by more than 1 per session; one bad day never lowers a level; the injury gate requires 3 pain-free sessions over at least 7 days, with no instant clearance; gentle-mode caps hold; short, lighter and swapped sessions never move a level; the engine is pure.

**P1 — Conformance with the locked doc**
7. Compare `docs/CORE-PRODUCT-LOGICS.docx` and the APPROVED items against what the code does. Read it together with the approved amendments in `docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md` (A1–A5).

**P1 — Data integrity**
8. `migrateState` handles schemas 1→4 without losing data; the event log is append-only; export and restore round-trip correctly; reload or resume mid-workout and mid-check-in works.

**P1 — Privacy**
9. No network calls with user data. The only network use should be loading the app's own files (now same-origin). No analytics. The S2 privacy copy matches the behaviour.

**P1 — Honest copy**
10. No outcome or timeline promises; plain language (grade 6–8, no jargon); no stale "placeholder" labels for approved values; food guidance general only.

**P2 — Licenses**
11. three.js (MIT), rich-body-highlighter (MIT) and coach-mannequin.glb (Quaternius, CC0, see README credits). Check that no other assets lack a license.

**P2 — Accessibility**
12. Tap targets of at least 44 px, contrast, labels and roles on chip groups, screen-reader flow. Lighthouse accessibility is 100 at v0.7.0.

**P2 — iOS Safari behaviour**
13. Safe areas, the floating toolbar, 16 px inputs, speech (synthesis and recognition availability), the service worker update bar, and Home Screen storage separate from Safari.

**P2 — Test coverage gaps**
14. Known gaps: no real-device tests; speech recognition is faked in tests; not every spec stop path or region-to-pattern mapping is covered; 3D is checked only for render and offline; no fuzzing of imported backups beyond the basic invalid cases.

**Known uncertainties (from the v0.6 and v0.7 reports)**
- Lighter sessions do not count towards finishing calibration, so it can take slightly longer (R23).
- Pain during a modification puts the movement on hold. That is consistent with the check-in pain rule, but it has had no clinical review.
- Lighthouse performance is about 71 because the 3D coach dominates blocking time in headless Chrome. Real iPhone performance is unmeasured.
- R1–R26 and X1–X9 were approved by the owner in Decision Round 1 (27 Oct 2026) without external expert validation; the pre-launch reviews listed in §4 are still required.
- Override layering (`v05` → `v07`) makes the call order non-obvious. It is a refactor candidate before porting.

## 6. Prompt for Claude (paste as is)

```
You are auditing FitcoachAI, a draft fitness-coaching prototype (reference only, not medical advice).

1. Clone https://github.com/Rudhra6467/fitcoachai-prototype (branch main).
2. Read, in order: docs/AUDIT-HANDOFF.md, docs/CORE-PRODUCT-LOGICS.docx (the locked product logic),
   docs/ONBOARDING-SPEC.md, README.md, RESEARCH-FLAGS.md, UX-AUDIT.md.
3. Read the code: index.html, js/config.js, js/engine.js, js/app.js, js/v05.js, js/v06.js, js/v07.js, sw.js, tests/.
   Scripts load in that order, and later files override earlier functions.
4. Audit against the checklist in docs/AUDIT-HANDOFF.md section 5, in priority order (P0 first).
   For each item give: PASS / ISSUE / UNSURE, the evidence with file:line references, and for an ISSUE
   the severity (critical/high/medium/low) and a concrete fix.
5. Check conformance with CORE-PRODUCT-LOGICS.docx and the APPROVED items in the onboarding spec: list any rule
   the code hard-codes that the doc does not settle (it should be a labelled placeholder), and any
   place the code contradicts the doc.
6. Check that the safety statements (SAFE in index.html) match the spec's section 0.1 word for word.
7. Optionally run the tests (see AUDIT-HANDOFF section 3) and report the results.
Rules: do not invent behaviour. Quote the code. If something can't be determined from the repo, say UNSURE
and what would settle it. End with a top-10 list of the most important findings.
```
