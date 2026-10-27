---
title: "FitcoachAI — Onboarding Spec (MVP)"
subtitle: "Status: PROPOSED — not approved, except decisions marked APPROVED (Oct 26, 2026)"
date: "October 26, 2026"
---

# FitcoachAI — Onboarding Spec (MVP)

| | |
|---|---|
| **Status** | **PROPOSED — not approved**, except the 10 decisions marked ✅ APPROVED (founder, Oct 26, 2026) — see §9 Decision log. Everything not marked APPROVED is still a proposal for discussion between the founder and a colleague. |
| **Platform** | iPhone first, SwiftUI. Everything runs on the device. No accounts, no backend, no LLM in the MVP. |
| **Scope** | First launch through the start of the voice-guided baseline assessment. |
| **Target time** | 3–4 minutes to reach the assessment; the assessment itself takes about 6–10 minutes. |
| **Owner** | Founder (product). Reviewers: colleague, plus a clinician/physio before launch (see Open Questions). |

---

## 0. Principles

1. **Short now, learn later.** We ask **9 core questions over 11 screens** (height and weight were dropped — **✅ APPROVED (Oct 26, 2026)**). Everything else (wake/sleep window, best time of day, real session length, soreness patterns, household items, holidays, what keeps the user coming back) is learned during the **7-day calibration**.
2. **Always play safe.** When we're unsure, we choose the more cautious option. "Not sure" counts as "yes" on the health check (**✅ APPROVED (Oct 26, 2026)**). Missing data counts as **unknown**, never as "fine" or zero.
3. **Reference only.** Every safety surface uses the same fixed statement (§0.1). We never diagnose, never clear anyone medically, and never promise results.
4. **Plain language.** No jargon ("hinge", "RPE", "PAR-Q", "contraindicated") in user-facing copy. Target reading level: about grade 6–8.
5. **Start with no equipment.** The first plan uses only body weight plus things most homes have (a wall, a sturdy chair, floor space). Other equipment is recorded for later.
6. **Readiness per movement pattern, not one fitness score.** A user can be "ready" for pushing and "not ready" for squatting on the same day.
7. **Built for real lives.** Shift workers, new parents, people coming back after having a baby, people with injuries, adaptive users, and people with little or no equipment are core users, not edge cases.
8. **Honest.** No promises about weight loss, pain relief, or timelines. Food guidance stays general (for example, "drink water, eat regular meals with protein and vegetables"). No calorie targets, no meal plans.

### 0.1 Fixed safety statements (exact wording; the engine may not edit these)

**SAFE-REF (reference statement)** — shown on Welcome, Health Check, Summary, and in Settings → Safety:

> **FitcoachAI is for general fitness reference only. It is not medical advice. Please ask your family doctor before starting a new exercise routine, and stop if anything feels wrong.**

**SAFE-DOC (doctor note)** — shown when any health-check answer is "Yes" or "Not sure":

> **Because of your answers, please check with your family doctor before you exercise with FitcoachAI. Until then, we'll keep everything gentle. This app can't tell whether exercise is safe for you — only a doctor who knows you can.**

**SAFE-STOP (red-flag wording)** — shown on the health check, before every session, and whenever the user reports these symptoms:

> **Stop exercising and get medical help right away if you have chest pain or pressure, trouble breathing that doesn't settle with rest, fainting or feeling like you'll faint, a sudden severe headache, sudden weakness or numbness on one side, or a racing or irregular heartbeat. If it feels like an emergency, call your local emergency number.**

**SAFE-PAIN (injury red flags)** — shown on the body map and whenever new pain is reported:

> **Please see a doctor before exercising this area if the pain is severe, getting worse, started after a fall or accident, wakes you at night, or comes with numbness, tingling, weakness, swelling, or fever.**

**SAFE-FOOD** — shown wherever food is mentioned:

> **Our food tips are general. For advice about your own diet, especially if you're pregnant, breastfeeding, or managing a health condition, please talk to your doctor or a registered dietitian.**

---

## 1. Flow overview

```
S1  Welcome & safety                (no question; acknowledge)
S2  Your data stays on your phone   (no question; acknowledge)
S3  About you                       Q1 age range & sex
S4  Your main goal                  Q2
S5  Your experience                 Q3
S6  Your body map                   Q4 injuries/sore areas + movement needs
S7  Quick health check              Q5  ──► S7a Baby & pregnancy follow-up (conditional)
                                         ──► S7b "Let's pause here" (conditional hard stop)
S8  Your day                        Q6 job activity (+ shift pattern)
S9  Your space & equipment          Q7
S10 Your week                       Q8 days/week & minutes/session
S11 Your coach                      Q9 coaching style, voice, nudges
S12 Apple Health (optional)         permission, skippable
S13 Here's what we heard            summary & confirm
S14 Let's see where you're starting transition → baseline assessment
```

- **Core path:** S1–S11 = 11 screens with 9 core questions. S12–S14 are a permission, a review, and the handoff.
- **Conditional screens:** S7a (only if pregnancy/postpartum = yes) and S7b (only if a hard stop applies).
- **Progress bar** covers S3–S11 only ("Step 3 of 9"), so it feels short.
- **Back** is always available. **Quit mid-way:** answers are saved locally; the next launch resumes at the same screen.
- **Accessibility (all screens):** Dynamic Type up to AX5, full VoiceOver labels, 44 pt minimum tap targets, no colour-only meaning, Reduce Motion respected, every voice feature has a button alternative.

---

## 2. Screen-by-screen spec

Field types use Swift notation. All data is stored on the device (SwiftData/Core Data, with file protection `completeUntilFirstUserAuthentication`). `nil` means **unknown**.

---

### S1 — Welcome & safety

**Purpose:** Set expectations (a coach that learns you over months), give the reference-only statement, and get an acknowledgment. Not a question.

**Copy:**

