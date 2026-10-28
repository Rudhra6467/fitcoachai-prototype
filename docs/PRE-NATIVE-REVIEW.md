# FitcoachAI — Pre-native review

Prototype v0.9.1, decisions applied in v0.9.2 · 27 Oct 2026 · Reviewed against v0.9.0 (`5301692`). Draft prototype, reference only — not medical advice.

## Summary

Everything was cross-checked against everything else: the locked `docs/CORE-PRODUCT-LOGICS.docx` (read in full), ONBOARDING-SPEC, DECISION-ROUND-1, RESEARCH-FLAGS, AUDIT-HANDOFF, README, `js/config.js` and what the code actually does.

- **22 findings.** **12 fixed** in v0.9.1 (doc drift, small bugs, copy that didn't match the app). **10 need a decision** (Decision Round 2 below). These are real conflicts between the locked doc and the prototype, so nothing was decided here.
- **Safety:** no safety issue found. Safety wording is unchanged. Pain is never swapped, and the injury gate, ±1 rule and "one bad day never lowers a level" hold, as the tests confirm.
- **Biggest gaps vs the locked doc:** no single Ability Score (the prototype tracks a level for each movement); one composed session instead of "15 home workouts"; "Other" reasons are always accepted, so "pure laziness is blocked" isn't true yet; no "can't take responsibility" note on risky accepts; Apple Health signals narrower than the doc's list; and users can delete their data, which contradicts "never deletes".
- **Already consistent:** calibration is data-driven, not time-driven, in the code (only the docs still mentioned the old 7-day floor). The Performance Score is shown after every completed session. A reason is required after calibration. Changes are limited to ±1 level.

## Findings

| ID | Area | Finding | Severity | Status |
|---|---|---|---|---|
| F1 | Docs / calibration | RESEARCH-FLAGS listed "a 7-day calibration floor" as approved. The code retired it in v0.6, and the locked doc §3 says "never time-driven". | Medium | Fixed |
| F2 | Docs / calibration | ONBOARDING-SPEC §4 was titled "7-day calibration" and said "at day 7…" and "for the first 7 days". | Medium | Fixed (now data-driven wording) |
| F3 | Docs / tests | The README test list was broken: `v090.js` was inserted inside the `v080.js` description. | Low | Fixed |
| F4 | Docs / tests | AUDIT-HANDOFF listed `v090.js` with no description, and its pass counts were from v0.7.0. | Low | Fixed; `v091.js` now checks that both docs list every suite |
| F5 | Docs | The AUDIT-HANDOFF version table was out of order (v0.9.0 and v0.8.0 above v0.7.0), and the v0.9.0 row had no commit. | Low | Fixed |
| F6 | Docs | AUDIT-HANDOFF §4 "Open placeholders" still listed R1–R26 as open after Decision Round 1. The "11 open questions" section and the checklist line "placeholder labels visible" were also stale. | Medium | Fixed |
| F7 | Docs | The DECISION-ROUND-1 reason for deferring R24 said the experience answer is "unused for tone". It still sets the tone line. | Low | Fixed |
| F8 | Apple Health | The simulated Health screen still showed a Steps column after OQ-18 approved only sleep and workouts. | Medium | Fixed: columns now come from `healthReadTypes` and steps are removed |
| F9 | Privacy copy | The privacy screen says "Settings → Delete my data", but the button was labelled "Reset everything". | Low | Fixed: button renamed (`#deleteData`) |
| F10 | Data retention | Removing or editing a body area deleted the old record from the profile (only the event log kept it). Locked doc §5/§7: historical data is never deleted. | Medium | Fixed: kept in `bodyAreaHistory` with `archivedAt`/`archivedWhy` |
| F11 | Config | 6 config keys are never read: `badDayLowersLevel`, `maxLevelChangePerStep`, `startEveryoneAsBeginner`, `streakUnit`, `healthReadTypes`, and R8 `calibrationObsPerPattern`. | Low | Fixed: `healthReadTypes` now drives the Health screen. The others are commented in config.js as rules enforced in code and asserted by tests |
| F12 | Config | `js/v06.js` keeps its own copy of some config values as a fallback for stale caches (v0.5.2 hotfix). They match today, but could drift. | Low | Fixed for now (checked equal); the native app should drop these copies |
| F13 | Locked doc §2/§4 | There is no single "Ability Score". Difficulty is a separate ladder level for each of 6 movements. | High | Decided: approved (D2-1, A1) |
| F14 | Locked doc §1/§10 | The doc says the Composer picks from "15 home workouts". The library is 6 movements × 4 steps = 24 exercises plus 6 seated versions, put together into a few session types (Strength, Light cardio + balance, Mobility & core, Light day). | High | Decided: approved (D2-2, A2) |
| F15 | Locked doc §5 | "Pure laziness is blocked": after calibration a reason is required, but "Something else" is always accepted straight away, with no counter-offer. | High | Decided: approved, shipped v0.9.2 |
| F16 | Locked doc §5 | "When accepting a change that carries risk, the system must clearly state it cannot take responsibility." The only note is "It just won't move up until you do it." | Medium | Decided: approved, shipped v0.9.2 (legal review deferred) |
| F17 | Locked doc §4 | "During early calibration intensity may be changed freely (±1)." Users have no easier/harder control, only swap, skip or a shorter session. | Medium | Decided: approved, shipped v0.9.2 |
| F18 | Locked doc §6 vs OQ-18 | The doc lists sleep, HRV, resting heart rate and recent load. OQ-18 approved sleep and workouts, and the engine uses only sleep (workouts are shown but unused). | Medium | Decided: approved (A3); HRV/RHR deferred |
| F19 | Locked doc §7 vs privacy | "The system never deletes user input", but Settings → Delete my data wipes everything (the S2 privacy promise, GDPR). | Medium | Decided: approved (A4) |
| F20 | Locked doc §7 | "Every decision must consider the full history." The engine rules use defined windows (last 2–4 sessions, 14 days, last 3 for tolerance). All history is kept, but it isn't all used. | Low | Decided: approved (A5) |
| F21 | Locked doc §8 | The 7 engines aren't separate modules. Score, Adaptation and Calibration are in `engine.js`; Constraint is in `index.html`/`tighten`; Modification in `v07.js`; Composer in `index.html buildPlan/exFor`; Readiness in check-in triage; Explanation in `MSG`/`reasonLine`. Later files also override earlier ones (v05 → v07). | Medium | Decided: approved for native |
| F22 | Signals §6 | Modification patterns and reasons are logged but only feed the R25 repeat-skip note. They don't affect adaptation. | Low | Decided: approved (V1 as is); B deferred |

Counts: **22 found · 12 fixed · 10 needed a decision**, all decided 2026-10-27 (see Decision round 2). UX dead-end check: every screen reached in the suites has a way back to Today or Settings. None found.

## Decision round 2

**Outcome (2026-10-27):** the user approved every recommendation ("Go with your best recommendations"). Five changes to the locked doc are recorded as amendments A1–A5 in `docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md`; the locked docx is untouched. D2-3, D2-4 and D2-5 shipped in v0.9.2. These parts are deferred: D2-2b, D2-4 legal wording, D2-6b and D2-10b.

Same format as Round 1. P1 = decide before the native build.

### D2-1. Ability Score (F13, P1)
- **Locked doc:** one user Ability Score controls difficulty centrally.
- **Prototype:** separate levels for each movement (squat, push, hinge, core, balance, cardio). Each moves ±1, with its own injury gate.
- **Options:** (A) Amend the doc: "Ability Score = a profile of levels, one per movement". (B) Add one 0–100 summary for display only, derived from those levels. (C) Make difficulty truly one number.
- **Recommendation:** A + B. Keep the per-movement levels as the source of truth and show a summary.
- **Why:** a knee problem shouldn't lower push-ups. Separate levels give better difficulty accuracy, which the doc calls non-negotiable.
- **Risk if wrong:** C makes difficulty less accurate. With B alone, the doc and the code still disagree.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A + B. Recorded as amendment **A1** in `CORE-PRODUCT-LOGICS-AMENDMENTS.md`. The summary card ("Ability: x of 4", display only) shipped in v0.9.2.

### D2-2. "15 home workouts" (F14, P1)
- **Options:** (A) Amend the doc to "6 movement ladders × 4 steps, composed into session types". (B) Write 15 named workout templates now, built from the ladders. (C) Treat 15 as the target size of the native library.
- **Recommendation:** A for V1, with B as a content task before launch if marketing needs named workouts.
- **Why:** the ladders are what make ±1 adaptation possible. Named templates can sit on top of them without changing the engine.
- **Risk if wrong:** the doc and the build stay out of step, and content scope is unclear for the native team.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A. Recorded as amendment **A2**. **DEFERRED:** B (15 named templates) is a pre-launch content task, because it isn't needed for the engine (RESEARCH-FLAGS D2-2b).

### D2-3. Blocking "pure laziness" (F15, P1)
- **Options:** (A) Keep as is: "Something else" is always accepted. (B) After calibration, "Something else" first gets a counter-offer (the short version), then an accept with an honest note. (C) After the R25 repeat note (3 skips in 14 days), only the counter-offer or the short version is offered.
- **Recommendation:** B. Never apply this to pain, and never fully block a skip.
- **Why:** it follows the doc's order (counter-propose → adjust → accept) and stays human. A hard block would push people to quit or to lie about the reason.
- **Risk if wrong:** A ignores the locked doc. C may feel punitive.
- **Decision:** **APPROVED** 2026-10-27 (user approval): B. Shipped in v0.9.2 (`modCounterOtherAfterCalibration:'short'`). The pain path is unchanged, and "No, skip it" is always available.

### D2-4. "Can't take responsibility" note (F16, P1)
- **Proposed copy:** "Okay, it's your call. I can't promise the same progress when parts of the plan are skipped." Shown on full accepts after calibration. Never shown on the pain path, where the existing SAFE-PAIN wording stays verbatim.
- **Options:** approve the copy / change the wording / send it to OQ-5 legal review.
- **Recommendation:** approve the copy for the prototype and add it to the OQ-5 legal review list.
- **Risk if wrong:** a note that sounds blaming. It needs a user test.
- **Decision:** **APPROVED** 2026-10-27 (user approval): copy approved for the prototype and shipped in v0.9.2 (`modAcceptNote`). **DEFERRED:** final wording waits for OQ-5 legal review.

### D2-5. Free intensity changes during calibration (F17, P2)
- **Options:** (A) Add "Easier / Harder" (±1 step for one movement) during calibration only. (B) Leave it to swap or skip, and amend the doc.
- **Recommendation:** A. Each change counts as data and is limited to ±1.
- **Why:** the doc asks for it, and it makes difficulty accurate sooner.
- **Risk if wrong:** noisier calibration data. Mitigation: treat changed sessions as their own observations.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A. Shipped in v0.9.2: Easier / Harder during calibration only, ±1, once per movement per day, never above the gentle cap, and logged as a user decision.

### D2-6. Apple Health signals (F18, P2)
- **Options:** (A) Keep OQ-18 (sleep and workouts) and amend the doc to "when available and used". (B) Add HRV and resting heart rate as readiness hints in native, with no effect on difficulty. (C) Read everything the doc lists from day one.
- **Recommendation:** A for V1, and B after a pilot shows they help. Use workouts as "recent load" in native, or stop reading them.
- **Why:** read only what the engine uses (privacy, App Store review). Wearable HRV data is noisy.
- **Risk if wrong:** reading data that isn't used fails privacy review. Reading too little gives weaker readiness.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A. Recorded as amendment **A3**. **DEFERRED:** B (HRV and resting heart rate) until after the pilot. Workouts become "recent load" in the native build (RESEARCH-FLAGS D2-6b).

### D2-7. "Never deletes" vs Delete my data (F19, P1)
- **Options:** (A) Amend the doc: "The system never deletes or forgets on its own; the user can always delete everything". (B) Remove the delete option.
- **Recommendation:** A.
- **Why:** the S2 privacy promise, GDPR Art. 17 and App Store rule 5.1.1(v) need user-initiated deletion.
- **Risk if wrong:** B is a legal and App Store blocker.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A. Recorded as amendment **A4**. No code change: Delete my data was already there, and archiving shipped in v0.9.1.

### D2-8. "Full history" vs windowed rules (F20, P3)
- **Recommendation:** amend the doc to "Full history is kept and available; each rule uses a defined, documented window." Keep the windows.
- **Why:** windows keep adaptation responsive and easy to explain.
- **Risk if wrong:** old data could drive today's difficulty in ways that are hard to explain.
- **Decision:** **APPROVED** 2026-10-27 (user approval). Recorded as amendment **A5**. The windows are kept.

### D2-9. Native structure: the 7 engines (F21, P1)
- **Options:** (A) In SwiftUI, build 7 modules exactly as in the doc's map, as pure functions over a single `UserHistory`, plus a Calibration module (8 in total). (B) Port the prototype's structure as it is.
- **Recommendation:** A. Delete the override layering and port the rules, not the files.
- **Risk if wrong:** B carries the order-of-overrides fragility into production.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A. Applies to the native build (see the checklist). The prototype's structure is not refactored.

### D2-10. Modification patterns as an adaptation signal (F22, P3)
- **Options:** (A) Keep them as logged data plus the R25 note in V1. (B) Let repeated non-pain skips of one movement suggest a permanent swap of its variant.
- **Recommendation:** A for V1, and B after the pilot.
- **Why:** there isn't enough data yet to tune it.
- **Decision:** **APPROVED** 2026-10-27 (user approval): A for V1 (no change). **DEFERRED:** B (suggesting a swap) until there is pilot data (RESEARCH-FLAGS D2-10b).

## Ready for native — checklist

**Carry over as the spec**
- [ ] **Engine rules** (`js/engine.js` + `js/config.js` APPROVED):
  - ±1 level per change, and at most 1 step up per session;
  - one bad day never lowers a level; double progression (R3), bad sessions (R4), anti-thrash (R5), plateau order (R6);
  - gentle cap (R7); injury gate of 3 pain-free sessions over 7 or more days;
  - check-in triage (R10/R11), with the lighter next session (R23) never moving a level;
  - calibration ending on data quality (R19); the R21 Performance Score; the R25 modification order;
  - pain is never swapped.
- [ ] **Data schema** (`SCHEMA=4`):
  - `profile` (answers, `bodyAreas` + `bodyAreaHistory`, `hs`, `postpartum`, `patternReadiness`);
  - `eng` (per-pattern `lvl`/`target`/`sets`/`status`/`obs[]`/`painFree[]`, `decisions[]`);
  - `sessions[]` (prescription snapshot, results per set, score, decisions, check-ins, `plannedDay`);
  - `mods{dateKey}`, `calib`, and an append-only event log (UTC + time zone).
  - Port `migrateState` as the v1 importer.
- [ ] **Tests as the spec:**
  - `inv.js` (engine invariants) and `test.js` (stop paths) become XCTest cases one for one;
  - `ui.js` / `v06.js` / `v07.js` / `v090.js` / `v091.js` become acceptance criteria;
  - `audit.js` sets the tap budget (≤34 taps, ≤15 screens to the first workout).
- [ ] **Locked doc + amendments:** `CORE-PRODUCT-LOGICS.docx` read together with amendments A1–A5.
- [ ] **Round 2 behaviour (v0.9.2):**
  - Ability is a level for each movement, plus a display-only summary;
  - "Something else" after calibration gets a counter-offer first;
  - an accept note on non-pain accepts after calibration;
  - Easier/Harder ±1 during calibration (`tests/v092.js`).
- [ ] **Copy:** the `SAFE` statements word for word (pending OQ-5), the `MSG` decision reasons, and the R24 tone lines (deferred).

**Don't carry over:** service worker, `?v=` cache-busting, localStorage, the Safari toolbar workarounds, override layering (v05→v07), the duplicated fallback config, the dev/sim tools, and the fake speech recognition.

**Before native starts:** Decision Round 2 is done. Book the reviews still open: X6 and OQ-1a (physio), OQ-5 (legal/clinical), OQ-15 (regulatory), R7/OQ-17 (physio), R11/X2 (clinical), X8 (design).

**Native-only work:**
- real HealthKit permission flow;
- on-device speech, plus a hold-to-talk fallback (OQ-13);
- Core Data/SwiftData storage, with the event log in a table instead of a growing blob (localStorage is limited to about 5 MB);
- notifications without the web-push limits;
- testing on a real iPhone, which has never been done;
- 7 Swift engine modules plus Calibration (D2-9);
- workouts used as recent load (A3).

Approved by: the user (chat, "Go with your best recommendations") · Date: 2026-10-27
