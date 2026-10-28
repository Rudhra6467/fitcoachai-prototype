/* v0.8.0 exercise demos: a CC0 clip plays only where one matches; everything else keeps text + muscle map */
const BASE=(process.argv[2]||'http://127.0.0.1:8765/');const SHOT=process.env.SHOT;
const fakeSR=`class FakeSR{start(){window.__recActive=this}abort(){}stop(){}}window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
(async()=>{const br=await require('./launch.js')();let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 const toBaseline=async(o)=>{const c=await br.newContext({viewport:{width:375,height:667},serviceWorkers:'block',...o});await c.addInitScript(fakeSR);const p=await c.newPage();
  await p.goto(BASE+'?dev=1');const ck=s=>p.click(s),chip=t=>p.locator('#app .chip',{hasText:t}).first().click();
  await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
  for(const k of ['h1','h2','h3','h4','h5','h6'])await p.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
  await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');await ck('#next');await ck('#next');await ck('#startCheck');
  await p.waitForSelector('#startBtn');return [c,p]};
 const snap=p=>p.evaluate(()=>document.querySelector('.fxdemo canvas').toDataURL());
 {const [c,p]=await toBaseline({});const name=await p.textContent('#app h1');
  check(/Sit-to-stand/.test(name),'first check-in test is a sit-to-stand ('+name.trim()+')');
  await p.waitForSelector('.fxdemo[data-ready],.fxdemo[data-failed]',{timeout:60000});
  check(await p.$('.fxdemo[data-ready][data-demo="sitToStand"]'),'sit-to-stand intro shows the 3D demo');
  check(await p.$('.mmap'),'muscle map is still shown next to the demo');
  check((await p.textContent('.fxcap')).includes('hands-on-thighs'),'demo caption says which version it shows');
  await p.waitForTimeout(300);const a=await snap(p);await p.waitForTimeout(900);const b=await snap(p);check(a!==b,'demo animates (frames differ)');
  if(SHOT){await p.evaluate(()=>scrollTo(0,0));for(const k of [0,1,2,3]){await p.waitForTimeout(420);await p.locator('.fxdemo').screenshot({path:SHOT+'-f'+k+'.png'})}await p.screenshot({path:SHOT+'-intro.png'})}
  await p.click('#startBtn');await p.waitForSelector('.fxdemo.fxsm[data-ready],.fxdemo.fxsm[data-failed]',{timeout:60000});
  check(await p.$('.fxdemo.fxsm[data-ready]'),'run screen shows the smaller demo');
  const d=await p.evaluate(()=>{const r=document.getElementById('doneBtn').getBoundingClientRect();return r.top<innerHeight&&r.bottom>0});check(d,'Done button is still on screen with the demo (SE size)');
  if(SHOT){await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(300);await p.screenshot({path:SHOT+'-run.png'})}
  await p.click('#doneBtn');await p.waitForTimeout(200);
  // walk on to the next test (push): no matching clip, so no demo
  for(let i=0;i<8&&!(await p.$('#startBtn'));i++){const btn=await p.$('#saveCount,#painNo,[data-e="okay"],#talkYes,#skipRest,#contBtn,#nextBtn');if(!btn)break;if(await btn.getAttribute('id')==='saveCount'){await p.click('#plus')}await btn.click();await p.waitForTimeout(250)}
  const n2=await p.textContent('#app h1').catch(()=>'');
  if(await p.$('#startBtn')){check(!/sit-to-stand/i.test(n2)&&!(await p.$('.fxdemo')),'no demo for an exercise without a CC0 clip ('+n2.trim()+')');check(await p.$('.mmap'),'…it keeps the text + muscle map')}
  else check(false,'reached the second test');await c.close()}
 {const [c,p]=await toBaseline({reducedMotion:'reduce'});await p.waitForSelector('.fxdemo[data-ready],.fxdemo[data-failed]',{timeout:60000});await p.waitForTimeout(300);
  const a=await snap(p);await p.waitForTimeout(1200);const b=await snap(p);check(a===b,'reduced motion: demo holds one still pose');
  check(await p.evaluate(()=>document.querySelector('.fxdemo canvas').style.transition)==='none','reduced motion: no fade');await c.close()}
 {const fs=require('fs');const sz=fs.statSync(__dirname+'/../assets/coach-mannequin.glb').size;check(sz<600000,'model file stays small ('+sz+' bytes)')}
 await br.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();
