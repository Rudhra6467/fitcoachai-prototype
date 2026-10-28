/* v0.9.2 Decision Round 2: ability summary, "Something else" counter-offer, accept note, calibration Easier/Harder */
const BASE=(process.argv[2]||'http://127.0.0.1:8765/');const URL=BASE+'?dev=1';
const fakeSR=`class FakeSR{start(){window.__recActive=this}abort(){}stop(){}}window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
(async()=>{const br=await require('./launch.js')();let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 const ctx=await br.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});await ctx.addInitScript(fakeSR);const pg=await ctx.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(String(e)));pg.on('dialog',d=>d.accept());await pg.goto(URL);
 const ck=s=>pg.click(s),chip=t=>pg.locator('#app .chip',{hasText:t}).first().click(),has=async s=>(await pg.locator(s).count())>0;
 // 1. config: approved values moved, only deferred/superseded left in RESEARCH_NEEDED

 // 2. onboarding + baseline, then the plan
 await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
 for(const k of ['h1','h2','h3','h4','h5','h6'])await pg.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
 await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');
 await ck('#next');await ck('#next');await ck('#startCheck');let n=0;
 while(await has('#startBtn')&&n<8){n++;await pg.evaluate(()=>say('go'));await pg.waitForTimeout(100);await pg.evaluate(()=>say('done'));await pg.waitForTimeout(100);
  if(await has('#talkYes'))await pg.evaluate(()=>say('yes'));else await pg.evaluate(()=>say('twelve'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('okay'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('no'));await pg.waitForTimeout(150);if(await has('#skipRest'))await ck('#skipRest');await pg.waitForTimeout(100)}
 await ck('#startPlan');for(let i=0;i<7&&!(await has('#todayWorkout'));i++){await ck('#simDay');await pg.waitForTimeout(150)}
 check(await pg.evaluate(()=>!calDone()),'still calibrating');
 // D2-5 Easier / Harder during calibration
 await ck('#modOpen');check(await has('#intensityHint')&&await has('[data-mod="easier"],[data-mod="harder"]'),'calibration: Easier / Harder offered');
 const pat=await pg.evaluate(()=>{const p=ENG.PATS.find(x=>canNudge(x,1)||canNudge(x,-1));return p});
 const dir=await pg.evaluate(p=>canNudge(p,1)?1:-1,pat);const l0=await pg.evaluate(p=>E().patterns[p].lvl,pat);
 await pg.click(`[data-mod="${dir>0?'harder':'easier'}"][data-pat="${pat}"]`);await pg.waitForTimeout(100);
 const r=await pg.evaluate(p=>({l:E().patterns[p].lvl,again:canNudge(p,1)||canNudge(p,-1),d:E().decisions.slice(-1)[0]}),pat);
 check(r.l===l0+dir,'level moved exactly one step ('+l0+'→'+r.l+')');check(!r.again,'only once per movement per day');check(r.d&&r.d.userInitiated&&/USER_/.test(r.d.code),'logged as a user decision');
 check(await pg.evaluate(()=>{for(const x of ENG.PATS){const ps=E().patterns[x];if(ps.status==='gentle'||ps.injury){return !canNudge(x,1)||ps.lvl+1<=ENG.GCAP}}return true}),'gentle movements never go above the gentle cap');
 await pg.evaluate(()=>modUndo());check(await pg.evaluate(p=>!(canNudge(p,1)||canNudge(p,-1)),pat),'undo does not reopen the ±1 for today');
 // before calibration: no accept note, "Something else" accepted directly (unchanged)
 await pg.evaluate(()=>{S.mod={step:'offer',action:'skip',pattern:'squat',reason:'other'};go('modify')});await pg.waitForTimeout(100);
 check(!(await has('#modDisclaim'))&&!(await has('#modCounter')),'calibrating: "Something else" accepted directly, no note');
 // after calibration
 await pg.evaluate(()=>{simCalib(false)});check(await pg.evaluate(()=>calDone()),'calibration complete');
 await pg.evaluate(()=>{S.mod={step:'what'};go('modify')});await pg.waitForTimeout(100);check(await has('[data-mod="swap"]'),'modify list shown');check(!(await has('[data-mod="easier"],[data-mod="harder"]')),'after calibration: no Easier / Harder');
 const pk=await pg.evaluate(()=>ENG.PATS.find(x=>E().patterns[x].status!=='notReady'));
 await pg.evaluate(p=>{S.mod={step:'offer',action:'skip',pattern:p,reason:'other'};go('modify')},pk);await pg.waitForTimeout(100);
 check(await has('#modCounter')&&(await pg.textContent('#modCounter')).includes('short'),'D2-3: "Something else" gets the short-version counter-offer first');
 check(await has('#modAnyway'),'…and can still say no (never a hard block)');
 check(await has('#modDisclaim')&&(await pg.textContent('#modDisclaim')).includes("can't promise the same progress"),'D2-4: accept note shown');
 await pg.evaluate(p=>{S.mod={step:'offer',action:'skip',pattern:p,reason:'pain'};go('modify')},pk);await pg.waitForTimeout(100);
 check(!(await has('#modDisclaim'))&&!(await has('#modCounter')),'pain path unchanged: no note, no counter-offer');
 const t=await pg.textContent('#app');check(t.includes('safer to leave'),'pain wording unchanged');
 // D2-1 ability summary
 const a=await pg.evaluate(()=>abilitySummary());check(a&&a.of===4&&a.avg>=1&&a.avg<=4,'ability summary is the average step ('+JSON.stringify(a)+')');
 await pg.evaluate(()=>{S.mod=null;simDays(1,true)});await pg.waitForTimeout(200);const ls=await pg.evaluate(()=>{const s=P().sessions.slice(-1)[0];S.lastSession=s&&s.id;go('sessionDone');return !!s});
 await pg.waitForTimeout(150);check(ls&&await has('#perfCard')&&await has('#abilityCard'),'Performance Score + ability summary after a session');
 const cf2=await pg.evaluate(()=>({v:APPVER,A:FC_CONFIG.APPROVED}));check(cf2.v==='0.9.2','APPVER 0.9.2');
 const sw2=await (await pg.request.get(BASE+'sw.js')).text();check(sw2.includes('fcai-v0.9.2')&&sw2.includes('js/v092.js'),'service worker fcai-v0.9.2 caches v092.js');
 const fs=require('fs');const am=fs.readFileSync(__dirname+'/../docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md','utf8');check(['A1','A2','A3','A4','A5'].every(x=>am.includes('**'+x)),'amendments file lists A1–A5');
 const rv=fs.readFileSync(__dirname+'/../docs/PRE-NATIVE-REVIEW.md','utf8');check(!/Decision:\s*_{3,}/.test(rv),'every Round 2 decision recorded');
 check(errs.length===0,'no page errors '+JSON.stringify(errs));
 console.log(fails?fails+' FAIL':'ALL PASS');await br.close();process.exit(fails?1:0)})();
