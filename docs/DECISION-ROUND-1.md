# FitcoachAI — Decision Round 1

Prototype v0.8.0 · 27 Oct 2026 · **Decided 27 Oct 2026 by the owner (vamsimadhav): 35 APPROVED, 9 DEFERRED, 0 CHANGED.** Approved values are applied in v0.9.0. Deferred items need expert, clinical, legal or budget input and are not decided.

44 items: 24 research flags (R1–R26; R8 and R9 are not included because R19 and R21 replaced them in v0.6), 9 prototype flags (X1–X9) and the 11 open questions from ONBOARDING-SPEC §7.1. P1 = decide first (calibration, score and safety), P2 = before the pilot, P3 = can wait.

The citations are real sources that support the direction of each recommendation. Most of the exact numbers are our own placeholders, and the reason column says so.

## Summary

| # | ID | Priority | Topic | Recommendation | Decision |
|---|---|---|---|---|---|
| 1 | R19 | P1 | When does calibration end? | APPROVE as a pilot default, and log the spread values so it can be re-fit | APPROVED |
| 2 | R21 | P1 | Performance Score formula | APPROVE, with one change to consider: show it as 'what you did' feedback, never as a grade, and never lower it for stopping because of pain (already true) | APPROVED |
| 3 | R7 | P1 safety | Gentle-mode level cap and step spacing | APPROVE as conservative until a physio reviews it (ties to OQ-17) | APPROVED |
| 4 | R11 | P1 safety | What pain at check-in does | APPROVE | APPROVED |
| 5 | R17 | P1 safety | One-tap 'I feel good — start workout' | APPROVE for the pilot, and measure: compare how often pain is reported with the one-tap vs | APPROVED |
| 6 | R23 | P1 safety (pain path) | After-session check-in effects | APPROVE the pain path as is | APPROVED |
| 7 | R25 | P1 safety (pain path) | Swap / skip reasons and responses | APPROVE the pain path ('never swap, hold + wording') | APPROVED |
| 8 | X2 | P1 safety | Tolerance labels | APPROVE | APPROVED |
| 9 | X6 | P1 safety | Injury-flag mapping at plan start | DEFER until physio review: keep the current conservative map, and get it signed before launch | DEFERRED |
| 10 | OQ-1a | P1 safety | Pelvic-floor physio review (postpartum) | Get the review before launch | DEFERRED |
| 11 | OQ-5 | P1 safety | Red-flag wording sign-off | Book the legal and clinical review | DEFERRED |
| 12 | OQ-6b | P1 safety | Older adults: default to gentle mode? | Keep the health-check route, but for 70+ also preselect the slower pace and add balance work early | APPROVED |
| 13 | OQ-15 | P1 safety | Regulatory positioning | Get a regulatory review before launch | DEFERRED |
| 14 | OQ-17 | P1 safety | Gentle-mode details | APPROVE as conservative placeholders | APPROVED |
| 15 | R20 | P2 | Beginner starting step | APPROVE | APPROVED |
| 16 | R1 | P2 | Rep, hold and time ranges; sets | APPROVE | APPROVED |
| 17 | X5 | P2 | Step-up check | APPROVE, with the CHANGE option of going back only after 2 poor sessions in a row | APPROVED |
| 18 | R4 | P2 | Bad-session thresholds | APPROVE | APPROVED |
| 19 | R3 | P2 | Moving up | APPROVE | APPROVED |
| 20 | R18 | P2 | Defaults for skipped onboarding screens | APPROVE, but change voice coaching to OFF by default if the app may be used in public places (owner choice) | APPROVED |
| 21 | R26 | P2 | Days-per-week suggestion | APPROVE | APPROVED |
| 22 | R10 | P2 | Check-in → shorter session | APPROVE as an offer only (it already is) | APPROVED |
| 23 | R13 | P2 | Short-sleep threshold (Apple Health) | APPROVE | APPROVED |
| 24 | OQ-18 | P2 | Apple Health read types | APPROVE only the types the engine actually uses today (sleep duration, workouts) | APPROVED |
| 25 | R16 | P2 | Weekly goal and streak | APPROVE | APPROVED |
| 26 | R12 | P3 | Rest between sets | APPROVE for low-intensity bodyweight work | APPROVED |
| 27 | R2 | P3 | Levels per ladder | APPROVE for the prototype | APPROVED |
| 28 | R6 | P3 | Plateau rule | APPROVE | APPROVED |
| 29 | R5 | P3 | Anti-thrash | APPROVE | APPROVED |
| 30 | R15 | P3 | Offer shorter sessions | APPROVE; re-fit from pilot data | APPROVED |
| 31 | R22 | P3 | 'Finished fast' cue | APPROVE (copy only) | APPROVED |
| 32 | R24 | P3 | Experience answer → tone | DEFER, or remove the question to shorten onboarding (ties to OQ-16) | DEFERRED |
| 33 | R14 | P3 | Default reminder time | APPROVE | APPROVED |
| 34 | X1 | P3 | Evidence-tier labels | APPROVE; check the wording with users | APPROVED |
| 35 | X3 | P3 | Rest-day touchpoint | APPROVE | APPROVED |
| 36 | X4 | P3 | Measure chips and run caps | APPROVE | APPROVED |
| 37 | X7 | P3 | Reminder demo | APPROVE | APPROVED |
| 38 | X8 | P3 | Look of the 3D coach | APPROVE for the prototype | APPROVED |
| 39 | X9 | P3 | Demo animations needed | DECIDE on a budget: commission CC0 or owned mocap clips, and have a coach check the form before shipping | DEFERRED |
| 40 | OQ-9 | P3 | Holidays | APPROVE locale only | APPROVED |
| 41 | OQ-11 | P3 | Backups / export | DEFER to the native build | DEFERRED |
| 42 | OQ-12 | P3 | First name for voice | DEFER; test it in the pilot | DEFERRED |
| 43 | OQ-13 | P3 | Voice reliability | APPROVE, because the buttons are always on screen | APPROVED |
| 44 | OQ-16 | P3 | Screen count | DEFER to user testing | DEFERRED |

