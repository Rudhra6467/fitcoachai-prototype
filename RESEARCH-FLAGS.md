# Research flags — values NOT decided

All of these are placeholders. They live in `js/config.js` → `FC_CONFIG.RESEARCH_NEEDED` (R1–R15), or in the code where noted (X1–X7). They are marked "RESEARCH NEEDED / not decided". The values that are approved are in `FC_CONFIG.APPROVED`:
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
| R8 | Observations needed per pattern for calibration | 3 | Determines when we claim "personalized" | Reliability of repeated-performance measures; minimal detectable change |
| R9 | Workout score formula: evidence-tier ceilings, hard-effort factor, unknown-data penalty, minimum ceiling | ceilings 60/70/80/90/100; ×0.85; −10; 50 | Score framing affects motivation and trust; there is no floor (approved) | Gamification/self-determination UX research; user testing |
| R10 | Check-in triage rule (when to offer the short session) | poor sleep, low energy or a lot of soreness → shorter session offered | The effect sizes of sleep and energy on training are unclear | Sleep/readiness literature; HRV-guided training studies |
| R11 | Effects of check-in pain | skip loaded patterns for that area; mark the pattern not ready | Is this too conservative or not conservative enough? | Physio review; return-to-activity guidelines |
| R12 | Rest between sets | 30 s / 45 s | Depends on population and goal | ACSM/NSCA rest-interval recommendations |
| R13 | Short-sleep threshold from Health | under 6 h | Wearable sleep accuracy varies | Apple Watch sleep validation studies; sleep-duration consensus (AASM) |
| R14 | Default nudge time before patterns are learned | 18:00 | Timing affects adherence | Habit-formation / JITAI literature (Nahum-Shani) |
| R15 | Offer shorter sessions if the real length is below X × planned | 0.7 | Arbitrary threshold | Pilot data on adherence vs. session length |
| X1 | Evidence-tier definitions (Unknown / Baseline only / Early / Building / Personalized) | based on counts of observations and sessions in the engine `tier()` | Defines how confident we claim to be | Measurement reliability; UX testing of the wording |
| X2 | Tolerance labels | last 3 observations: any pain → "Needs care"; 2+ hard → "Finding it tough" | Heuristic only | Physio/coach review |
| X3 | Rest-day touchpoint | 60 s breathing drill + quick check-in | Content and length not validated | Behaviour-change research on minimal-dose engagement |
| X4 | Measure-chip ranges and run-time limits | chips around the target; 120 s cap for reps | Usability only | Usability testing |
| X5 | Step-up verification rule | "poor" = hard effort or any set below the bottom of the range → revert | Is one session enough to judge? | Coach review; pilot data |
| X6 | Injury-flag heuristic when the plan starts | not-ready/gentle readiness from onboarding → injury gate | Mapping body areas to patterns needs clinical review | Physio review of REGION_LOAD / TRIG_MAP |
| X7 | Reminder demo | 1/day (approved cap); the iOS web-push limits are explained | iOS needs Add to Home Screen (iOS 16.4+) for web push | Apple WebKit web-push documentation |
