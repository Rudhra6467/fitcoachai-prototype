/* FitcoachAI v0.6 — calibration phase. Data-driven "Getting to know you" (no fixed day count), everyone starts as a beginner,
   per-set timing recorded quietly, one-line plain reasons for each small (+/-1) adaptation, post-session check-in (<10 s),
   Performance Score screen after every session, plan generated from calibration data. All on-device; no LLM.
   Thresholds R19-R23 approved in Decision Round 1 (FC_CONFIG.APPROVED); R24 still open. */
const CX6=Object.assign({calibration:{minSessions:6,minPatterns:3,minSessionsPerPattern:2,maxRatioSpread:0.35},beginnerLevel:{squat:0,push:0,hinge:0,core:1,balance:0,cardio:0},
 performanceScore:{weights:{completion:0.4,volume:0.4,adherence:0.2},adherenceUnplannedDay:0.75},fastSecPerRep:2,postCheckPainMarksPatternNotReady:true,experienceTone:{}},CX);
function calState(){const p=P();p.calib=p.calib||{startedAt:p.planStartedAt||nowISO(),completedAt:null};return p.calib}
const calDone=()=>!!(E()&&calState().completedAt);
const beginnerLvl=pat=>pat==='core'&&P().postpartumMode?0:(CX6.beginnerLevel[pat]||0);
const toneLine=()=>CX6.experienceTone[P().experience]||CX6.experienceTone.new||'';

/* ---------- 1. Everyone starts as a beginner; experience never sets difficulty ---------- */
{const _ex=exFor;exFor=function(pat){const p=P(),R=p.patternReadiness[pat]||{level:'notAssessed'};if(R.level==='notReady')return null;
 if(p.movementNeeds.includes('seated'))return SEATED[pat];
 const lvl=calDone()&&E().patterns[pat]?E().patterns[pat].lvl:beginnerLvl(pat);return nameFor(pat,lvl)}}
{const _sp=startPlan;startPlan=function(){_sp();const p=P(),e=E();if(!e)return;
 ENG.PATS.forEach(x=>{const ps=e.patterns[x];const l=beginnerLvl(x),k=kindFor(x,l);ps.lvl=l;ps.kind=k;ps.target=ENG.range(k,gentleMode())[0];ps.capability=null});
 p.calib={startedAt:nowISO(),completedAt:null};p.plan=buildPlan();
 logEv('calibration_started',{levels:Object.fromEntries(ENG.PATS.map(x=>[x,e.patterns[x].lvl])),rule:'everyone starts as a beginner',thresholds:CX6.calibration});save();render()}}
{const _r=SC.results;SC.results=()=>_r().replace("It's not a fitness grade.</p>","It's not a fitness grade.</p><p class=\"sm\" id=\"beginnerNote\">Everyone starts at the beginner level. Your first few workouts show me what suits you, then I'll build your plan.</p>")}

/* ---------- 2. Quietly record per-set timing ("done" timestamps) and rest ---------- */
{const _sd=setDone;setDone=function(){if(W&&W.phase==='run'){W.tSet=W.tSet||[];W.tSet.push({sec:Math.round((Date.now()-W.ts)/1000),doneAtUTC:new Date(appNow()).toISOString()})}_sd()}}
{const _ls=logSet;logSet=function(n){_ls(n);if(W&&W.phase==='rest')W.restT0=Date.now()}}
{const _er=endRest;endRest=function(){if(W&&W.phase==='rest'&&W.restT0){W.tRest=W.tRest||[];W.tRest.push(Math.round((Date.now()-W.restT0)/1000));W.restT0=null}_er()}}
{const _pr=pushResult;pushResult=function(pain,sharp){const ts=(W.tSet||[]).slice(),tr=(W.tRest||[]).slice();_pr(pain,sharp);const r=W.results[W.results.length-1];
 r.timing={setSec:ts.map(x=>x.sec),doneAtUTC:ts.map(x=>x.doneAtUTC),restSec:tr};W.tSet=[];W.tRest=[];logEv('exercise_timing',{pattern:r.pattern,...r.timing})}}
{const _st=startSession;startSession=function(m){const planned=!!todaySlot().slot;S._plannedDay=planned;_st(m);if(W)W.plannedDay=planned}}
/* effort (RPE) is optional: add a Skip on the per-exercise effort question */
{const _ss=SC.session;SC.session=()=>{let h=_ss();if(W&&!W.paused&&W.phase==='effort')h=h.replace(/(data-effort="hard"[^>]*>[^<]*<\/button>)/,'$1<button class="chip" id="effSkip" onclick="setEff(null)">Skip</button>')+'<p class="sm mut">Optional — skip if you\'re not sure.</p>';return h}}

