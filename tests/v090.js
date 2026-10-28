/* v0.9.0 Decision Round 1: approved values are in FC_CONFIG.APPROVED, placeholder labels gone, approved behaviour changes work */
const BASE=(process.argv[2]||'http://127.0.0.1:8765/');const URL=BASE+'?dev=1';
const fakeSR=`class FakeSR{start(){window.__recActive=this}abort(){}stop(){}}window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
(async()=>{const br=await require('./launch.js')();let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 const ctx=await br.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await ctx.addInitScript(fakeSR);const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(String(e)));pg.on('dialog',d=>d.accept());await pg.goto(URL);
 const ck=s=>pg.click(s),chip=t=>pg.locator('#app .chip',{hasText:t}).first().click(),has=async s=>(await pg.locator(s).count())>0;
 // 1. config: approved values moved, only deferred/superseded left in RESEARCH_NEEDED
 const cf=await pg.evaluate(()=>({A:FC_CONFIG.APPROVED,R:Object.keys(FC_CONFIG.RESEARCH_NEEDED).sort(),v:APPVER}));const A=cf.A;
 check(/^0\.9\./.test(cf.v),'APPVER 0.9.x');
 check(JSON.stringify(cf.R)===JSON.stringify(['calibrationObsPerPattern','experienceTone','scoreCeilingByTier','scoreHardEffortFactor','scoreMinCeiling','scoreUnknownPenalty']),'RESEARCH_NEEDED keeps only R8/R9 (superseded) and R24 (deferred): '+cf.R.join(','));
 const exp={'repRange':{standard:[8,12],gentle:[6,10]},'holdRangeSec':{standard:[15,30],gentle:[10,20]},'cardioRangeMin':{standard:[3,5],gentle:[2,3]},startSets:2,maxSets:3,ladderLevels:4,cleanSessionsToStepUp:2,repIncrement:1,
  badSessionsToReviseVolume:2,badSessionsToReviseLevel:3,minDaysBetweenLevelDowns:7,minSessionsBetweenChanges:2,plateauSessions:4,gentleMaxLevel:1,gentleMinDaysBetweenSteps:7,restSec:{standard:30,gentle:45},hkShortSleepHours:6,
  learnedNudgeDefault:'18:00',proposeShorterIfActualBelow:0.7,quickCheckin:{sleep:'good',energy:'high',soreness:'none',pain:'no'},onboardingDefaults:{coachingStyle:'calm',voiceCoaching:true,nudgeMode:'learned',healthKit:null},
  calibration:{minSessions:6,minPatterns:3,minSessionsPerPattern:2,maxRatioSpread:0.35},beginnerLevel:{squat:0,push:0,hinge:0,core:1,balance:0,cardio:0},
  performanceScore:{weights:{completion:0.4,volume:0.4,adherence:0.2},adherenceUnplannedDay:0.75},fastSecPerRep:2,easeStep:{reps:2,hold:5,time:1},suggestThreeDaysFrom:5,
  checkinPainSkipsLoadedPatterns:true,checkinPainMarksPatternNotReady:true,postCheckPainMarksPatternNotReady:true,modReasonRequiredAfterCalibration:true,
  skipNoteAfter:3,skipNoteWindowDays:14,restExtendSec:15,healthReadTypes:['sleep','workouts']};
 const bad=Object.keys(exp).filter(k=>JSON.stringify(A[k])!==JSON.stringify(exp[k]));check(!bad.length,'all approved values in FC_CONFIG.APPROVED match Decision Round 1'+(bad.length?' (diff: '+bad.join(',')+')':''));
 check(JSON.stringify(A.modCounter)===JSON.stringify({pain:'none',fatigue:'short',equipment:'seated',schedule:'short',other:'none'}),'R25 pain is never a swap (modCounter.pain = none)');
 // 2. onboarding + baseline, then the plan
 await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
 for(const k of ['h1','h2','h3','h4','h5','h6'])await pg.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
 await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');
 await ck('#next');await ck('#next');await ck('#startCheck');let n=0;
 while(await has('#startBtn')&&n<8){n++;await pg.evaluate(()=>say('go'));await pg.waitForTimeout(100);await pg.evaluate(()=>say('done'));await pg.waitForTimeout(100);
  if(await has('#talkYes'))await pg.evaluate(()=>say('yes'));else await pg.evaluate(()=>say('twelve'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('okay'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('no'));await pg.waitForTimeout(150);if(await has('#skipRest'))await ck('#skipRest');await pg.waitForTimeout(100)}
 await ck('#startPlan');await pg.evaluate(()=>simDays(10,true));await pg.waitForTimeout(300);
 let txt='';for(const t of ['#tab-today','#tab-progress','#tab-settings']){if(await has(t)){await ck(t);await pg.waitForTimeout(150);txt+=await pg.textContent('#app')}}
 check(txt.length>200&&!/placeholder/i.test(txt),'no "placeholder" labels left on Today, Progress or Settings');
 check(await pg.evaluate(()=>P().sessions.length>0&&P().sessions.every(s=>!s.score||s.score.formula==='R21')),'session scores use the approved R21 formula label');
 // 3. R12: "need more rest" adds 15 s
 const r12=await pg.evaluate(()=>{const w0=W;W={phase:'rest',restDur:30,restLeft:20};moreRest();const r=[W.restDur,W.restLeft];W=w0;return r});check(r12[0]===45&&r12[1]===35,'R12: +15 s rest option extends the current rest ('+r12+')');
 const appjs=await (await pg.request.get(BASE+'js/app.js')).text();check(appjs.includes('id="moreRest"'),'R12: rest screen has the "Need more rest?" button');
 check(appjs.includes('only read sleep and workouts')&&!appjs.includes('read steps'),'OQ-18: Health copy lists only sleep and workouts');
 // 4. R25: gentle note after the 3rd skip of the same movement in 14 days; never on the pain path
 const r25=await pg.evaluate(()=>{const p=P(),d=k=>{const x=new Date(appNow()-k*864e5);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const keep=JSON.stringify(p.mods);p.mods[d(3)]={skip:['push'],swap:{}};p.mods[d(6)]={skip:['push'],swap:{}};p.mods[d(40)]={skip:['push'],swap:{}};
  const o=modOffer({action:'skip',reason:'other',pattern:'push'}),pn=modOffer({action:'skip',reason:'pain',pattern:'push'}),h=modOffer({action:'skip',reason:'other',pattern:'hinge'});p.mods=JSON.parse(keep);
  return {o:o.includes('modRepeat')&&o.includes('3 times'),pn:pn.includes('modRepeat'),h:h.includes('modRepeat')}});
 check(r25.o,'R25: 3rd skip in 14 days shows the gentle repeat note');check(!r25.pn,'R25: no repeat note on the pain path');check(!r25.h,'R25: no note for a movement not skipped before');
 // 5. migration: old placeholder score labels are relabelled, values kept
 const mig=await pg.evaluate(()=>{const o=JSON.parse(localStorage.getItem(KP));o.p.sessions[0].score.formula='R21-placeholder';o.p.sessions[0].score.score=77;return migrateState(o).p.sessions[0].score});
 check(mig.formula==='R21'&&mig.score===77,'migration: old R21-placeholder label becomes R21, score unchanged');
 // 6. OQ-1a interim: C-section line on the postpartum screen
 {const c2=await br.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const q=await c2.newPage();await q.goto(URL);const k=s=>q.click(s),ch=t=>q.locator('#app .chip',{hasText:t}).first().click();
  await k('#ack');await k('#next');await ch('30–39');await ch('Female');await k('#next');await k('#next');await ch('active most weeks');await k('#next');await k('#nothing');
  for(const x of ['h1','h2','h3','h4','h6'])await q.click(`[data-q="hs.${x}"][data-v="no"]`);await q.click('[data-q="hs.h5"][data-v="yes"]');await k('#next');await q.waitForTimeout(200);
  await q.evaluate(()=>{S.screen='s7a';render()});await q.waitForTimeout(150);await ch('I had a baby');await q.waitForTimeout(100);await ch('C-section');await q.waitForTimeout(150);
  check(await q.locator('#csNote').count()>0,'OQ-1a: C-section line shown ("follow your clinician\'s advice on timing")');await c2.close()}
 check(!errs.length,'no page errors '+JSON.stringify(errs));
 await br.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();