> **Hi, I'm your FitcoachAI coach.**
>
> I'll help you build a routine that fits your body, your schedule, and your life — starting with no equipment.
>
> First, a few quick questions (about 3 minutes). Then we'll do a short, gentle check-in workout so I can see where you're starting. Over the next week, I'll keep learning what works for you.
>
> **One important thing:** *[SAFE-REF]*
>
> I can't promise specific results. What I can do is help you move safely and keep showing up.
>
> ☐ **I understand that FitcoachAI is for reference only and isn't medical advice.**
>
> **[Let's get started]**

**Input:** One checkbox + primary button.
**Required:** Yes. The button is disabled until the box is checked.
**Validation:** Checkbox must be true.
**Engine effect:** None beyond the consent gate. Records that the disclaimer was shown.
**Stored fields:**

| Field | Type | Notes |
|---|---|---|
| `disclaimerAcceptedAt` | `Date` | |
| `disclaimerVersion` | `String` | e.g. `"safe-ref-1.0"`; if the wording changes, ask again |
| `onboardingStartedAt` | `Date` | |
| `appLocale`, `timeZoneID` | `String` | From the device (context awareness); not asked |

**Edge cases:**
- VoiceOver users: the checkbox label reads the whole statement.
- If `disclaimerVersion` changes in a later app version, show S1 again before the next session.

---

### S2 — Your data stays on your phone

**Purpose:** Build trust; explain on-device storage plainly.

**Copy:**

> **Your data stays on your phone.**
>
> - There's no account and no sign-up.
> - Your answers, workouts, and health info are stored **only on this iPhone**.
> - We don't send your data to our servers — we don't have any.
> - You can delete everything at any time in **Settings → Delete my data**.
>
> *Heads up: if you use iCloud or computer backups for your iPhone, those backups may include FitcoachAI data, protected by Apple. If you delete the app without a backup, your history is gone.*
>
> **[Sounds good]**

**Input:** Button only.
**Required:** Must be viewed (not a question).
**Engine effect:** None.
**Stored fields:** `privacyNoticeShownAt: Date`, `privacyNoticeVersion: String`.
**Edge cases:** Wording about backups needs confirming against the final storage choice (see Open Questions, OQ-11).

---

### S3 — About you (Q1 age range & sex)

**Purpose:** Age gate, choose reference ranges for the baseline, and make balance testing sensible.

> **✅ APPROVED (Oct 26, 2026)** **Height and weight are not asked.** The question, its stored fields, and all references were removed because they drove no MVP decision.

**Copy:**

> **A little about you**
>
> **How old are you?**
> ◯ Under 18 ◯ 18–29 ◯ 30–39 ◯ 40–49 ◯ 50–59 ◯ 60–69 ◯ 70+
>
> **What sex were you assigned at birth?**
> *This only helps us compare your check-in results to typical ranges.*
> ◯ Female ◯ Male ◯ Prefer not to say
>
> **[Next]**

**Input:** Two single-select chip groups.
**Required:** Age range required. Sex required, but "Prefer not to say" is a full answer.
**Validation:** One choice in each group.

**Engine effects:**

| Answer | Effect |
|---|---|
| Under 18 | **Hard stop** (S7b-style screen): "FitcoachAI is built for adults (18+) for now." No plan. **✅ APPROVED (Oct 26, 2026)** |
| 60–69, 70+ | Baseline always includes a supported balance test; floor-to-stand moves start as "Not assessed" until tested; slightly longer warm-ups. **Doesn't** turn on conservative mode by itself. |
| Sex = Female/Male | Picks reference ranges for interpreting baseline reps (used to word feedback, not to grade). |
| Prefer not to say | Combined reference ranges. No other effect. |

**Stored fields:**

| Field | Type |
|---|---|
| `ageRange` | `enum AgeRange { under18, r18_29, r30_39, r40_49, r50_59, r60_69, r70plus }` |
| `sexForReference` | `enum SexRef { female, male, undisclosed }` |

**Edge cases:**
- Trans and non-binary users: the question is framed only for reference ranges; pregnancy/postpartum is asked of **everyone** on S7, not based on sex.
- Because body measurements aren't asked, nobody (including people with an eating-disorder history or users who can't stand to be measured) has to enter them.

---

### S4 — Your main goal (Q2)

**Purpose:** Set the plan's focus and the coach's language.

**Copy:**

> **What matters most to you right now?**
> *Pick one. You can change it any time.*
>
> ◯ **Feel more energetic day to day**
> ◯ **Get stronger**
> ◯ **Move with less stiffness or discomfort**
> ◯ **Build a habit I can actually keep**
> ◯ **Get back into exercise after a baby**
> ◯ **Get back into exercise after an injury or time off**
> ◯ **Manage my weight**
>
> **[Next]**

If "Manage my weight" is chosen, show an inline note:

> *We'll focus on regular movement and steady habits, which help most people feel better. We don't give diet plans or promise weight loss. [SAFE-FOOD]*

**Input:** Single-select list.
**Required:** Yes (a choice is needed to shape the plan). Default highlight: "Build a habit".
**Validation:** Exactly one.

**Engine effects:**

| Goal | Plan emphasis | Tone/messages |
|---|---|---|
| Energy | Mixed: short strength + low-impact cardio, more frequent short sessions | Talks about how you feel, sleep, energy |
| Stronger | More strength blocks; progression by reps/tempo/harder variations | Celebrates rep gains |
| Less stiffness | Mobility + gentle strength; longer warm-ups; no high impact at start | Comfort-first language |
| Habit | Shortest effective sessions; streak-friendly; strong daily-return nudges | "Showing up counts" |
| After a baby | **Forces S7 pregnancy/postpartum follow-up** even if the user answers "No" there (we confirm). Postpartum-safe library | Gentle, no "bounce back" language |
| After injury/time off | Body map highlighted; slower progression; "Not assessed" patterns start gentle | Patient, gradual |
| Manage weight | Consistency + daily movement (steps if Health connected); general food tips only | Never mentions body shape; no before/after language |

**Stored fields:** `primaryGoal: enum Goal { energy, strength, lessStiffness, habit, postBaby, returnFromInjury, weight }`, `goalSetAt: Date`.

**Edge cases:** "After a baby" chosen but S7 says no birth in the last 12 months → ask once on S7a: "When was your baby born?" (to apply the right rules).

---

### S5 — Your experience (Q3)

**Purpose:** Set starting difficulty and how much explanation to give.

**Copy:**

> **How would you describe your exercise lately?**
>
> ◯ **I'm new to exercise** — or it's been years
> ◯ **I used to be active, but it's been a while** — more than a few months
> ◯ **I do something now and then** — about once a week or less
> ◯ **I'm active most weeks** — 2 or more times a week
>
> *No wrong answers. Your check-in workout will fine-tune this.*

**Input:** Single-select.
**Required:** Yes.
**Validation:** Exactly one.

**Engine effects:**

| Answer | Starting variants | Progression | Coaching |
|---|---|---|---|
| New | Easiest variant for every pattern (e.g., sit-to-stand, wall push-up) | Slowest | Explains every move; form cues on |
| Used to be | Easy variants; may step up after the baseline | Slow for 2 weeks, then normal | "Your body remembers — let's go gradually" |
| Now and then | Middle variants | Normal | Moderate cues |
| Active | Baseline may test harder variants | Normal | Fewer explanations |

Experience only sets the **starting point for the baseline**; the baseline results override it per movement pattern. Conservative mode (S7) always overrides experience.

**Stored fields:** `experience: enum Experience { new, lapsed, occasional, regular }`.

**Edge cases:** A very fit person coming back from injury picks "Active" → the body map still restricts the affected patterns. Adaptive athletes may be very experienced; the movement-needs answers on S6 decide variants, not experience.