## Items

### 1. R19 — When does calibration end? (P1)

- **Question:** Calibration ends on data quality only, never on time. When should we stop calling the plan 'calibrating'?
- **Current placeholder:** 6 quality sessions; at least 3 patterns; at least 2 counted sessions per pattern; spread between the last two volume ratios ≤ 0.35
- **Recommendation:** APPROVE as a pilot default, and log the spread values so it can be re-fit.
- **Why:** Two counted sessions per pattern is the minimum for a test-retest comparison. Beginner bodyweight scores also improve quickly through learning (ACSM Guidelines 11th ed. treat the first weeks as an initial adaptation stage), so a spread limit guards against fitting to the learning curve. The exact 0.35 has no published source.
- **Risk if wrong:** Too early: the plan is fit to noisy early numbers and steps up too fast. Too late: users feel stuck in 'calibrating' and drop out.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 2. R21 — Performance Score formula (P1)

- **Question:** What goes into the score users see, and in what weights?
- **Current placeholder:** 40% exercises completed + 40% reps/time vs target (capped at 100%) + 20% adherence (planned day 1, unplanned 0.75); exercises stopped for pain are left out; unknown counts drop the volume part
- **Recommendation:** APPROVE, with one change to consider: show it as 'what you did' feedback, never as a grade, and never lower it for stopping because of pain (already true).
- **Why:** Self-determination theory (Ryan & Deci, 2000, Am Psychol 55:68–78) supports feedback that is informative rather than controlling. Leaving pain stops out of the score avoids punishing the safe behaviour we ask for. The weights are product judgment, not evidence.
- **Risk if wrong:** Score users read as 'failing' leads to drop-out or pushing through pain to protect it.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 3. R7 — Gentle-mode level cap and step spacing (P1 safety)

