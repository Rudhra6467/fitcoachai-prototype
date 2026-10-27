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
 await ck('#startPlan');
 const ev=()=>pg.evaluate(()=>JSON.parse(localStorage.getItem(KL)||'[]').map(e=>e.type||e.t||e.event));
 const lv=()=>pg.evaluate(()=>Object.fromEntries(ENG.PATS.map(x=>[x,E().patterns[x].lvl])));
 for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 // --- 3. explanation line
 const why=await pg.textContent('#whyLine');check(why.includes('Why this workout:')&&why.includes('beginner level'),'Today explains why this workout: '+why);
 // --- 2. modification during calibration: reason optional, counter-offer first
 await ck('#modOpen');check(await has('[data-mod="swap"]')&&await has('#modShort'),'Change something: swap / skip / shorten');
 await pg.click('[data-mod="swap"]');check(await has('[data-reason="none"]'),'reason optional while getting to know you ("Rather not say")');
 await pg.click('[data-reason="equipment"]');check(await has('#modCounter'),'equipment: coach counter-offers an alternative first: '+(await pg.textContent('#modCounter')));
 const alt=(await pg.textContent('#modCounter')).replace(/^Use /,'');await ck('#modCounter');
 check((await pg.textContent('#todayWorkout')).includes(alt)&&(await pg.textContent('#whyLine')).includes('swapped'),'swap shows on Today + in the why line');
 await ck('#modUndo');check(!(await pg.textContent('#todayWorkout')).includes('You changed'),'undo restores the workout');
 await ck('#modOpen');await pg.locator('[data-mod="skip"]').first().click();await pg.click('[data-reason="fatigue"]');
 check((await pg.textContent('#app')).includes('short version instead'),'tired + skip: offers the short version first');
 await ck('#modAnyway');check((await pg.textContent('#todayWorkout')).includes('skipped today'),'"No, skip it" = full accept, exercise marked skipped');
 await ck('#modUndo');await ck('#modOpen');await ck('#modShort');await pg.click('[data-reason="schedule"]');await ck('#modOk');
 check(await pg.evaluate(()=>modToday().short),'shorten accepted');
 const E1=await ev();check(E1.includes('modification_requested')&&E1.includes('modification_applied')&&E1.includes('modification_undone'),'modifications logged');
 await ck('#modUndo');
 // --- 1a. a hard session eases the next one (hold, -1 step max, no level drop)
 async function run(effort,energy,opts){opts=opts||{};if(await has('#somethingOff'))await ck('#somethingOff');
  for(const [k,v] of [['sleep','good'],['energy','high'],['soreness','none'],['pain','no']])if(await has(`[data-ci="${k}"][data-v="${v}"]`))await pg.click(`[data-ci="${k}"][data-v="${v}"]`);
  await ck('#startSession');let g=0;const tri=await pg.evaluate(()=>W&&W.triage);
  if(opts.skipPain){await ck('#skipEx');check(await has('#modReasons')&&!(await has('[data-reason="none"]')),'in-session skip asks why (required after calibration)');await pg.click('[data-reason="pain"]');check(await has('#skipCont')&&(await pg.textContent('#app')).includes('on hold'),'pain skip: on hold + pain safety text');await ck('#skipCont')}
  while(!(await has('#postDone'))&&g++<300){
   if(await has('#goSet')){await ck('#goSet');continue}
   if(await has('#done')&&await pg.isVisible('#done')){await ck('#done');continue}
   if(await has('[data-n]')){const v=await pg.evaluate(()=>cur().target);const sel=`[data-n="${v}"]`;await pg.click(await has(sel)?sel:'[data-n]');continue}
   if(await has('#skipRest')){await ck('#skipRest');continue}
   if(await has('#effSkip')){await ck('#effSkip');continue}
   if(await has('#painNo')){await ck('#painNo');continue}
   await pg.waitForTimeout(120)}
  if(effort)await pg.click(`[data-pc="effort"][data-v="${effort}"]`);await pg.click('[data-pc="pain"][data-v="no"]');await pg.click(`[data-pc="energy"][data-v="${energy}"]`);await ck('#postDone');return tri}
 const before=await lv();await run('hard','ok');
 check(await has('#easeNext'),'session done: says next time will be lighter: '+(await has('#easeNext')?await pg.textContent('#easeNext'):''));
 await ck('#backToday');for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 check(await has('#easeCard')&&(await pg.textContent('#whyLine')).includes('lighter'),'Today: lighter-session card + why line');
 const cmp=await pg.evaluate(()=>ENG.PATS.filter(x=>E().patterns[x].status!=='notReady').map(x=>{const a=ENG.prescribe(E(),x,ctxG('full')),b=ENG.prescribe(E(),x,ctxG('eased'));return {lvl:a.lvl===b.lvl,sets:a.sets===b.sets,d:a.target-b.target,lo:b.target>=b.lo}}));
 check(cmp.every(c=>c.lvl&&c.sets&&c.lo&&c.d>=0&&c.d<=5)&&cmp.some(c=>c.d>0),'eased dose: same level and sets, target lower by one small step at most, never below floor '+JSON.stringify(cmp));
 const mid=await lv();const tri=await run(null,'good');const after=await lv();
 check(tri==='eased','next session runs eased');
 check(JSON.stringify(mid)===JSON.stringify(after)&&Object.keys(after).every(x=>after[x]>=before[x]),'eased session: no level moves, never lower '+JSON.stringify({before,after}));
 const last=await pg.evaluate(()=>P().sessions.at(-1));check(last.decisions.some(d=>d.code==='EASED_HOLD')&&/Lighter session/.test(last.reason),'EASED_HOLD decision + reason line: '+last.reason);
 check(await pg.evaluate(()=>!easePending()),'ease applies to one session only');
 await ck('#backToday');
 // low energy also eases; can be declined
 for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 await run('okay','low');await ck('#backToday');for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 check(await has('#easeCard')&&(await pg.textContent('#easeCard')).includes('energy was low'),'low energy eases the next session');
 await ck('#easeDecline');check(!(await has('#easeCard'))&&(await ev()).includes('ease_declined'),'user can decline the lighter session');
 // --- after calibration: reasons required; in-session skip with pain
 await pg.evaluate(()=>simCalib(false));check(await pg.evaluate(()=>calDone()),'calibration complete');
 for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 await ck('#modOpen');await pg.locator('[data-mod="skip"]').first().click();check(!(await has('[data-reason="none"]')),'after calibration a reason is required');await ck('#modBack');
 const pat=await pg.evaluate(()=>sessionPatterns(todaySlot().slot||P().plan.weeks[0][0])[0]);
 await run(null,'good',{skipPain:true});check(await pg.evaluate(p=>E().patterns[p].status==='notReady',pat),'pain skip puts that movement on hold');
 await ck('#backToday');
 // --- 1e. migrated data completing calibration at once gets an honest note
 await pg.evaluate(()=>{const o=JSON.parse(localStorage.getItem(KP));o.schemaVersion=2;o.p.calib={startedAt:o.p.calib.startedAt,completedAt:null};delete o.p.ease;delete o.p.mods;localStorage.setItem(KP,JSON.stringify(o))});
 await pg.reload();await pg.waitForTimeout(500);await pg.evaluate(()=>go('today',false));
 check(await pg.evaluate(()=>S.schemaVersion===4&&P().mods&&'ease' in P()),'schema 4 migration adds ease + mods');
 check(await has('#planReadyBanner')&&(await pg.textContent('#planReadyBanner')).includes('earlier workouts already gave me enough'),'migrated user: honest "earlier workouts" note');
 // --- 1d. days suggestion no longer tied to experience
 const html=await (await pg.request.get(BASE+'index.html')).text();
 check(html.includes('d>=(CX.suggestThreeDaysFrom||5)&&!S._daysAsked')&&!/includes\(p\.experience\)\|\|gentleMode\(\)\)&&!S\._daysAsked/.test(html),'days suggestion independent of experience');
 check(errs.length===0,'no console errors '+JSON.stringify(errs.slice(0,3)));
 await br.close();console.log(fails?fails+' FAILURES':'ALL PASSED');process.exit(fails?1:0)})();
