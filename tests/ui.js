const {chromium}=require('playwright-core');const BASE=(process.argv[2]||'http://127.0.0.1:8765/');const URL=BASE+'?dev=1';
const fakeSR=`class FakeSR{constructor(){}start(){window.__recActive=this}abort(){}stop(){}}window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
(async()=>{const br=await require('./launch.js')();
 let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 const ctx=await br.newContext({viewport:{width:390,height:844},acceptDownloads:true});await ctx.addInitScript(fakeSR);const pg=await ctx.newPage();const errs=[];
 pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('pageerror',e=>console.log('STACK',e.stack));pg.on('pageerror',e=>errs.push(String(e)));pg.on('dialog',d=>d.accept());await pg.goto(URL);
 const ck=s=>pg.click(s),chip=t=>pg.locator('#app .chip',{hasText:t}).first().click(),has=async s=>(await pg.locator(s).count())>0;
 // onboarding (standard, no injuries) + baseline by voice
 await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
 for(const k of ['h1','h2','h3','h4','h5','h6'])await pg.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
 await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');
 await ck('#next');await ck('#next');await ck('#startCheck');let n=0;
 while(await has('#startBtn')&&n<8){n++;await pg.evaluate(()=>say('go'));await pg.waitForTimeout(100);await pg.evaluate(()=>say('done'));await pg.waitForTimeout(100);
  if(await has('#talkYes'))await pg.evaluate(()=>say('yes'));else await pg.evaluate(()=>say('twelve'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('okay'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('no'));await pg.waitForTimeout(150);if(await has('#skipRest'))await ck('#skipRest');await pg.waitForTimeout(100)}
 await ck('#startPlan');check(await has('#calib')&&await has('#tab-today'),'Today screen after onboarding, with calibration card + tabs');
 check(await has('#whyLine')||await has('#restDay'),'Today shows workout + why line, or a rest day');
 await ck('#fastTog');
 const ci=async(o={})=>{if(await has('#somethingOff'))await ck('#somethingOff');for(const [k,v] of [['sleep',o.sleep||'good'],['energy',o.energy||'high'],['soreness','none'],['pain',o.pain||'no']])await pg.click(`[data-ci="${k}"][data-v="${v}"]`);if(o.pain==='yes')await pg.click(`[data-cir="${o.region}"]`)};
 async function playSession(o={}){let guard=0,exN=0;
  while(!(await has('#backToday'))&&guard++<300){
   if(await has('#postDone')){await pg.click('[data-pc="effort"][data-v="okay"]');await pg.click('[data-pc="pain"][data-v="no"]');await pg.click('[data-pc="energy"][data-v="ok"]');await ck('#postDone');continue}
   if(await has('#goSet')){exN++;await ck('#goSet');continue}
   if(await has('#done')&&await pg.isVisible('#done')){await ck('#done');continue}
   if(await has('[data-n]')){const v=await pg.evaluate(h=>{const r=cur();return h?r.lo-1:r.hi},!!o.hard);const sel=`[data-n="${v}"]`;await pg.click(await has(sel)?sel:'[data-n]');continue}
   if(await has('#skipRest')){await ck('#skipRest');continue}
   if(await has('[data-effort]')){await pg.click(`[data-effort="${o.hard?'hard':'okay'}"]`);continue}
   if(await has('#painNo')){const pat=await pg.evaluate(()=>cur().pattern);await ck(o.painOn===pat?'#painYes':'#painNo');continue}
   if(await has('#sharpNo')){await ck('#sharpNo');continue}
   await pg.waitForTimeout(150)}return exN}
 let workouts=0,touches=0,checkedTriage=false,checkedPain=false;
 for(let d=1;d<=14;d++){
  if(await has('#trainAnyway')){await ck('#breathBtn');await ck('#brStart');await pg.waitForSelector('#touchDone',{timeout:10000});touches++}
  else if(await has('#todayWorkout')&&!(await has('#doneCard'))){
   if(!checkedTriage){await ci({energy:'low'});check((await pg.textContent('#triage')).includes('Shorter version'),'low energy -> short version suggested');await pg.click('[data-ci="energy"][data-v="high"]');checkedTriage=true}
   else if(workouts===3&&!checkedPain){await ci({pain:'yes',region:'wristR'});check((await pg.textContent('#triage')).includes('Left out today')&&await has('#triage ~ .safe.stop, .safe.pain'),'check-in pain -> loaded patterns left out + SAFE-PAIN');checkedPain=true}
   else await ci();
   check(await has('.safe.stop'),`day ${d}: SAFE-STOP shown before session`);
   await ck('#startSession');const ex=await playSession(workouts===1?{hard:true}:workouts===2?{painOn:'squat'}:{});workouts++;
   check(await has('#score'),`day ${d}: session ${workouts} done (${ex} exercises), score shown`);await ck('#backToday')}
  await ck('#simDay')}
 const st=await pg.evaluate(()=>JSON.parse(localStorage.fcai_proto_state_v1).p);const dec=st.eng.decisions;
 console.log('   workouts',workouts,'touchpoints',touches,'codes',[...new Set(dec.map(d=>d.code))].join(','));
 check(workouts>=5&&touches>=5,'14 simulated days: workouts and rest-day touchpoints happened');
 const bySession={};dec.forEach(d=>{if(d.code==='STEP_UP')bySession[d.session]=(bySession[d.session]||0)+1});check(Object.values(bySession).every(v=>v===1)&&Object.keys(bySession).length>=1,'UI: step-ups happened, never >1 per session');
 check(dec.some(d=>d.code==='BAD_DAY_RETAIN'),'UI: hard session -> BAD_DAY_RETAIN');
 check(st.eng.patterns.squat.status==='notReady'&&dec.some(d=>d.code==='PAIN_STOP_PATTERN'&&d.pattern==='squat'),'UI: pain on squat -> squat stopped');
 check(dec.some(d=>d.code==='INJURY_REPORTED'&&d.pattern==='push'),'UI: check-in wrist pain -> push left out (INJURY_REPORTED)');
 const log=await pg.evaluate(()=>JSON.parse(localStorage.fcai_proto_log_v1));
 check(log.filter(e=>e.type==='set_logged').length>10&&log.some(e=>e.type==='session_started'&&e.data.prescriptionSnapshot),'event log: sets + prescription snapshot');
 check(log.every(e=>/Z$/.test(e.atUTC)&&e.timeZoneID)&&log.some(e=>e.simulatedDayOffset),'event log: UTC + tz, simulated events tagged');
 await ck('#tab-learned');check(await has('[data-tier="4"]')&&(await pg.textContent('#app')).includes("Here's what I learned"),'Learned: personalized after 14 days');
 await ck('#tab-learned');await pg.click('#advanced summary');await ck('#openDecisions');check((await pg.locator('#decList .dec').count())>5,'Decision log visible with reason codes');
 await ck('#tab-settings');const [dl]=await Promise.all([pg.waitForEvent('download'),ck('#exportBtn')]);const fs=require('fs');const p=await dl.path();const j=JSON.parse(fs.readFileSync(p,'utf8'));check(j.events.length>50&&j.state,'Export: JSON event log downloaded');
 await ck('#editBody');await pg.click('svg [data-r="kneeL"]');await pg.locator('#sheet .chip',{hasText:'Hurts now'}).click();await ck('#saveArea');
 let s2=await pg.evaluate(()=>JSON.parse(localStorage.fcai_proto_state_v1).p.eng);check(s2.decisions.some(d=>d.code==='INJURY_REPORTED'&&d.pattern==='squat')||s2.patterns.squat.status==='notReady','New knee area restricts immediately');
 if(!(await has('svg [data-r="kneeL"]')))console.log('SCREEN:',(await pg.textContent('#app')).slice(0,400));
 await pg.click('svg [data-r="kneeL"]');s2=await pg.evaluate(()=>JSON.parse(localStorage.fcai_proto_state_v1).p);check(s2.eng.decisions.some(d=>d.code==='NO_INSTANT_CLEARANCE')&&s2.bodyAreas.find(a=>a.region==='kneeL').status==='resolving','Unselecting area: no instant clearance');
 await pg.goto(URL);if(!(await has('#tab-settings')))console.log('SCREEN2:',(await pg.textContent('body')).slice(0,500));await ck('#tab-settings');await ck('#remBtn');check((await pg.textContent('#app')).includes('Add to Home Screen'),'Reminders: iOS web limit explained');await ck('#notifTest');
 await pg.goto(URL);await ck('#tab-settings');await ck('#hkBtn');if(!(await has('table.hk')))await ck('#hkToggle');check(await has('#hkSim')&&(await pg.textContent('#app')).includes('read-only'),'Apple Health: simulated label + read-only');
 await pg.goto(URL);await ck('#tab-today');for(let i=0;i<11;i++)await ck('#sim7');check(await has('#rescreen'),'90-day health re-check prompt appears');
 check(errs.length===0,'no console errors '+JSON.stringify(errs));await pg.screenshot({path:'/tmp/today.png'});
 // auto-play 14 days on a fresh plan
 require('fs').writeFileSync('/tmp/state.json',JSON.stringify(await pg.evaluate(()=>({...localStorage}))));await br.close();console.log(fails?fails+' FAILURES':'ALL PASSED');process.exit(fails?1:0)})();
