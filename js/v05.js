/* FitcoachAI v0.5 — "Ready to try daily on iPhone": Stop everywhere, pause/resume after backgrounding or reload,
   wake lock, audio unlock, iOS install hint, backup import + validation, service worker + update prompt. */
const KW='fcai_proto_session_v1',KB='fcai_proto_baseline_v1',KC='fcai_proto_ci_v1',KA='fcai_proto_a2hs_v1';

/* ---------- 1. Stop on every active-exercise screen + spoken "stop" ---------- */
{const _sb=SC.baseline;SC.baseline=()=>{let h=_sb();if(B&&['measure','effort','pain','painWhere','painSharp','painNote'].includes(B.phase))
  h+=`<button class="btn red" id="stopBtn" onclick="stopBaseline('button')">Stop</button><p class="sm mut">Say "stop" any time.</p>`;return h}}
{const _ss=SC.session;SC.session=()=>{if(W&&W.paused)return pausedHTML();let h=_ss();
  if(W&&['measure','effort','pain','sharp'].includes(W.phase))h=h.replace(/<\/div>$/,'')+`<button class="btn red" id="stopSession" onclick="stopSession()">Stop workout</button><p class="sm mut">Say "stop" any time.</p></div>`;return h}}
{const _sd=SC.sessionDone;SC.sessionDone=()=>{let h=_sd();const s=(P().sessions||[]).find(x=>x.id===S.lastSession);
  if(s&&s.stopped&&s.stopWhy!=='sharpPain')h=h.replace('</h1>','</h1>'+safe('STOP'));return h}}
{const _stop=stopSession;stopSession=function(){const on=!!W;_stop();if(on&&P().voiceCoaching&&'speechSynthesis' in window)try{const u=new SpeechSynthesisUtterance('Stopping now. '+SAFE.STOP);u.lang=navigator.language||'en-US';speechSynthesis.speak(u)}catch(e){}}}
{const _l=listen;listen=function(h){_l(t=>{if(has(t,['stop'])){if(W&&S.screen==='session')return stopSession();
  if(B&&S.screen==='baseline'&&!['stopped','painStop'].includes(B.phase))return stopBaseline('voice')}h&&h(t)})}}

/* ---------- 2. Pause / resume (backgrounding + reload) ---------- */
function pausedHTML(){return `<h1>Paused</h1><p>Your workout is saved. Pick up right where you left off — the current set starts again.</p>
 <p class="sm mut">Exercise ${W.i+1} of ${W.rx.length} · ${esc(cur().name)}</p>
 <button class="btn xl" id="resumeW" onclick="resumeW()">Resume workout</button>
 <button class="btn red" id="stopSession" onclick="stopSession()">Stop workout</button>${safe('STOP')}`}
function pauseW(why){if(!W||W.paused)return;clearInterval(timerI);try{unlisten();speechSynthesis.cancel()}catch(e){}
 W.paused={phase:W.phase,why,at:nowISO()};logEv('session_paused',{why,phase:W.phase,at:W.i});persist();if(S.screen==='session')render()}
function resumeW(){if(!W||!W.paused)return;const ph=W.paused.phase;W.paused=null;logEv('session_resumed',{phase:ph,at:W.i});
 if(ph==='run')return goSet();if(ph==='rest'){W.phase='rest';return endRest()}render();sayPhase()}
function persist(){try{if(W)lsSet(KW,W);else localStorage.removeItem(KW);
 if(B&&S.screen==='baseline')lsSet(KB,B);else localStorage.removeItem(KB);
 if(CI&&!CI.complete&&CI.key===todayKey())lsSet(KC,CI);else localStorage.removeItem(KC)}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){
  if(W&&S.screen==='session')pauseW('background');
  else if(B&&S.screen==='baseline'&&B.phase==='run'&&!B.paused)pauseTest(true);persist()}
 else wake()});
window.addEventListener('pagehide',persist);
/* restore after reload */
(function restore(){const w=lsGet(KW),b=lsGet(KB),c=lsGet(KC);
 if(w&&w.rx&&w.rx.length&&E()){W=w;if(!W.paused)W.paused={phase:W.phase,why:'reload',at:nowISO()};S.screen='session';logEv('session_restored',{phase:W.paused.phase,at:W.i})}
 else if(b&&b.tests){B=b;S.screen='baseline';logEv('baseline_restored',{phase:B.phase,test:B.i});
  if(B.phase==='run'){B.phase='intro'}else if(B.phase==='rest'){B.phase='rest';B.i=Math.min(B.i+1,B.tests.length-1);B.phase='intro'}
  setTimeout(()=>{if(!B)return;if(B.phase==='intro')introTest();else listen(()=>{})},0)}
 if(c&&c.key===todayKey()&&!c.complete){CI=c;S.ciOpen=true}
 save()})();

