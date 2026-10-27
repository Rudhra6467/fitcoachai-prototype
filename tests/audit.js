const {chromium}=require('playwright-core');const BASE=(process.argv[2]||'http://127.0.0.1:8765/');const URL=BASE+'?dev=1';
const fakeSR=`class FakeSR{constructor(){}start(){window.__recActive=this}abort(){}stop(){}}window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
(async()=>{const br=await require('./launch.js')();
 let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 const ctx=await br.newContext({viewport:{width:390,height:844},acceptDownloads:true});await ctx.addInitScript(fakeSR);const pg=await ctx.newPage();const errs=[];
 pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('pageerror',e=>console.log('STACK',e.stack));pg.on('pageerror',e=>errs.push(String(e)));pg.on('dialog',d=>d.accept());await pg.goto(URL);
 let taps=0;const seen=[];const rec=async()=>{const r=await pg.evaluate(()=>({s:S.screen,w:document.getElementById('app').innerText.split(/\s+/).filter(Boolean).length,h:(document.querySelector('#app h1')||{}).innerText||''}));const l=seen[seen.length-1];if(!l||l.s!==r.s)seen.push({...r,taps:0});return r};const _pc=pg.click.bind(pg);pg.click=async(s)=>{await rec();seen[seen.length-1].taps++;taps++;await _pc(s);await rec()};const ck=s=>pg.click(s),chip=async t=>{await rec();seen[seen.length-1].taps++;taps++;await pg.locator('#app .chip',{hasText:t}).first().click();await rec()},has=async s=>(await pg.locator(s).count())>0;
 // onboarding (standard, no injuries) + baseline by voice
 await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
 for(const k of ['h1','h2','h3','h4','h5','h6'])await pg.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
 await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');
 await ck('#next');await ck('#next');await ck('#startCheck');let n=0;
 while(await has('#startBtn')&&n<8){n++;await pg.evaluate(()=>say('go'));await pg.waitForTimeout(100);await pg.evaluate(()=>say('done'));await pg.waitForTimeout(100);
  if(await has('#talkYes'))await pg.evaluate(()=>say('yes'));else await pg.evaluate(()=>say('twelve'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('okay'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('no'));await pg.waitForTimeout(150);if(await has('#skipRest'))await ck('#skipRest');await pg.waitForTimeout(100)}
 await ck('#startPlan');await rec();
 // to first workout start (check-in + start)
 if(!(await has('#quickStart'))&&await has('#trainAnyway'))await ck('#trainAnyway');if(await has('#quickStart'))await ck('#quickStart');else{for(const [k,v] of [['sleep','good'],['energy','high'],['soreness','none'],['pain','no']])await pg.click(`[data-ci="${k}"][data-v="${v}"]`);await ck('#startSession')}await rec();
 const B=JSON.parse(require('fs').readFileSync(__dirname+'/audit_before.json','utf8'));const okT=taps<B.taps,okS=seen.length<B.screens,inSession=seen[seen.length-1].s==='session';
 console.log((okT&&okS&&inSession?'PASS':'FAIL')+` onboarding->first workout: taps ${B.taps}->${taps}, screens ${B.screens}->${seen.length}`);
 console.log(JSON.stringify({taps,screens:seen.length,seen}));require('fs').writeFileSync(process.argv[3]||'/tmp/audit.json',JSON.stringify({taps,screens:seen.length,seen},null,1));
 await br.close()})();