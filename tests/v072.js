/* v0.7.2 polish checks: 3D coach reduced motion + load-failure fallback; caption bar never hides Stop on a small iPhone */
const BASE=(process.argv[2]||'http://127.0.0.1:8765/');
const fakeSR=`class FakeSR{start(){window.__recActive=this}abort(){}stop(){}}window.say=(t)=>{const r=window.__recActive;if(r&&r.onresult)r.onresult({resultIndex:0,results:[[{transcript:t}]]})};window.webkitSpeechRecognition=FakeSR;window.SpeechRecognition=FakeSR;`;
(async()=>{const br=await require('./launch.js')();let fails=0;const check=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
 const st=async(o)=>{const c=await br.newContext({viewport:{width:375,height:667},serviceWorkers:'block',...o});await c.addInitScript(fakeSR);return [c,await c.newPage()]};
 {const [c,p]=await st({reducedMotion:'reduce'});await p.goto(BASE);await p.waitForSelector('.fx3d[data-ready],.fx3d[data-failed]',{timeout:60000});
  const r=await p.evaluate(()=>{const e=document.querySelector('.fx3d'),cv=e.querySelector('canvas');return {ready:!!e.dataset.ready,tr:cv&&cv.style.transition}});
  check(r.ready&&r.tr==='none','reduced motion: coach loads with no fade');
  const f=await p.evaluate(()=>{const b=document.querySelector('.fx3d').getBoundingClientRect();return b.width<=375&&b.left>=0&&b.height>=200});check(f,'coach box fits a 375 px screen');await c.close()}
 {const [c,p]=await st({});await p.route('**/coach-mannequin.glb',r=>r.abort());await p.goto(BASE);await p.waitForSelector('.fx3d[data-failed]',{timeout:60000});
  check((await p.textContent('.fx3d')).includes("couldn't load"),'model load failure shows the fallback message');
  check((await p.textContent('#app h1')).includes("Hi, I'm your FitcoachAI coach"),'app still works after a 3D failure');await c.close()}
 {const [c,p]=await st({});await p.goto(BASE+'?dev=1');const ck=s=>p.click(s),chip=t=>p.locator('#app .chip',{hasText:t}).first().click();
  await ck('#ack');await ck('#next');await chip('30–39');await chip('Female');await ck('#next');await ck('#next');await chip('active most weeks');await ck('#next');await ck('#nothing');
  for(const k of ['h1','h2','h3','h4','h5','h6'])await p.click(`[data-q="hs.${k}"][data-v="no"]`);await ck('#next');
  await chip('Mostly sitting');await chip('Regular daytime');await ck('#next');await chip('A wall');await chip('sturdy chair');await chip('Floor space');await ck('#next');await ck('#next');await ck('#next');await ck('#startCheck');
  await p.waitForSelector('#stopBtn');await p.waitForTimeout(400);await p.locator('#stopBtn').scrollIntoViewIfNeeded();await p.evaluate(()=>window.scrollTo(0,99999));await p.waitForTimeout(200);
  const ov=await p.evaluate(()=>{const s=document.getElementById('stopBtn').getBoundingClientRect(),c=document.getElementById('cap'),cr=c.getBoundingClientRect();return {vis:getComputedStyle(c).display!=='none',clear:s.bottom<=cr.top+1||getComputedStyle(c).display==='none'}});
  check(ov.clear,'SE size: Stop can be scrolled fully clear of the caption bar');await c.close()}
 await br.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();
