# Research flags — Decision Round 1 outcome (v0.9.0)

On 27 Oct 2026 the owner (vamsimadhav) approved Decision Round 1 (`docs/DECISION-ROUND-1.md`). Every R and X item below is **resolved** except the ones marked OPEN. Approved values now live in `js/config.js` → `FC_CONFIG.APPROVED`. `FC_CONFIG.RESEARCH_NEEDED` keeps only the superseded R8/R9 keys and the deferred R24 `experienceTone`.

**Still open (deferred):** R24 (experience → tone), X6 (physio review of injury map), X9 (demo animation budget), and from the spec: OQ-1a (pelvic-floor physio review), OQ-5 (legal/clinical wording review — wording stays verbatim), OQ-15 (regulatory review), OQ-11 (backups, native build), OQ-12 (first name, pilot), OQ-16 (screen count, user testing).

**Approved but still need a review before launch:** R7, OQ-17 (physio), R11, X2 (clinical), X8 (design), R17 (pilot comparison), OQ-13 (pilot measurement).

**CHANGE options offered but not applied (owner may choose):** R23/X5 act only after 2 hard/poor sessions in a row; R1 10–15 reps for gentle mode; R18 voice coaching off by default.

The original placeholder table follows, for reference. "Placeholder used" is now the approved value unless marked OPEN.

## Original notes

Before Decision Round 1 these were all placeholders in `FC_CONFIG.RESEARCH_NEEDED` (R1–R26) or in the code (X1–X9). The rules approved earlier in the spec (also in `FC_CONFIG.APPROVED`) are:
- 1 step-up per session
- a bad day never lowers the level
- the injury gate: 3 pain-free sessions over at least 7 days
- calibration ends on data quality, never on time (the 7-day floor was retired in v0.6, per CORE-PRODUCT-LOGICS §3)
- a 90-day re-screen
- at most 1 nudge per day

Changing a value only means editing the config; the engine reads its thresholds from it. A few APPROVED keys are declarative invariants (`badDayLowersLevel`, `maxLevelChangePerStep`, `startEveryoneAsBeginner`, `streakUnit`): the code enforces them and the tests assert them, but they are not read at runtime.