---

### S6 — Your body map (Q4)

**Purpose:** Capture sore or injured areas, what sets them off, and movement needs, so the engine can filter exercises. This is the most important safety screen after S7.

**Copy (top):**

> **Anything we should be careful with?**
> *Tap any area that's sore, injured, or needs extra care. Tap again to remove it.*
>
> [Front / Back body figure — tappable regions]
>
> **[Nothing right now]**

**Regions (front/back, left/right where relevant):** neck, upper back, lower back, shoulder L/R, elbow L/R, wrist & hand L/R, chest, abdomen/core, pelvic floor & groin, hip L/R, knee L/R, ankle & foot L/R, other (free choice from a list: jaw, ribs, tailbone, …).

**When a region is tapped, a bottom sheet opens:**

> **Your [left knee]**
>
> **How is it right now?**
> ◯ Hurts now or recently (last 6 weeks)
> ◯ Old injury — mostly fine, but I'm careful
> ◯ Had surgery here
>
> **What tends to set it off?** *(pick any)*
> ☐ Bending down / squatting ☐ Kneeling ☐ Stairs or stepping up ☐ Jumping or running ☐ Twisting
> ☐ Lifting or reaching overhead ☐ Pushing (like a push-up) ☐ Pulling ☐ Gripping or weight on hands
> ☐ Bending forward / picking things up ☐ Lying on my back or front ☐ Standing or sitting a long time ☐ Not sure
>
> **How much does it bother you on a typical day?** *(optional)*
> 0 ——— 10 slider (0 = not at all, 10 = worst imaginable)
>
> *[SAFE-PAIN]*
>
> **[Save]**

**Movement needs (below the figure, collapsed under "Anything else about how you move?"):**

> ☐ I use a wheelchair or exercise seated
> ☐ I have a limb difference or amputation → which: [arm L/R, leg L/R]
> ☐ I have limited use of one side of my body
> ☐ My balance isn't great
> ☐ Getting down to the floor or back up is hard
> ☐ I'd rather not say more

**Input:** Tappable body map + bottom sheet (single-select status, multi-select triggers, optional slider) + multi-select movement needs.
**Required:** Must either tap "Nothing right now" or save at least one region / need. **Skippable** via "Nothing right now".
**Validation:**
- A region needs a status before saving; triggers default to "Not sure" if none chosen.
- Pain ≥ 7 or status "Hurts now" with "Not sure" triggers → show SAFE-PAIN again with: "We'll leave this area out of your plan for now."

**Engine effects:**

Triggers map to movement patterns:

| Trigger | Patterns affected |
|---|---|
| Bending down/squatting | squat, lunge |
| Kneeling | floor transitions, kneeling variants |
| Stairs/stepping up | lunge/single-leg, step cardio |
| Jumping/running | impact/locomotion |
| Twisting | rotation/core |
| Overhead | vertical push, vertical pull |
| Pushing | horizontal push |
| Pulling | horizontal/vertical pull |
| Gripping/weight on hands | planks on hands, push-ups (switch to forearm/wall variants) |
| Bending forward/picking up | hip hinge |
| Lying on back/front | floor work (switch to standing/seated variants) |
| Standing/sitting long | session structure (frequent position changes) |
| Not sure | **all** patterns loading that region start as "Gentle" |

Rules by status:
- **Hurts now / recently:** affected patterns → **Not ready** (excluded). Excluded from baseline tests. If pain ≥ 7: whole region excluded and SAFE-PAIN shown.
- **Old injury, careful:** affected patterns → **Gentle** (easiest variant, extra pain check-ins).
- **Surgery:** treated as "careful" + asks once: "Has your surgeon or physio said you can exercise this area?" (Yes / Not yet / Not sure). Not yet / Not sure → **Not ready**.
- **No instant clearance:** later, if the user removes a region or says it feels better, affected patterns move **Not ready → Gentle → Ready** only after **3 pain-free sessions across at least 7 days per step** (**✅ APPROVED (Oct 26, 2026)**). The app never jumps straight to full intensity.
- **Report new areas** any time: from the home screen ("Something hurts") and after every set. A new report immediately excludes affected patterns for that session.

Movement needs:
- **Wheelchair/seated:** seated library only; baseline uses seated tests; impact and standing patterns hidden; voice copy changes ("stand" → "sit tall").
- **Limb difference:** unilateral variants on the unaffected side + adapted bilateral moves; no tests that need the missing limb.
- **Limited use of one side:** supported variants; balance tests near a wall/chair only.
- **Balance:** all standing work "with a hand on a wall or chair"; no single-leg tests without support.
- **Floor is hard:** no floor exercises; floor-transition pattern = Not ready until the user opts in.

**Stored fields:**

| Field | Type |
|---|---|
| `bodyAreas` | `[BodyAreaReport]` |
| `BodyAreaReport.region` | `enum BodyRegion` (with `side: Side?`) |
| `BodyAreaReport.status` | `enum { current, oldCareful, surgery }` |
| `BodyAreaReport.triggers` | `Set<Trigger>` |
| `BodyAreaReport.painScore` | `Int?` (0–10) |
| `BodyAreaReport.surgeryCleared` | `Tristate?` (yes/no/unsure) |
| `BodyAreaReport.reportedAt`, `.updatedAt` | `Date` |
| `BodyAreaReport.history` | `[BodyAreaEvent]` (append-only; never overwritten) |
| `movementNeeds` | `Set<MovementNeed>` |
| `limbDifference` | `[Limb]?` |
| `patternReadiness` | `[MovementPattern: Readiness]` where `Readiness { notAssessed, notReady, gentle, ready, progressing }` |

**Edge cases:**
- Pelvic floor selection with postpartum → postpartum rules (S7a) also apply; no impact, no breath-holding.
- Many regions selected (e.g., chronic widespread pain): if ≥ 5 regions "current", show "That's a lot to deal with. We'll start very gently and you're in charge — tell us any time something doesn't feel right." Conservative mode turns on.
- VoiceOver: the body map has a list alternative ("Choose from a list").
- Adaptive users who don't want to describe their disability: "I'd rather not say more" → baseline asks before each test "Would you like to try this, try a seated version, or skip?"

---

### S7 — Quick health check (Q5)

**Purpose:** Plain-language safety screen. Any "Yes" or "Not sure" turns on **conservative mode** and shows **SAFE-DOC**. Certain answers stop the flow.

**Copy:**

> **A quick health check**
> *These questions help keep you safe. Answer "Not sure" if you don't know — that's okay.*
>
> H1. **Has a doctor ever said you have a heart problem, or that you should only exercise with medical advice?**
> H2. **Do you ever get chest pain, pressure, or tightness — when active or at rest?**
> H3. **Has a doctor said you have high blood pressure?**
> H4. **Do you ever feel dizzy, light-headed, or faint, or have you passed out?**
> H5. **Are you pregnant, or have you had a baby in the last 12 months?**
> H6. **Do you take any medicine that affects your heart rate or blood pressure?** *(for example, beta-blockers — if unsure, check the label or ask your pharmacist)*
>
> Each: **[No] [Yes] [Not sure]**
>
> *[SAFE-STOP]*
>
> **[Next]**

