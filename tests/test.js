const {chromium}=require('playwright-core');
const URL=process.argv[2]||'http://127.0.0.1:8765/';
const fakeSR=`window.__heard=[];class FakeSR{constructor(){window.__rec=this}start(){window.__recActive=this}abort(){}stop(){}}
window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};
window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
const noSR=`delete window.webkitSpeechRecognition;window.webkitSpeechRecognition=undefined;window.SpeechRecognition=undefined;`;
(async()=>{const br=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 async function newPage(init){const ctx=await br.newContext({viewport:{width:390,height:844}});if(init)await ctx.addInitScript(init);const pg=await ctx.newPage();const errs=[];
  pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('pageerror',e=>errs.push(String(e)));pg.on('dialog',d=>d.accept());await pg.goto(URL);return{pg,errs,ctx}}
 const ck=async(pg,sel)=>{await pg.click(sel)};
 const chip=(pg,txt)=>pg.locator('#app .chip',{hasText:txt}).first().click();
 async function onboard(pg,o={}){await ck(pg,'#ack');await ck(pg,'#next');
  await chip(pg,o.age||'30–39');await chip(pg,'Female');await ck(pg,'#next');if(o.age==='Under 18')return;
  await ck(pg,'#next');await chip(pg,o.exp||'active most weeks');await ck(pg,'#next');
  if(o.knee){await pg.click('svg [data-r="kneeL"]');await pg.locator('#sheet .chip',{hasText:'Hurts now'}).click();await pg.locator('#sheet .chip',{hasText:'Bending down'}).click();await ck(pg,'#saveArea');await ck(pg,'#next')}
  else await ck(pg,'#nothing');
  const hs=o.hs||{};for(const k of ['h1','h2','h3','h4','h5','h6'])await pg.click(`[data-q="hs.${k}"][data-v="${hs[k]||'no'}"]`);
  if(o.chestRecent)await pg.click(`[data-q="hs.chestRecent"][data-v="${o.chestRecent}"]`);
  if(o.faintRecent)await pg.click(`[data-q="hs.faintRecent"][data-v="${o.faintRecent}"]`);
  await ck(pg,'#next');if(o.stopAfterHealth)return;
  if(o.pregnant){await chip(pg,"pregnant now");await ck(pg,'#next');return}
  await chip(pg,'Mostly sitting');await chip(pg,'Regular daytime');await ck(pg,'#next');
  await chip(pg,'A wall');await chip(pg,'sturdy chair');await chip(pg,'Floor space');await ck(pg,'#next');
  await ck(pg,'#next');await ck(pg,'#next');}
 // Path A: full standard path with fake voice
 {const {pg,errs}=await newPage(fakeSR);
  check((await pg.textContent('#app h1')).includes("Hi, I'm your FitcoachAI coach"),'X: first screen renders');
  await pg.waitForSelector('.fx3d[data-ready],.fx3d[data-failed],.fx3d .fxmsg:not(:empty)',{timeout:30000});await pg.waitForTimeout(1500);
  const px=await pg.evaluate(()=>{const c=document.querySelector('.fx3d canvas');if(!c)return {fallback:document.querySelector('.fx3d').textContent};const t=document.createElement('canvas');t.width=c.width;t.height=c.height;const x=t.getContext('2d');x.drawImage(c,0,0);const d=x.getImageData(0,0,t.width,t.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return {n,total:d.length/4}});
  console.log('   3D:',JSON.stringify(px));check(px.n>500||!!px.fallback,'X: 3D canvas draws non-blank pixels (or fallback)');
  await pg.screenshot({path:'/tmp/s1.png'});
  await pg.click('#ack');await pg.click('#next');await pg.locator('#app .chip',{hasText:'30–39'}).first().click();await pg.locator('#app .chip',{hasText:'Female'}).first().click();await pg.click('#next');await pg.click('#next');await pg.locator('#app .chip',{hasText:'active most weeks'}).first().click();await pg.click('#next');
  await pg.click('svg [data-r="kneeL"]');await pg.locator('#sheet .chip',{hasText:'Hurts now'}).click();await ck(pg,'#saveArea');
  await pg.waitForSelector('#app .mmap[data-ready]',{timeout:15000});const mm=await pg.evaluate(()=>{const p=[...document.querySelectorAll('#app .mmap path')];return {paths:p.length,lit:p.filter(e=>+getComputedStyle(e).opacity>0.3||+e.getAttribute('opacity')>0.3||+e.getAttribute('fill-opacity')>0.3).length}});
  console.log('   S6 map:',JSON.stringify(mm));check(mm.paths>0&&mm.lit>0,'X: injury muscle map highlights selected area');await pg.screenshot({path:'/tmp/s6.png'});
  await pg.evaluate(()=>{localStorage.clear()});await pg.reload();await onboard(pg);
  check(await pg.locator('h1',{hasText:"Let's see where you're starting"}).count()===1,'A: reached S14');
  await ck(pg,'#startCheck');await pg.waitForSelector('#app .mmap[data-ready]',{timeout:15000});const tm=await pg.evaluate(()=>[...document.querySelectorAll('#app .mmap path')].filter(e=>+getComputedStyle(e).opacity>0.3||+e.getAttribute('opacity')>0.3||+e.getAttribute('fill-opacity')>0.3).length);check(tm>0,'X: test card muscle map highlights ('+tm+')');await pg.screenshot({path:'/tmp/test.png'});let n=0;
  while(await pg.locator('#startBtn').count()&&n<8){n++;await pg.evaluate(()=>say('go'));await pg.waitForTimeout(100);
   await pg.evaluate(()=>say('done'));await pg.waitForTimeout(100);
   if(await pg.locator('#talkYes').count())await pg.evaluate(()=>say('yes'));else await pg.evaluate(()=>say('twelve'));await pg.waitForTimeout(80);
   await pg.evaluate(()=>say('okay'));await pg.waitForTimeout(80);await pg.evaluate(()=>say('no'));await pg.waitForTimeout(150);
   if(await pg.locator('#skipRest').count())await ck(pg,'#skipRest');await pg.waitForTimeout(100)}
  check(n>=4&&n<=6,`A: ran ${n} tests via voice commands`);
  check(await pg.locator('h1',{hasText:"Here's what we saw"}).count()===1,'A: results screen');
  check(await pg.locator('h2',{hasText:'Week 2'}).count()===1,'A: 2-week plan rendered');
  const st=await pg.evaluate(()=>({p:JSON.parse(localStorage.fcai_proto_state_v1).p,l:JSON.parse(localStorage.fcai_proto_log_v1)}));
  check(st.p.baselineResults.length===n&&st.p.baselineResults.every(r=>r.inputMethod==='voice'),'A: results persisted, inputMethod voice');
  check(st.l.every(e=>/Z$/.test(e.atUTC)&&e.timeZoneID),'A: log has UTC timestamps + tz ('+st.l.length+' events)');
  check(!('heightCm' in st.p)&&!('weight' in st.p),'A: no height/weight fields');
  await pg.screenshot({path:'/workspace/fitcoachai-prototype/shot-results.png',fullPage:false});
  check(errs.length===0,'A: no console errors '+JSON.stringify(errs))}
 // Path B: no speech recognition, gentle mode, knee pain, pain during test -> continue, button only
 {const {pg,errs}=await newPage(noSR);await onboard(pg,{knee:true,exp:'new to exercise',hs:{h3:'unsure'}});
  
  check((await pg.textContent('#app')).includes('skipped to protect your left knee'),'B: squat skipped for knee');
  await ck(pg,'#startCheck');await pg.waitForTimeout(400);
  check(await pg.locator('.mic',{hasText:'Voice off'}).count()===1,'B: graceful degrade without speech recognition');
  await ck(pg,'#startBtn');await ck(pg,'#doneBtn');await ck(pg,'#plus');await ck(pg,'#saveCount');await pg.click('[data-e="hard"]');await ck(pg,'#painYes');
  await pg.click('#app [data-r="shoulderR"]');await ck(pg,'#sharpNo');check(await pg.locator('#app .safe.pain').count()===1,'B: pain -> SAFE-PAIN shown');
  await ck(pg,'#contBtn');check(await pg.locator('#skipRest').count()===0&&await pg.locator('#rt').count()===1,'B: rest countdown, not skippable in gentle mode');
  await pg.waitForTimeout(16000);await ck(pg,'#startBtn');await ck(pg,'#stopBtn');check(await pg.locator('.safe.stop').count()===1,'B: stop -> SAFE-STOP');
  await ck(pg,'#seeResults');const t=await pg.textContent('#app');check(t.includes('Not ready')&&t.includes('You stopped the check-in'),'B: results show Not ready + stopped');check(await pg.locator('.safe.doc').count()>0,'B: gentle mode SAFE-DOC on results');
  check(errs.length===0,'B: no console errors '+JSON.stringify(errs))}
 // Stops
 for(const [name,o,txt] of [['under18',{age:'Under 18'},'adults (18+)'],['chest',{hs:{h2:'yes'},chestRecent:'unsure',stopAfterHealth:1},"Let's pause here."],['faint unsure',{hs:{h4:'yes'},faintRecent:'unsure',stopAfterHealth:1},"Let's pause here."],['pregnancy',{hs:{h5:'yes'},pregnant:1},"isn't built for pregnancy"]]){
  const {pg,errs}=await newPage(noSR);await onboard(pg,o);const t=await pg.textContent('#app');check(t.includes(txt)&&t.includes(SAFESTOP),`Stop: ${name}`);check(errs.length===0,`Stop ${name}: no console errors`)}
 await br.close();console.log(fails?`${fails} FAILURES`:'ALL PASSED');process.exit(fails?1:0)})();
const SAFESTOP='Stop exercising and get medical help right away';