/* ---------- 3. Finish -> post-session check-in -> apply -> Performance Score ---------- */
finishSession=function(stopped,why){stopAllMedia();const w=W;W=null;
 const pend={w,stopped,why:why||null,at:nowISO(),dateKey:todayKey(),minutesActual:Math.round((Date.now()-w.t0)/6e4),plannedDay:w.plannedDay!=null?w.plannedDay:S._plannedDay!==false,post:{}};
 P().pendingPost=pend;logEv('session_finished',{stopped,why:why||null});
 if(why==='sharpPain')return commitSession({skipped:'sharpPain',effort:null,pain:'yes',regions:[],energy:null});
 save();S.hist=[];go('postCheck',false)};
function regionPats(rs){return [...new Set((rs||[]).flatMap(r=>REGION_LOAD[r]||[]))]}
function commitCore(pend,post){const p=P(),w=pend.w,painPost=post.pain==='yes',postPats=painPost?regionPats(post.regions):[];
 const res=ENG.applySession(E(),{atISO:pend.at,triage:w.triage,checkinPain:!!(w.checkin&&w.checkin.pain==='yes')||painPost,painPatterns:[...new Set((w.painPatterns||[]).concat(postPats))],results:w.results},ctxG(w.triage));
 p.eng=res.eng;pushDecisions(res.decisions);let D=(w.pre||[]).concat(res.decisions);
 if(postPats.length&&CX6.postCheckPainMarksPatternNotReady){const want={};postPats.forEach(x=>want[x]='notReady');const t=ENG.tighten(E(),want,pend.at);p.eng=t.eng;pushDecisions(t.decisions);D=D.concat(t.decisions)}
 const sc=ENG.perfScore(w.rx,w.results,{plannedDay:pend.plannedDay});
 const wasCal=!calDone(),reason=reasonLine(D,w);
 const rec={id:'s'+(p.sessions.length+1),at:pend.at,dateKey:pend.dateKey,type:w.slotType,triage:w.triage,stopped:pend.stopped,stopWhy:pend.why,prescriptionSnapshot:w.rx,results:w.results,score:sc,
  decisions:D,minutesActual:pend.minutesActual,minutesPlanned:w.planned,checkin:w.checkin,postCheck:post,plannedDay:pend.plannedDay,reason,calibration:wasCal,...(pend.simulated?{simulated:true}:{})};
 p.sessions.push(rec);
 logEv('post_session_checkin',{session:rec.id,...post});
 logEv('session_completed',{id:rec.id,stopped:rec.stopped,triage:w.triage,score:sc,reason,decisionCodes:D.map(d=>d.code),plannedDay:pend.plannedDay,minutesActual:rec.minutesActual,minutesPlanned:rec.minutesPlanned,...(pend.simulated?{simulated:true}:{})});
 if(wasCal){const c=calib();rec.calSnapshot={sessions:c.sessions,confident:c.confident,complete:c.complete,extending:c.extending};
  if(c.complete)completeCalibration(rec);else if(c.extending&&!calState().extendedAt){calState().extendedAt=pend.at;logEv('calibration_extended',{sessions:c.sessions,inconsistent:c.inconsistent,thin:c.thin})}}
 delete p.pendingPost;return rec}
