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
 const ev=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem(KL)||'[]').map(e=>e.type||e.t||e.event));
 const st=()=>pg.evaluate(()=>{const c=calib();return {c:{sessions:c.sessions,complete:c.complete,extending:c.extending,confident:c.confident},lv:Object.fromEntries(ENG.PATS.map(x=>[x,E().patterns[x].lvl])),done:calDone(),seeded:P().plan.seededBy||null,n:P().sessions.length}});
 // --- beginner start regardless of experience ("active most weeks" + strong baseline)
 let s0=await st();const beg=await pg.evaluate(()=>ENG.PATS.every(x=>E().patterns[x].lvl===(FC_CONFIG.APPROVED.beginnerLevel[x])));
 check(beg,'everyone starts at beginner levels despite "regular" experience '+JSON.stringify(s0.lv));
 check((await pg.textContent('#calib')).includes('Getting to know you: 0 of 6 sessions'),'Today: "Getting to know you: 0 of 6 sessions"');
 check(await pg.evaluate(()=>!/day \d+ of/i.test(document.querySelector('#calib').textContent)),'no fixed day count in the calibration meter');
 // --- one real session through the player, then post check-in timing + taps
 const t=await pg.evaluate(()=>{startSession&&0;return 1});
 for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 if(await has('#somethingOff'))await ck('#somethingOff');for(const [k,v] of [['sleep','good'],['energy','high'],['soreness','none'],['pain','no']])await pg.click(`[data-ci="${k}"][data-v="${v}"]`);
 await ck('#startSession');let g=0,sawSkip=false;
 while(!(await has('#postDone'))&&g++<300){
  if(await has('#goSet')){await ck('#goSet');continue}
  if(await has('#done')&&await pg.isVisible('#done')){await ck('#done');continue}
  if(await has('[data-n]')){const v=await pg.evaluate(()=>cur().hi);const sel=`[data-n="${v}"]`;await pg.click(await has(sel)?sel:'[data-n]');continue}
  if(await has('#skipRest')){await ck('#skipRest');continue}
  if(await has('#effSkip')){sawSkip=true;await ck('#effSkip');continue}
  if(await has('[data-effort]')){await pg.click('[data-effort="okay"]');continue}
  if(await has('#painNo')){await ck('#painNo');continue}
  await pg.waitForTimeout(120)}
 check(sawSkip,'effort (RPE) question has a Skip button');
 check(!(await pg.isEnabled('#postDone')),'post check-in: score button waits for pain + energy');
 const t0=Date.now();let taps=0;await pg.click('[data-pc="pain"][data-v="no"]');taps++;await pg.click('[data-pc="energy"][data-v="good"]');taps++;await ck('#postDone');taps++;
 check(taps<=4&&Date.now()-t0<10000,`post check-in: ${taps} taps, effort optional, ${Date.now()-t0} ms`);
 check(await has('#perfCard')&&await has('#score')&&await has('[data-part="completion"]')&&await has('[data-part="volume"]')&&await has('[data-part="adherence"]'),'Performance Score screen with completion / volume / adherence');
 check(!(await pg.textContent('#perfCard')).includes('placeholder'),'score formula no longer labelled placeholder (R21 approved)');
 check(await has('#reasonLine'),'one-line reason shown: '+(await has('#reasonLine')?await pg.textContent('#reasonLine'):''));
 const s1=await pg.evaluate(()=>P().sessions[0]);
 check(s1.results.every(r=>r.timing&&r.timing.setSec.length===r.sets.length&&r.timing.doneAtUTC.length===r.sets.length),'per-set timing + done timestamps recorded');
 check(s1.postCheck&&s1.postCheck.effort===null&&s1.postCheck.energy==='good','post check-in answers stored (effort skipped = null)');
 await ck('#backToday');check((await pg.textContent('#calib')).includes('1 of 6'),'meter advances to 1 of 6');
 check(await has('#lastReason'),'Today shows the last adjustment line');
 // --- extension path: messy data
 await pg.evaluate(()=>simCalib(true));s0=await st();
 check(s0.c.sessions>=6&&!s0.c.complete&&s0.c.extending&&!s0.done,'messy data: 6+ sessions but calibration extends '+JSON.stringify(s0.c));
 check(await has('#calibExtend')&&(await pg.textContent('#calibExtend')).includes("A few more sessions and I'll have you dialed in."),'Today: honest extension copy');
 check((await ev()).includes('calibration_extended'),'calibration_extended logged');
 // --- clean data completes
 await pg.evaluate(()=>simCalib(false));s0=await st();
 check(s0.done&&s0.seeded&&s0.seeded.source==='calibration','consistent data completes calibration; plan seeded by calibration '+JSON.stringify(s0.c));
 const E2=await ev();check(E2.includes('calibration_complete')&&E2.includes('plan_generated'),'calibration_complete + plan_generated logged');
 check(await has('#planReadyBanner')&&(await pg.textContent('#calib')).includes('Your plan is ready'),'Today: "Your plan is ready"');
 await ck('#seePlan3');check(await has('#planList')&&(await pg.locator('#planList li').count())>=3,'plan ready screen lists starting exercises');
 await ck('#planGo');check(!(await has('#planReadyBanner')),'banner gone after viewing plan');
 // --- +/-1 rule over the whole history
 const jump=await pg.evaluate(()=>{let mx=0;ENG.PATS.forEach(x=>{const o=E().patterns[x].obs;for(let i=1;i<o.length;i++)mx=Math.max(mx,Math.abs(o[i].lvl-o[i-1].lvl))});return mx});
 check(jump<=1,'level never changes by more than 1 between sessions (max '+jump+')');
 check(await pg.evaluate(()=>P().sessions.every(s=>s.score&&s.score.formula==='R21')),'every session has a Performance Score');
 // --- version
 await ck('#tab-settings');check((await pg.textContent('#app')).includes('v0.9.1'),'settings version line v0.9.1');
 const html=await (await pg.request.get(BASE+'index.html')).text(),sw=await (await pg.request.get(BASE+'sw.js')).text();
 check(!html.includes('v=0.5')&&!html.includes('v=0.6')&&html.includes('js/v07.js?v=0.9.1')&&sw.includes("fcai-v0.9.1")&&sw.includes('js/v07.js'),'?v=0.9.1 everywhere + SW cache fcai-v0.9.1');
 // --- migration from v0.5 (schema 2) keeps data
 const old=await pg.evaluate(()=>{const o=JSON.parse(localStorage.getItem(KP));o.schemaVersion=2;delete o.p.calib;const n=o.p.sessions.length;localStorage.setItem(KP,JSON.stringify(o));return n});
 await pg.reload();await pg.waitForTimeout(400);
 const mg=await pg.evaluate(()=>({v:S.schemaVersion,calib:!!P().calib,n:P().sessions.length}));
 check(mg.v===4&&mg.calib&&mg.n===old,'v0.5 data migrates to schema 4, sessions kept '+JSON.stringify(mg));
 check(errs.length===0,'no console errors '+JSON.stringify(errs.slice(0,3)));
 await br.close();console.log(fails?fails+' FAILURES':'ALL PASSED');process.exit(fails?1:0)})();