| ID | What it is | Placeholder used | Why research is needed | Suggested sources / questions |
|---|---|---|---|---|
| R1 — ✅ RESOLVED (approved 27 Oct 2026) | Rep/hold/time ranges, starting and max sets | reps 8–12 (gentle 6–10); holds 15–30 s (10–20); cardio 3–5 min (2–3); 2 sets start, 3 max | Ranges depend on population and goal; beginners and older adults differ | ACSM Guidelines for Exercise Testing & Prescription (11th ed.); ACSM position stand on progression models (2009); NSCA beginner guidance |
| R2 — ✅ RESOLVED (approved 27 Oct 2026) | Levels per movement ladder | 4 | Depends on how the exercise library is graded | Coach/physio review of the regressions and progressions per pattern |
| R3 — ✅ RESOLVED (approved 27 Oct 2026) | Clean sessions needed before a step-up; rep increment | 2 sessions; +1 rep | Double-progression parameters are mostly practitioner convention | NSCA Essentials; double-progression literature; pilot data on how often steps are reverted |
| R4 — ✅ RESOLVED (approved 27 Oct 2026) | Bad-session thresholds for revising volume or level; minimum days between level-downs | 2 / 3 sessions; 7 days | Needs balancing between avoiding over-reaction to noise and catching real overreach | Autoregulation / RPE literature (Helms et al.); pilot data |
| R5 — ✅ RESOLVED (approved 27 Oct 2026) | Minimum sessions between changes (anti-thrash) | 2 | Stability vs. responsiveness | UX testing; adaptive-training literature |
| R6 — ✅ RESOLVED (approved 27 Oct 2026) | Plateau definition and the order of responses | 4 flat sessions; tempo → add set → variant offer → deload suggestion | The order of interventions is not evidence-settled | NSCA; coach panel; plateau-management reviews |
| R7 — ✅ RESOLVED (approved 27 Oct 2026); still needs physio review before launch | Gentle-mode level cap and step spacing | max level 1; 7 days between steps | Safety-critical for people with conditions or pain | Physiotherapist input; graded-activity / pacing literature |
| R8 — — superseded | *(Superseded in v0.6 by R19)* Observations needed per pattern for calibration | 3 | Determines when we claim "personalized" | Reliability of repeated-performance measures; minimal detectable change |
| R9 — — superseded | *(Superseded in v0.6 by R21 for the score users see; engine `score()` kept for tests)* Workout score formula: evidence-tier ceilings, hard-effort factor, unknown-data penalty, minimum ceiling | ceilings 60/70/80/90/100; ×0.85; −10; 50 | Score framing affects motivation and trust; there is no floor (approved) | Gamification/self-determination UX research; user testing |
| R10 — ✅ RESOLVED (approved 27 Oct 2026) | Check-in triage rule (when to offer the short session) | poor sleep, low energy or a lot of soreness → shorter session offered | The effect sizes of sleep and energy on training are unclear | Sleep/readiness literature; HRV-guided training studies |
| R11 — ✅ RESOLVED (approved 27 Oct 2026); still needs clinical review before launch | Effects of check-in pain | skip loaded patterns for that area; mark the pattern not ready | Is this too conservative or not conservative enough? | Physio review; return-to-activity guidelines |
| R12 — ✅ RESOLVED (approved 27 Oct 2026) | Rest between sets | 30 s / 45 s | Depends on population and goal | ACSM/NSCA rest-interval recommendations |
| R13 — ✅ RESOLVED (approved 27 Oct 2026) | Short-sleep threshold from Health | under 6 h | Wearable sleep accuracy varies | Apple Watch sleep validation studies; sleep-duration consensus (AASM) |
| R14 — ✅ RESOLVED (approved 27 Oct 2026) | Default nudge time before patterns are learned | 18:00 | Timing affects adherence | Habit-formation / JITAI literature (Nahum-Shani) |
| R15 — ✅ RESOLVED (approved 27 Oct 2026) | Offer shorter sessions if the real length is below X × planned | 0.7 | Arbitrary threshold | Pilot data on adherence vs. session length |
| R16 — ✅ RESOLVED (approved 27 Oct 2026) | Weekly goal and streak | goal = the workouts/week you chose (2 if your week varies); streak = weeks in a row with at least one workout; no penalties or "broken streak" messages | Streaks can motivate some people and pressure or shame others | Self-determination theory; research on streak design and drop-off; user testing |
| R17 — ✅ RESOLVED (approved 27 Oct 2026); still needs pilot comparison | One-tap "I feel good — start workout" | counts as sleep good, energy good, no soreness, no pain; the full 4-question check-in is one tap away and the stop-exercising safety text is always shown above it | Does one tap lower how often people report pain? | Pilot comparison of pain reports with the one-tap vs. the 4-question check-in; physio review |
| R18 — ✅ RESOLVED (approved 27 Oct 2026) | Defaults used because onboarding skips the tone, reminder and Apple Health screens (config `onboardingDefaults`) | coaching style calm; voice coaching on; reminders "learn my time"; Apple Health not connected. You can change these from "Here's what we heard" and Settings | Tone and reminder defaults shape the first experience and affect privacy and notifications. **Needs owner approval.** | UX testing of the first session; notification-consent best practice; owner decision |
| R19 — ✅ RESOLVED (approved 27 Oct 2026) | When calibration ends (data quality, never time): quality sessions, movement patterns, sessions per pattern, max spread between the last two volume ratios (config `calibration`) | 6 sessions; ≥3 patterns; ≥2 counted sessions each; spread ≤0.35 | Ending too early mis-fits the plan; too late feels slow. Fewer than 3 eligible patterns → needs all eligible ones | Reliability / minimal detectable change of repeated bodyweight tests in beginners |
| R20 — ✅ RESOLVED (approved 27 Oct 2026) | Beginner starting step per pattern (config `beginnerLevel`) | ladder step 0 everywhere; core step 1 (wall plank), step 0 if postpartum | Everyone starts here regardless of what they told us | Beginner exercise selection guidelines; clinician review |
| R21 — ✅ RESOLVED (approved 27 Oct 2026) | Performance Score formula (config `performanceScore`) | 40% exercises completed + 40% reps/time vs target (capped at 100%) + 20% adherence (planned day 1, unplanned 0.75); pain-stopped exercises left out; unknown counts drop the volume part | Score framing affects motivation | Self-determination / feedback framing research |
| R22 — ✅ RESOLVED (approved 27 Oct 2026) | "Finished fast" cue: average seconds per rep (config `fastSecPerRep`) | < 2 s/rep | Copy only; dose still follows the engine's ±1 rules | Tempo norms for beginner bodyweight work |
| R23 — ✅ RESOLVED (approved 27 Oct 2026) | Post-session check-in effects (config `postCheckPainMarksPatternNotReady`, `easeNextIf`, `easeStep`) | pain + area → loaded patterns on hold (same as R11). v0.7: overall effort "Hard" **or** energy "Low" → the next session only is "lighter": same level and sets, target lowered by 2 reps / 5 s / 1 min, never below the range floor, and it does not count towards moving up or down. The user can decline it. One bad day never lowers a level | Whether one hard rating should trigger it (vs two in a row); the size of the step; whether eased sessions should count towards calibration (they currently don't, which can lengthen it slightly) | Coaching / sports-science lead |
| R24 — 🟠 OPEN — DEFERRED | Experience answer → coaching tone copy (config `experienceTone`) | 4 tone lines; never changes difficulty. v0.7: no longer used by the days-per-week suggestion (see R26) | Whether the answer is worth asking at all now | Product |
| R25 — ✅ RESOLVED (approved 27 Oct 2026) | Modification path (config `modReasons`, `modCounter`, `modReasonRequiredAfterCalibration`) | Reasons: Injury or pain / Tired or recovering / Equipment or space / Short on time / Something else. First response: pain → leave it out and put it on hold (never a swap), with the pain wording; tired or short on time → offer the short version; equipment → offer the seated version; other → accept. Second: the user's own choice, with an honest note ("it won't move up until you do it"). Swapped exercises don't change the level. Reason optional during calibration, required after | The counter-offer for each reason; whether to warn after repeated skips of the same movement; whether a swap should count as evidence | Coaching lead + clinical review (pain path) |
| R26 — ✅ RESOLVED (approved 27 Oct 2026) | Days-per-week suggestion (config `suggestThreeDaysFrom`) | anyone choosing 5 or more days is offered "start with 3" (they can keep their choice). Previously only for new/lapsed users or gentle mode | The threshold, and whether to suggest at all | Product + coaching |
| X1 — ✅ RESOLVED (approved 27 Oct 2026) | Evidence-tier definitions (Unknown / Baseline only / Early / Building / Personalized) | based on counts of observations and sessions in the engine `tier()` | Defines how confident we claim to be | Measurement reliability; UX testing of the wording |
| X2 — ✅ RESOLVED (approved 27 Oct 2026); still needs clinical review before launch | Tolerance labels | last 3 observations: any pain → "Needs care"; 2+ hard → "Finding it tough" | Heuristic only | Physio/coach review |
| X3 — ✅ RESOLVED (approved 27 Oct 2026) | Rest-day touchpoint | 60 s breathing drill + quick check-in | Content and length not validated | Behaviour-change research on minimal-dose engagement |
| X4 — ✅ RESOLVED (approved 27 Oct 2026) | Measure-chip ranges and run-time limits | chips around the target; 120 s cap for reps | Usability only | Usability testing |
| X5 — ✅ RESOLVED (approved 27 Oct 2026) | Step-up verification rule | "poor" = hard effort or any set below the bottom of the range → revert | Is one session enough to judge? | Coach review; pilot data |
| X6 — 🟠 OPEN — DEFERRED | Injury-flag heuristic when the plan starts | not-ready/gentle readiness from onboarding → injury gate | Mapping body areas to patterns needs clinical review | Physio review of REGION_LOAD / TRIG_MAP |
| X7 — ✅ RESOLVED (approved 27 Oct 2026) | Reminder demo | 1/day (approved cap); the iOS web-push limits are explained | iOS needs Add to Home Screen (iOS 16.4+) for web push | Apple WebKit web-push documentation |
| X8 — ✅ RESOLVED (approved 27 Oct 2026); still needs design review before launch | Look of the 3D coach | Quaternius CC0 mannequin (orange/purple, faceless, idle loop only) | Placeholder art: tone, inclusivity and body diversity not reviewed; no exercise demos yet | Design review; user testing with the target groups; decide on exercise demo clips for native |
| X9 — 🟠 OPEN — DEFERRED | Demo animations needed | 3D demo only for sit-to-stand (3 ladder steps). All others show text + muscle map: **squat** body-weight squat to a chair; **push** wall, counter, knee and floor push-up; **hinge** standing hip hinge to a wall, glute bridge, glute bridge with 2-second hold, single-leg glute bridge; **core** breathing + heel slides, forearm wall plank, forearm plank on knees, forearm plank, seated breathing + gentle belly brace; **balance** feet-together stand, supported single-leg stand, single-leg stand with fingertip support, single-leg stand with a reach; **cardio** easy march in place, march in place, brisk march with arm swings, step-backs + march; **seated** forward reach-and-return, chest press against a wall, forward lean & return, brace & breathe, seated reach, seated arm march | The free CC0 Quaternius packs (UAL 1 and 2, Standard) have no exercise clips. MakeHuman has CC0 *static* poses (e.g. push-up), not motion. Procedural keyframes were not attempted: wrong form in a demo is a safety risk | Commission or record CC0/owned clips (mocap or animator), reviewed by a coach/physio for form; check paid Quaternius tiers (CC0, 120+/130+ clips) for anything usable |

> v0.7.2 note on X8: the mannequin is tinted toward the app palette at runtime (cloned materials). The CC0 GLB is unchanged; the look is still a placeholder.

## Decision Round 2 (2026-10-27) — deferred parts

Every Round 2 item was approved by the user on 2026-10-27 (`docs/PRE-NATIVE-REVIEW.md`). Changes to the locked doc are recorded in `docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md` (A1–A5). Still open:

| ID | What | Why deferred | Who / when |
|---|---|---|---|
| D2-2b | 15 named workout templates on top of the ladders | Content, not engine; only if marketing needs them | Content, pre-launch |
| D2-4 legal | Final wording of the accept note (`modAcceptNote`) | Needs legal review; added to OQ-5 | Legal, pre-launch |
| D2-6b | HRV / resting heart rate as readiness hints | Noisy wearable data; prove value first | After the pilot |
| D2-6c | Workouts used as "recent load" | Real HealthKit only in the native build | Native build |
| D2-9 | 7 engine modules (+ Calibration) | Native structure; prototype not refactored | Native build |
| D2-10b | Repeated non-pain skips suggest a permanent swap | Needs pilot data to tune | After the pilot |

