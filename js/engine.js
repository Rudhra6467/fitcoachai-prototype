/* FitcoachAI deterministic adaptation engine (prototype). Pure functions: no clock, no randomness, no DOM.
   Same inputs -> same outputs. Every change is returned as a decision with a reason code. */
(function(root){
'use strict';
const CFG=(typeof module!=='undefined'&&module.exports)?require('./config.js'):root.FC_CONFIG;
const A=CFG.APPROVED,X=CFG.RESEARCH_NEEDED;
const PATS=['squat','push','hinge','core','balance','cardio'];
const DAY=864e5,MAXLVL=X.ladderLevels-1,GCAP=X.gentleMaxLevel;
const clone=o=>JSON.parse(JSON.stringify(o));
const ms=iso=>Date.parse(iso);
const dkey=iso=>String(iso).slice(0,10);
function range(kind,gentle){const k=gentle?'gentle':'standard';return (kind==='hold'?X.holdRangeSec:kind==='time'?X.cardioRangeMin:X.repRange)[k].slice()}
function rg(ps,ctx){return range(ps.kind,!!(ctx&&ctx.gentle))}
const MSG={
 PAIN_STOP_PATTERN:'Pain during this movement: it stops here and leaves your plan until you have 3 pain-free sessions over at least 7 days.',
 TRIAGE_NO_PROGRESS:'Shorter session today, so this one doesn\'t count towards moving up or down.',
 UNKNOWN_COUNT_HOLD:'We didn\'t get a count, so nothing changes. Unknown isn\'t treated as good or bad.',
 STEP_VERIFIED:'The new step held up a second time. It now counts as your level.',
 STEP_VERIFY_FAIL_REVERT:'The new step was too much on its second try, so we go back to the previous version. This is a check, not a failure.',
 BAD_DAY_RETAIN:'One harder day doesn\'t change your level. Same plan next time.',
 REVISE_VOLUME:'Several hard sessions in a row: fewer reps next time, same exercise.',
 RETAIN_WATCH:'Still hard. We keep the same exercise and keep watching.',
 REVISE_LEVEL_DOWN:'Hard sessions keep repeating: one step easier for now (controlled change, rate-limited).',
 DAMAGE_CAP_HOLD:'Hard again, but we already changed this recently. We hold here instead of dropping further.',
 TOP_OF_RANGE:'Top of the range. A bit more of this and we\'ll try the next step.',
 ADD_REP:'You hit your target on every set: one more rep (or a few more seconds) next time.',
 RETAIN:'Same plan next time.',
 PLATEAU_TEMPO:'No change in a few sessions: try it slower (3 seconds down) before anything else.',
 PLATEAU_ADD_SET:'Still steady: we add one extra set.',
 PLATEAU_VARIANT_OFFER:'Still steady: you can swap to a different exercise at the same level if you want.',
 PLATEAU_DELOAD_SUGGEST:'Still steady: an easier week often helps. We\'ll ask before changing anything.',
 STEP_UP:'Consistently at the top of the range: we try the next step. It needs to hold up next time too.',
 STEP_UP_DEFERRED:'Ready to move up, but only one movement steps up per session. This one waits.',
 INJURY_GATE_HOLD:'This movement protects a sore area. It only moves up through the pain-free check.',
 MAX_LEVEL:'You\'re at the top version in this prototype.',
 GENTLE_CAP:'Gentle mode keeps this at an easy version.',
 GENTLE_WEEKLY_CAP:'Gentle mode: steps for this movement are rate-limited.',
 NO_THRASH_HOLD:'We changed this very recently. We wait one more session before changing it again.',
 INJURY_GATE_STEP:'3 pain-free sessions over 7+ days: this movement goes up one readiness step.',
 INJURY_GATE_PROGRESS:'Pain-free session counted towards bringing this movement back.',
 PAINFREE_RESET:'You reported pain in this area, so the pain-free count starts again.',
 INJURY_REPORTED:'New or worse area reported: this movement is left out until it\'s been pain-free for a while.',
 INJURY_CARE:'Area reported: this movement uses the gentlest version for now.',
 NO_INSTANT_CLEARANCE:'Area marked as better. It stays protected until 3 pain-free sessions over 7+ days.',
 SKIPPED:'Skipped today. Nothing changes.'
};
function init(o){
 const e={v:1,startedAt:o.nowISO,sessionCount:0,patterns:{},decisions:[]};
 PATS.forEach(p=>{const s=(o.patterns||{})[p]||{status:'notAssessed',lvl:0,kind:'reps'};const kind=s.kind||'reps';
  const lo=range(kind,o.gentle)[0];
  e.patterns[p]={status:s.status,lvl:Math.max(0,Math.min(MAXLVL,s.lvl|0)),prevLvl:null,kind,target:lo,sets:X.startSets,clean:0,bad:0,
   pendingVerify:false,lastChangeSession:-99,lastStepAt:null,lastDownAt:null,flat:0,plateau:0,
   injury:!!s.injury,healthHold:!!s.healthHold,painFree:[],obs:[],capability:s.status==='notAssessed'||s.status==='notReady'?null:Math.max(0,s.lvl|0),baseline:!!s.baseline}});
 return e}
function prescribe(e,p,ctx){const ps=e.patterns[p];if(!ps||ps.status==='notReady')return null;
 const [lo,hi]=rg(ps,ctx);let lvl=ps.lvl;if(ctx&&ctx.gentle)lvl=Math.min(lvl,GCAP);if(ps.injury&&ps.status==='gentle')lvl=0;
 const short=ctx&&ctx.triage==='short';
 return {pattern:p,lvl,kind:ps.kind,lo,hi,target:Math.min(hi,Math.max(lo,ps.target)),sets:short?1:ps.sets,status:ps.status}}
function applySession(e0,s,ctx){ctx=ctx||{};const e=clone(e0);e.sessionCount++;const n=e.sessionCount,at=s.atISO,D=[];
 const d=(code,pattern,extra)=>D.push({code,pattern,msg:MSG[code]+(extra?' '+extra:''),at,session:n});
 const anyPain=!!s.checkinPain||(s.results||[]).some(r=>r.pain);
 (s.painPatterns||[]).forEach(p=>{const ps=e.patterns[p];if(ps&&ps.painFree.length){ps.painFree=[];d('PAINFREE_RESET',p)}});
 const cands=[];
 (s.results||[]).forEach(r=>{const p=r.pattern,ps=e.patterns[p];if(!ps)return;
  if(r.skipped){d('SKIPPED',p);return}
  const [lo,hi]=rg(ps,ctx);ps.target=Math.min(hi,Math.max(lo,ps.target));
  ps.obs.push({at,lvl:r.lvl,sets:r.sets,effort:r.effort||null,pain:!!r.pain,triage:s.triage||'full'});
  if(r.pain){ps.status='notReady';ps.injury=true;ps.painFree=[];ps.pendingVerify=false;ps.clean=0;ps.flat=0;d('PAIN_STOP_PATTERN',p);return}
  if(s.triage==='short'){d('TRIAGE_NO_PROGRESS',p);return}
  const sets=r.sets||[],known=sets.length>0&&sets.every(x=>x!=null&&isFinite(x));
  const poor=r.effort==='hard'||(known&&sets.some(x=>x<lo));
  if(!known&&!poor){d('UNKNOWN_COUNT_HOLD',p);return}
  if(ps.pendingVerify){ps.pendingVerify=false;
   if(poor){ps.lvl=ps.prevLvl;ps.target=lo;ps.clean=0;ps.bad=0;ps.lastChangeSession=n;ps.status=ps.injury?'gentle':'ready';d('STEP_VERIFY_FAIL_REVERT',p)}
   else{ps.capability=Math.max(ps.capability||0,ps.lvl);ps.status='ready';d('STEP_VERIFIED',p)}return}
  if(poor){ps.bad++;ps.clean=0;ps.flat=0;
   if(ps.bad<X.badSessionsToReviseVolume)d('BAD_DAY_RETAIN',p);
   else if(ps.bad<X.badSessionsToReviseLevel){if(ps.target>lo){ps.target=lo;d('REVISE_VOLUME',p)}else d('RETAIN_WATCH',p)}
   else{const ok=ps.lvl>0&&n-ps.lastChangeSession>=X.minSessionsBetweenChanges&&(!ps.lastDownAt||ms(at)-ms(ps.lastDownAt)>=X.minDaysBetweenLevelDowns*DAY);
    if(ok){ps.prevLvl=ps.lvl;ps.lvl--;ps.target=lo;ps.lastChangeSession=n;ps.lastDownAt=at;ps.bad=0;d('REVISE_LEVEL_DOWN',p)}else d('DAMAGE_CAP_HOLD',p)}
   return}
  ps.bad=0;if(ps.capability==null)ps.capability=ps.lvl;
  if(sets.every(x=>x>=hi)){ps.clean++;ps.flat=0;if(ps.clean>=X.cleanSessionsToStepUp)cands.push(p);else d('TOP_OF_RANGE',p);return}
  if(sets.every(x=>x>=ps.target)&&ps.target<hi){ps.target=Math.min(hi,ps.target+X.repIncrement);ps.flat=0;d('ADD_REP',p);return}
  ps.flat++;
  if(ps.flat>=X.plateauSessions){ps.flat=0;ps.plateau++;const code=X.plateauOrder[(ps.plateau-1)%X.plateauOrder.length];
   if(code==='PLATEAU_ADD_SET'){if(!ctx.gentle&&ps.sets<X.maxSets){ps.sets++;d(code,p)}else d('PLATEAU_TEMPO',p)}else d(code,p)}
  else d('RETAIN',p)});
 let stepped=0;
 cands.forEach(p=>{const ps=e.patterns[p];let b=null;
  if(stepped>=A.maxStepUpsPerSession)b='STEP_UP_DEFERRED';else if(ps.injury)b='INJURY_GATE_HOLD';else if(ps.lvl>=MAXLVL)b='MAX_LEVEL';
  else if(ctx.gentle&&ps.lvl>=GCAP)b='GENTLE_CAP';else if(ctx.gentle&&ps.lastStepAt&&ms(at)-ms(ps.lastStepAt)<X.gentleMinDaysBetweenSteps*DAY)b='GENTLE_WEEKLY_CAP';
  else if(n-ps.lastChangeSession<X.minSessionsBetweenChanges)b='NO_THRASH_HOLD';
  if(b){d(b,p);return}
  ps.prevLvl=ps.lvl;ps.lvl++;ps.target=rg(ps,ctx)[0];ps.clean=0;ps.pendingVerify=true;ps.status='progressing';ps.lastChangeSession=n;ps.lastStepAt=at;stepped++;d('STEP_UP',p)});
 const did=(s.results||[]).some(r=>!r.skipped);
 if(!anyPain&&did)PATS.forEach(p=>{const ps=e.patterns[p];if(!ps.injury||!(ps.status==='notReady'||ps.status==='gentle'))return;
  if(ps.painFree.length&&dkey(ps.painFree[ps.painFree.length-1])===dkey(at))return; // one per day
  ps.painFree.push(at);const f=ps.painFree;
  if(f.length>=A.injuryGatePainFreeSessions&&ms(at)-ms(f[0])>=A.injuryGateMinDays*DAY){
   if(ps.status==='notReady'){ps.status='gentle';ps.lvl=0;ps.target=rg(ps,ctx)[0];d('INJURY_GATE_STEP',p,'Back in gently at the easiest version.')}
   else{ps.status='ready';ps.injury=false;d('INJURY_GATE_STEP',p,'Now Ready.')}
   ps.painFree=[];ps.lastChangeSession=n}
  else d('INJURY_GATE_PROGRESS',p,`(${f.length} of ${A.injuryGatePainFreeSessions}; at least ${A.injuryGateMinDays} days from the first.)`)});
 e.decisions=e.decisions.concat(D);
 return {eng:e,decisions:D}}
/* Tighten only: new or worse areas restrict immediately; nothing is ever cleared instantly. */
function tighten(e0,want,atISO){const e=clone(e0),D=[];
 PATS.forEach(p=>{const ps=e.patterns[p],w=want[p];if(!w)return;
  if(w==='notReady'&&ps.status!=='notReady'){ps.status='notReady';ps.injury=true;ps.painFree=[];ps.pendingVerify=false;D.push({code:'INJURY_REPORTED',pattern:p,msg:MSG.INJURY_REPORTED,at:atISO,session:e.sessionCount})}
  else if(w==='gentle'&&['ready','progressing','notAssessed'].includes(ps.status)){ps.status='gentle';ps.injury=true;ps.lvl=0;ps.pendingVerify=false;ps.painFree=[];D.push({code:'INJURY_CARE',pattern:p,msg:MSG.INJURY_CARE,at:atISO,session:e.sessionCount})}});
 e.decisions=e.decisions.concat(D);return {eng:e,decisions:D}}
function fullObs(ps){return ps.obs.filter(o=>o.triage==='full'&&!o.pain&&(o.sets||[]).length&&o.sets.every(x=>x!=null)).length}
function calibration(e,nowISO){const elapsed=Math.max(0,Math.floor((ms(nowISO)-ms(e.startedAt))/DAY));
 const per={};PATS.forEach(p=>{const ps=e.patterns[p];const n=fullObs(ps);per[p]={obs:n,need:X.calibrationObsPerPattern,personalized:elapsed>=A.calibrationFloorDays&&n>=X.calibrationObsPerPattern,included:ps.status!=='notReady'}});
 const inc=PATS.filter(p=>per[p].included);const done=inc.length?inc.filter(p=>per[p].personalized).length:0;
 return {elapsed,day:elapsed+1,floorMet:elapsed>=A.calibrationFloorDays,per,complete:elapsed>=A.calibrationFloorDays&&inc.length>0&&done===inc.length,pct:Math.round(100*Math.min(1,(Math.min(elapsed,A.calibrationFloorDays)/A.calibrationFloorDays+(inc.length?inc.reduce((a,p)=>a+Math.min(X.calibrationObsPerPattern,per[p].obs)/X.calibrationObsPerPattern,0)/inc.length:0))/2))}}
function tier(e,p,nowISO){const ps=e.patterns[p],n=fullObs(ps),c=calibration(e,nowISO);
 if(!n)return ps.baseline&&ps.status!=='notAssessed'?{t:1,label:'Baseline only',conf:'Low'}:{t:0,label:'Unknown',conf:'None yet'};
 if(n<X.calibrationObsPerPattern)return {t:2,label:'Early',conf:'Low'};
 if(!c.floorMet)return {t:3,label:'Building',conf:'Medium'};
 return {t:4,label:'Personalized',conf:'High'}}
function tolerance(ps){const r=ps.obs.slice(-3);if(!r.length)return 'Unknown';if(r.some(o=>o.pain))return 'Needs care';if(r.filter(o=>o.effort==='hard').length>=2)return 'Finding it tough';return 'Handling it well'}
const CEIL=X.scoreCeilingByTier;
/* Score = share of today's prescription actually done. Evidence ceiling; no floor for just showing up. */
function score(rx,results,e,nowISO){let sum=0,cnt=0,unknown=0,minT=4;
 results.forEach(r=>{const x=rx.find(q=>q.pattern===r.pattern);if(!x)return;minT=Math.min(minT,tier(e,r.pattern,nowISO).t);
  if(r.pain)return; if(r.skipped){cnt++;return}
  const sets=r.sets||[];if(!sets.length||sets.some(v=>v==null)){unknown++;return}
  const want=x.sets*x.target;let c=Math.min(1,sets.reduce((a,b)=>a+b,0)/want);if(r.effort==='hard')c*=X.scoreHardEffortFactor;sum+=c;cnt++});
 if(!cnt)return {score:null,ceiling:null,why:'Not enough data to score this session.'};
 const ceiling=Math.max(X.scoreMinCeiling,CEIL[minT]-X.scoreUnknownPenalty*unknown),raw=Math.round(100*sum/cnt);
 return {score:Math.min(raw,ceiling),raw,ceiling,why:raw>ceiling?`Capped at ${ceiling} until we've seen more sessions.`:`Max right now: ${ceiling} (rises as we learn more).`}}
const API={CFG,PATS,MSG,range,init,prescribe,applySession,tighten,calibration,tier,tolerance,score,GCAP,MAXLVL};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.ENG=API;
})(typeof window!=='undefined'?window:globalThis);