- **Question:** For people with a condition, pain or 'not ready' answers, how far and how fast can the plan move up?
- **Current placeholder:** Max ladder level 1; at least 7 days between steps
- **Recommendation:** APPROVE as conservative until a physio reviews it (ties to OQ-17).
- **Why:** ACSM Guidelines 11th ed. advise starting low and progressing slowly for people with chronic conditions and for older adults. ACSM 2009 progression position stand (Med Sci Sports Exerc 41:687–708) recommends small load increases (about 2–10%) once the current load is managed well. Pacing / graded-activity approaches also use small, time-spaced steps. 7 days is a convention, not a tested number.
- **Risk if wrong:** Too loose: flare-ups or injury in the most vulnerable group. Too tight: boredom; the user leaves gentle mode by answering differently.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Physio review still required before launch

### 4. R11 — What pain at check-in does (P1 safety)

- **Question:** If someone reports pain before a session, what happens?
- **Current placeholder:** Skip loaded patterns for that body area; mark the pattern 'not ready' (on hold)
- **Recommendation:** APPROVE. Keep the verbatim stop/pain wording. Clinician to review the area-to-pattern map (X6).
- **Why:** The app cannot assess pain, so the honest default is to avoid loading the area and point to a professional, which follows standard pre-participation screening logic (ACSM Guidelines 11th ed., ch. 2). The risk of being too careful (a skipped exercise) is much smaller than the risk of loading a painful joint.
- **Risk if wrong:** Not careful enough: aggravating an injury, a safety and liability problem. Too careful: whole sessions get emptied for small aches.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Clinical review still required before launch

### 5. R17 — One-tap 'I feel good — start workout' (P1 safety)

- **Question:** Is it OK that one tap counts as 'sleep good, energy good, no soreness, no pain'?
- **Current placeholder:** One tap = all good; the 4-question check-in is one tap away; the stop-exercising safety text always shows above it
- **Recommendation:** APPROVE for the pilot, and measure: compare how often pain is reported with the one-tap vs. the 4-question check-in.
- **Why:** No published evidence either way. Less friction raises use, but a default 'no pain' answer may hide pain. Showing the safety text every time softens this. The pilot comparison is the only real test.
- **Risk if wrong:** Pain goes unreported, so R11 never fires for people who need it.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Pilot comparison of pain-report rates (one-tap vs full check-in)

### 6. R23 — After-session check-in effects (P1 safety (pain path))

