/* FitcoachAI prototype — post-onboarding app: Today, session player, calibration, learned, decisions, settings,
   reminders, simulated Apple Health, dev day simulation. Classic script; shares globals with index.html. */
const CA=FC_CONFIG.APPROVED,CX=FC_CONFIG.RESEARCH_NEEDED,DAYMS=864e5;
const DEV={on:/[?&]dev=1/.test(location.search)||!!lsGet('fcai_proto_dev'),fast:!!lsGet('fcai_proto_fast')};
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const todayKey=()=>{const d=new Date(appNow());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmtDay=iso=>new Date(iso).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
/* defaults; js/v07.js replaces these */
function planMode(){return 'full'}
function modToday(){return {skip:[],swap:{},short:false}}
const ctxG=t=>({gentle:gentleMode(),triage:t||'full',easeStep:CX.easeStep});
const KIND=p=>p==='cardio'?'time':p==='balance'?'hold':p==='core'?'hold':'reps';
function kindFor(pat,lvl){if(pat==='core'&&lvl===0&&!P().movementNeeds.includes('seated'))return 'reps';return KIND(pat)}
function nameFor(pat,lvl){const p=P();if(p.movementNeeds.includes('seated'))return SEATED[pat];let ex=LADDER[pat][Math.min(lvl,3)];
 const noFloor=p.movementNeeds.includes('floorHard')||!p.availableItems.includes('floor');
 if(noFloor&&pat==='hinge')ex=LADDER.hinge[0]+(lvl?` (slower, level ${lvl+1})`:'');
 if(noFloor&&pat==='core'&&lvl>=2)ex=LADDER.core[1]+' (longer hold)';
 if(p.postpartumMode&&pat==='core'&&lvl===0&&noFloor)ex='Seated breathing + gentle belly brace';
 if((p.quietMode||gentleMode()||p.postpartumMode)&&ex==='Step-backs + march')ex=LADDER.cardio[2];return ex}
function doseText(rx){const u=rx.kind==='hold'?' s hold':rx.kind==='time'?' min':' reps';
 return `${rx.sets} set${rx.sets>1?'s':''} · target ${rx.target}${u} (range ${rx.lo}–${rx.hi})`}
const E=()=>P().eng;
function pushDecisions(D){D.forEach(d=>logEv('decision',d))}

/* ---------- start plan from onboarding results ---------- */
function startPlan(){const p=P(),pats={};
 PATTERNS.forEach(pat=>{const R=p.patternReadiness[pat]||{level:'notAssessed',why:[]};let i=LADDER[pat].indexOf(exFor(pat));
  if(i<0)i=R.result&&!R.result.skippedByUser?Math.min(3,(R.result.lvl||0)+(R.stepUp?1:0)):0;
  const injury=(R.why||[]).some(w=>/your |surgeon|area/i.test(w))||!!(R.result&&R.result.pain);
  pats[pat]={status:R.level||'notAssessed',lvl:i,kind:kindFor(pat,i),injury,healthHold:R.level==='notReady'&&!injury,baseline:!!R.result}});
 p.eng=ENG.init({nowISO:nowISO(),gentle:gentleMode(),patterns:pats});p.plan=p.plan||buildPlan();p.sessions=p.sessions||[];p.touch=p.touch||{};
 p.rem=p.rem||{lastNudgeKey:null};p.hk=p.hk||{connected:p.healthKitChoice==='connect'};p.planStartedAt=nowISO();
 logEv('plan_started',{patterns:pats,config:FC_CONFIG});S.hist=[];go('today',false)}
const _results=SC.results;
SC.results=()=>(P().eng?`<button class="btn" id="goToday" onclick="S.hist=[];go('today',false)">Go to Today</button>`:`<button class="btn" id="startPlan" onclick="startPlan()">Start my plan</button>`)+_results();

/* ---------- wrappers around onboarding functions ---------- */
const _computeSafety=computeSafety;
computeSafety=function(){_computeSafety();const p=P();
 if(p.safetyMode==='conservative'&&p.doctorClearanceSelfReportedAt&&p.hs.answeredAt&&p.doctorClearanceSelfReportedAt>=p.hs.answeredAt&&!p.postpartumMode){p.safetyMode='standard';p.safetyModeClearedBy='doctorSelfReport'}};
const _removeArea=removeArea,_mapTap=mapTap,_saveArea=saveArea;
function markResolving(r){const a=P().bodyAreas.find(x=>x.region===r);a.status='resolving';a.updatedAt=nowISO();a.history=(a.history||[]).concat({at:a.updatedAt,status:'resolving'});
 const D=[];PATTERNS.forEach(pat=>{if((REGION_LOAD[r]||[]).includes(pat))D.push({code:'NO_INSTANT_CLEARANCE',pattern:pat,msg:ENG.MSG.NO_INSTANT_CLEARANCE,at:nowISO(),session:E().sessionCount})});
 E().decisions=E().decisions.concat(D);pushDecisions(D);logEv('body_area_resolving',{region:r});save();render();toast(`${REGIONS[r]}: marked as getting better. Stays protected for now.`)}
removeArea=function(){if(!E())return _removeArea();const r=draftArea.region;draftArea=null;closeSheet();markResolving(r)};
mapTap=function(r){if(!E())return _mapTap(r);const a=P().bodyAreas.find(x=>x.region===r);if(a&&a.status!=='resolving')return markResolving(r);openRegion(r)};
saveArea=function(){_saveArea();if(E())tightenFromProfile()};
function tightenFromProfile(){computeReadiness();const R=P().patternReadiness||{},want={};PATTERNS.forEach(p=>want[p]=R[p]&&R[p].level);
 const res=ENG.tighten(E(),want,nowISO());P().eng=res.eng;pushDecisions(res.decisions);save()}
hkConnect=function(){P().healthKitChoice='connect';P().healthKitRequestedAt=nowISO();P().hk={connected:true,simulated:true};logEv('healthkit_simulated_connect');toast('Simulated Apple Health connected (demo data, read-only).');next()};
remind=function(l){P().rem=P().rem||{};P().rem.pausedReminder={label:l,at:nowISO()};logEv('reminder_requested',{label:l,reason:S.stopReason});toast('Saved. This prototype shows it in-app; real notifications need the iPhone app.')};
const _back=back;back=function(){if(W)return;_back()};
const _resetAll=resetAll;resetAll=function(){localStorage.removeItem(CLK);W=null;_resetAll()};

/* ---------- navigation chrome ---------- */
const MAIN=['today','learned','decisions','settings','health','sessionDone','breath','reminders','checkin'];
const ROOTS=['today','learned','settings'];const TABOF={decisions:'learned',health:'settings',reminders:'settings',checkin:'today',breath:'today',sessionDone:'today'};
const _r=_render;
_render=function(){_r();let nav=document.getElementById('botnav');
 if(MAIN.includes(S.screen)&&E()){const t=[['today','Today','🏠'],['learned','Progress','📈'],['settings','Settings','⚙️']],on=TABOF[S.screen]||S.screen;
  if(!nav){nav=document.createElement('nav');nav.id='botnav';nav.setAttribute('aria-label','Main');document.body.appendChild(nav)}
  nav.innerHTML=t.map(([k,l,i])=>`<button class="tab ${on===k?'on':''}" id="tab-${k}" ${on===k?'aria-current="page"':''} onclick="S.hist=[];go('${k}',false)"><span aria-hidden="true">${i}</span>${l}</button>`).join('');document.body.classList.add('hasnav');
  document.getElementById('top').innerHTML=!ROOTS.includes(S.screen)&&S.hist.length?'<button class="back" id="backBtn" onclick="back()" aria-label="Back">‹ Back</button>':''}
 else{if(nav)nav.remove();document.body.classList.remove('hasnav')}
 if(S.screen==='session'&&W&&W.cap){const c=document.getElementById('cap');c.style.display='block'}};
(function(){const st=document.createElement('style');st.textContent=`#top{position:sticky;top:0;z-index:5;background:#05060acc;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding-top:6px;padding-bottom:6px}#app.enter{animation:fcfade .18s ease-out}#app{padding-bottom:calc(24px + env(safe-area-inset-bottom))}@keyframes fcfade{from{opacity:.4;transform:translateY(4px)}to{opacity:1;transform:none}}.card{margin-bottom:12px}.card h2{margin-top:0}button{touch-action:manipulation;transition:transform .08s ease,background .15s ease,border-color .15s ease}button:active{transform:scale(.97)}button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}h1{letter-spacing:-.01em}@media (prefers-reduced-motion:reduce){#app.enter{animation:none}button{transition:none}}#top:empty{display:none}#botnav{position:fixed;left:0;right:0;bottom:0;z-index:6;display:flex;gap:4px;justify-content:center;background:#0b0d12f2;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--line);padding:6px 10px calc(6px + env(safe-area-inset-bottom))}#botnav .tab{flex:1;max-width:160px;background:none;border:0;color:var(--mut);display:flex;flex-direction:column;align-items:center;gap:2px;font-size:12px;min-height:48px;border-radius:12px}#botnav .tab span{font-size:20px}#botnav .tab.on{color:var(--acc);background:#5ee6a814}body.hasnav #app{padding-bottom:calc(96px + env(safe-area-inset-bottom))}.btn.xl{font-size:20px;min-height:64px}.sess h1{font-size:30px;line-height:1.2}.cue{color:var(--acc);text-align:center;font-size:17px}.week{display:flex;gap:6px;margin:8px 0}.week i{flex:1;height:10px;border-radius:5px;background:var(--card2)}.week i.on{background:var(--acc)}details.more{margin:12px 0}details.more>summary{cursor:pointer;color:var(--acc);padding:10px 0;min-height:44px}.chg{padding:8px 0;border-bottom:1px solid var(--line)}
.bar{height:10px;background:var(--card2);border-radius:6px;overflow:hidden;margin:6px 0}.bar>i{display:block;height:100%;background:var(--acc)}
.dec{border-left:3px solid var(--line);padding:6px 10px;margin:8px 0}.code{font-family:ui-monospace,monospace;font-size:12px;background:#262b38;padding:2px 6px;border-radius:6px}
.sim{background:#2b2140;color:#e0ccff;border-radius:10px;padding:6px 10px;font-size:13px;margin:6px 0}.flag{color:var(--warn);font-size:12px}
table.hk{width:100%;border-collapse:collapse;font-size:14px}table.hk td,table.hk th{border-bottom:1px solid var(--line);padding:6px;text-align:left}`;document.head.appendChild(st)})();

/* ---------- plan day logic ---------- */
function calib(){return ENG.calibration(E(),nowISO())}
function todaySlot(){const p=P(),pl=p.plan,c=calib(),wk=pl.weeks[Math.floor(c.elapsed/7)%2],wd=WD[new Date(appNow()).getDay()];
 if(pl.variable)return {slot:wk[c.elapsed%wk.length],fixed:false};const s=wk.find(x=>x.day===wd);return {slot:s||null,fixed:true}}
function sessionPatterns(slot){const ok=x=>E().patterns[x]&&E().patterns[x].status!=='notReady';
 const base=[...new Set((slot.ex||[]).map(x=>x.pattern).filter(x=>x!=='none'))];
 const strength=['squat','push','hinge','core'];
 if(/Full body|Strength/.test(slot.type))strength.forEach(x=>{if(!base.includes(x))base.push(x)});
 return PATTERNS.filter(x=>base.includes(x)&&ok(x))}
const doneToday=()=>(P().sessions||[]).find(s=>s.dateKey===todayKey()&&!s.stopped);
function healthDue(){const a=P().hs.answeredAt;return !a||appNow()-Date.parse(a)>CA.rescreenDays*DAYMS}
/* Simulated Apple Health: deterministic per date; some values deliberately unknown. */
function hkDay(key){let h=0;for(const c of key)h=(h*31+c.charCodeAt(0))>>>0;const unk=n=>(h>>n)%5===0;
 return {steps:unk(1)?null:2000+(h%9000),sleepH:unk(3)?null:Math.round((5+(h%40)/10)*10)/10,workouts:unk(5)?null:(h>>7)%2}}
function prevKey(n){const d=new Date(appNow()-n*DAYMS);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

/* ---------- reminders (capped: at most CA.maxNudgesPerDay per day) ---------- */
function nudgeTime(){const p=P();if(p.nudgeMode==='fixedTime')return p.nudgeTime;const hrs=(p.sessions||[]).map(s=>new Date(s.at).getHours()).sort((a,b)=>a-b);
 return hrs.length>=3?String(hrs[Math.floor(hrs.length/2)]).padStart(2,'0')+':00':CX.learnedNudgeDefault}
function nudgeCopy(){return P().coachingStyle==='direct'?`You said ${P().plan.variable?'a few':P().plan.daysPerWeek} days. Let's get today's done.`:'No problem if today is busy. Want a 10-minute version?'}
function maybeNudge(){const p=P(),r=p.rem=p.rem||{};if(p.nudgeMode==='off'||doneToday())return null;const ts=todaySlot();if(!ts.slot)return null;
 const now=new Date(appNow()),[h,m]=nudgeTime().split(':').map(Number);if(now.getHours()*60+now.getMinutes()<h*60+m)return null;
 const k=todayKey();r.count=r.count||{};if((r.count[k]||0)>=CA.maxNudgesPerDay)return r.shownKey===k?nudgeCopy():null;
 r.count[k]=(r.count[k]||0)+1;r.shownKey=k;logEv('nudge_shown',{key:k,channel:'inApp'});
 try{if(window.Notification&&Notification.permission==='granted')new Notification('FitcoachAI',{body:nudgeCopy()})}catch(e){}
 save();return nudgeCopy()}

/* ---------- weekly goal + streak (definition: RESEARCH NEEDED R16) ---------- */
function weekStart(ms){const d=new Date(ms);d.setHours(0,0,0,0);const wd=(d.getDay()+6)%7;return d.getTime()-wd*DAYMS}
function weekGoal(){const pl=P().plan;return pl.variable?2:pl.daysPerWeek}
function weekStats(){const ss=(P().sessions||[]).filter(s=>!s.stopped),ws=weekStart(appNow());const thisWeek=ss.filter(s=>Date.parse(s.at)>=ws).length;
 let streak=0,w=ws;if(thisWeek)streak=1;for(let i=1;i<60;i++){const a=w-i*7*DAYMS,b=a+7*DAYMS;if(ss.some(s=>Date.parse(s.at)>=a&&Date.parse(s.at)<b))streak++;else break}
 return {done:thisWeek,goal:weekGoal(),streak}}
function weekCard(){const w=weekStats();const msg=w.done>=w.goal?'Weekly goal reached. Anything extra is a bonus.':w.done?`${w.goal-w.done} more to reach this week's goal — no rush.`:'A fresh week. One short workout gets it going.';
 return `<div class="card" id="weekCard"><b>This week: ${w.done} of ${w.goal} workout${w.goal>1?'s':''}</b><div class="week">${Array.from({length:Math.max(w.goal,w.done)},(_,i)=>`<i class="${i<w.done?'on':''}"></i>`).join('')}</div><p class="sm mut">${msg}${w.streak>1?` · ${w.streak} active weeks in a row 🔥`:''} <span class="flag">(streak rule: placeholder)</span></p></div>`}
function nextWorkoutText(){const pl=P().plan;if(pl.variable)return 'Next: whenever suits you this week.';for(let i=1;i<=7;i++){const d=new Date(appNow()+i*DAYMS),wd=WD[d.getDay()],wk=pl.weeks[Math.floor((calib().elapsed+i)/7)%2],s=wk.find(x=>x.day===wd);if(s)return `Next workout: ${i===1?'tomorrow':wd} · ${s.type}.`}return ''}
function plainChanges(D){D=D.filter(d=>d.code!=='RETAIN');if(!D.length)return '<p class="sm">Nothing changed — same plan next time. Steady is good.</p>';
 return D.map(d=>`<div class="chg">${d.pattern?`<b>${PSHORT[d.pattern]||d.pattern}:</b> `:''}${esc(d.msg)}</div>`).join('')}

/* ---------- TODAY ---------- */
let CI=null; // draft check-in
SC.today=()=>{const p=P();if(!E())return `<h1>Today</h1><p>Finish the check-in first.</p><button class="btn" onclick="go('results')">See results</button>`;
 const c=calib(),ts=todaySlot(),done=doneToday(),sim=simOffset(),nudge=maybeNudge();
 let h=`<h1>Today <span class="mut sm">${fmtDay(nowISO())}</span></h1>`;
 if(sim)h+=`<div class="sim" id="simBadge">Simulated date: +${sim} day${sim>1?'s':''} (dev)</div>`;
 if(gentleMode())h+=`<p><span class="pill p-gentle">Gentle mode</span> <span class="sm mut">Easier versions and longer rests, to start safely.</span></p>`;
 const extras=()=>{let x='';if(healthDue())x+=`<div class="card" id="rescreen"><b>Time for your 90-day health check.</b><p class="sm">Answers change. It takes a minute.</p><button class="btn sec" onclick="S.returnTo='settings';go('s7')">Re-check now</button></div>`;
  if(nudge)x+=`<div class="card" id="nudge">🔔 ${esc(nudge)}</div>`;
  x+=weekCard();
  x+=typeof calibCard==='function'?calibCard(c):'';return x};
 if(done){const sc=done.score||{};h+=`<div class="card" id="doneCard"><h2>Done for today ✓</h2><p>Nice work showing up.</p>${sc.score!=null?`<p class="sm">Workout score <b id="score">${sc.score}</b>/100 · <span class="mut">${esc(sc.why)}</span></p>`:''}
  <p class="sm mut">${esc(nextWorkoutText())}</p><button class="btn sec" onclick="S.lastSession='${done.id}';go('sessionDone')">What changed and why</button></div>`;
  h+=touchCard(true);return h+extras()+devBox()}
 if(!ts.slot){h+=`<div class="card" id="restDay"><h2>Rest day 🌿</h2><p>Recovery is part of the plan. A one-minute check-in keeps the habit going.</p></div>`+(S.anyway?'':touchCard(false)+`<button class="btn sec" id="trainAnyway" onclick="S.anyway=true;render()">Train today anyway</button>`);if(!S.anyway)return h+extras()+devBox()}
 const slot=ts.slot||P().plan.weeks[0][0],pats=sessionPatterns(slot),mins=slot.warmup+slot.main+slot.cooldown;
 h+=`<div class="card" id="todayWorkout"><h2>${esc(slot.type)}</h2><p class="sm mut">About ${mins} min · ${pats.length||1} exercise${pats.length===1?'':'s'} · warm-up and cool-down included</p><ul>${pats.map(x=>{const rx=ENG.prescribe(E(),x,ctxG(planMode())),m=modToday();if(m.skip.includes(x))return `<li class="mut"><s>${esc(nameFor(x,rx.lvl))}</s> <span class="sm">skipped today</span></li>`;return `<li><b>${esc(m.swap[x]||nameFor(x,rx.lvl))}</b> <span class="sm mut">${doseText(rx)}</span></li>`}).join('')||'<li>Gentle walk or easy movement you enjoy (5–10 min)</li>'}</ul>
 <p class="sm" id="whyLine"><b>Why:</b> ${esc(slot.why)}</p></div>`;
 const tri=triage();
 if(!(CI&&CI.complete)&&!S.ciOpen){h+=`${safe('STOP')}<button class="btn xl" id="quickStart" onclick="quickStart()">I feel good — start workout</button><button class="btn sec" id="somethingOff" onclick="S.ciOpen=true;render()">Not 100% today? Quick check-in first</button>`;return h+extras()+devBox()}
 h+=checkinForm();
 if(CI&&CI.complete){h+=`<div class="card" id="triage">${tri.short?`<b>Shorter version suggested</b> — ${esc(tri.reasons.join(', '))}. 1 set each. Showing up still counts. <span class="flag">(triage rule: placeholder)</span>`:'<b>Full version — you\'re good to go.</b>'}
  ${tri.skip.length?`<p>Left out today because of pain: <b>${tri.skip.map(x=>PSHORT[x]).join(', ')}</b>.</p>${safe('PAIN')}`:''}
  ${tri.hkHint?`<p class="sm mut">Simulated Apple Health: ${tri.hkHint}</p>`:''}</div>
  ${safe('STOP')}<button class="btn xl" id="startSession" onclick="startSession(${tri.short?"'short'":"'full'"})">Start ${tri.short?'short ':''}workout</button>
  ${tri.short?`<button class="btn sec" id="startFull" onclick="startSession('full')">I'd rather do the full version</button>`:`<button class="btn sec" id="startShort" onclick="startSession('short')">Do the 10-minute version</button>`}`}
 return h+extras()+devBox()};
function quickStart(){CI={key:todayKey(),...CX.quickCheckin,regions:[],quick:true};CI.complete=true;logEv('checkin',{...CI});P().checkins=P().checkins||{};P().checkins[CI.key]={...CI};save();startSession('full')}
function checkinForm(){CI=CI&&CI.key===todayKey()?CI:{key:todayKey()};const q=(k,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="chip ${CI[k]===v?'on':''}" data-ci="${k}" data-v="${v}" onclick="ciSet('${k}','${v}')">${l}</button>`).join('')}</div>`;
 return `<div class="card" id="checkin"><h2>Quick check-in</h2><p class="sm mut">4 taps. Helps me pick the right workout today.</p>
 <p class="sm">Sleep last night</p>${q('sleep',[['good','Good'],['ok','Okay'],['poor','Poor']])}
 <p class="sm">Energy</p>${q('energy',[['high','Good'],['ok','Okay'],['low','Low']])}
 <p class="sm">Muscle soreness</p>${q('soreness',[['none','None'],['some','Some'],['lot','A lot']])}
 <p class="sm">Any pain right now? <span class="mut">(not normal muscle soreness)</span></p>${q('pain',[['no','No'],['yes','Yes']])}
 ${CI.pain==='yes'?`<p class="sm">Where? <span class="mut">(pick any)</span></p><div class="chips">${Object.keys(REGIONS).map(r=>`<button class="chip ${(CI.regions||[]).includes(r)?'on':''}" data-cir="${r}" onclick="ciRegion('${r}')">${REGIONS[r]}</button>`).join('')}</div>`:''}</div>`}
function ciSet(k,v){CI[k]=v;if(k==='pain'&&v==='no')CI.regions=[];CI.complete=['sleep','energy','soreness','pain'].every(x=>CI[x])&&(CI.pain==='no'||(CI.regions||[]).length>0);
 if(CI.complete){logEv('checkin',{...CI});P().checkins=P().checkins||{};P().checkins[CI.key]={...CI}}save();render()}
function ciRegion(r){CI.regions=CI.regions||[];CI.regions=CI.regions.includes(r)?CI.regions.filter(x=>x!==r):CI.regions.concat(r);ciSet('pain','yes')}
function triage(){const t={short:false,reasons:[],skip:[],hkHint:null};if(!CI||!CI.complete)return t;const T=CX.triageShortIf;
 if(T.sleep.includes(CI.sleep))t.reasons.push('poor sleep');if(T.energy.includes(CI.energy))t.reasons.push('low energy');if(T.soreness.includes(CI.soreness))t.reasons.push('very sore');
 if(P().hk&&P().hk.connected){const d=hkDay(prevKey(0));t.hkHint=d.sleepH==null?'sleep unknown — not used.':d.sleepH<CX.hkShortSleepHours?`about ${d.sleepH} h sleep — a lighter day might feel better (just a hint).`:`about ${d.sleepH} h sleep.`}
 t.short=t.reasons.length>0;
 if(CI.pain==='yes'&&CX.checkinPainSkipsLoadedPatterns)t.skip=[...new Set((CI.regions||[]).flatMap(r=>REGION_LOAD[r]||[]))];return t}

/* ---------- rest-day touchpoint ---------- */
function touchCard(done){const t=(P().touch||{})[todayKey()];if(done)return '';
 return `<div class="card" id="touch"><b>Daily touchpoint</b> <span class="sm mut">(about a minute)</span>${t?`<p id="touchDone">✓ Done today: ${esc(t.kind)}</p>`:`<p class="sm">A quick check-in or a 1-minute breathing drill keeps the habit going and helps calibration.</p>
 <button class="btn sec" id="breathBtn" onclick="go('breath')">1-minute breathing drill</button><button class="btn sec" id="quickCi" onclick="go('checkin')">Quick check-in only</button>`}</div>`}
function markTouch(kind,extra){P().touch=P().touch||{};P().touch[todayKey()]={kind,at:nowISO(),...(extra||{})};logEv('touchpoint_done',{kind,...(extra||{})});save()}
let BR=null;
SC.breath=()=>`<h1>Breathing drill</h1><p>Breathe in for 4, out for 6. Stop any time.</p><div class="big" id="brT">${BR?BR.left:60}</div><p class="mut" id="brCue">${BR?BR.cue:'Ready when you are.'}</p>
${BR?`<button class="btn sec" id="brStop" onclick="endBreath(false)">Stop</button>`:`<button class="btn" id="brStart" onclick="startBreath()">Start</button><button class="btn sec" onclick="go('today',false)">Back</button>`}`;
function startBreath(){const dur=DEV.fast?3:60,t0=Date.now();BR={left:dur,cue:'Breathe in…'};speak('Breathe in for four. Out for six.');render();
 BR.i=setInterval(()=>{const el=(Date.now()-t0)/1000;BR.left=Math.max(0,Math.ceil(dur-el));BR.cue=(el%10)<4?'Breathe in…':'Breathe out…';const a=document.getElementById('brT'),b=document.getElementById('brCue');if(a)a.textContent=BR.left;if(b)b.textContent=BR.cue;if(BR.left<=0)endBreath(true)},250)}
function endBreath(full){if(BR)clearInterval(BR.i);BR=null;stopAllMedia();markTouch('breathing drill',{completed:full});go('today',false);toast(full?'Nice. That counts for today.':'Stopped — that still counts.')}
SC.checkin=()=>{const tri=CI&&CI.complete;return `<h1>Quick check-in</h1>${checkinForm()}${tri?`<button class="btn" id="ciSave" onclick="markTouch('check-in',{checkin:CI});go('today',false)">Save</button>`:''}<button class="btn sec" onclick="go('today',false)">Back</button>`};

/* ---------- SESSION PLAYER ---------- */
let W=null;
function startSession(triageMode){const mt=modToday();if(mt.short)triageMode='short';else if(triageMode==='full')triageMode=planMode();const tri=triage(),ts=todaySlot(),slot=ts.slot||P().plan.weeks[0][0];
 const rx=sessionPatterns(slot).map(x=>{const r=ENG.prescribe(E(),x,ctxG(triageMode));const sw=mt.swap[x];return {...r,name:sw||nameFor(x,r.lvl),...(sw?{swapped:true}:{}),skipToday:tri.skip.includes(x),modSkip:mt.skip.includes(x)}});
 // check-in pain: tighten (no instant clearance later)
 let pre=[];if(CI&&CI.pain==='yes'&&CX.checkinPainMarksPatternNotReady){const want={};tri.skip.forEach(x=>want[x]='notReady');const res=ENG.tighten(E(),want,nowISO());P().eng=res.eng;pre=res.decisions;pushDecisions(pre)}
 W={triage:triageMode,slotType:slot.type,planned:slot.warmup+slot.main+slot.cooldown,rx,i:0,set:0,phase:'intro',sets:[],results:[],startedAt:nowISO(),t0:Date.now(),pre,checkin:CI?{...CI}:null,painPatterns:tri.skip};
 rx.forEach(r=>{if(r.skipToday)W.results.push({pattern:r.pattern,lvl:r.lvl,sets:[],skipped:true,reason:'checkinPain'});else if(r.modSkip)W.results.push({pattern:r.pattern,lvl:r.lvl,sets:[],skipped:true,reason:'modified'})});
 W.rx=rx.filter(r=>!r.skipToday&&!r.modSkip);
 logEv('session_started',{triage:triageMode,prescriptionSnapshot:rx,checkin:W.checkin,config:FC_CONFIG.RESEARCH_NEEDED});
 if(!W.rx.length)return finishSession(false);go('session');sayPhase()}
const cur=()=>W.rx[W.i];
function unit(r){return r.kind==='hold'?'seconds':r.kind==='time'?'minutes':'reps'}
SC.session=()=>{if(!W)return `<p>No session running.</p><button class="btn" onclick="go('today',false)">Back to Today</button>`;const r=cur(),stopB=`<button class="btn red" id="stopSession" onclick="stopSession()">Stop workout</button>`;
 const head=`<div class="bar" aria-hidden="true"><i style="width:${W.i/W.rx.length*100}%"></i></div><p class="sm mut">Exercise ${W.i+1} of ${W.rx.length} · set ${Math.min(W.set+1,r.sets)} of ${r.sets}${W.triage==='short'?' · short version':W.triage==='eased'?' · lighter today':''}${r.swapped?' · swapped':''}</p><h1>${esc(r.name)}</h1>`;
 switch(W.phase){
 case 'intro':return head+`${demoBox(r.name)}<p>${doseText(r)}</p><div class="mmap" data-groups="${PMUS[r.pattern]}" data-color="#22c55e"></div>${safe('PAIN')}<button class="btn xl" id="goSet" onclick="goSet()">Start set</button><button class="btn sec" id="skipEx" onclick="skipEx()">Skip this exercise</button>${stopB}`;
 case 'run':return head+`${demoBox(r.name,true)}<div class="big" id="t">0</div><p class="mut">${r.kind==='reps'?'Count your reps. Tap Done when finished.':r.kind==='hold'?`Hold up to ${r.hi} s. Tap Done when you stop.`:`About ${r.target} min at a pace where you can talk.`}</p><p class="cue">Breathe out as you push. Keep breathing.</p><p class="sm mut" id="heard"></p><button class="btn xl" id="done" onclick="setDone()">Done</button>${stopB}`;
 case 'measure':{const vals=[];const lo=r.kind==='time'?1:Math.max(0,r.lo-4),hi=r.hi+(r.kind==='hold'?10:2),st=r.kind==='hold'?5:1;for(let v=lo;v<=hi;v+=st)vals.push(v);if(W.timed!=null&&!vals.includes(W.timed))vals.push(W.timed);vals.sort((a,b)=>a-b);
  return head+`<h2>How many ${unit(r)}?</h2>${W.timed!=null?`<p class="sm mut">Timer says about ${W.timed}.</p>`:''}<div class="chips">${vals.map(v=>`<button class="chip" data-n="${v}" onclick="logSet(${v})">${v}</button>`).join('')}</div><button class="btn sec" id="lostCount" onclick="logSet(null)">Not sure / lost count</button>`}
 case 'rest':return head+`<h2>Rest</h2><div class="big" id="t">${W.restLeft}</div>${gentleMode()?'<p class="sm mut">Gentle mode: rest can\'t be skipped.</p>':'<button class="btn sec" id="skipRest" onclick="endRest()">Skip rest</button>'}${stopB}`;
 case 'effort':return head+`<h2>How hard was that?</h2><div class="list chips">${[['easy','Easy — could do a lot more'],['okay','Okay — a few more in the tank'],['hard','Hard — little or nothing left']].map(([v,l])=>`<button class="chip" data-effort="${v}" onclick="setEff('${v}')">${l}</button>`).join('')}</div>`;
 case 'pain':return head+`<h2>Any pain during that one?</h2><p class="sm mut">Not normal muscle effort — pain.</p><div class="row"><button class="btn sec" id="painNo" onclick="setPainEx(false)">No</button><button class="btn sec" id="painYes" onclick="setPainEx(true)">Yes</button></div>`;
 case 'sharp':return head+`<h2>Is it sharp, or getting worse?</h2>${safe('PAIN')}<div class="row"><button class="btn sec" id="sharpNo" onclick="painSharp(false)">No</button><button class="btn red" id="sharpYes" onclick="painSharp(true)">Yes</button></div>`;
 }return ''};
function sayPhase(){const r=cur();if(!r)return;unlisten();
 if(W.phase==='intro')speak(`${r.name}. ${doseText(r).replace('·',',')}.`);
 if(W.phase==='run'){speak(r.kind==='reps'?'Go. Say done when finished.':'Go.');listen(t=>{if(has(t,['done','finished']))setDone();else if(has(t,['stop']))stopSession()})}
 if(W.phase==='measure'){speak(`How many ${unit(r)}?`);listen(t=>{const n=parseNum(t);if(n!=null)logSet(n)})}
 if(W.phase==='effort'){speak('Easy, okay, or hard?');listen(t=>{['easy','okay','hard'].forEach(v=>{if(t.includes(v))setEff(v)})})}
 if(W.phase==='pain'){speak('Any pain during that one?');listen(t=>{if(/\bno\b/.test(t))setPainEx(false);else if(/\byes\b/.test(t))setPainEx(true)})}}
function tick(fn){clearInterval(timerI);timerI=setInterval(fn,250)}
function goSet(){const r=cur();W.phase='run';W.ts=Date.now();render();sayPhase();
 const lim=r.kind==='time'?(DEV.fast?3:r.target*60):r.kind==='hold'?(DEV.fast?3:r.hi):(DEV.fast?600:120);
 tick(()=>{const s=Math.floor((Date.now()-W.ts)/1000),el=document.getElementById('t');if(el)el.textContent=r.kind==='time'?Math.floor(s/60)+':'+String(s%60).padStart(2,'0'):s;if(s>=lim)setDone()})}
function setDone(){if(!W||W.phase!=='run')return;clearInterval(timerI);const r=cur(),s=Math.round((Date.now()-W.ts)/1000);
 W.timed=r.kind==='hold'?s:r.kind==='time'?(DEV.fast?r.target:Math.max(1,Math.round(s/60))):null;W.phase='measure';render();sayPhase()}
function logSet(n){if(!W||W.phase!=='measure')return;unlisten();const r=cur();W.sets.push(n);logEv('set_logged',{pattern:r.pattern,lvl:r.lvl,set:W.set+1,value:n,unit:unit(r)});W.set++;W.timed=null;
 if(W.set<r.sets){W.phase='rest';W.restLeft=DEV.fast?1:CX.restSec[gentleMode()?'gentle':'standard'];render();speak('Rest.');const t0=Date.now(),dur=W.restLeft;
  tick(()=>{W.restLeft=Math.max(0,Math.ceil(dur-(Date.now()-t0)/1000));const el=document.getElementById('t');if(el)el.textContent=W.restLeft;if(W.restLeft<=0)endRest()})}
 else{W.phase='effort';render();sayPhase()}}
function endRest(){clearInterval(timerI);if(!W||W.phase!=='rest')return;W.phase='run';W.ts=Date.now();goSet()}
function setEff(v){if(!W||W.phase!=='effort')return;W.effort=v;W.phase='pain';render();sayPhase()}
function setPainEx(y){if(!W||W.phase!=='pain')return;unlisten();if(y){W.phase='sharp';render();speak('Is it sharp, or getting worse?');return}pushResult(false);nextEx()}
function painSharp(sharp){pushResult(true,sharp);if(sharp){logEv('session_pain_stop',{pattern:cur().pattern});return finishSession(true,'sharpPain')}
 toast(`${cur().name}: stopped for today. It leaves your plan until it's been pain-free for a while.`);nextEx()}
function pushResult(pain,sharp){const r=cur();const res={pattern:r.pattern,lvl:r.lvl,kind:r.kind,sets:W.sets.slice(),effort:W.effort||null,pain:!!pain,sharp:!!sharp,...(r.swapped?{swapped:true}:{}),prescription:{...r}};W.results.push(res);logEv('exercise_logged',res);W.sets=[];W.set=0;W.effort=null}
function skipEx(){const r=cur();W.results.push({pattern:r.pattern,lvl:r.lvl,sets:[],skipped:true,reason:'user'});logEv('exercise_skipped',{pattern:r.pattern});nextEx()}
function nextEx(){W.i++;W.set=0;W.sets=[];if(W.i>=W.rx.length)return finishSession(false);W.phase='intro';render();sayPhase()}
function stopSession(){if(!W)return;if(W.sets.length)pushResult(false);logEv('session_stopped_by_user',{at:W.i});finishSession(true,'user')}
function finishSession(stopped,why){stopAllMedia();const p=P(),w=W;W=null;
 const rxAll=w.rx.concat([]);const sc=ENG.score(rxAll,w.results.filter(r=>rxAll.find(x=>x.pattern===r.pattern)),E(),nowISO());
 const res=ENG.applySession(E(),{atISO:nowISO(),triage:w.triage,checkinPain:!!(w.checkin&&w.checkin.pain==='yes'),painPatterns:w.painPatterns,results:w.results},ctxG(w.triage));
 p.eng=res.eng;pushDecisions(res.decisions);
 const rec={id:'s'+(p.sessions.length+1),at:nowISO(),dateKey:todayKey(),type:w.slotType,triage:w.triage,stopped,stopWhy:why||null,prescriptionSnapshot:w.rx,results:w.results,score:sc,
  decisions:w.pre.concat(res.decisions),minutesActual:Math.round((Date.now()-w.t0)/6e4),minutesPlanned:w.planned,checkin:w.checkin};
 p.sessions.push(rec);logEv('session_completed',{id:rec.id,stopped,triage:w.triage,score:sc,decisionCodes:rec.decisions.map(d=>d.code)});S.lastSession=rec.id;CI=null;S.anyway=false;S.ciOpen=false;save();S.hist=[];go('sessionDone',false)}
SC.sessionDone=()=>{const s=(P().sessions||[]).find(x=>x.id===S.lastSession);if(!s)return '<button class="btn" onclick="go(\'today\',false)">Today</button>';const w=weekStats();
 return `<h1>${s.stopped?(s.stopWhy==='sharpPain'?'Stopped — that was the right call.':'Stopped. That\'s okay.'):'Workout done ✓'}</h1>
 ${s.stopWhy==='sharpPain'?safe('PAIN')+safe('STOP'):''}
 <p>${s.stopped?'Listening to your body is part of training. Anything you did still counts.':'Great job. Every workout teaches me more about what suits you.'}</p>
 <div class="card"><b>What changed and why</b>${plainChanges(s.decisions)}</div>
 <div class="card"><b>Workout score: <span id="score">${s.score.score==null?'—':s.score.score}</span>${s.score.score==null?'':'/100'}</b><p class="sm mut">${esc(s.score.why)} It shows how much of today's plan you did, not a fitness grade. <span class="flag">(formula: placeholder)</span></p></div>
 <div class="card"><b>This week: ${w.done} of ${w.goal}</b><div class="week">${Array.from({length:Math.max(w.goal,w.done)},(_,i)=>`<i class="${i<w.done?'on':''}"></i>`).join('')}</div><p class="sm mut">${esc(nextWorkoutText())}</p></div>
 <button class="btn xl" id="backToday" onclick="S.hist=[];go('today',false)">Done</button>`};
function decList(D){if(!D.length)return '<p class="mut">No changes.</p>';return D.map(d=>`<div class="dec"><span class="code">${d.code}</span> ${d.pattern?`<b>${PSHORT[d.pattern]||d.pattern}</b>`:''}<br><span class="sm">${esc(d.msg)}</span><br><span class="sm mut">${fmtDay(d.at)} · session ${d.session}</span></div>`).join('')}

/* ---------- LEARNED ---------- */
const STLAB={ready:'Ready',gentle:'Easing in',notReady:'On hold',notAssessed:'Not tested yet',progressing:'Trying a new step'};
SC.learned=()=>{if(!E())return '<p>Start your plan first.</p>';const c=calib(),now=nowISO(),ss=P().sessions||[];
 const cards=PATTERNS.map(x=>{const ps=E().patterns[x],t=ENG.tier(E(),x,now),n=ps.obs.length;
  return `<div class="card" data-pattern="${x}"><div style="display:flex;justify-content:space-between"><b>${PSHORT[x]}</b><span class="pill p-${ps.status==='progressing'?'ready':ps.status}">${STLAB[ps.status]}</span></div>
  <p class="sm">Can do: <b>${ps.capability==null?'unknown yet':esc(nameFor(x,ps.capability))}</b><br>How it's going: <b>${ENG.tolerance(ps)}</b><br>
  How sure I am: <b data-tier="${t.t}">${t.conf}</b> (${t.label}) · based on ${n} session${n===1?'':'s'}${ps.baseline?' + your check-in':''}</p>
  ${ps.injury&&ps.status!=='ready'?`<p class="sm mut">Protecting a sore area: ${ps.painFree.length} of ${CA.injuryGatePainFreeSessions} pain-free sessions (over at least ${CA.injuryGateMinDays} days) towards the next step.</p>`:''}
  ${ps.healthHold?'<p class="sm mut">Left out because of a health-check answer. Update your health check if things change.</p>':''}</div>`}).join('');
 const full=ss.filter(s=>!s.stopped),avgA=full.length?Math.round(full.reduce((a,s)=>a+s.minutesActual,0)/full.length):null;
 let h=`<h1>Your progress</h1>${weekCard()}<h2>${c.complete?"Here's what I learned":'What I\'ve learned so far'}</h2><p class="sm mut">Day ${c.day} · ${full.length} workouts · ${Object.keys(P().touch||{}).length} rest-day check-ins. ${c.complete?'':'Still getting to know you — treat this as a starting point.'}</p>${cards}
 <div class="card"><b>Your routine</b><p class="sm">Usual workout time: ${full.length>=3?nudgeTime():'unknown yet'}<br>Real session length: ${avgA==null?'unknown yet':(avgA<1?'under 1 min':avgA+' min')} (planned ${P().plan.minutes} min)</p></div>`;
 if(c.floorMet&&avgA!=null&&avgA>=1&&!(typeof DEV!=='undefined'&&DEV.fast)&&avgA<CX.proposeShorterIfActualBelow*P().plan.minutes&&!P().proposalAnswered){const nm=[10,15,20,30].filter(v=>v>=avgA)[0]||10;
  h+=`<div class="card" id="proposal"><b>Suggestion:</b> your sessions run about ${avgA} min. Plan ${nm}-minute sessions instead? Nothing changes unless you say yes. <span class="flag">(threshold: placeholder)</span>
  <div class="row"><button class="btn" onclick="answerProposal(${nm})">Yes, change it</button><button class="btn sec" onclick="answerProposal(null)">Keep as is</button></div></div>`}
 return h+`<details class="more" id="advanced"><summary>Advanced: how your plan has changed</summary><button class="btn sec" id="openDecisions" onclick="go('decisions')">Open the plan change log</button></details>`};
function answerProposal(m){P().proposalAnswered=nowISO();if(m){P().targetMinutes=m;P().plan=buildPlan()}logEv('plan_change_proposal',{accepted:!!m,minutes:m});save();render()}
SC.decisions=()=>{const D=(E()?E().decisions:[]).slice().reverse();return `<h1>Plan changes</h1><p class="sm mut">Every change to your plan and why, newest first. The small code is for testing.</p><div id="decList">${decList(D)}</div>`};

/* ---------- SETTINGS ---------- */
SC.settings=()=>{const p=P(),days=p.hs.answeredAt?Math.floor((appNow()-Date.parse(p.hs.answeredAt))/DAYMS):null;const ed=s=>`S.returnTo='settings';go('${s}')`;
 return `<h1>Settings</h1>
 <div class="card"><h2>Your answers</h2><div class="list chips"><button class="chip" onclick="${ed('s3')}">About you</button><button class="chip" onclick="${ed('s4')}">Main goal</button><button class="chip" onclick="${ed('s5')}">Experience</button><button class="chip" onclick="${ed('s8')}">Work day</button><button class="chip" onclick="${ed('s9')}">Space & quiet mode</button><button class="chip" onclick="${ed('s10')}">Days & minutes</button></div>
 <button class="btn sec" id="rebuild" onclick="P().plan=buildPlan();logEv('plan_rebuilt');save();toast('Plan schedule updated. Your levels stay as they are.')">Rebuild my schedule from these answers</button></div>
 <div class="card"><h2>Body areas</h2><p class="sm">Add a new area, or mark one as better. Marking better doesn't clear it straight away — it stays protected until ${CA.injuryGatePainFreeSessions} pain-free sessions over ${CA.injuryGateMinDays}+ days.</p>
 <p class="sm">${p.bodyAreas.length?p.bodyAreas.map(a=>`${REGIONS[a.region]}${a.status==='resolving'?' (getting better)':''}`).join(' · '):'None'}</p><button class="btn sec" id="editBody" onclick="${ed('s6')}">Edit body map</button></div>
 <div class="card"><h2>Health check</h2><p class="sm">${days==null?'Not answered.':`Last answered ${days} day${days===1?'':'s'} ago.`} We ask again every ${CA.rescreenDays} days.</p>${gentleMode()?`<p class="sm">Gentle mode is on. It turns off only if a new health check is all "No", or a doctor told you you can exercise without limits.</p>
 <label class="sm">Date a doctor said I can exercise without limits: <input type="date" id="docDate" onchange="docClear(this.value)"></label>`:''}
 <button class="btn sec" id="rescreenBtn" onclick="${ed('s7')}">Re-do the health check</button>${safe('STOP')}</div>
 <div class="card"><h2>Coaching</h2><div class="chips"><button class="chip ${p.coachingStyle==='calm'?'on':''}" onclick="P().coachingStyle='calm';save();render()">Calm</button><button class="chip ${p.coachingStyle==='direct'?'on':''}" onclick="P().coachingStyle='direct';save();render()">Direct</button>
 <button class="chip ${p.voiceCoaching?'on':''}" id="voiceTog" onclick="P().voiceCoaching=!P().voiceCoaching;save();render()">Voice coaching</button></div>
 <button class="btn sec" id="remBtn" onclick="go('reminders')">Reminders</button><button class="btn sec" id="hkBtn" onclick="go('health')">Apple Health (simulated)</button></div>
 <div class="card"><h2>Your data</h2><p class="sm">Everything stays on this device.</p><button class="btn sec" id="exportBtn" onclick="exportLog()">Export my data (JSON)</button><details class="more"><summary>Advanced</summary><button class="btn sec" onclick="showLog()">View event log</button><button class="btn sec" onclick="go('decisions')">Plan change log</button></details><button class="btn red" onclick="resetAll()">Reset everything</button></div>
 <p class="sm mut" id="ver" onclick="verTap()">FitcoachAI prototype v${APPVER} · draft · values marked "placeholder" are not decided</p>${DEV.on?devBox():''}`};
function docClear(v){if(!v)return;P().doctorClearanceSelfReportedAt=new Date(v+'T12:00:00').toISOString();logEv('doctor_clearance_self_report',{date:v});computeSafety();save();render();toast(gentleMode()?'Saved. Gentle mode stays on for now.':'Saved. Gentle mode is off.')}
let verN=0;function verTap(){if(++verN>=5){DEV.on=true;lsSet('fcai_proto_dev',1);toast('Developer tools on');render()}}
function exportLog(){const blob=new Blob([JSON.stringify({exportedAtUTC:new Date().toISOString(),simulatedDayOffset:simOffset(),state:S,events:lsGet(KL)||[]},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='fitcoachai-event-log.json';document.body.appendChild(a);a.click();a.remove();logEv('log_exported')}
SC.reminders=()=>{const p=P(),sup='Notification' in window,perm=sup?Notification.permission:'unsupported';
 return `<h1>Reminders</h1>${chips('nudgeMode',[['fixedTime','Around a set time'],['learned','Learn my best time'],['off','No reminders']])}
 ${p.nudgeMode==='fixedTime'?`<input type="time" value="${esc(p.nudgeTime)}" onchange="P().nudgeTime=this.value;save()" aria-label="Reminder time">`:''}
 ${p.nudgeMode==='learned'?`<p class="sm">Current guess: ${nudgeTime()} ${(p.sessions||[]).length<3?'(default until we see a few workouts — placeholder)':''}</p>`:''}
 <p class="sm">At most ${CA.maxNudgesPerDay} reminder a day, only on planned days, never after you've trained. No guilt trips.</p>
 <div class="card"><b>Phone notifications (demo)</b><p class="sm">Status: <span id="notifPerm">${perm}</span></p>
 <p class="sm mut">On iPhone, web notifications only work after "Add to Home Screen" (iOS 16.4+). The real app would use native notifications. In this prototype reminders show inside the app.</p>
 ${sup?`<button class="btn sec" id="notifAsk" onclick="Notification.requestPermission().then(r=>{logEv('notification_permission',{result:r});render()})">Allow notifications</button><button class="btn sec" id="notifTest" onclick="testNotif()">Send a test reminder</button>`:'<p class="sm">Not supported in this browser.</p>'}</div>
 <button class="btn" onclick="go('settings',false)">Done</button>`};
function testNotif(){try{if(Notification.permission==='granted'){new Notification('FitcoachAI',{body:nudgeCopy()});toast('Sent.')}else toast('Notifications are not allowed — reminders stay in the app.')}catch(e){toast('This browser blocked it — reminders stay in the app.')}logEv('notification_test')}
SC.health=()=>{const hk=P().hk||{},rows=[6,5,4,3,2,1,0].map(n=>{const k=prevKey(n),d=hkDay(k),u=v=>v==null?'<i class="mut">unknown</i>':v;return `<tr><td>${k.slice(5)}</td><td>${u(d.steps)}</td><td>${d.sleepH==null?u(null):d.sleepH+' h'}</td><td>${u(d.workouts)}</td></tr>`}).join('');
 return `<h1>Apple Health</h1><div class="sim" id="hkSim">SIMULATED DATA — this web prototype can't read Apple Health. Numbers below are made up.</div>
 <p>Optional and <b>read-only</b>: we would only read steps, sleep and workouts, never write. Missing data shows as <b>unknown</b> and is never guessed. Sleep is only used as a hint for a lighter day.</p>
 <button class="btn ${hk.connected?'sec':''}" id="hkToggle" onclick="P().hk={connected:${!hk.connected},simulated:true};logEv('healthkit_simulated_${hk.connected?'disconnect':'connect'}');save();render()">${hk.connected?'Disconnect (simulated)':'Connect (simulated)'}</button>
 ${hk.connected?`<table class="hk"><tr><th>Day</th><th>Steps</th><th>Sleep</th><th>Workouts</th></tr>${rows}</table>`:'<p class="mut">Not connected. Everything works without it.</p>'}<button class="btn sec" onclick="go('settings',false)">Back</button>`};

/* ---------- DEV: simulate days (hidden: ?dev=1 or tap the version line 5x) ---------- */
function devBox(){if(!DEV.on)return '';return `<div class="card" id="devBox" style="border:1px dashed #a78bfa"><b>Developer: simulate days</b><p class="sm mut">Moves this device's app clock forward. Simulated events are tagged in the log.</p>
 <div class="row"><button class="btn sec" id="simDay" onclick="simDays(1,false)">+1 day</button><button class="btn sec" id="sim7" onclick="simDays(7,false)">+7 days</button></div>
 <button class="btn sec" id="sim14" onclick="simDays(14,true)">Auto-play 14 days (synthetic workouts)</button>
 <div class="row"><button class="btn sec" id="simReset" onclick="lsSet(CLK,{days:0});logEv('sim_clock_reset');render()">Real date</button><button class="btn sec" id="fastTog" onclick="DEV.fast=!DEV.fast;lsSet('fcai_proto_fast',DEV.fast?1:0);render()">Fast timers: ${DEV.fast?'on':'off'}</button></div></div>`}
function simDays(n,auto){for(let k=0;k<n;k++){if(auto)autoDay();lsSet(CLK,{days:simOffset()+1});logEv('sim_day_advanced',{to:simOffset()})}CI=null;S.anyway=false;save();render()}
function autoDay(){const ts=todaySlot();if(!ts.slot||doneToday()){if(!(P().touch||{})[todayKey()])markTouch('check-in',{simulated:true});return}
 const rx=sessionPatterns(ts.slot).map(x=>ENG.prescribe(E(),x,ctxG('full')));const results=rx.map(r=>({pattern:r.pattern,lvl:r.lvl,sets:Array(r.sets).fill(Math.min(r.hi,r.target+1)),effort:'okay',pain:false}));
 const sc=ENG.score(rx,results,E(),nowISO());const res=ENG.applySession(E(),{atISO:nowISO(),triage:'full',results},ctxG('full'));P().eng=res.eng;pushDecisions(res.decisions);
 P().sessions.push({id:'s'+(P().sessions.length+1),at:nowISO(),dateKey:todayKey(),type:ts.slot.type,triage:'full',stopped:false,simulated:true,prescriptionSnapshot:rx,results,score:sc,decisions:res.decisions,minutesActual:P().plan.minutes,minutesPlanned:P().plan.minutes});
 logEv('session_completed',{simulated:true,score:sc,decisionCodes:res.decisions.map(d=>d.code)})}

/* ---------- boot ---------- */
if(S.screen==='baseline')S.screen='s14';
if(['session','breath'].includes(S.screen))S.screen='today';
if(E()&&/^s\d/.test(S.screen)){S.screen=S.returnTo||'today';S.returnTo=null;S.hist=[]}
logEv(lsGet(KL)?'app_open':'app_first_open',{resumeAt:S.screen,locale:navigator.language});
render();

/* ---------- simplified wrappers ---------- */
{const _sess=SC.session;SC.session=()=>`<div class="sess">${_sess()}</div>`}
{const _res=_results;SC.results=()=>{const p=P(),R=p.patternReadiness||{},n=k=>PATTERNS.filter(x=>R[x]&&R[x].level===k).length,pl=p.plan||buildPlan();
 const top=P().eng?`<button class="btn xl" id="goToday" onclick="S.hist=[];go('today',false)">Go to Today</button>`:`<button class="btn xl" id="startPlan" onclick="startPlan()">Start my plan</button>`;
 return `<h1>You're all set 🎉</h1><p>Thanks — that check-in gives your plan a safe starting point. It's not a fitness grade.</p>
 <div class="card"><b>Your plan</b><p class="sm">${pl.variable?'2–4 workouts a week':`${pl.daysPerWeek} workout${pl.daysPerWeek>1?'s':''} a week`} · ${pl.minutes} minutes · no equipment${gentleMode()?' · Gentle mode':''}</p>
 <p class="sm mut">${n('ready')+n('progressing')} movement${n('ready')+n('progressing')===1?'':'s'} ready · ${n('gentle')} starting gently · ${n('notReady')+n('notAssessed')} on hold for now</p></div>
 ${p.baselineStopped?safe('STOP'):''}${p.bodyAreas.some(a=>(a.history||[]).some(h=>h.event==='pain during baseline'))?safe('PAIN'):''}${gentleMode()?safe('DOC'):''}${safe('REF')}
 ${top}<details class="more" id="resultsMore"><summary>See full check-in notes and 2-week plan</summary>${_res()}</details>`}}
