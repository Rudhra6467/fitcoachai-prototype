# Research flags — values NOT decided

All of these are placeholders. They live in `js/config.js` → `FC_CONFIG.RESEARCH_NEEDED` (R1–R26), or in the code where noted (X1–X8). They are marked "RESEARCH NEEDED / not decided". The values that are approved are in `FC_CONFIG.APPROVED`:
- 1 step-up per session
- a bad day never lowers the level
- the injury gate: 3 pain-free sessions over at least 7 days
- a 7-day calibration floor
- a 90-day re-screen
- at most 1 nudge per day

Changing a placeholder only means editing the config. The engine reads every threshold from it.

| ID | What it is | Placeholder used | Why research is needed | Suggested sources / questions |
|---|---|---|---|---|
| R1 | Rep/hold/time ranges, starting and max sets | reps 8–12 (gentle 6–10); holds 15–30 s (10–20); cardio 3–5 min (2–3); 2 sets start, 3 max | Ranges depend on population and goal; beginners and older adults differ | ACSM Guidelines for Exercise Testing & Prescription (11th ed.); ACSM position stand on progression models (2009); NSCA beginner guidance |
| R2 | Levels per movement ladder | 4 | Depends on how the exercise library is graded | Coach/physio review of the regressions and progressions per pattern |
| R3 | Clean sessions needed before a step-up; rep increment | 2 sessions; +1 rep | Double-progression parameters are mostly practitioner convention | NSCA Essentials; double-progression literature; pilot data on how often steps are reverted |
| R4 | Bad-session thresholds for revising volume or level; minimum days between level-downs | 2 / 3 sessions; 7 days | Needs balancing between avoiding over-reaction to noise and catching real overreach | Autoregulation / RPE literature (Helms et al.); pilot data |
| R5 | Minimum sessions between changes (anti-thrash) | 2 | Stability vs. responsiveness | UX testing; adaptive-training literature |
| R6 | Plateau definition and the order of responses | 4 flat sessions; tempo → add set → variant offer → deload suggestion | The order of interventions is not evidence-settled | NSCA; coach panel; plateau-management reviews |
| R7 | Gentle-mode level cap and step spacing | max level 1; 7 days between steps | Safety-critical for people with conditions or pain | Physiotherapist input; graded-activity / pacing literature |
| R8 | *(Superseded in v0.6 by R19)* Observations needed per pattern for calibration | 3 | Determines when we claim "personalized" | Reliability of repeated-performance measures; minimal detectable change |
| R9 | *(Superseded in v0.6 by R21 for the score users see; engine `score()` kept for tests)* Workout score formula: evidence-tier ceilings, hard-effort factor, unknown-data penalty, minimum ceiling | ceilings 60/70/80/90/100; ×0.85; −10; 50 | Score framing affects motivation and trust; there is no floor (approved) | Gamification/self-determination UX research; user testing |
| R10 | Check-in triage rule (when to offer the short session) | poor sleep, low energy or a lot of soreness → shorter session offered | The effect sizes of sleep and energy on training are unclear | Sleep/readiness literature; HRV-guided training studies |
| R11 | Effects of check-in pain | skip loaded patterns for that area; mark the pattern not ready | Is this too conservative or not conservative enough? | Physio review; return-to-activity guidelines |
| R12 | Rest between sets | 30 s / 45 s | Depends on population and goal | ACSM/NSCA rest-interval recommendations |
| R13 | Short-sleep threshold from Health | under 6 h | Wearable sleep accuracy varies | Apple Watch sleep validation studies; sleep-duration consensus (AASM) |
| R14 | Default nudge time before patterns are learned | 18:00 | Timing affects adherence | Habit-formation / JITAI literature (Nahum-Shani) |
| R15 | Offer shorter sessions if the real length is below X × planned | 0.7 | Arbitrary threshold | Pilot data on adherence vs. session length |
| R16 | Weekly goal and streak | goal = the workouts/week you chose (2 if your week varies); streak = weeks in a row with at least one workout; no penalties or "broken streak" messages | Streaks can motivate some people and pressure or shame others | Self-determination theory; research on streak design and drop-off; user testing |
| R17 | One-tap "I feel good — start workout" | counts as sleep good, energy good, no soreness, no pain; the full 4-question check-in is one tap away and the stop-exercising safety text is always shown above it | Does one tap lower how often people report pain? | Pilot comparison of pain reports with the one-tap vs. the 4-question check-in; physio review |
| R18 | Defaults used because onboarding skips the tone, reminder and Apple Health screens (config `onboardingDefaults`) | coaching style calm; voice coaching on; reminders "learn my time"; Apple Health not connected. You can change these from "Here's what we heard" and Settings | Tone and reminder defaults shape the first experience and affect privacy and notifications. **Needs owner approval.** | UX testing of the first session; notification-consent best practice; owner decision |
| R19 | When calibration ends (data quality, never time): quality sessions, movement patterns, sessions per pattern, max spread between the last two volume ratios (config `calibration`) | 6 sessions; ≥3 patterns; ≥2 counted sessions each; spread ≤0.35 | Ending too early mis-fits the plan; too late feels slow. Fewer than 3 eligible patterns → needs all eligible ones | Reliability / minimal detectable change of repeated bodyweight tests in beginners |
| R20 | Beginner starting step per pattern (config `beginnerLevel`) | ladder step 0 everywhere; core step 1 (wall plank), step 0 if postpartum | Everyone starts here regardless of what they told us | Beginner exercise selection guidelines; clinician review |
| R21 | Performance Score formula (config `performanceScore`) | 40% exercises completed + 40% reps/time vs target (capped at 100%) + 20% adherence (planned day 1, unplanned 0.75); pain-stopped exercises left out; unknown counts drop the volume part | Score framing affects motivation | Self-determination / feedback framing research |
| R22 | "Finished fast" cue: average seconds per rep (config `fastSecPerRep`) | < 2 s/rep | Copy only; dose still follows the engine's ±1 rules | Tempo norms for beginner bodyweight work |
| R23 | Post-session check-in effects (config `postCheckPainMarksPatternNotReady`, `easeNextIf`, `easeStep`) | pain + area → loaded patterns on hold (same as R11). v0.7: overall effort "Hard" **or** energy "Low" → the next session only is "lighter": same level and sets, target lowered by 2 reps / 5 s / 1 min, never below the range floor, and it does not count towards moving up or down. The user can decline it. One bad day never lowers a level | Whether one hard rating should trigger it (vs two in a row); the size of the step; whether eased sessions should count towards calibration (they currently don't, which can lengthen it slightly) | Coaching / sports-science lead |
| R24 | Experience answer → coaching tone copy (config `experienceTone`) | 4 tone lines; never changes difficulty. v0.7: no longer used by the days-per-week suggestion (see R26) | Whether the answer is worth asking at all now | Product |
| R25 | Modification path (config `modReasons`, `modCounter`, `modReasonRequiredAfterCalibration`) | Reasons: Injury or pain / Tired or recovering / Equipment or space / Short on time / Something else. First response: pain → leave it out and put it on hold (never a swap), with the pain wording; tired or short on time → offer the short version; equipment → offer the seated version; other → accept. Second: the user's own choice, with an honest note ("it won't move up until you do it"). Swapped exercises don't change the level. Reason optional during calibration, required after | The counter-offer for each reason; whether to warn after repeated skips of the same movement; whether a swap should count as evidence | Coaching lead + clinical review (pain path) |
| R26 | Days-per-week suggestion (config `suggestThreeDaysFrom`) | anyone choosing 5 or more days is offered "start with 3" (they can keep their choice). Previously only for new/lapsed users or gentle mode | The threshold, and whether to suggest at all | Product + coaching |
| X1 | Evidence-tier definitions (Unknown / Baseline only / Early / Building / Personalized) | based on counts of observations and sessions in the engine `tier()` | Defines how confident we claim to be | Measurement reliability; UX testing of the wording |
| X2 | Tolerance labels | last 3 observations: any pain → "Needs care"; 2+ hard → "Finding it tough" | Heuristic only | Physio/coach review |
| X3 | Rest-day touchpoint | 60 s breathing drill + quick check-in | Content and length not validated | Behaviour-change research on minimal-dose engagement |
| X4 | Measure-chip ranges and run-time limits | chips around the target; 120 s cap for reps | Usability only | Usability testing |
| X5 | Step-up verification rule | "poor" = hard effort or any set below the bottom of the range → revert | Is one session enough to judge? | Coach review; pilot data |
| X6 | Injury-flag heuristic when the plan starts | not-ready/gentle readiness from onboarding → injury gate | Mapping body areas to patterns needs clinical review | Physio review of REGION_LOAD / TRIG_MAP |
| X7 | Reminder demo | 1/day (approved cap); the iOS web-push limits are explained | iOS needs Add to Home Screen (iOS 16.4+) for web push | Apple WebKit web-push documentation |
| X8 | Look of the 3D coach | Quaternius CC0 mannequin (orange/purple, faceless, idle loop only) | Placeholder art: tone, inclusivity and body diversity not reviewed; no exercise demos yet | Design review; user testing with the target groups; decide on exercise demo clips for native |

> v0.7.2 note on X8: the mannequin is tinted toward the app palette at runtime (cloned materials). The CC0 GLB is unchanged; the look is still a placeholder.