- **Question:** What do post-session answers change? Pain + area → put loaded patterns on hold. 'Hard' effort or 'Low' energy → the next session only is lighter (−2 reps / −5 s / −1 min, never below the range floor, doesn't count towards moving up or down, can be declined).
- **Current placeholder:** As described; one bad day never lowers a level
- **Recommendation:** APPROVE the pain path as is. For the 'lighter' path, consider requiring 2 hard ratings in a row (a CHANGE option), because one hard rating is common in beginners.
- **Why:** Autoregulation with RPE / reps-in-reserve (Helms et al., 2016, Strength Cond J 38:42–49) supports adjusting the next dose from how the last one felt. Single ratings are noisy, which argues for 2 in a row before acting. Not counting eased sessions toward calibration keeps R19 clean, but it can make calibration a little longer.
- **Risk if wrong:** Pain path wrong: same as R11. Ease path too twitchy: the plan keeps backing off, and the user never progresses.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** CHANGE option (act only after 2 hard ratings in a row) not applied — owner may choose

### 7. R25 — Swap / skip reasons and responses (P1 safety (pain path))

- **Question:** When someone skips or swaps an exercise, what reasons do we offer and what do we say back?
- **Current placeholder:** Reasons: Injury or pain / Tired or recovering / Equipment or space / Short on time / Something else. Pain → leave it out + hold (never a swap) + pain wording. Tired / short on time → short version. Equipment → seated version. Other → accept. Second time: the user's choice, with the note 'it won't move up until you do it'. Reason optional during calibration, required after.
- **Recommendation:** APPROVE the pain path ('never swap, hold + wording'). Decide whether to warn after repeated skips of the same movement (recommend: a gentle note after 3 skips).
- **Why:** Offering a different exercise when someone reports pain would mean the app is giving clinical advice it can't back up. Holding the pattern and pointing to a professional matches R11. The other counter-offers are product choices.
- **Risk if wrong:** Pain path wrong: a swap loads an injured area. The rest: annoyance if the app is too pushy.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Implemented: note after 3 skips of the same movement in 14 days (not on the pain path)

### 8. X2 — Tolerance labels (P1 safety)

- **Question:** Labels shown per movement from the last 3 observations.
- **Current placeholder:** Any pain → 'Needs care'; 2 or more hard → 'Finding it tough'
- **Recommendation:** APPROVE. Physio/coach to check the words do not sound like a diagnosis.
- **Why:** These are heuristics with no published threshold. 'Needs care' is purposely non-clinical. Review the wording with a clinician and with OQ-5 (red-flag wording).
- **Risk if wrong:** A label that reads like a diagnosis creates medical-claim risk (OQ-15). A label that is too soft hides a real problem.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Clinical review still required before launch

### 9. X6 — Injury-flag mapping at plan start (P1 safety)

- **Question:** Which onboarding answers (body area, readiness) block which movement patterns?
- **Current placeholder:** 'Not ready' or gentle readiness → injury gate; REGION_LOAD / TRIG_MAP map body areas to patterns
- **Recommendation:** DEFER until physio review: keep the current conservative map, and get it signed before launch.
- **Why:** Mapping body areas to the patterns that load them is a clinical judgment. We have no source to cite, so this must not be locked in without a clinician.
- **Risk if wrong:** A missed mapping (e.g. wrists → push-ups) loads an injured area.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Needs physio review of the injury map; current conservative map stays until signed off before launch

### 10. OQ-1a — Pelvic-floor physio review (postpartum) (P1 safety)

- **Question:** The 12-week early-postpartum rule is approved, but a pelvic-floor physio has to review it. Does a C-section need longer? Are the post-session postpartum questions right?
- **Current placeholder:** 12 weeks early postpartum; core starts at step 0
- **Recommendation:** Get the review before launch. Until then keep 12 weeks for everyone, and add the line 'if you had a C-section, follow your clinician's advice on timing'.
- **Why:** ACOG Committee Opinion 804 (2020) says activity can resume gradually once medically safe and that timing after a C-section is individual. Return-to-running guidance (Goom, Donnelly & Brockwell, 2019) suggests about 12 weeks before high-impact work, so 12 weeks for loaded core work is in line with it.
- **Risk if wrong:** Wrong timing or exercises can worsen diastasis recti or pelvic-floor problems.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Needs pelvic-floor physio review before launch. Interim: C-section line "follow your clinician's advice on timing" added

### 11. OQ-5 — Red-flag wording sign-off (P1 safety)

- **Question:** The SAFE-REF / DOC / STOP / PAIN wording needs legal and clinical review, and localization (e.g. 'family doctor' vs 'GP', emergency number).
- **Current placeholder:** Current verbatim wording, English only
- **Recommendation:** Book the legal and clinical review. Keep the wording locked (verbatim) until then. Localize per launch country.
- **Why:** The stop warning signs follow ACSM pre-participation and exercise-termination guidance (ACSM Guidelines 11th ed.). The exact wording and the emergency numbers are legal and country-specific.
- **Risk if wrong:** Wrong wording or the wrong emergency number in a real emergency.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Needs legal + clinical review; red-flag wording stays verbatim until then

### 12. OQ-6b — Older adults: default to gentle mode? (P1 safety)

- **Question:** Should people aged 70+ start in gentle mode by default, or only through the health check (current)?
- **Current placeholder:** Only through the health check
- **Recommendation:** Keep the health-check route, but for 70+ also preselect the slower pace and add balance work early. Don't force gentle mode on everyone by age.
- **Why:** ACSM Guidelines 11th ed. and WHO 2020 guidelines (Bull et al., Br J Sports Med 54:1451–62) recommend activity for older adults with progression fitted to the person, plus balance training. Age alone is a poor stand-in for ability; the health-check answers are more specific.
- **Risk if wrong:** Too loose: falls or overexertion. Too strict: patronising for fit older adults.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Already met: 70+ gets the easier balance version and lower thresholds; no pace setting exists, so no new feature

### 13. OQ-15 — Regulatory positioning (P1 safety)

- **Question:** Confirm that the app is a general wellness app (not a medical device) in the target countries, and check App Store rules for health claims in our copy.
- **Current placeholder:** Assumed general wellness
- **Recommendation:** Get a regulatory review before launch. Avoid 'treat', 'rehab', 'diagnose' and 'injury recovery' in the copy.
- **Why:** US FDA 'General Wellness: Policy for Low Risk Devices' (2016, updated 2019) excludes low-risk fitness apps that make no disease claims. In the EU, MDR 2017/745 depends on the intended purpose as stated in our own claims. Apple App Store Review Guidelines §1.4.1 cover health and medical claims.
- **Risk if wrong:** Being classed as a medical device (approval needed) or rejected by the App Store.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Needs regulatory review before launch (copy check: no treat/rehab/diagnose wording found)

### 14. OQ-17 — Gentle-mode details (P1 safety)

- **Question:** Gentle mode's effort cap, progression rate and warm-up lengths (S7) are still proposals.
- **Current placeholder:** Effort cap 'moderate'; slower progression (R7); longer warm-up
- **Recommendation:** APPROVE as conservative placeholders. Physio to review together with R7.
- **Why:** ACSM Guidelines 11th ed. suggest light to moderate intensity, longer warm-ups and slower progression for deconditioned people and people with chronic conditions. The exact numbers are ours.
- **Risk if wrong:** Same as R7.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Physio review still required before launch

### 15. R20 — Beginner starting step (P2)

- **Question:** Where does each movement pattern start for a beginner?
- **Current placeholder:** Ladder step 0 everywhere; core step 1 (wall plank); step 0 if postpartum
- **Recommendation:** APPROVE.
- **Why:** Starting with the easiest version and letting the baseline test move it up matches ACSM 2009 'start novices low' guidance. The baseline already adjusts it.
- **Risk if wrong:** Too easy for fit users for a few sessions (calibration corrects it).
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 16. R1 — Rep, hold and time ranges; sets (P2)

- **Question:** Target ranges and how many sets.
- **Current placeholder:** Reps 8–12 (gentle 6–10); holds 15–30 s (gentle 10–20); cardio 3–5 min (gentle 2–3); 2 sets to start, 3 max
- **Recommendation:** APPROVE. Consider 10–15 reps for gentle mode and older adults instead of 6–10.
- **Why:** ACSM 2009 progression position stand: novices 1–3 sets of 8–12 reps. ACSM Guidelines 11th ed.: 10–15 reps for older or deconditioned adults at a lighter effort. Fewer reps of a hard exercise and more reps of an easy one give a similar effort.
- **Risk if wrong:** Too much volume: soreness and drop-out. Too little: no progress.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** CHANGE option (10–15 reps for gentle mode) not applied — owner may choose

### 17. X5 — Step-up check (P2)

- **Question:** After stepping up a level, what counts as 'poor', so we go back?
- **Current placeholder:** Hard effort or any set below the range floor → go back
- **Recommendation:** APPROVE, with the CHANGE option of going back only after 2 poor sessions in a row.
- **Why:** Single sessions are noisy (same reasoning as R23). Going back after one bad session is safe but may be too twitchy.
- **Risk if wrong:** Users bounce between levels.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** CHANGE option (2 poor sessions in a row) not applied — owner may choose

### 18. R4 — Bad-session thresholds (P2)

- **Question:** How many bad sessions before volume or level is revised, and how many days at minimum between level-downs?
- **Current placeholder:** 2 bad sessions → revise volume; 3 → revise level; at least 7 days between level-downs
- **Recommendation:** APPROVE.
- **Why:** RPE-based autoregulation (Helms et al., 2016) supports responding to trends, not single sessions. The exact counts are practitioner convention.
- **Risk if wrong:** Over-reacting to noise, or missing real overreach.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 19. R3 — Moving up (P2)

- **Question:** Clean sessions needed before a step-up, and the size of each step.
- **Current placeholder:** 2 clean sessions; +1 rep
- **Recommendation:** APPROVE.
- **Why:** ACSM 2009: add load or reps once the person can do 1–2 reps above the target on 2 sessions in a row (the '2-for-2' rule). This matches it closely.
- **Risk if wrong:** Progress too fast or too slow; low risk.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 20. R18 — Defaults for skipped onboarding screens (P2)

- **Question:** Defaults when onboarding skips the tone, reminder and Apple Health screens.
- **Current placeholder:** Calm tone; voice on; reminders 'learn my time'; Apple Health not connected
- **Recommendation:** APPROVE, but change voice coaching to OFF by default if the app may be used in public places (owner choice).
- **Why:** Privacy and consent best practice: data access (Apple Health) and notifications should be opt-in, which is already the case. Voice on is a product choice.
- **Risk if wrong:** A surprise voice in public, or a notification the user didn't expect, hurts trust.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** CHANGE option (voice coaching OFF by default) not applied — owner may choose

### 21. R26 — Days-per-week suggestion (P2)

- **Question:** Who gets offered 'start with 3 days'?
- **Current placeholder:** Anyone choosing 5 or more days (they can keep their choice)
- **Recommendation:** APPROVE.
- **Why:** ACSM Guidelines 11th ed.: resistance training 2–3 days per week for beginners. Habit research (Lally et al., 2010, Eur J Soc Psychol 40:998–1009) suggests a sustainable routine matters more than an ambitious start.
- **Risk if wrong:** Being pushy toward motivated users (they can keep their choice).
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 22. R10 — Check-in → shorter session (P2)

- **Question:** When is the short session offered?
- **Current placeholder:** Poor sleep, low energy or a lot of soreness → shorter session offered
- **Recommendation:** APPROVE as an offer only (it already is).
- **Why:** The evidence on how sleep and readiness affect training is mixed (HRV-guided training studies show small effects). An optional offer is low risk.
- **Risk if wrong:** Offering too often feels naggy.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 23. R13 — Short-sleep threshold (Apple Health) (P2)

- **Question:** Below how many hours of sleep is it 'short'?
- **Current placeholder:** Under 6 h
- **Recommendation:** APPROVE.
- **Why:** AASM/SRS consensus (Watson et al., 2015, Sleep 38:843–4) recommends 7 h or more for adults. 6 h is a lenient cut that allows for wearables over- or under-estimating sleep.
- **Risk if wrong:** Small: affects an optional offer only.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 24. OQ-18 — Apple Health read types (P2)

- **Question:** Which Health data types do we ask to read (S12)?
- **Current placeholder:** Proposal list (sleep, workouts, steps, etc.)
- **Recommendation:** APPROVE only the types the engine actually uses today (sleep duration, workouts). Add more later.
- **Why:** Data minimisation (GDPR Art. 5(1)(c)) and Apple's HealthKit review rules ask apps to request only what they use.
- **Risk if wrong:** App review rejection; users trust us less.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Implemented: only sleep and workouts are read; copy updated

### 25. R16 — Weekly goal and streak (P2)

- **Question:** Weekly goal and streak rules.
- **Current placeholder:** Goal = chosen workouts per week (2 if the week varies); streak = weeks in a row with at least one workout; no penalties or 'broken streak' messages
- **Recommendation:** APPROVE.
- **Why:** Counting weeks (not days) and not shaming missed weeks fits self-determination theory. Daily streaks are known to cause pressure and drop-off after a break.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 26. R12 — Rest between sets (P3)

- **Question:** Rest between sets.
- **Current placeholder:** 30 s / 45 s
- **Recommendation:** APPROVE for low-intensity bodyweight work.
- **Why:** ACSM 2009 suggests 1–2 min for lighter loads and 2–3 min for heavy compound lifts. Easy beginner bodyweight sets need less, but give a 'need more rest' option.
- **Risk if wrong:** Too little rest: sets fall below range, which looks like 'poor' to X5.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Implemented: "Need more rest? +15 s" button

### 27. R2 — Levels per ladder (P3)

- **Question:** Levels per movement ladder.
- **Current placeholder:** 4
- **Recommendation:** APPROVE for the prototype. Coach review of the regressions and progressions.
- **Why:** Depends on the exercise library; no external standard.
- **Risk if wrong:** Gaps that are too big between steps.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 28. R6 — Plateau rule (P3)

- **Question:** When is it a plateau, and what do we try first?
- **Current placeholder:** 4 flat sessions; tempo → add a set → offer a different version → suggest a lighter week
- **Recommendation:** APPROVE.
- **Why:** The order of these steps is not settled in research. A lighter week as a last step is common practice.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 29. R5 — Anti-thrash (P3)

- **Question:** Minimum sessions between plan changes.
- **Current placeholder:** 2
- **Recommendation:** APPROVE.
- **Why:** Product stability choice.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 30. R15 — Offer shorter sessions (P3)

- **Question:** Offer shorter sessions if the real length is below X × planned.
- **Current placeholder:** 0.7
- **Recommendation:** APPROVE; re-fit from pilot data.
- **Why:** Arbitrary threshold.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 31. R22 — 'Finished fast' cue (P3)

- **Question:** Average seconds per rep that counts as fast.
- **Current placeholder:** Under 2 s per rep
- **Recommendation:** APPROVE (copy only).
- **Why:** ACSM 2009 suggests moderate tempos (roughly 1–2 s up, 1–2 s down) for novices.
- **Risk if wrong:** Low: copy only.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 32. R24 — Experience answer → tone (P3)

- **Question:** Is the experience question still worth asking?
- **Current placeholder:** 4 tone lines; never changes difficulty
- **Recommendation:** DEFER, or remove the question to shorten onboarding (ties to OQ-16).
- **Why:** Product choice.
- **Risk if wrong:** Low.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Experience answer still sets the tone line only (never difficulty); the tone copy stays in RESEARCH_NEEDED until reviewed. Whether to keep the question is revisited with OQ-16 screen-count testing

### 33. R14 — Default reminder time (P3)

- **Question:** Default nudge time before the app learns the user's pattern.
- **Current placeholder:** 18:00
- **Recommendation:** APPROVE.
- **Why:** JITAI work (Nahum-Shani et al., 2018, Ann Behav Med 52:446–62) suggests learning the timing from the person, which the app does. 18:00 is only the first guess.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 34. X1 — Evidence-tier labels (P3)

- **Question:** Unknown / Baseline only / Early / Building / Personalized: what counts as each?
- **Current placeholder:** Based on counts of observations and sessions (engine tier())
- **Recommendation:** APPROVE; check the wording with users.
- **Why:** Measurement-reliability choice; no external standard.
- **Risk if wrong:** Claiming 'personalized' too early is a trust problem.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 35. X3 — Rest-day touchpoint (P3)

- **Question:** Rest-day content.
- **Current placeholder:** 60 s breathing drill + quick check-in
- **Recommendation:** APPROVE.
- **Why:** Low risk; not validated.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 36. X4 — Measure chips and run caps (P3)

- **Question:** Chip ranges and the 120 s cap for reps.
- **Current placeholder:** Chips around the target; 120 s cap
- **Recommendation:** APPROVE.
- **Why:** Usability only.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 37. X7 — Reminder demo (P3)

- **Question:** Reminders: once a day; iOS limits explained.
- **Current placeholder:** 1/day
- **Recommendation:** APPROVE.
- **Why:** Apple WebKit docs: web push on iOS needs Add to Home Screen (iOS 16.4+).
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 38. X8 — Look of the 3D coach (P3)

- **Question:** Is the Quaternius CC0 mannequin acceptable?
- **Current placeholder:** Tinted, faceless CC0 mannequin
- **Recommendation:** APPROVE for the prototype. Design review for tone and body diversity before native.
- **Why:** Placeholder art.
- **Risk if wrong:** Some users don't relate to it.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Design review before launch

### 39. X9 — Demo animations needed (P3)

- **Question:** Only sit-to-stand has an honest CC0 demo. How do we get the rest?
- **Current placeholder:** Text + muscle map for every other exercise
- **Recommendation:** DECIDE on a budget: commission CC0 or owned mocap clips, and have a coach check the form before shipping.
- **Why:** Free CC0 packs (Quaternius UAL 1 and 2 Standard) have no exercise clips. A wrong-form demo is worse than none.
- **Risk if wrong:** Wrong form taught by the app.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Budget decision on commissioned CC0/owned mocap clips plus coach form check; not decided

### 40. OQ-9 — Holidays (P3)

- **Question:** Use only the device locale for public holidays, or ask for Calendar access?
- **Current placeholder:** Device locale only
- **Recommendation:** APPROVE locale only.
- **Why:** Data minimisation; Calendar access adds privacy friction for little benefit.
- **Risk if wrong:** Low.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav).

