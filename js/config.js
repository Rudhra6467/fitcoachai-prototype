/* ==========================================================================
   FitcoachAI prototype — tunable values.
   Everything in RESEARCH_NEEDED is a PLACEHOLDER: RESEARCH NEEDED / NOT DECIDED.
   These are not product decisions. See RESEARCH-FLAGS.md for each item.
   APPROVED holds only rules already approved in the spec / by the owner.
   ========================================================================== */
(function(root){
const FC_CONFIG={
 APPROVED:{
  maxStepUpsPerSession:1,          // one step up per session
  badDayLowersLevel:false,         // one bad day never lowers a level
  injuryGatePainFreeSessions:3,    // OQ-8: 3 pain-free sessions...
  injuryGateMinDays:7,             // ...over at least 7 days, per readiness step
  calibrationFloorDays:7,          // soft 7-day floor (spec §4)
  rescreenDays:90,                 // OQ-14
  maxNudgesPerDay:1                // S11: at most 1 nudge a day
 },
 RESEARCH_NEEDED:{ // PLACEHOLDER — RESEARCH NEEDED / not decided
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
  calibrationObsPerPattern:3,                        // R8
  scoreCeilingByTier:{0:60,1:70,2:80,3:90,4:100},    // R9
  scoreHardEffortFactor:0.85,scoreUnknownPenalty:10,scoreMinCeiling:50, // R9
  triageShortIf:{sleep:['poor'],energy:['low'],soreness:['lot']},   // R10
  checkinPainSkipsLoadedPatterns:true,               // R11
  checkinPainMarksPatternNotReady:true,              // R11
  restSec:{standard:30,gentle:45},                   // R12
  hkShortSleepHours:6,                               // R13
  learnedNudgeDefault:'18:00',                       // R14
  proposeShorterIfActualBelow:0.7,                   // R15
  // R16 weekly goal + streak definition (goal = the days/week the user chose; streak unit is a placeholder)
  streakUnit:'weeks with at least one workout',
  // R17 one-tap "I feel good" check-in = sleep good, energy good, no soreness, no pain (placeholder; is one tap enough?)
  quickCheckin:{sleep:'good',energy:'high',soreness:'none',pain:'no'}
 }
};
if(typeof module!=='undefined'&&module.exports)module.exports=FC_CONFIG;else root.FC_CONFIG=FC_CONFIG;
})(typeof window!=='undefined'?window:globalThis);
