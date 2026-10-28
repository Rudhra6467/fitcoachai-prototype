/* v0.9.1 pre-native review fixes: Health screen shows only approved read types, Delete my data, body-area history kept, docs list every suite */
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
 const cf=await pg.evaluate(()=>({A:FC_CONFIG.APPROVED,v:APPVER}));
 check(/^0\.9\./.test(cf.v),'APPVER 0.9.x');
 const sw=await (await pg.request.get(BASE+'sw.js')).text();check(/fcai-v0\.9\./.test(sw),'service worker cache fcai-v0.9.x');
 // Health screen: only the approved read types (OQ-18), no steps
 await pg.evaluate(()=>{P().hk={connected:true,simulated:true};go('health')});await pg.waitForTimeout(150);
 const hk=await pg.textContent('#app');check(hk.includes('Sleep')&&hk.includes('Workouts')&&!/Steps/.test(hk),'Health screen columns are sleep + workouts only (no steps)');
 check(await pg.evaluate(()=>!('steps' in hkDay('2026-10-27'))),'simulated Health day has no steps value');
 // Delete my data matches the privacy copy
 await pg.evaluate(()=>go('settings'));await pg.waitForTimeout(150);check(await has('#deleteData')&&(await pg.textContent('#deleteData')).includes('Delete my data'),'Settings has "Delete my data", as the privacy screen says');
 // locked doc §5/§7: removing or updating a body area keeps its history
 const h=await pg.evaluate(()=>{const p=P();p.bodyAreas.push({region:'knee',status:'current',triggers:['stairs']});draftArea={region:'knee'};removeArea();return {gone:!p.bodyAreas.some(a=>a.region==='knee'),hist:(p.bodyAreaHistory||[]).filter(a=>a.region==='knee'&&a.archivedWhy==='removed').length}});
 check(h.gone&&h.hist===1,'removed body area leaves the active list but stays in bodyAreaHistory');
 // declarative invariants in config match the engine
 check(cf.A.maxLevelChangePerStep===1&&cf.A.badDayLowersLevel===false&&cf.A.startEveryoneAsBeginner===true,'declarative invariants present in APPROVED');
 // docs list every suite that exists
 const fs=require('fs'),path=require('path'),root=path.join(__dirname,'..'),suites=fs.readdirSync(__dirname).filter(f=>/^(inv|test|ui|audit|v\d+)\.js$/.test(f));
 const rd=fs.readFileSync(path.join(root,'README.md'),'utf8'),ah=fs.readFileSync(path.join(root,'docs/AUDIT-HANDOFF.md'),'utf8');
 const miss=suites.filter(f=>!rd.includes('`'+f+'`')||!ah.includes('`'+f+'`'));check(!miss.length,'README and AUDIT-HANDOFF list every suite'+(miss.length?' (missing: '+miss+')':''));
 check(!/7-day calibration floor/.test(fs.readFileSync(path.join(root,'RESEARCH-FLAGS.md'),'utf8')),'RESEARCH-FLAGS no longer lists a 7-day calibration floor');
 check(!errs.length,'no page errors '+JSON.stringify(errs));
 await br.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();