**Input:** Six three-way segmented controls.
**Required:** Yes, all six. Not skippable (a safety screen).
**Validation:** Every row answered. No defaults pre-selected.

**Engine effects:**

| Answer | Effect |
|---|---|
| All "No" | Standard mode (still subject to body map and baseline). SAFE-REF still applies. |
| Any "Yes" or "Not sure" (**✅ APPROVED (Oct 26, 2026)** "Not sure" = "Yes") | **Conservative mode ON**, SAFE-DOC shown on the next interstitial, on Summary, and pinned in Settings. |
| H2 (chest pain) = Yes | Follow-up: "Has this happened in the last few weeks, or does it happen when you're active?" Yes/Not sure → **S7b hard stop** (**✅ APPROVED (Oct 26, 2026)**). No → conservative mode. |
| H4 (fainting/dizziness) = Yes | Conservative + no fast floor-to-stand moves, no head-below-heart positions, all standing work near support; baseline balance test skipped. Follow-up: "Have you fainted in the last few months?" Yes/Not sure → **S7b hard stop** (**✅ APPROVED (Oct 26, 2026)**). |
| H5 = Yes | → **S7a** follow-up. |
| H6 = Yes | Conservative + **effort is guided by how you feel, never by heart-rate numbers** (meds can blunt heart rate). Apple Health heart-rate data is shown but not used for effort decisions. |
| H1/H3 = Yes | Conservative mode. |

**Conservative mode — what it does (proposed):**
- Effort cap: "easy to okay" — you can talk in full sentences.
- No high impact (no jumping, no running), no max-effort sets, no holding your breath while straining, no heavy straining moves.
- Longer warm-up (≥ 5 min) and cool-down (≥ 3 min).
- Slower progression (proposed: at most one small step up per pattern per week, and only after 2 sessions rated "easy" or "okay" with no pain).
- Baseline uses gentle variants and shorter tests; step/cardio test uses marching only.
- SAFE-STOP read aloud (voice on) at the start of the first session each week.
- "Pushy" coaching style is softened to "encouraging" for effort cues (still direct about consistency).
- **Leaving conservative mode** (**✅ APPROVED (Oct 26, 2026)**): only by the user re-answering the health check with all "No", or by self-confirming "My doctor has said I can exercise without limits" (stored with date). We never infer clearance. There is no automatic time-out.

**S7b — "Let's pause here" (hard stop)**

> **Let's pause here.**
>
> Based on what you told us, it isn't safe for FitcoachAI to plan your exercise right now. Please talk to your family doctor first.
>
> *[SAFE-STOP]*
>
> When you've spoken with your doctor, you can come back and update your answers.
>
> **[Update my answers]** **[Remind me in a week]**

No plan, no assessment. Data kept on device. Hard stop triggers (**✅ APPROVED (Oct 26, 2026)**): under 18; recent/active chest pain; recent fainting; pregnancy (MVP); early postpartum; late postpartum without clearance.

**Stored fields:**

| Field | Type |
|---|---|
| `healthScreen.heartCondition` | `Tristate` |
| `healthScreen.chestPain` | `Tristate`; `chestPainRecentOrExertional: Tristate?` |
| `healthScreen.highBloodPressure` | `Tristate` |
| `healthScreen.dizzinessFainting` | `Tristate`; `faintedRecently: Tristate?` |
| `healthScreen.pregnantOrPostpartum` | `Tristate` |
| `healthScreen.hrAffectingMeds` | `Tristate` |
| `healthScreen.answeredAt` | `Date`; `version: String` |
| `safetyMode` | `enum SafetyMode { standard, conservative, paused }` |
| `safetyModeReasons` | `Set<SafetyReason>` |
| `doctorClearanceSelfReportedAt` | `Date?` |

`Tristate = { no, yes, unsure }`; `unsure` is treated as `yes` everywhere.

**Edge cases:**
- Shift workers often feel dizzy from fatigue: we don't second-guess; "Yes" → conservative. Calibration may suggest re-checking with a doctor rather than lifting the mode.
- The health check is re-asked **every 90 days** (**✅ APPROVED (Oct 26, 2026)**) and whenever the user taps "My health has changed".

---

### S7a — Pregnancy & baby follow-up (conditional)

**Shown when:** S7 H5 = Yes/Not sure, or S4 goal = "After a baby".

**Copy:**

> **Congratulations — and thank you for telling us.**
>
> **Which applies to you?**
> ◯ I'm pregnant now
> ◯ I had a baby → **When?** [date picker, month/year is enough] **How was your baby born?** ◯ Vaginal birth ◯ C-section ◯ Prefer not to say
>
> **Has your doctor, midwife, or physio said you're ready to start exercising again?**
> ◯ Yes ◯ Not yet ◯ Not sure

**Rules (**✅ APPROVED (Oct 26, 2026)** — the 12-week threshold still needs review by a pelvic-floor physio before launch; see OQ-1):**

| Situation | Result |
|---|---|
| Pregnant now | **S7b pause (MVP)** (**✅ APPROVED (Oct 26, 2026)**). Copy: "FitcoachAI isn't built for pregnancy yet. Your doctor or midwife can tell you what's right for you." |
| Early postpartum (< 12 weeks since birth, any birth type — **✅ APPROVED (Oct 26, 2026)**) | **Never recommended.** S7b pause variant: "The first weeks after birth are for recovery. We'll be here when you're ready. [Remind me when my baby is 12 weeks old]" |
| Late postpartum (12 weeks–12 months) + clearance "Yes" | Allowed, **conservative mode + postpartum mode**. |
| Late postpartum + "Not yet" / "Not sure" | **Clearance gate:** S7b pause: "Please get the go-ahead from your doctor, midwife, or physio first." |
| Birth date unknown / prefer not to say birth type | Treated as early postpartum → pause, with option to fill in later. |

**Postpartum mode (on top of conservative):** no impact or running; no heavy straining or breath-holding; no full sit-ups/crunches or front planks to start; breathing and gentle core work first; asks after sessions about leaking, heaviness or pressure in the pelvis, or pain at the scar — any "yes" → that pattern goes to Not ready and the user sees: "Please mention this to your doctor or a pelvic floor physio." C-section: abdomen region auto-added to body map as "careful".

**Stored fields:** `postpartum: PostpartumInfo?` { `pregnantNow: Bool`, `birthDate: Date?`, `birthType: enum { vaginal, cesarean, undisclosed }?`, `clearance: Tristate`, `clearanceAnsweredAt: Date` }, `postpartumMode: Bool`.

