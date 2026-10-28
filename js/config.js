/* ==========================================================================
   FitcoachAI prototype — tunable values.
   APPROVED holds rules approved in the spec / by the owner, including Decision Round 1 (2026-10-27).
   RESEARCH_NEEDED holds only what is still open (DEFERRED) or superseded. See RESEARCH-FLAGS.md.
   ========================================================================== */
(function(root){
const FC_CONFIG={
 APPROVED:{
  maxStepUpsPerSession:1,          // one step up per session
  badDayLowersLevel:false,         // one bad day never lowers a level [declarative: enforced in engine.applySession, asserted by tests/inv.js]
  injuryGatePainFreeSessions:3,    // OQ-8: 3 pain-free sessions...
  injuryGateMinDays:7,             // ...over at least 7 days, per readiness step
  // v0.6: the 7-day calibration floor is retired. Calibration ends on data quality, never on time (CORE-PRODUCT-LOGICS §3).
  startEveryoneAsBeginner:true,    /* declarative: enforced by beginnerLevel, asserted by tests/v06.js */    // CORE-PRODUCT-LOGICS §2; experience answer only sets coaching tone
  maxLevelChangePerStep:1, /* declarative: lvl only moves by ++/-- in engine; asserted by tests/inv.js */        // CORE-PRODUCT-LOGICS §4: intensity changes at most +/-1 level
  rescreenDays:90,                 // OQ-14
  maxNudgesPerDay:1,               // S11: at most 1 nudge a day
  // ---- Decision Round 1, approved by the owner 2026-10-27 (docs/DECISION-ROUND-1.md) ----
  repRange:{standard:[8,12],gentle:[6,10]},          // R1
  holdRangeSec:{standard:[15,30],gentle:[10,20]},    // R1
  cardioRangeMin:{standard:[3,5],gentle:[2,3]},      // R1
  startSets:2,maxSets:3,                             // R1
  ladderLevels:4,                                    // R2 (0..3)
  cleanSessionsToStepUp:2,                           // R3 double progression trigger
  repIncrement:1,                                    // R3
  badSessionsToReviseVolume:2,                       // R4
  badSessionsToReviseLevel:3,                        // R4
  minDaysBetweenLevelDowns:7,                        // R4 damage cap
  minSessionsBetweenChanges:2,                       // R5 no-thrash
  plateauSessions:4,                                 // R6
  plateauOrder:['PLATEAU_TEMPO','PLATEAU_ADD_SET','PLATEAU_VARIANT_OFFER','PLATEAU_DELOAD_SUGGEST'], // R6
  gentleMaxLevel:1,gentleMinDaysBetweenSteps:7,      // R7
  triageShortIf:{sleep:['poor'],energy:['low'],soreness:['lot']},   // R10
  checkinPainSkipsLoadedPatterns:true,               // R11
  checkinPainMarksPatternNotReady:true,              // R11
  restSec:{standard:30,gentle:45},                   // R12
  hkShortSleepHours:6,                               // R13
  learnedNudgeDefault:'18:00',                       // R14
  proposeShorterIfActualBelow:0.7,                   // R15
  // R16 weekly goal + streak definition (goal = the days/week the user chose)
  streakUnit:'weeks with at least one workout',     // definition only (copy); weekStats() implements it
  // R17 one-tap "I feel good" check-in = sleep good, energy good, no soreness, no pain 
  quickCheckin:{sleep:'good',energy:'high',soreness:'none',pain:'no'},
  // R18 defaults used because onboarding now skips the tone/reminder/Health screens 
  onboardingDefaults:{coachingStyle:'calm',voiceCoaching:true,nudgeMode:'learned',healthKit:null},
  // ---- calibration phase (v0.6) ----
  // R19 when calibration can end: enough quality sessions AND enough movement patterns seen consistently
  calibration:{minSessions:6,minPatterns:3,minSessionsPerPattern:2,maxRatioSpread:0.35},
  // R20 starting (beginner) ladder step per pattern; core starts at the wall plank unless postpartum (heel slides)
  beginnerLevel:{squat:0,push:0,hinge:0,core:1,balance:0,cardio:0},
  // R21 Performance Score = weighted mix ; adherence on an unplanned day
  performanceScore:{weights:{completion:0.4,volume:0.4,adherence:0.2},adherenceUnplannedDay:0.75},
  // R22 set timing: average seconds per rep below this reads as "finished fast" (copy only; never changes the dose)
  fastSecPerRep:2,
  // R23 post-session check-in effects: pain + area -> those patterns go on hold (same as R11).
  // v0.7: "Hard" overall effort or "Low" energy -> the NEXT session only is eased: same level and sets, target one small step lower
  // (never below the range floor), and it does not count towards moving up or down. One bad day never lowers a level.
  postCheckPainMarksPatternNotReady:true,
  easeNextIf:{effort:['hard'],energy:['low']},
  easeStep:{reps:2,hold:5,time:1},
  // R25 modification path: reasons and what the coach offers first (counter-offer -> accept with adjustment -> accept with disclaimer)
  modReasons:['pain','fatigue','equipment','schedule','other'],
  modCounter:{pain:'none',fatigue:'short',equipment:'seated',schedule:'short',other:'none'},
  modReasonRequiredAfterCalibration:true,
  // Decision Round 2 (approved 2026-10-27, user approval) — see docs/PRE-NATIVE-REVIEW.md
  modCounterOtherAfterCalibration:'short',   // D2-3: "Something else" after calibration -> short-version counter-offer first (never a hard block; pain unchanged)
  modAcceptNote:"Okay, it's your call. I can't promise the same progress when parts of the plan are skipped.", // D2-4 (copy pending OQ-5 legal review)
  calibrationIntensityControl:true,          // D2-5: Easier / Harder, ±1 step per movement, once per movement per day, calibration only
  // R26 days-per-week suggestion: anyone choosing 5+ days is offered 3 to start (no longer tied to the experience answer)
  suggestThreeDaysFrom:5,
  skipNoteAfter:3,skipNoteWindowDays:14,             // R25: gentle note after 3 skips of the same movement in 14 days
  restExtendSec:15,                                  // R12: "+15 s" more-rest option
  healthReadTypes:['sleep','workouts']               // drives the Health screen columns; engine uses sleep only               // OQ-18: read only what the engine uses
 },
 RESEARCH_NEEDED:{ // PLACEHOLDER — still open after Decision Round 1 (DEFERRED or superseded)
  calibrationObsPerPattern:3,                        // R8 (superseded in v0.6 by R19; kept for reference)
  scoreCeilingByTier:{0:60,1:70,2:80,3:90,4:100},    // R9 (superseded in v0.6 by R21; engine score() kept for tests)
  scoreHardEffortFactor:0.85,scoreUnknownPenalty:10,scoreMinCeiling:50, // R9
  // R24 experience answer -> coaching tone copy only (never difficulty)
  experienceTone:{
   new:"We'll start easy and build from what you actually do.",
   lapsed:"Welcome back. We'll start easy and build from what you actually do.",
   occasional:"Everyone starts at the beginner level. If it feels easy, your sessions will show it and we'll move up a step at a time.",
   regular:"Everyone starts at the beginner level, even regulars. If it's easy, your sessions will show it and we'll move up a step at a time."}  // R24 DEFERRED
 }
};
FC_CONFIG.ALL=Object.assign({},FC_CONFIG.APPROVED,FC_CONFIG.RESEARCH_NEEDED); // merged read view
if(typeof module!=='undefined'&&module.exports)module.exports=FC_CONFIG;else root.FC_CONFIG=FC_CONFIG;
})(typeof window!=='undefined'?window:globalThis);