/* ---------- 3. Wake lock + audio unlock ---------- */
let WL=null;
async function wake(){const want=document.visibilityState==='visible'&&(['session','baseline','breath'].includes(S.screen))&&!(W&&W.paused);
 try{if(want&&!WL&&navigator.wakeLock){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}
  else if(!want&&WL){const l=WL;WL=null;await l.release()}}catch(e){WL=null}}
document.addEventListener('pointerdown',function unlock(){document.removeEventListener('pointerdown',unlock,true);
 try{if('speechSynthesis' in window){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}}catch(e){}
 try{const A=window.AudioContext||window.webkitAudioContext;if(A){const a=new A();a.resume&&a.resume();const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0);window._fcAudio=a}}catch(e){}},true);

/* ---------- 4. Install on iPhone ---------- */
const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
SC.install=()=>`<h1>Add FitcoachAI to your Home Screen</h1><p>It opens full screen like an app and works offline after the first visit.</p>
 ${isStandalone()?'<div class="card"><b>✓ Already installed.</b> You\'re using the Home Screen app.</div>':''}
 <div class="card"><b>On iPhone (Safari)</b><ol><li>Tap the <b>Share</b> button <span aria-hidden="true">⬆︎</span> at the bottom of Safari.</li><li>Scroll and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol>
 <p class="sm mut">Using Chrome or another app on iPhone? Open this page in Safari first.</p></div>
 <div class="card"><b>On Android (Chrome)</b><p class="sm">Menu ⋮ → <b>Install app</b> or <b>Add to Home screen</b>.</p></div>
 <p class="sm mut">Your data stays on this device. Installing from Safari starts a separate copy of the app storage — use <b>Settings → Export</b> then <b>Restore</b> to move it.</p>
 <button class="btn" id="installDone" onclick="lsSet(KA,1);S.hist=[];go(E()?'today':'s1',false)">Got it</button>`;
{const _t=SC.today;SC.today=()=>{let h=_t();if(isIOS&&!isStandalone()&&!lsGet(KA))h+=`<div class="card" id="a2hsCard"><b>Use it like an app</b><p class="sm">Add FitcoachAI to your Home Screen for full screen and offline use.</p><div class="row"><button class="btn sec" id="a2hsShow" onclick="go('install')">Show me how</button><button class="btn sec" onclick="lsSet(KA,1);render()">Not now</button></div></div>`;return h}}

/* ---------- 5. Backup export / restore ---------- */
exportLog=function(){const data={app:'FitcoachAI',appVersion:APPVER,schemaVersion:SCHEMA,exportedAtUTC:new Date().toISOString(),simulatedDayOffset:simOffset(),state:S,events:lsGet(KL)||[]};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fitcoachai-backup.json';document.body.appendChild(a);a.click();a.remove();logEv('log_exported',{schemaVersion:SCHEMA})};
function validateBackup(o){if(!o||typeof o!=='object'||Array.isArray(o))return 'This file is not a FitcoachAI backup.';
 if(o.app&&o.app!=='FitcoachAI')return 'This backup is from a different app.';
 if(o.schemaVersion!=null&&(typeof o.schemaVersion!=='number'||o.schemaVersion>SCHEMA))return 'This backup is from a newer version. Update the app first.';
 const s=o.state;if(!s||typeof s!=='object'||!s.p||typeof s.p!=='object')return 'The backup is missing your profile.';
 if(typeof s.screen!=='string')return 'The backup is missing the app screen.';
 if(s.p.hs!=null&&typeof s.p.hs!=='object')return 'The health check in the backup is damaged.';
 if(s.p.sessions!=null&&!Array.isArray(s.p.sessions))return 'The workout history in the backup is damaged.';
 if(o.events!=null&&!Array.isArray(o.events))return 'The event log in the backup is damaged.';
 if(typeof s.p.disclaimerAccepted!=='boolean')return 'The backup is missing the safety acknowledgement.';return null}
function importBackupText(txt,skipConfirm){let o;try{o=JSON.parse(txt)}catch(e){return {ok:false,error:'This file is not valid JSON.'}}
 const err=validateBackup(o);if(err){logEv('backup_import_rejected',{error:err});return {ok:false,error:err}}
 if(!skipConfirm&&!confirm('Replace the data on this device with this backup?'))return {ok:false,error:'cancelled'};
 const st=migrateState(JSON.parse(JSON.stringify(o.state)));delete st._justMigrated;st.schemaVersion=SCHEMA;
 if(['session','breath','baseline'].includes(st.screen))st.screen=st.p.eng?'today':'s14';
 stopAllMedia();W=null;B=null;CI=null;[KW,KB,KC].forEach(k=>localStorage.removeItem(k));
 lsSet(KP,st);lsSet(KL,(o.events||[]).concat([{type:'backup_imported',atUTC:new Date().toISOString(),timeZoneID:TZ,data:{fromSchema:o.schemaVersion||1,exportedAtUTC:o.exportedAtUTC||null}}]));
 return {ok:true}}
function pickBackup(){const i=document.getElementById('restoreFile');if(i)i.click()}
function onBackupFile(inp){const f=inp.files&&inp.files[0];if(!f)return;if(f.size>5e6){toast('That file is too big to be a backup.');return}
 f.text().then(t=>{const r=importBackupText(t);inp.value='';if(r.ok){location.reload()}else if(r.error!=='cancelled')toast(r.error)})}
{const _s=SC.settings;SC.settings=()=>_s().replace('<button class="btn red" onclick="resetAll()"',
 `<button class="btn sec" id="restoreBtn" onclick="pickBackup()">Restore from a backup</button><input type="file" id="restoreFile" accept="application/json,.json" hidden onchange="onBackupFile(this)"><button class="btn red" onclick="resetAll()"`)
 +`<div class="card"><h2>Install</h2><button class="btn sec" id="installBtn" onclick="go('install')">${isStandalone()?'Installed ✓ — how it works':'Add to Home Screen'}</button></div>`}

/* ---------- 6. Service worker + update prompt ---------- */
function updateBanner(reg){if(document.getElementById('updBar'))return;const d=document.createElement('div');d.id='updBar';d.setAttribute('role','status');
 d.innerHTML='<span>A new version is ready.</span><button id="updBtn">Update</button>';document.body.appendChild(d);
 d.querySelector('button').onclick=()=>{if(W||(B&&S.screen==='baseline')){toast('Finish or stop your workout first.');return}window._fcReload=true;if(reg.waiting)reg.waiting.postMessage('skipWaiting');else location.reload()}}
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(window._fcReload)location.reload()});
 window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(reg=>{window._fcReg=reg;
  if(reg.waiting&&navigator.serviceWorker.controller)updateBanner(reg);
  reg.addEventListener('updatefound',()=>{const n=reg.installing;n&&n.addEventListener('statechange',()=>{if(n.state==='installed'&&navigator.serviceWorker.controller)updateBanner(reg)})});
  setInterval(()=>reg.update().catch(()=>{}),36e5)}).catch(()=>{})})}