**Edge cases:** Breastfeeding → SAFE-FOOD wherever food appears; no fasting-style suggestions ever. New parents' sleep → calibration expects broken sleep; missed days are never treated as "failure".

---

### S8 — Your day (Q6 job activity)

**Purpose:** Occupational activity changes how much training load is sensible, which patterns are already worked hard, and when the user can train.

**Copy:**

> **What does a typical work day look like for your body?**
>
> ◯ **Mostly sitting** (desk, driving)
> ◯ **On my feet** (standing or walking a lot)
> ◯ **Physical work** (lifting, carrying, climbing)
> ◯ **Very heavy physical work** (most of the day)
> ◯ **Caring for others at home** (kids, family)
> ◯ **Not working right now**
> ◯ **It varies a lot**
>
> **When do you usually work?**
> ◯ Regular daytime hours ◯ Evening or night shifts ◯ Rotating shifts ◯ It changes week to week ◯ Doesn't apply

**Input:** Two single-select groups.
**Required:** Job activity required; work timing required unless "Not working right now" (then auto "Doesn't apply").
**Validation:** One of each.

**Engine effects:**

| Answer | Effect |
|---|---|
| Mostly sitting | Adds mobility "movement snacks"; hip/upper-back mobility emphasis. |
| On my feet | Lower total leg volume on work days; foot/ankle and calf care; prefers non-standing finishers. |
| Physical / very heavy | Lower volume and intensity on work days, especially for patterns used at work (lifting = hinge/carry); suggests recovery/mobility sessions after shifts; strength days placed on days off where known. Very heavy → max 3 hard sessions/week by default. |
| Caring at home | Short, interruptible sessions (blocks of 3–5 min that can be paused); quiet mode suggested. |
| Night/rotating/changing shifts | **Shift-worker mode:** plan is anchored to *wake time*, not clock time; no fixed morning reminders; no hard sessions in the 2 hours before planned sleep (learned in calibration); after a night shift, default suggestion is light movement only. |
| Varies | Calibration asks daily "How physical was today?" for the first 7 days. |

**Stored fields:** `jobActivity: enum { sitting, onFeet, physical, veryHeavy, caregiving, notWorking, varies }`, `workPattern: enum { regularDay, eveningNight, rotating, irregular, notApplicable }`.

**Edge cases:** Multiple jobs → choose the most physical (helper text: "Have more than one job? Pick the most physical one."). Users with holidays or seasonal work: calibration and the device's calendar locale handle public holidays (no calendar access requested in MVP; see OQ-9).

---

### S9 — Your space & equipment (Q7)

**Purpose:** Confirm the no-equipment start, find usable household items, and learn about noise/space limits.

**Copy:**

> **Where will you usually work out?**
> *You don't need any equipment — we'll start with just your body.*
>
> **What do you have nearby?** *(pick any)*
> ☐ A wall ☐ A sturdy chair (no wheels) ☐ Stairs or a sturdy step ☐ Floor space to lie down
> ☐ A towel ☐ A backpack I could add weight to ☐ Resistance bands ☐ Dumbbells or kettlebells ☐ None of these
>
> **Need to keep it quiet?** *(sleeping baby, neighbours, night shifts)*
> ◯ Yes, no jumping or noise ◯ No, I'm fine

**Input:** Multi-select chips + single toggle.
**Required:** Optional (skip = "None of these" + quiet "No"). Skippable.
**Validation:** "None of these" deselects the others.

**Engine effects:**
- **MVP plan always starts body-weight only.** Wall and chair are used where safe (wall push-ups, sit-to-stand, supported balance). If no chair, chair moves get standing alternatives.
- Stairs/step → step-ups and step cardio only if no knee/ankle/stairs trigger and balance is not flagged.
- No floor space → no floor exercises (same as "floor is hard").
- Bands/dumbbells/backpack → stored; **not used in MVP plans** (**✅ APPROVED (Oct 26, 2026)**). The coach may say "Later, we can add your bands."
- Quiet mode → no jumping, no stomping; low-impact cardio (marching, step-backs, shadow boxing).

**Stored fields:** `availableItems: Set<Item>`, `quietMode: Bool`, `equipmentAnsweredAt: Date`.

**Edge cases:** Wheelchair users: chair item hidden; "Stable surface for wheelchair brakes" shown instead. Office-chair-with-wheels warning on "sturdy chair": "Chairs with wheels can roll — please use one without."

---

### S10 — Your week (Q8 days/week & minutes/session)

**Purpose:** Set realistic frequency and session length.

**Copy:**

> **How much time can you realistically give?**
> *Pick what fits a normal week — not your best week.*
>
> **Days per week:** ◯ 1 ◯ 2 ◯ 3 ◯ 4 ◯ 5 ◯ 6+ ◯ It changes a lot
> **Minutes per session:** ◯ 10 ◯ 15 ◯ 20 ◯ 30 ◯ 45+

**Input:** Two single-select chip rows.
**Required:** Yes. Defaults pre-highlighted: 3 days, 20 minutes.
**Validation:** One of each. If experience = New/Lapsed or conservative mode, and days ≥ 5 → soft suggestion: "Starting with 3 days usually works better — want to start there? [Start with 3] [Keep my choice]". If kept, extra days become light/mobility days.

**Engine effects:**
- Frequency → split: 1–2 days = full-body; 3–4 = full-body alternating emphasis; 5+ = alternating strength / light cardio / mobility days (no pattern trained hard two days in a row).
- Minutes → session template (10 min = warm-up 2 + main 7 + cool-down 1; conservative mode adds warm-up time and cuts main work, not the safety blocks).
- "It changes a lot" → weekly target range (e.g., "2–4 sessions") with flexible scheduling; each day offers a 10-minute minimum version.
- Every session also has a "short on time" 10-minute version (motivation/daily return).

**Stored fields:** `targetDaysPerWeek: Int?` (nil = variable), `variableSchedule: Bool`, `targetMinutes: Int`, `scheduleAnsweredAt: Date`.

