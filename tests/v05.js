const {chromium}=require('playwright-core');const fs=require('fs');const BASE=(process.argv[2]||'http://127.0.0.1:8765/');
const SCHEMA_EXPECT=4;
const fakeSR=fs.readFileSync(__dirname+'/ui.js','utf8').split('\n')[1].replace(/^const fakeSR=`/,'').replace(/`;\s*$/,'');
const IPH='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
(async()=>{const br=await require('./launch.js')();
 let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};const errs=[];
 async function mk(o={}){const ctx=await br.newContext({viewport:{width:390,height:844},acceptDownloads:true,...(o.ua?{userAgent:o.ua}:{})});await ctx.addInitScript(fakeSR);const pg=await ctx.newPage();
  pg.on('console',m=>{if(m.type()==='error'&&!(o.offline&&/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(m.text())))errs.push(m.text())});pg.on('pageerror',e=>errs.push(String(e)));pg.on('dialog',d=>d.accept());
  const ck=s=>pg.click(s),chip=t=>pg.locator('#app .chip',{hasText:t}).first().click(),has=async s=>(await pg.locator(s).count())>0,say=t=>pg.evaluate(t=>say(t),t),w=n=>pg.waitForTimeout(n);
  return {ctx,pg,ck,chip,has,say,w}}
 async function onboard(t){const {pg,ck,chip}=t;await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
  for(const k of ['h1','h2','h3','h4','h5','h6'])await pg.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
  await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');await ck('#next');await ck('#next');await ck('#startCheck')}
 const STOPTXT=await (async()=>{const t=await mk();await t.pg.goto(BASE);const s=await t.pg.evaluate(()=>SAFE.STOP);await t.ctx.close();return s})();

 // ---- A: baseline Stop on measure/effort + resume after reload + spoken stop
 {const t=await mk(),{pg,ck,has,say,w}=t;await pg.goto(BASE);await onboard(t);
  await say('go');await w(100);await say('done');await w(150);
  check(await has('#stopBtn'),'baseline measure screen has a Stop button');
  if(await has('#talkYes'))await ck('#talkYes');else await ck('#saveCount').catch(async()=>{await ck('#plus');await ck('#saveCount')});await w(100);
  check(await has('[data-e]')&&await has('#stopBtn'),'baseline effort screen has a Stop button');
  await pg.reload();await w(300);check(await has('[data-e]')&&await pg.evaluate(()=>S.screen==='baseline'),'reload mid check-in -> check-in resumes at the same step');
  await say('stop');await w(200);const txt=await pg.textContent('#app');check(txt.includes(STOPTXT)&&await has('#seeResults'),'spoken "stop" on effort screen -> stopped, verbatim STOP wording');
  await t.ctx.close()}
 // ---- A2: button stop on baseline pain screen
 {const t=await mk(),{pg,ck,has,say,w}=t;await pg.goto(BASE);await onboard(t);await say('go');await w(100);await say('done');await w(150);
  if(await has('#talkYes'))await ck('#talkYes');else{await ck('#plus');await ck('#saveCount')}await pg.click('[data-e="okay"]');
  check(await has('#painNo')&&await has('#stopBtn'),'baseline pain screen has a Stop button');await ck('#painYes');await w(100);
  check(await has('[data-r]')&&await has('#stopBtn'),'baseline "where is the pain" screen has a Stop button');await say('stop');await w(150);
  check((await pg.textContent('#app')).includes(STOPTXT)&&await has('#seeResults'),'spoken "stop" on pain screen (previously not listening) -> verbatim STOP wording');await t.ctx.close()}
 {const t=await mk(),{pg,ck,has,say,w}=t;await pg.goto(BASE);await onboard(t);await say('go');await w(100);await say('done');await w(150);await ck('#stopBtn');
  check((await pg.textContent('#app')).includes(STOPTXT),'Stop button on measure screen -> verbatim STOP wording');await t.ctx.close()}

 // ---- B: iPhone UA, full onboarding, session pause/resume, Stop on measure, backup round-trip
 const t=await mk({ua:IPH}),{pg,ck,has,say,w}=t;await pg.goto(BASE+'?dev=1');await onboard(t);let n=0;
 while(await has('#startBtn')&&n<8){n++;await say('go');await w(100);await say('done');await w(100);if(await has('#talkYes'))await say('yes');else await say('twelve');await w(80);await say('okay');await w(80);await say('no');await w(80);if(await has('#skipRest'))await ck('#skipRest');await w(80)}
 await ck('#startPlan');check(await has('#a2hsCard'),'iOS Safari (not installed): Add to Home Screen hint on Today');
 await ck('#a2hsShow');check((await pg.textContent('#app')).includes('Add to Home Screen')&&await has('#installDone'),'install hint screen with steps');await ck('#installDone');
 check(!(await has('#a2hsCard')),'hint dismissed stays dismissed');
 if(!(await has('#quickStart'))&&await has('#trainAnyway'))await ck('#trainAnyway');await ck('#quickStart');await ck('#goSet');check(await has('#done'),'session running');
 await pg.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'hidden',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});await w(100);
 check(await has('#resumeW'),'app backgrounded mid-set -> workout paused');
 await pg.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
 await ck('#resumeW');check(await has('#done'),'resume -> set running again');
 await pg.reload();await w(300);check(await has('#resumeW')&&await pg.evaluate(()=>!!W&&S.screen==='session'),'reload mid-workout -> paused workout restored from localStorage');
 await ck('#resumeW');await ck('#done');check(await has('[data-n]')&&await has('#stopSession'),'session "how many" screen has Stop workout');
 await pg.click('[data-n]');check(await has('[data-effort]')?await has('#stopSession'):true,'effort screen has Stop workout (if reached)');
 await ck('#stopSession');await w(100);check(await has('#postDone')&&(await pg.textContent('#app')).includes(STOPTXT),'Stop -> post check-in shows verbatim STOP wording');await pg.click('[data-pc="pain"][data-v="no"]');await pg.click('[data-pc="energy"][data-v="ok"]');await ck('#postDone');check(await has('#backToday')&&(await pg.textContent('#app')).includes(STOPTXT),'Stop workout -> done screen shows verbatim STOP wording');
 check(await pg.evaluate(()=>!localStorage.fcai_proto_session_v1),'saved session cleared after stop');await ck('#backToday');
 // backup round trip
 await ck('#tab-settings');const fsz=await pg.$eval('#docDate',e=>parseFloat(getComputedStyle(e).fontSize)).catch(()=>16);check(fsz>=16,'inputs are 16px (no iOS zoom): '+fsz);
 const [dl]=await Promise.all([pg.waitForEvent('download'),ck('#exportBtn')]);const bj=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
 check(bj.app==='FitcoachAI'&&bj.schemaVersion===SCHEMA_EXPECT&&bj.state.p.sessions.length>=1,'export has app, schemaVersion, sessions');
 const before=await pg.evaluate(()=>({n:P().sessions.length,ev:JSON.parse(localStorage.fcai_proto_log_v1).length}));
 const bad=await pg.evaluate(()=>[importBackupText('nope',true),importBackupText('{"x":1}',true),importBackupText(JSON.stringify({app:'Other',state:{}}),true),importBackupText(JSON.stringify({schemaVersion:99,state:{screen:'today',p:{disclaimerAccepted:true}}}),true)].map(r=>r.ok));
 check(bad.every(x=>x===false),'invalid backups rejected (bad JSON, wrong shape, other app, newer schema)');
 await pg.evaluate(()=>{localStorage.removeItem('fcai_proto_state_v1');localStorage.removeItem('fcai_proto_log_v1')});
 fs.writeFileSync('/tmp/bk.json',JSON.stringify(bj));await pg.setInputFiles('#restoreFile','/tmp/bk.json');await pg.waitForLoadState('load');await w(500);
 const after=await pg.evaluate(()=>({n:P().sessions.length,ev:JSON.parse(localStorage.fcai_proto_log_v1).length,scr:S.screen,imp:JSON.parse(localStorage.fcai_proto_log_v1).some(e=>e.type==='backup_imported')}));
 check(after.n===before.n&&after.imp&&after.ev>=before.ev&&await has('#tab-today'),'backup import round-trip restores sessions + log '+JSON.stringify(after));
 // migration from older data
 const old=JSON.parse(JSON.stringify(bj.state));delete old.schemaVersion;delete old.hist;delete old.p.postpartum;delete old.p.hs.h6;delete old.p.limbDifference;delete old.p.nudgeTime;
 await pg.evaluate(o=>{localStorage.setItem('fcai_proto_state_v1',JSON.stringify(o))},old);await pg.reload();await w(400);
 const mg=await pg.evaluate(()=>({v:S.schemaVersion,f:S.migratedFrom,pp:!!P().postpartum,ld:Array.isArray(P().limbDifference),nt:P().nudgeTime,h:Array.isArray(S.hist),ev:JSON.parse(localStorage.fcai_proto_log_v1).some(e=>e.type==='storage_migrated'),stored:JSON.parse(localStorage.fcai_proto_state_v1).schemaVersion}));
 check(mg.v===SCHEMA_EXPECT&&mg.f===1&&mg.pp&&mg.ld&&mg.nt&&mg.h&&mg.ev&&mg.stored===SCHEMA_EXPECT&&await has('#tab-today'),'v0.4 data migrates to current schema and app opens '+JSON.stringify(mg));
 await pg.evaluate(()=>updateBanner({waiting:null}));check(await has('#updBtn'),'update prompt renders');await t.ctx.close();

 // ---- C: offline after first load (service worker)
 {const t=await mk({offline:true}),{pg,ctx,has,w}=t;await pg.goto(BASE);
  const sw=await pg.evaluate(async()=>{const r=await navigator.serviceWorker.ready;for(let i=0;i<60&&!navigator.serviceWorker.controller;i++)await new Promise(z=>setTimeout(z,250));
   const ks=await caches.keys(),c=await caches.open(ks.find(k=>k.startsWith('fcai-')));const keys=(await c.keys()).map(r=>r.url);
   return {active:!!r.active,ctl:!!navigator.serviceWorker.controller,ks,glb:keys.some(u=>u.endsWith('Xbot.glb')),three:keys.some(u=>u.includes('three.module.min.js')),gltf:keys.some(u=>u.includes('GLTFLoader.js')),n:keys.length}});
  check(sw.active&&sw.ctl&&sw.ks.some(k=>/^fcai-v0\.7/.test(k)),'service worker active, versioned cache '+JSON.stringify(sw.ks));
  check(sw.glb&&sw.three&&sw.gltf,'cache holds Xbot.glb + three.js (vendored) ('+sw.n+' files)');
  await ctx.setOffline(true);await pg.reload();await w(2500);
  check((await pg.textContent('#app')).includes("FitcoachAI coach")&&await has('#ack'),'offline reload: app loads');
  check(await pg.evaluate(()=>!!document.querySelector('#app canvas')||!/couldn|can.t load/i.test(document.querySelector('#app').textContent)),'offline: 3D coach loads from cache');
  const man=await pg.evaluate(async()=>{const m=await (await fetch('manifest.json')).json();const i=await fetch(m.icons[0].src);return {name:m.name,disp:m.display,ok:i.ok,type:i.headers.get('content-type')}});
  check(man.name==='FitcoachAI'&&man.disp==='standalone'&&man.ok&&/png/.test(man.type),'manifest + PNG icons served offline');
  await ctx.close()}
 check(errs.length===0,'no console errors '+JSON.stringify(errs));
 await br.close();console.log(fails?'FAILURES: '+fails:'ALL PASSED');process.exit(fails?1:0)})();