/* ---------- 7. iPhone CSS: safe areas, 16px inputs ---------- */
(function(){const st=document.createElement('style');st.textContent=`html{-webkit-text-size-adjust:100%}
body{padding-top:env(safe-area-inset-top);padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
input,select,textarea{font-size:16px!important}
#cap{pointer-events:none;padding-bottom:calc(10px + env(safe-area-inset-bottom))}#toast{top:calc(70px + env(safe-area-inset-top))}
#updBar{position:fixed;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top));z-index:40;background:#24304a;border:1px solid var(--line);border-radius:14px;padding:10px 14px;display:flex;gap:10px;align-items:center;justify-content:space-between;font-size:15px}
#updBar button{background:var(--acc);color:#04210f;border:0;border-radius:10px;padding:10px 14px;font-weight:700;min-height:44px}
body,button{-webkit-tap-highlight-color:transparent}`;document.head.appendChild(st)})();

/* keep a voice "stop" listener armed on every active-exercise screen (some phases had none) */
function armStop(){setTimeout(()=>{const act=(W&&S.screen==='session'&&!W.paused)||(B&&S.screen==='baseline'&&!['stopped','painStop'].includes(B.phase));if(act&&!recHandler)listen(()=>{})},0)}
window.addEventListener('fc-render',()=>{persist();wake();armStop()});
render();

/* ---------- 8. v0.5.1: keep CTAs clear of Safari's floating bottom toolbar (iOS 26) ---------- */
(function(){const st=document.createElement('style');st.textContent=`
#phone{min-height:100vh;min-height:100svh}
@supports(height:100dvh){@media(max-width:499px){#phone{min-height:100dvh}}}
#app{padding-bottom:calc(110px + env(safe-area-inset-bottom))!important;scroll-padding-bottom:calc(110px + env(safe-area-inset-bottom))}
body.hasnav #app{padding-bottom:calc(170px + env(safe-area-inset-bottom))!important}
html.iosweb #app{padding-bottom:calc(140px + env(safe-area-inset-bottom))!important}
html.iosweb body.hasnav #app{padding-bottom:calc(200px + env(safe-area-inset-bottom))!important}
html.iosweb #botnav{padding-bottom:calc(6px + env(safe-area-inset-bottom) + 58px)}
html.iosweb #cap{padding-bottom:calc(10px + env(safe-area-inset-bottom) + 58px)}
#toast,#cap,.fxhint{pointer-events:none}
`;document.head.appendChild(st);
if(isIOS&&!isStandalone())document.documentElement.classList.add('iosweb');})();