function commitSession(post){const pend=P().pendingPost;if(!pend)return go('today',false);const rec=commitCore(pend,post);
 S.lastSession=rec.id;CI=null;S.anyway=false;S.ciOpen=false;save();S.hist=[];go('sessionDone',false)}
function completeCalibration(rec){const p=P(),c=calib(),cs=calState();cs.completedAt=rec?rec.at:nowISO();
 const levels=Object.fromEntries(ENG.PATS.map(x=>[x,E().patterns[x].lvl]));p.plan=buildPlan();p.plan.seededBy={source:'calibration',sessions:c.sessions,patterns:c.confident,levels,at:cs.completedAt};
 if(rec)rec.planReady=true;cs.planShown=false;logEv('calibration_complete',{sessions:c.sessions,confident:c.confident,levels});logEv('plan_generated',{source:'calibration',seededBy:p.plan.seededBy})}

/* one plain-language line for the most important change this session */
function reasonLine(D,w){const nm=p=>{const r=(w.rx||[]).find(x=>x.pattern===p);return r?r.name:(PSHORT[p]||p)};
 const res=p=>(w.results||[]).find(r=>r.pattern===p)||{},rx=p=>(w.rx||[]).find(r=>r.pattern===p)||{};
 const order=['PAIN_STOP_PATTERN','INJURY_REPORTED','STEP_VERIFY_FAIL_REVERT','REVISE_LEVEL_DOWN','STEP_UP','STEP_VERIFIED','ADD_REP','REVISE_VOLUME','INJURY_GATE_STEP','TOP_OF_RANGE','PLATEAU_ADD_SET','PLATEAU_TEMPO','BAD_DAY_RETAIN','DAMAGE_CAP_HOLD','UNKNOWN_COUNT_HOLD','TRIAGE_NO_PROGRESS','EASED_HOLD','SWAPPED'];
 const d=order.map(c=>D.find(x=>x.code===c)).find(Boolean);if(!d)return 'Same plan next time. Steady is good.';const n=nm(d.pattern);
 switch(d.code){
 case 'PAIN_STOP_PATTERN':case 'INJURY_REPORTED':return `${n}: you felt pain, so it's on hold until it's been pain-free for a while.`;
 case 'STEP_VERIFY_FAIL_REVERT':return `${n}: the new step was a lot today, so next time goes back one step.`;
 case 'REVISE_LEVEL_DOWN':return `${n} has been hard several times, so next time is one step easier.`;
 case 'STEP_UP':return `${n}: you hit the top of the range again, so next time is one step harder.`;
 case 'STEP_VERIFIED':return `${n}: the new step held up, so it now counts as your level.`;
 case 'ADD_REP':{const r=res(d.pattern),t=(r.timing||{}).setSec||[],sets=r.sets||[],k=rx(d.pattern).kind;
  if(k==='reps'&&t.length&&sets.length&&t.every(x=>x>0)){const spr=t.reduce((a,b)=>a+b,0)/Math.max(1,sets.reduce((a,b)=>a+(b||0),0));if(spr<CX6.fastSecPerRep)return `${n}: you finished fast, so next time's set is one rep harder.`}
  return k==='hold'?`${n}: you held every set, so next time is a second longer.`:k==='time'?`${n}: you did every round, so next time is a little longer.`:`${n}: you hit every set, so next time's set is one rep harder.`}
 case 'REVISE_VOLUME':return `${n} felt hard a few times, so next time has fewer reps.`;
 case 'INJURY_GATE_STEP':return `${n}: pain-free for a while now, so it comes back one step.`;
 case 'TOP_OF_RANGE':return `${n}: top of the range. One more like that and we try the next step.`;
 case 'PLATEAU_ADD_SET':return `${n}: steady for a while, so next time adds one set.`;
 case 'PLATEAU_TEMPO':return `${n}: steady for a while, so next time try it slower.`;
 case 'BAD_DAY_RETAIN':case 'DAMAGE_CAP_HOLD':return `${n} felt hard today. One hard day never lowers your level, so it stays the same.`;
 case 'UNKNOWN_COUNT_HOLD':return `No count for ${n}, so nothing changes there.`;
 case 'TRIAGE_NO_PROGRESS':return 'Short version today, so nothing moves up or down.';
 case 'EASED_HOLD':return 'Lighter session today, so nothing moves up or down.';
 case 'SWAPPED':return `${n} was swapped today, so it stays the same.`}
 return 'Same plan next time. Steady is good.'}

