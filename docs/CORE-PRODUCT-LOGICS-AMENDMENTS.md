# CORE-PRODUCT-LOGICS — approved amendments

`docs/CORE-PRODUCT-LOGICS.docx` is locked and has not been edited. This file records approved amendments to it. Where an amendment and the locked doc differ, **the amendment wins**.

Source: Decision Round 2 (`docs/PRE-NATIVE-REVIEW.md`). Approved 2026-10-27 by the user ("Go with your best recommendations"). The safety wording (`SAFE` statements) is unchanged by every amendment.

| ID | Locked doc section | Original | Amended to | From |
|---|---|---|---|---|
| **A1** | §2 Core Principle; §4 Score Generator Engine | "A central Ability Score … controls workout difficulty" | **The Ability Score is a profile with one level per movement** (squat, push, hinge, core, balance, cardio). Each level moves ±1 independently and has its own injury gate. A single display-only summary (the average step, "Ability: x of 4") is shown to the user. It never drives difficulty. | D2-1 |
| **A2** | §1 Product Overview; §10 Workout Composer | "selects from 15 home workouts" | **The library is 6 movement ladders × 4 steps (24 exercises) plus 6 seated versions**, put together into session types (Strength, Light cardio + balance, Mobility & core, Light day). Named workout templates may sit on top as content only (deferred, pre-launch content task). | D2-2 |
| **A3** | §6 Signals | "Apple Health: sleep, HRV, resting heart rate, recent load" | **Apple Health signals are read only when available and only if the engine uses them.** V1 reads sleep (a hint for a lighter day) and workouts (recent load, used from the native build). HRV and resting heart rate are deferred until a pilot shows they help, and they will never drive difficulty on their own. | D2-6 |
| **A4** | §7 Data Retention | "The system never deletes user input" | **The system never deletes or forgets data on its own. The user can always delete everything** (Settings → Delete my data; GDPR Art. 17, App Store 5.1.1(v)). Changed or removed items (such as body areas) are archived, not erased. | D2-7 |
| **A5** | §7 Data Retention | "Every decision must consider the full history" | **The full history is kept and available. Each rule uses a defined, documented window** (for example the last 2–4 sessions, 14 days for repeat skips, 3 pain-free sessions over 7 days or more), so adaptation stays responsive and explainable. | D2-8 |

These Round 2 items **implement** the locked doc as written, so they don't amend it:
- D2-3: laziness is not accepted without a counter-offer.
- D2-4: the "can't take responsibility" note.
- D2-5: free ±1 intensity during calibration.
- D2-9: 7 engines as modules.
- D2-10: modification patterns as a signal.

Approved by: the user (via chat, t24u) · Date: 2026-10-27