### 41. OQ-11 — Backups / export (P3)

- **Question:** Rely on iOS backups only, or add an encrypted export file?
- **Current placeholder:** Prototype has a JSON backup
- **Recommendation:** DEFER to the native build. Recommend an encrypted export if health data is stored.
- **Why:** GDPR Art. 20 (data portability) favours an export.
- **Risk if wrong:** Lost data on a phone change.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Deferred to the native build

### 42. OQ-12 — First name for voice (P3)

- **Question:** Ask for an optional first name for voice coaching?
- **Current placeholder:** Not asked
- **Recommendation:** DEFER; test it in the pilot.
- **Why:** Product choice.
- **Risk if wrong:** Low.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Deferred; test in the pilot

### 43. OQ-13 — Voice reliability (P3)

- **Question:** What error rate is OK for on-device 'done' / 'stop' in noisy homes? Do we need hold-to-talk?
- **Current placeholder:** Always-listening; buttons always shown
- **Recommendation:** APPROVE, because the buttons are always on screen. Measure false triggers in the pilot.
- **Why:** No standard; a 'stop' that the app misses is covered by the big Stop button.
- **Risk if wrong:** A missed 'stop' if the user relies only on voice.
- **Decision:** APPROVED — 2026-10-27, owner (vamsimadhav). **Notes:** Measure in the pilot

### 44. OQ-16 — Screen count (P3)

- **Question:** 11 screens + summary + handoff (+2 conditional). Merge S1 and S2?
- **Current placeholder:** Not merged
- **Recommendation:** DEFER to user testing.
- **Why:** Product choice.
- **Risk if wrong:** Drop-off during onboarding.
- **Decision:** DEFERRED — 2026-10-27, owner (vamsimadhav). **Reason:** Deferred to user testing

## Sign-off

Approved by: owner (vamsimadhav), 27 Oct 2026. Clinical reviewer: pending (see deferred items and pre-launch reviews).