let PC=null;
SC.postCheck=()=>{const pend=P().pendingPost;if(!pend)return '<p>Nothing to check in.</p><button class="btn" onclick="go(\'today\',false)">Today</button>';const q=pend.post;
 const ch=(k,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="chip ${q[k]===v?'on':''}" data-pc="${k}" data-v="${v}" onclick="pcSet('${k}','${v}')">${l}</button>`).join('')}</div>`;
 const ready=q.pain&&q.energy&&(q.pain==='no'||(q.regions||[]).length);
 return `<h1>${pend.stopped?'Stopped. That\'s okay.':'Nice work ✓'}</h1><p class="sm mut">Quick check-in — a few taps, then your score.</p>
 <div class="card" id="postCheck"><p class="sm">How hard was it overall? <span class="mut">(optional)</span></p>${ch('effort',[['easy','Easy'],['okay','Okay'],['hard','Hard'],['skip','Skip']])}
 <p class="sm">Any pain? <span class="mut">(not normal muscle effort)</span></p>${ch('pain',[['no','No'],['yes','Yes']])}
 ${q.pain==='yes'?`<p class="sm">Where?</p><div class="chips">${Object.keys(REGIONS).map(r=>`<button class="chip ${(q.regions||[]).includes(r)?'on':''}" data-pcr="${r}" onclick="pcRegion('${r}')">${REGIONS[r]}</button>`).join('')}<button class="chip ${(q.regions||[]).includes('unsure')?'on':''}" data-pcr="unsure" onclick="pcRegion('unsure')">Not sure</button></div>${safe('PAIN')}`:''}
 <p class="sm">Energy now?</p>${ch('energy',[['low','Low'],['ok','Okay'],['good','Good']])}</div>
 ${pend.stopped?safe('STOP'):''}
 <button class="btn xl" id="postDone" ${ready?'':'disabled'} onclick="postSubmit()">See my score</button>`};
function pcSet(k,v){const q=P().pendingPost.post;q[k]=v;if(k==='pain'&&v==='no')q.regions=[];save();render()}
function pcRegion(r){const q=P().pendingPost.post;q.regions=q.regions||[];q.regions=q.regions.includes(r)?q.regions.filter(x=>x!==r):q.regions.concat(r);q.pain='yes';save();render()}
function postSubmit(){const q=Object.assign({},P().pendingPost.post);if(!q.effort||q.effort==='skip')q.effort=null;q.regions=(q.regions||[]).filter(r=>r!=='unsure');q.answeredAt=nowISO();commitSession(q)}

/* ---------- Performance Score screen (after every session) ---------- */
const pctTxt=v=>v==null?'unknown':Math.round(v*100)+'%';
function scoreBars(sc){if(!sc||!sc.parts)return '';const P_=sc.parts,row=(id,l,v)=>`<div class="sm" data-part="${id}">${l}: <b>${pctTxt(v)}</b><div class="bar"><i style="width:${v==null?0:Math.round(v*100)}%"></i></div></div>`;
 return row('completion','Exercises completed',P_.completion)+row('volume','Reps / time vs. target',P_.volume)+row('adherence',P_.adherence===1?'Planned day':'Extra day (not planned)',P_.adherence)}
SC.sessionDone=()=>{const s=(P().sessions||[]).find(x=>x.id===S.lastSession);if(!s)return '<button class="btn" id="backToday" onclick="go(\'today\',false)">Today</button>';const w=weekStats(),sc=s.score||{},c=calib();
 const dur=s.minutesActual!=null&&s.minutesPlanned?`<p class="sm mut" id="duration">Took about ${s.minutesActual<1?'under 1':s.minutesActual} min (planned ${s.minutesPlanned}).</p>`:'';
 return `<h1>${s.stopped?(s.stopWhy==='sharpPain'?'Stopped — that was the right call.':'Stopped. That\'s okay.'):'Workout done ✓'}</h1>
 ${s.stopWhy==='sharpPain'?safe('PAIN')+safe('STOP'):s.stopped?safe('STOP'):''}
 <div class="card" id="perfCard"><h2 style="margin-bottom:4px">Performance Score</h2><div class="big" style="margin:4px 0"><span id="score">${sc.score==null?'—':sc.score}</span>${sc.score==null?'':'<span class="sm mut">/100</span>'}</div>
 ${scoreBars(sc)}<p class="sm mut">${esc(sc.why||'')} It's not a fitness grade.</p>${dur}</div>
 ${s.reason?`<div class="card" id="reasonLine"><b>Adjusted for you:</b> ${esc(s.reason)}</div>`:''}
 ${s.planReady?`<div class="card" id="planReadyCard"><h2>Your plan is ready 🎉</h2><p class="sm">I've seen enough of your sessions to build your own plan.</p><button class="btn" id="seePlan" onclick="go('planReady')">See my plan</button></div>`:s.calibration?calibCard(c,true):''}
 <details class="more"><summary>What changed and why</summary>${plainChanges(s.decisions)}</details>
 <div class="card"><b>This week: ${w.done} of ${w.goal}</b><div class="week">${Array.from({length:Math.max(w.goal,w.done)},(_,i)=>`<i class="${i<w.done?'on':''}"></i>`).join('')}</div><p class="sm mut">${esc(nextWorkoutText())}</p></div>
 <button class="btn xl" id="backToday" onclick="S.hist=[];go('today',false)">Done</button>`};

/* ---------- Today: data-driven calibration meter ---------- */
function calibCard(c,compact){if(calDone())return `<div class="card" id="calib" data-state="ready"><b id="calibTitle">Your plan is ready</b><div class="bar"><i style="width:100%"></i></div><p class="sm mut">Built from your own ${(P().plan.seededBy||{}).sessions||c.sessions} sessions. It keeps adjusting after every workout, one step at a time.</p><button class="btn sec" id="seePlan2" onclick="go('planReady')">See my plan</button></div>`;
 const C=CX6.calibration,last=[...(P().sessions||[])].reverse().find(s=>s.reason);
 let why='';if(c.extending){const parts=[];if(c.inconsistent.length)parts.push(`your last two ${c.inconsistent.map(x=>PSHORT[x]).join(', ')} sessions were quite different`);
  if(c.confident.length<c.needPatterns)parts.push(`I need ${C.minSessionsPerPattern} counted sessions each for ${c.needPatterns} movement types — ${c.confident.length} so far`);why=parts.join('; and ')}
 return `<div class="card" id="calib" data-state="${c.extending?'extending':'calibrating'}"><b id="${c.extending?'calibExtend':'calibTitle'}">${c.extending?'A few more sessions and I\'ll have you dialed in.':`Getting to know you: ${Math.min(c.sessions,c.needSessions)} of ${c.needSessions} sessions`}</b><div class="bar"><i style="width:${c.pct}%"></i></div>
 <p class="sm mut">${c.extending?esc(why.charAt(0).toUpperCase()+why.slice(1))+'.':esc(toneLine())}</p>
 ${!compact&&last?`<p class="sm" id="lastReason"><b>Last change:</b> ${esc(last.reason)}</p>`:''}
 ${compact?'':`<details class="sm mut"><summary>Details</summary>${PATTERNS.filter(x=>c.per[x].included).map(x=>`${PSHORT[x]} ${Math.min(c.per[x].obs,c.per[x].need)}/${c.per[x].need}${c.per[x].personalized?' ✓':''}`).join(' · ')}<br>Only full sessions with counts logged teach me. Short or stopped sessions still count for you.</details>`}</div>`}
{const _t=SC.today;SC.today=()=>{let h=_t();if(!E())return h;
 if(calDone()&&!calState().planShown)h=h.replace('<h1>','<div class="card" id="planReadyBanner"><b>Your plan is ready 🎉</b><p class="sm">Built from your own sessions.</p><button class="btn" id="seePlan3" onclick="go(\'planReady\')">See my plan</button></div><h1>');
 return h}}

/* ---------- Plan ready ---------- */
SC.planReady=()=>{const p=P();if(!calDone())return '<p>Still getting to know you.</p><button class="btn" onclick="go(\'today\',false)">Today</button>';
 if(!calState().planShown){calState().planShown=true;logEv('plan_ready_viewed');save()}
 const sb=p.plan.seededBy||{},pl=p.plan,pats=PATTERNS.filter(x=>E().patterns[x].status!=='notReady');
 return `<h1>Your plan is ready</h1><p>Built from your own ${sb.sessions||''} sessions, not from what you told me at the start.</p>
 <div class="card" id="planList"><b>Where you start now</b><ul>${pats.map(x=>{const rx=ENG.prescribe(E(),x,ctxG());const t=ENG.tier(E(),x,nowISO());return `<li data-pattern="${x}"><b>${esc(nameFor(x,rx.lvl))}</b> <span class="sm mut">${doseText(rx)} · how sure: ${t.conf}</span></li>`}).join('')}</ul></div>
 <div class="card"><b>Your week</b><p class="sm">${pl.variable?'2–4 workouts a week':`${pl.daysPerWeek} workout${pl.daysPerWeek>1?'s':''} a week`} · ${pl.minutes} minutes · no equipment${gentleMode()?' · Gentle mode':''}</p>
 <p class="sm mut">It keeps adjusting after every session, one step at a time, and only when your workouts show it.</p></div>
 <button class="btn xl" id="planGo" onclick="S.hist=[];go('today',false)">Go to Today</button>`};
MAIN.push('planReady');TABOF.planReady='today';

/* ---------- Settings version line ---------- */

/* ---------- Dev: auto-play calibration sessions (clean or messy) through the same pipeline ---------- */
autoDay=function(messy){const ts=todaySlot();if(!ts.slot||doneToday()){if(!(P().touch||{})[todayKey()])markTouch('check-in',{simulated:true});return false}
 const k=(P().sessions||[]).length;
 const rx=sessionPatterns(ts.slot).map(x=>{const r=ENG.prescribe(E(),x,ctxG('full'));return {...r,name:nameFor(x,r.lvl)}});
 const results=rx.map(r=>{let v=Math.min(r.hi,r.target+1);if(messy)v=k%2?r.hi:Math.max(1,Math.round(r.target*0.4));const sets=Array(r.sets).fill(v);
  return {pattern:r.pattern,lvl:r.lvl,kind:r.kind,sets,effort:messy?null:'okay',pain:false,prescription:{...r},timing:{setSec:sets.map(n=>r.kind==='reps'?Math.round(n*2.5):n),doneAtUTC:[],restSec:[]}}});
 const w={triage:'full',slotType:ts.slot.type,planned:P().plan.minutes,rx,results,pre:[],checkin:null,painPatterns:[]};
 const pend={w,stopped:false,why:null,at:nowISO(),dateKey:todayKey(),minutesActual:P().plan.minutes,plannedDay:true,simulated:true};
 commitCore(pend,{effort:null,pain:'no',regions:[],energy:'ok',simulated:true});return true};
function simCalib(messy){let n=0,g=0;while(n<6&&g++<40){if(autoDay(messy))n++;lsSet(CLK,{days:simOffset()+1});logEv('sim_day_advanced',{to:simOffset()})}CI=null;S.anyway=false;save();render();toast(`${n} simulated ${messy?'messy ':''}sessions added.`)}
{const _db=devBox;devBox=function(){const h=_db();if(!h)return h;return h.replace(/<\/div>$/,`<div class="row"><button class="btn sec" id="simCal" onclick="simCalib(false)">Auto-play 6 sessions</button><button class="btn sec" id="simMessy" onclick="simCalib(true)">6 messy sessions</button></div></div>`)}}