**Edge cases:** New parents and shift workers will under- or over-estimate; calibration compares planned vs. actual minutes and adjusts after day 7 (with the user's OK).

---

### S11 — Your coach (Q9 coaching style, voice, nudges)

**Purpose:** Tone, voice guidance, and daily return.

**Copy:**

> **How should I coach you?**
>
> ◯ **Calm and encouraging** — gentle reminders, lots of reassurance
> ◯ **Direct and pushy** — I'll nudge you to show up and push a bit (but never through pain)
>
> **Voice coaching during workouts**
> ◯ On — talk me through it ◯ Off — just show me on screen
>
> **Daily nudge**
> ◯ Yes, around [time picker] ◯ Learn the best time for me ◯ No nudges

**Input:** Two single-selects + nudge single-select with optional time picker.
**Required:** Coaching style and voice required (defaults: Calm, Voice On). Nudge optional (default "Learn the best time for me").
**Validation:** Time picker required only if "Yes, around…" is chosen. Shift workers (S8) default to "Learn the best time for me" and the fixed-time option shows: "Tip: with changing shifts, letting me learn usually works better."

**Engine effects:**
- **Calm:** soft language; missed day → "No problem. Want a 10-minute version today?" **Pushy:** firmer ("You said 3 days. Let's get day 2 done."), more frequent nudges (still max 1/day), but **never** encourages pushing through pain, never shames, and is softened in conservative/postpartum mode.
- **Voice On:** spoken cues, counting, "done" voice control (on-device speech recognition). **Off:** text, haptics, and buttons; baseline still offers voice for "done" but defaults to the button.
- **Nudges:** iOS notification permission requested **only** after the user picks "Yes" or "Learn" (on tap of Next). Denied → no nudges, in-app reminders only. Max 1 nudge per day; none during learned sleep window; none on device-locale public holidays unless the user opts in.

**Stored fields:** `coachingStyle: enum { calm, direct }`, `voiceCoaching: Bool`, `nudgeMode: enum { fixedTime, learned, off }`, `nudgeTime: DateComponents?`, `notificationsAuthorized: Bool?`.

**Edge cases:** Deaf/hard-of-hearing users → Voice Off plus strong haptics; captions for all spoken cues. Users with speech differences → button backup is always visible, never hidden.

---

### S12 — Apple Health (optional)

**Purpose:** Optional, read-only context. Never required.

**Copy:**

> **Connect Apple Health? (optional)**
>
> If you'd like, FitcoachAI can **read** some of your Apple Health data to understand your days better — like steps, sleep, and workouts. **We never write to Apple Health, and the data stays on your phone.**
>
> You choose exactly what to share on the next screen, and you can change it any time in the Health app.
>
> **[Connect Apple Health]** **[Not now]**

**Read types requested (proposed):** steps, walking/running distance, active energy, exercise minutes, workouts, sleep analysis, resting heart rate, heart rate (display/context only), flights climbed.

**Required:** No. Skippable ("Not now").
**Validation:** None. Note: iOS doesn't tell apps which **read** permissions were denied — so any missing type is treated as **unknown** (also when the user simply has no data).

**Engine effects:**
- Steps/workouts → daily load context (e.g., a 20,000-step shift → lighter session suggested).
- Sleep → readiness hint only ("You slept less than usual — want the lighter version?"); never blocks a session by itself.
- Heart rate → shown for interest; **not** used for effort decisions if S7 H6 = Yes/Not sure; never used to diagnose or alert about heart conditions.
- **Missing = unknown:** no data never means "inactive" or "slept badly".

**Stored fields:** `healthKitRequestedAt: Date?`, `healthKitPromptShown: Bool`, cached daily summaries `[DailyHealthSummary]` with every metric as `Double?`.

**Edge cases:** No Apple Watch → most heart/sleep data missing; fine. Shift workers' sleep crosses midnight → sleep is grouped by "sleep period", not calendar day.

---

### S13 — Here's what we heard (summary & confirm)

**Purpose:** Let the user check and fix answers, and see their safety status clearly.

**Copy:**

> **Here's what we heard**
>
> - **You:** 30–39 · Female **[Edit]**
> - **Main goal:** Build a habit I can actually keep **[Edit]**
> - **Experience:** Used to be active **[Edit]**
> - **Careful with:** Left knee (stairs, squatting) · Lower back (bending forward) **[Edit]**
> - **Your day:** On my feet · Rotating shifts **[Edit]**
> - **Space:** Wall, chair · Quiet mode on **[Edit]**
> - **Your week:** 3 days · 20 minutes **[Edit]**
> - **Coach:** Calm · Voice on · I'll learn your best time **[Edit]**
> - **Apple Health:** Connected (read only) **[Edit]**
>
> *(If conservative mode is on:)*
> 🟡 **Gentle mode is on.** *[SAFE-DOC]*
>
> *[SAFE-REF]*
>
> **[Looks right]**

**Input:** Review list with edit links (jumps back, then returns here).
**Required:** Must tap "Looks right".
**Engine effects:** On confirm, the engine builds `UserProfile v1`, computes initial `patternReadiness`, selects the baseline test set, and writes `onboardingCompletedAt`.
**Stored fields:** `onboardingCompletedAt: Date`, `profileVersion: Int`, `profileSnapshot: Data` (immutable copy for later comparison).
**Edge cases:** Editing the health check here re-runs all S7 logic (including hard stops). The user-facing label is "Gentle mode" (friendlier than "conservative mode").

---

### S14 — Let's see where you're starting (transition to baseline)

**Purpose:** Explain the baseline, request mic/speech permission, and hand off.

**Copy:**

> **Let's see where you're starting**
>
> Next is a short check-in workout: **[4–6] quick tests**, about **[6–10] minutes**. It's not a fitness exam — it just helps me pick the right level for you.
>
> **How it works**
> - I'll explain each test, then you go.
> - Say **"done"** when you finish — or tap the big **Done** button.
> - You'll rest **10–15 seconds** between tests.
> - After each one, I'll ask how it felt and how many you did.
> - Say **"stop"** or tap **Stop** any time. **Stop right away if anything hurts.**
>
> *[SAFE-STOP]*
>
> **[Start check-in]** **[Do it later]**

On "Start check-in", if voice is on: request **Microphone** and **Speech Recognition** permissions with the explanation "So you can say 'done' and 'stop' hands-free. Your voice is processed on your phone." Speech uses on-device recognition only (`requiresOnDeviceRecognition = true`); if on-device recognition isn't available for the user's language, voice control is turned off and buttons are used.

**"Do it later"** → home screen with a gentle plan using only the easiest variants and all patterns "Not assessed"; reminder in 24 hours (or learned time).

**Stored fields:** `micAuthorized: Bool?`, `speechAuthorized: Bool?`, `baselineDeferred: Bool`.

---

## 3. Baseline assessment (handoff spec)

**Test selection:** 4–6 tests chosen from the profile. Any test whose pattern is **Not ready** (body map, postpartum, red flags) is skipped and shown as "Skipped to protect your [knee]".

| # | Pattern | Default test | Gentle / adaptive variant | What's recorded |
|---|---|---|---|---|
| 1 | Squat | Sit-to-stand from a chair, as many as comfortable in 30 s (stops at 15) | Partial range / hands on thighs; **seated:** seated forward reach-and-return | reps, time, effort, pain |
| 2 | Push | Wall push-ups (harder: counter/knee/floor push-ups if "Active") | Seated chest press against wall / band-free arm pushes | reps, effort, pain |
| 3 | Hinge | Glute bridge reps (floor) | Standing hip hinge to a wall (no floor); **seated:** seated forward lean & return | reps, effort, pain |
| 4 | Core | Forearm wall plank hold (harder: floor forearm plank) | Seated brace & breathe; postpartum: breathing + heel slides | hold time, effort, pain |
| 5 | Balance | Supported single-leg stand, each side (hand near wall/chair) | Feet-together stand; **seated:** seated reach | time each side, effort |
| 6 | Cardio | 2-minute march in place + talk test ("Can you say a full sentence?") | Seated arm march; conservative: 1 minute | reps/steps (counted by user or Health if available), talk test, effort |

**Per-test flow:**
1. Demo (short animation + spoken cue if voice on) → "Ready? Go."
2. User performs; app counts time. User says **"done"** (on-device speech) or taps **Done**. Auto-stop at the test's cap.
3. **"How many did you do?"** → say a number or use a big +/− stepper (pre-filled with nothing; "I lost count" allowed → `nil`). *Time alone is weak evidence, so reps are asked every time.*
4. **"How did that feel?"** → **Easy / Okay / Hard** (voice or buttons).
5. **"Any pain?"** → **No / Yes**. Yes → "Where?" (mini body map) → new or updated `BodyAreaReport`; that pattern → Not ready; if the pain is sharp or doesn't settle → stop the assessment and show SAFE-PAIN.
6. Rest **10–15 s** (countdown; "skip rest" allowed except in conservative mode).

**Readiness from results (per pattern):** Hard or pain → Not ready / Gentle; Okay → Gentle/Ready at the tested variant; Easy with good reps → Ready, and the plan starts one variant up. Unknown reps + "Easy" → Ready at tested variant only (no step-up on weak evidence).

**Stop rules:** "stop" / Stop button / any SAFE-STOP symptom → end immediately, SAFE-STOP shown, nothing is "failed".

**Stored:** `BaselineResult { pattern, testID, variant, reps: Int?, durationSec: Double, holdSec: Double?, effort: enum { easy, okay, hard }?, pain: Bool?, painRegion: BodyRegion?, inputMethod: enum { voice, button, auto }, completedAt }`.

---

## 4. 7-day calibration (what we learn instead of asking)

| Learned | How | Feeds |
|---|---|---|
| Wake/sleep window, best training time | Session times, app opens, Health sleep (if shared) | Nudge timing, shift-worker mode |
| Real session length | Actual vs. planned minutes | Session template |
| Effort and soreness trends | Post-session easy/okay/hard + next-day soreness check | Progression, readiness per pattern |
| Pain patterns | Post-set pain reports | Body map, readiness |
| Work-day load | "How physical was today?" (if job = varies/physical) + steps | Daily session intensity |
| Household items & space | "Did you have a chair handy?" prompts | Exercise choice |
| Holidays/routine breaks | Device locale + time zone changes + missed-day patterns | Plan pauses, nudges |
| What keeps them coming back | Response to nudges, streak vs. no-streak reactions | Motivation tactics, tone |

At day 7: a short "Here's what I learned" screen; any plan change (days, minutes, times) needs the user's OK. Calibration never raises intensity in conservative mode beyond the conservative caps.

---

## 5. Question → decision map

| # | Question (screen) | Safety rules | Exercise filtering | Plan structure | Tone / motivation | Context |
|---|---|---|---|---|---|---|
| Q1a | Age range (S3) | <18 hard stop | 60+: supported balance test, floor transitions start not assessed | Longer warm-up 60+ | — | — |
| Q1b | Sex (S3) | — | — | — | Feedback wording via reference ranges | — |
| Q2 | Main goal (S4) | "After a baby" forces S7a | Postpartum library if relevant | Emphasis (strength / mobility / habit…) | Language and celebrations | — |
| Q3 | Experience (S5) | Overridden by S6/S7 | Starting variant per pattern (baseline overrides) | Progression speed | Explanation depth | — |
| Q4 | Body map + movement needs (S6) | SAFE-PAIN; no instant clearance; ≥5 current areas → gentle mode | Patterns → Not ready/Gentle; seated/limb/balance/floor libraries | Removes/substitutes blocks | Comfort-first language | — |
| Q5 | Health check (S7, S7a) | Gentle mode, SAFE-DOC, hard stops, postpartum gate | No impact, no max effort/straining; postpartum filters | Slower progression, longer warm-ups | Pushy softened | HR not used if meds |
| Q6 | Job activity & work timing (S8) | Very heavy → cap hard sessions | Reduce patterns used at work | Work-day vs. day-off sessions | — | Shift-worker mode, wake-anchored plan |
| Q7 | Space & equipment (S9) | No wheeled chairs | Body-weight only; wall/chair/stairs; quiet mode = no impact | — | — | Noise limits |
| Q8 | Days & minutes (S10) | Soft cap for new/gentle users | — | Split and session template; 10-min fallback | — | Variable schedule |
| Q9 | Coaching style, voice, nudges (S11) | Never push through pain | Voice vs. button control | — | Calm vs. direct; nudge frequency | Nudge timing |
| — | Apple Health (S12) | HR not used for effort if meds | — | Daily load adjustments | "Lighter version?" offers | Steps, sleep, workouts; missing = unknown |

---

## 6. Deliberately NOT asked (and why)

| Not asked | Why |
|---|---|
| Name, email, phone, account | No accounts/backend in MVP; less to protect. (Optional first name for voice could be added later — OQ-12.) |
| Exact date of birth | Age range is enough; less sensitive. |
| Full medical history, diagnosis list, medication list | We can't safely interpret it without a clinician or an LLM; a yes/no screen + doctor note is safer and honest. |
| Injury diagnoses, dates, imaging | Users often don't know; what sets pain off is more useful for filtering. |
| Height and weight | Dropped (**✅ APPROVED (Oct 26, 2026)**): they drove no MVP decision, and skipping them shortens S3 and avoids body-image pressure. |
| Body fat %, waist size, body photos | Not needed for MVP decisions; can harm motivation and body image. |
| Target weight, deadline | Encourages outcome promises we won't make. |
| Calories, diet, macros, eating habits | Food guidance is general only; diet questions imply individual nutrition advice. |
| Menstrual cycle | Not used by the MVP engine; sensitive. |
| Mental health, stress scores | Not something we can act on safely; mood is learned lightly from session feedback. |
| Detailed sleep questions | Learned from calibration/Health instead of asked. |
| Preferred workout time | Learned in calibration (fixed-time nudge is optional on S11). |
| Location / GPS | Time zone and locale come from the device; no location permission needed. |
| Resting heart rate / max HR test | Unreliable self-report; HR-based effort is risky with medications; we use how-it-feels effort. |
| Fitness test scores from elsewhere | The baseline replaces this. |
| Ethnicity, income, education | Not used in any decision. |
| Motivation personality quiz | Too long; we learn what works by watching responses to nudges. |

---

## 7. Open questions for the founder

### 7.1 Still open (PROPOSED)

1. **OQ-1a Pelvic-floor physio review.** The 12-week early-postpartum line is approved, but a pelvic-floor physio must still review it before launch. They should also say whether a C-section needs a longer window and check the post-session postpartum questions.
2. **OQ-5 Red-flag wording sign-off.** SAFE-REF/DOC/STOP/PAIN wording needs legal and clinical review, and localization per country (e.g., "family doctor" vs. "GP", emergency number).
3. **OQ-6b Older adults.** Should 70+ default to gentle mode, or only via the health check (current proposal)?
4. **OQ-9 Holidays.** Use only device locale for public holidays, or ask for Calendar access (more context, more privacy friction)?
5. **OQ-11 Backups/export.** Rely on iOS device backups only, or add an encrypted export file? Affects the privacy copy on S2.
6. **OQ-12 First name** for voice coaching ("Nice work, Sam") — worth one optional field?
7. **OQ-13 Voice reliability.** On-device "done"/"stop" in noisy homes (TV, kids). Acceptable error rate? Do we need a hold-to-talk mode?
8. **OQ-15 Regulatory.** Confirm positioning as a general wellness app (not a medical device) in target countries, and App Store health-claim rules for copy.
9. **OQ-16 Screen count.** 11 screens + summary + handoff, plus up to 2 conditional screens. Do we merge S1 and S2 to feel even shorter?
10. **OQ-17 Gentle-mode details.** Gentle mode's effort cap, progression rate, and warm-up lengths (S7) are still proposals.
11. **OQ-18 Apple Health read types** (S12) are still a proposal.

### 7.2 Resolved — ✅ APPROVED by the founder on Oct 26, 2026

| ID | Question | Decision |
|---|---|---|
| OQ-1 | Early-postpartum threshold | Under 12 weeks after birth (any birth type) = early postpartum, never recommended. *Still flagged for pelvic-floor physio review (OQ-1a).* |
| OQ-2 | Pregnancy in MVP | Pregnant users get the pause screen (S7b); no plan in MVP. |
| OQ-3 | "Not sure" on health check | Counts as "Yes" → gentle mode + doctor note. |
| OQ-4 | Leaving gentle mode | Only by re-answering the health check with all "No", or by a dated self-report that a doctor said they can exercise without limits. Clearance is never inferred. |
| OQ-6a | Minimum age | Under-18s are stopped (hard stop). |
| OQ-7 | Equipment beyond body weight | Bands/dumbbells (and backpack) are recorded but not used in MVP plans. |
| OQ-8 | No-instant-clearance step-up | 3 pain-free sessions over at least 7 days per step (Not ready → Gentle → Ready). |
| OQ-10 | Height & weight | Dropped: question, fields, and references removed; core questions renumbered Q1–Q9. |
| OQ-14 | Health-check re-screening | Re-asked every 90 days (and whenever the user reports a health change). |
| — | Recent chest pain / fainting | Stops onboarding (S7b hard stop) until the user updates their answers after seeing a doctor. |

---

## 8. Data model summary (MVP)

```swift
struct UserProfile {
  // consent & context
  var disclaimerAcceptedAt: Date; var disclaimerVersion: String
  var privacyNoticeShownAt: Date; var timeZoneID: String; var appLocale: String
  // S3
  var ageRange: AgeRange; var sexForReference: SexRef   // no height/weight: dropped Oct 26, 2026
  // S4–S5
  var primaryGoal: Goal; var experience: Experience
  // S6
  var bodyAreas: [BodyAreaReport]; var movementNeeds: Set<MovementNeed>; var limbDifference: [Limb]?
  // S7 / S7a
  var healthScreen: HealthScreen; var postpartum: PostpartumInfo?
  var safetyMode: SafetyMode; var safetyModeReasons: Set<SafetyReason>; var postpartumMode: Bool
  var doctorClearanceSelfReportedAt: Date?
  // S8–S10
  var jobActivity: JobActivity; var workPattern: WorkPattern
  var availableItems: Set<Item>; var quietMode: Bool
  var targetDaysPerWeek: Int?; var variableSchedule: Bool; var targetMinutes: Int
  // S11–S12
  var coachingStyle: CoachingStyle; var voiceCoaching: Bool
  var nudgeMode: NudgeMode; var nudgeTime: DateComponents?
  var notificationsAuthorized: Bool?; var healthKitRequestedAt: Date?
  var micAuthorized: Bool?; var speechAuthorized: Bool?
  // engine state
  var patternReadiness: [MovementPattern: Readiness]   // default .notAssessed
  var baselineResults: [BaselineResult]; var baselineDeferred: Bool
  var onboardingCompletedAt: Date?; var profileVersion: Int
}
enum Tristate { case no, yes, unsure }   // unsure is treated as yes
enum Readiness { case notAssessed, notReady, gentle, ready, progressing }
enum MovementPattern { case squat, hinge, horizontalPush, verticalPush, horizontalPull,
  verticalPull, lungeSingleLeg, core, rotation, balance, impactLocomotion, floorTransition, carry }
```

**Rule:** any `nil` or `.notAssessed` value is **unknown** and is handled conservatively; nothing missing is ever treated as "healthy", "zero", or "fine".

---

## 9. Decision log

| Date | Decision | Decided by | Affects |
|---|---|---|---|
| Oct 26, 2026 | Early postpartum = under 12 weeks after birth; never recommended. Pelvic-floor physio review still required before launch. | Founder | S7a, OQ-1 |
| Oct 26, 2026 | Pregnant users get the pause screen in MVP. | Founder | S7a, S7b |
| Oct 26, 2026 | "Not sure" on the health check counts as "Yes". | Founder | S7, §0 |
| Oct 26, 2026 | Recent chest pain or recent fainting stops onboarding (hard stop). | Founder | S7, S7b |
| Oct 26, 2026 | Leaving gentle mode: all-"No" re-screen or dated doctor-clearance self-report only. | Founder | S7 |
| Oct 26, 2026 | No instant clearance: 3 pain-free sessions over at least 7 days per step up. | Founder | S6 |
| Oct 26, 2026 | Bands/dumbbells recorded but not used in MVP plans. | Founder | S9 |
| Oct 26, 2026 | Height and weight dropped (question, fields, references removed; questions renumbered Q1–Q9). | Founder | S3, §1, §5, §6, §8 |
| Oct 26, 2026 | Health check re-asked every 90 days. | Founder | S7 |
| Oct 26, 2026 | Under-18s stopped. | Founder | S3 |

---

*End of spec — PROPOSED, not approved, except items marked ✅ APPROVED (Oct 26, 2026).*
