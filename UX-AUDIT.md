# UX audit: first-time beginner on iPhone (390×844)

Method: a scripted walk (`tests/audit.js`) through the shortest path from first open to the first workout. It counts taps, screens and words per screen. The before numbers are from commit 6122bfc.

## Before (v0.3)
| Step | Screen | Taps | Words |
|---|---|---|---|
| 1 | Welcome + disclaimer | 2 | 127 |
| 2 | Privacy | 1 | 101 |
| 3 | About you | 3 | 41 |
| 4 | Goal | 1 | 57 |
| 5 | Experience | 2 | 66 |
| 6 | Body map | 1 | 80 |
| 7 | Health check | 7 | 203 |
| 8 | Work day | 3 | 83 |
| 9 | Space | 4 | 78 |
| 10 | Days & minutes | 1 | 40 |
| 11 | Coaching style + reminders | 1 | 65 |
| 12 | Apple Health | 1 | 66 |
| 13 | Summary | 1 | 120 |
| 14 | Check-in intro | 1 | 184 |
| 15 | Check-in workout (voice) | 5 | 58 |
| 16 | Results + full 2-week plan | 1 | **1062** |
| 17 | Today (4 check-in taps + Start) | 5 | 224 |
| | **Total to the first workout** | **40 taps, 18 screens** | |

## Findings
- **Jargon:** "movement pattern", "calibration", "evidence tier", "reason codes", "Decision log", "touchpoints", "double progression", "Not ready", "Gentle" as a status.
- **Cluttered:** the results screen had 1062 words, with the Start button above it all. Today put the calibration bar first and the workout second. The check-in needed 4 taps every day before Start appeared.
- **Unclear next action:** Today had several equal-weight buttons, and session-done showed raw codes such as `TOP_OF_RANGE`.
- **Too many tabs:** four top tabs (Today, Learned, Decisions, Settings). A developer-style log was a main tab.
- **Dead ends:**
  - Reloading during a Settings edit (fixed in v0.3).
  - "Back" showed inside a running session, which could leave the workout without saving.
  - The privacy screen was a forced extra step.
- **Onboarding that could be deferred:** coaching style, reminders and Apple Health already have defaults and live in Settings.
- **Measure screen:** there is no Stop button while choosing reps. Stop is one step away. Not changed (left as is).

## Changes (v0.4)
- **Onboarding:** the privacy summary is now one line on the welcome screen (full text one tap away). Coaching, reminders and Apple Health are skipped (defaults: calm, voice on, learn-my-time reminders, Health off) and are editable in Settings and from the summary. Every safety question and all safety wording is unchanged. The progress counter reads "Step x of 8".
- **Results:** "You're all set" with a 3-line plan summary, the safety notes and one big **Start my plan** button. Full notes and the 2-week plan sit under "See full…".
- **Navigation:** a bottom tab bar with 3 items (Today, Progress, Settings). The plan change log and event log moved to Progress → Advanced and Settings → Advanced. No Back button inside a session.
- **Today:** the workout card first, with a plain "Why", then the stop-exercising safety text and one big **I feel good — start workout** button. "Not 100% today?" opens the 4-question check-in, with the same triage and pain rules. Then the weekly goal and the "Getting to know you" progress card (was "Calibration").
- **Session:** a progress bar, a large exercise name, a big timer, a breathing cue and big Start set / Done buttons.
- **After a session:** "What changed and why" in plain words (no codes), the score (not a fitness grade), the week's progress and the next workout, then one Done button.
- **Copy:** "Not ready" → "On hold", "Gentle" → "Easing in", "How sure we are" → "How sure I am", "touchpoints" → "rest-day check-ins". Encouraging, non-shaming lines throughout.

## After
- Onboarding to the first workout: **33 taps, 15 screens** (was 40 and 18). The results screen has 84 words (was 1062).
- Daily loop: Today to the workout is **1 tap** (was 5).
- `tests/audit.js` asserts that both numbers dropped.

## v0.5 — ready to try daily on iPhone
- **Measure screen Stop (safety fix):** every active-exercise screen now has a Stop button and listens for a spoken "stop". That covers the check-in screens (how many, how did it feel, any pain, where, sharp?, stopped that movement) and the workout screens (how many, how hard, any pain, sharp?, rest). Stopping shows the stop-exercising safety wording verbatim. Earlier, some screens (pain questions and workout rest) didn't listen for "stop" at all; a listener is now always armed.
- **Interrupted check-in or workout:** leaving the app (backgrounding) pauses the workout. Reloading or reopening restores it from this device with a big **Resume workout** button (the current set restarts) or **Stop workout**. An interrupted check-in resumes at the same step, and a half-filled daily check-in is kept.
- **Spoken-caption overlap:** the spoken-text caption no longer blocks taps on the buttons under it.
- **iPhone:** safe areas, 16 px inputs (no zoom), the screen stays awake during workouts where supported, audio is unlocked on the first tap, and an "Add to Home Screen" hint appears in Safari (dismissible).
- **Data:** Settings → Restore from a backup (validated). Storage is versioned (schema 2), and older data migrates automatically.
- **Still open (not changed, need decisions):** onboarding defaults (R18).

## v0.7 — integration review and fine-tune
Lighthouse runs on the live site (mobile defaults, two runs each; the 3D coach uses software rendering in headless Chrome, so TBT is inflated compared with a real iPhone):

| Metric | v0.6.0 (before) | v0.7.0 (after) |
|---|---|---|
| Performance | 70 / 70 | 71 / 71 |
| Accessibility | 95 | **100** |
| Best practices | 100 | 100 |
| First Contentful Paint | 1.1 s | 1.1 s |
| Largest Contentful Paint | 1.4 s / 1.7 s | **1.2 s** |
| Total Blocking Time | 7,840 / 8,260 ms | **3,290 / 3,170 ms** |
| Transferred | 381 KB | **260 KB** |
| Onboarding → first workout | 34 taps, 15 screens | 34 taps, 15 screens (unchanged) |
| Post-session check-in | ≤ 4 taps | ≤ 4 taps (unchanged) |

- **3D coach:** loads after the page is idle, pauses when off-screen or the app is in the background, 30 fps cap, pixel ratio capped at 1.5. three.js is vendored and precached (same origin), so it also works offline.
- **Accessibility:** the only failure (link contrast on the welcome screen) is fixed. New buttons and links are at least 44 px tall.
- **Copy:** the welcome screen no longer promises a time span ("over your first few workouts" instead of "over the next week"). The experience screen says it only changes tone.
- **Friction:** "Change something" is a single secondary button on Today. A change takes 3 taps (what, why, accept) and can be undone for the day. The lighter-session card can be declined in one tap.
- **Dead code:** the v0.6 override wrappers (experience masking, settings version patch, calibration card splice, experience copy) are folded into the base files.
