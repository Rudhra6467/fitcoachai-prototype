/* FitcoachAI v0.7 — closes the v0.6 gaps and adds the simplest modification path.
   1. A "Hard" session or "Low" energy eases the NEXT session only (same level and sets, a slightly lower target; never a level drop).
   2. Swap or skip an exercise, or shorten the session, with a reason. The coach offers an alternative first, then adjusts, then
      accepts with an honest note. Reasons are optional while getting to know you and required afterwards. Everything is logged.
   3. "Why this workout" line on Today.
   4. Honest note for older data that already completed calibration on upgrade.
   All on-device; no LLM. Thresholds and the response order approved in Decision Round 1 (R23, R25). */

/* ---------- 1. Ease the next session after a hard one ---------- */
function easePending(){const e=P().ease;return !!(e&&!e.usedAt&&!e.declinedAt)}
function planMode(){return easePending()?'eased':'full'}
function easeWhy(e){return e.why==='energy'?'you said your energy was low':'you said it felt hard'}
{const _c=commitCore;commitCore=function(pend,post){const p=P(),hadEase=easePending();
 if(hadEase){p.ease.usedAt=pend.at;p.ease.usedBy=pend.w.triage}
 const rec=_c(pend,post);const T=CX.easeNextIf||{effort:[],energy:[]};
 const why=(T.effort||[]).includes(post.effort)?'effort':(T.energy||[]).includes(post.energy)?'energy':null;
 if(why&&!post.simulated){p.ease={at:pend.at,from:rec&&rec.id,why};logEv('next_session_eased',{from:p.ease.from,why,step:CX.easeStep})}
 save();return rec}}
function declineEase(){P().ease.declinedAt=nowISO();logEv('ease_declined',{from:P().ease.from});save();render()}

/* ---------- 2. Modification path ---------- */
const MOD_REASONS={pain:'Injury or pain',fatigue:'Tired or recovering',equipment:'Equipment or space',schedule:'Short on time',other:'Something else'};
function modToday(){const p=P();p.mods=p.mods||{};const m=p.mods[todayKey()];return m||{skip:[],swap:{},short:false}}
function modSave(m){P().mods[todayKey()]=m;save()}
function altFor(pat){return P().movementNeeds.includes('seated')?null:SEATED[pat]}
function modNeedReason(){return !!CX.modReasonRequiredAfterCalibration&&calDone()}
function openMod(action,pat){S.mod={step:action?'why':'what',action:action||null,pattern:pat||null,reason:null};go('modify')}
function modPick(action,pat){S.mod={step:'why',action,pattern:pat||null,reason:null};render()}
function modReason(r){const M=S.mod;M.reason=r;logEv('modification_requested',{action:M.action,pattern:M.pattern,reason:r,calibration:!calDone(),where:M.inSession?'session':'today'});
 if(M.inSession)return modInSession(r);M.step='offer';render()}
function modResolve(kind){const M=S.mod,m=modToday(),pat=M.pattern;let applied=kind;
 if(kind==='short')m.short=true;
 else if(kind==='swapAlt'){m.swap[pat]=altFor(pat);m.skip=m.skip.filter(x=>x!==pat)}
 else if(kind==='skip'||kind==='hold'){if(!m.skip.includes(pat))m.skip.push(pat);delete m.swap[pat]}
 if(kind==='hold'){const t=ENG.tighten(E(),{[pat]:'notReady'},nowISO());P().eng=t.eng;pushDecisions(t.decisions)}
 m.log=(m.log||[]).concat([{at:nowISO(),action:M.action,pattern:pat,reason:M.reason,response:M.response,applied}]);modSave(m);
 logEv('modification_applied',{action:M.action,pattern:pat,reason:M.reason,response:M.response,applied});S.mod=null;go('today',false)}
function modUndo(){const m=modToday();logEv('modification_undone',{was:{skip:m.skip,swap:m.swap,short:m.short}});modSave({skip:[],swap:{},short:false,log:m.log});render()}
/* decide the response: counter-offer -> accept with adjustment -> accept with an honest note */
/* R25 (approved): skips of one movement in the last CX.skipNoteWindowDays days (today's planned skips + in-session skips), not counting today's pending one */
function recentSkips(pat){const p=P(),cut=appNow()-CX.skipNoteWindowDays*864e5,tk=todayKey();let n=0;
 for(const k in (p.mods||{})){const t=Date.parse(k);if(k!==tk&&t>=cut&&(p.mods[k].skip||[]).includes(pat))n++}
 for(const x of (p.sessions||[])){const t=Date.parse(x.at||x.startedAt||x.date||'');if(t>=cut&&(x.results||[]).some(r=>r.pattern===pat&&r.skipped&&r.reason==='user'))n++}
 if((modToday().skip||[]).includes(pat))n++;return n}
function modOffer(M){const C=(CX.modCounter||{})[M.reason]||'none',a=M.action,pat=M.pattern,nm=pat?esc(todayName(pat)):'';const alt=pat&&altFor(pat);
 const B=(id,label,kind,sec)=>`<button class="btn${sec?' sec':''}" id="${id}" onclick="S.mod.response='${id}';modResolve('${kind}')">${label}</button>`;
 const n=pat?recentSkips(pat)+1:0,skipNote='<p class="sm mut" id="modNote">Skipping now and then is fine. It just won\'t move up until you do it.</p>'+(n>=CX.skipNoteAfter?`<p class="sm mut" id="modRepeat">You've skipped this ${n} times in the last 2 weeks. That's okay. If something about it doesn't suit you, a swap may help.</p>`:'');
 if(M.reason==='pain'){if(a==='short')return `<p>Okay, the short version: 1 set of everything.</p>${safe('PAIN')}${B('modOk','Okay','short')}`;
  return `<p>With pain, it's safer to leave <b>${nm}</b> out than to swap it. It goes on hold until it's been pain-free for a while.</p>${safe('PAIN')}${B('modOk','Okay','hold')}`}
 if(a==='short')return `<p>Okay, the short version today: 1 set of everything. Nothing moves up or down.</p>${B('modOk','Okay','short')}`;
 if(C==='short'&&!modToday().short)return `<p>How about the short version instead? 1 set of everything, and nothing moves up or down.</p>${B('modCounter','Do the short version','short')}${B('modAnyway',a==='swap'&&alt?'No, swap it':'No, skip it',a==='swap'&&alt?'swapAlt':'skip',true)}${a==='swap'?'':skipNote}`;
 if(a==='swap'||C==='seated'){if(alt)return `<p>Try <b>${esc(alt)}</b> instead${C==='seated'?'. It only needs a chair':''}. Swaps don't change your level.</p>${B('modCounter','Use '+esc(alt),'swapAlt')}${B('modAnyway','No, skip it','skip',true)}`;
  return `<p>There isn't a simpler version of <b>${nm}</b> for you, so the option is to leave it out today.</p>${B('modOk','Skip it','skip')}${skipNote}`}
 return `<p>Okay, <b>${nm}</b> is left out today.</p>${B('modOk','Okay','skip')}${skipNote}`}
function todayName(pat){const m=modToday(),r=ENG.prescribe(E(),pat,ctxG(planMode()));return m.swap[pat]||nameFor(pat,r?r.lvl:0)}
function reasonChips(){return `<div class="chips" id="modReasons" role="group" aria-label="Reason">${Object.entries(MOD_REASONS).filter(([k])=>(CX.modReasons||[]).includes(k)).map(([k,v])=>`<button class="chip" data-reason="${k}" onclick="modReason('${k}')">${v}</button>`).join('')}${modNeedReason()?'':`<button class="chip" data-reason="none" onclick="modReason(null)">Rather not say</button>`}</div>
 <p class="sm mut">${modNeedReason()?'Pick one. It helps me adjust your plan.':'Optional while I get to know you.'}</p>`}
SC.modify=()=>{const M=S.mod;if(!M||!E())return '<button class="btn" onclick="go(\'today\',false)">Today</button>';const ts=todaySlot(),slot=ts.slot||P().plan.weeks[0][0],m=modToday();
 const back='<button class="btn sec" id="modBack" onclick="S.mod=null;go(\'today\',false)">Keep the workout as it is</button>';
 if(M.step==='what')return `<h1>Change today's workout</h1><ul class="modList">${sessionPatterns(slot).filter(x=>!m.skip.includes(x)).map(x=>`<li><b>${esc(todayName(x))}</b><span><button class="chip" data-mod="swap" data-pat="${x}" onclick="modPick('swap','${x}')">Swap</button><button class="chip" data-mod="skip" data-pat="${x}" onclick="modPick('skip','${x}')">Skip</button></span></li>`).join('')}</ul>
  ${m.short?'':'<button class="btn sec" id="modShort" onclick="modPick(\'short\')">Make the whole workout shorter</button>'}${back}`;
 const what=M.action==='short'?'a shorter workout':`${M.action==='swap'?'swapping':'skipping'} <b>${esc(todayName(M.pattern))}</b>`;
 if(M.step==='why')return `<h1>What's the reason?</h1><p>For ${what}.</p>${reasonChips()}${back}`;
 return `<h1>Here's what I suggest</h1>${modOffer(M)}${back}`};
/* in-session "Skip this exercise" also asks why */
skipEx=function(){const r=cur();S.mod={step:'why',action:'skip',pattern:r.pattern,reason:null,inSession:true};W.phase='skipWhy';unlisten();render()};
function modInSession(reason){const r=cur(),M=S.mod;W.results.push({pattern:r.pattern,lvl:r.lvl,sets:[],skipped:true,reason:'user',why:reason});logEv('exercise_skipped',{pattern:r.pattern,reason});
 if(reason==='pain'){const t=ENG.tighten(E(),{[r.pattern]:'notReady'},nowISO());P().eng=t.eng;pushDecisions(t.decisions);W.pre=(W.pre||[]).concat(t.decisions);W.phase='skipPain';S.mod=null;save();return render()}
 S.mod=null;nextEx()}
{const _ss=SC.session;SC.session=()=>{if(W&&W.phase==='skipWhy'){const r=cur();return `<h1>Skip ${esc(r.name)}?</h1><p>What's the reason?</p>${reasonChips()}<button class="btn sec" id="skipBack" onclick="S.mod=null;W.phase='intro';render()">Don't skip</button>`}
 if(W&&W.phase==='skipPain')return `<h1>Okay, it's left out</h1><p>It goes on hold until it's been pain-free for a while.</p>${safe('PAIN')}<button class="btn xl" id="skipCont" onclick="nextEx()">Continue</button>`;return _ss()}}

/* ---------- 3. Today: why this workout + ease + modification controls ---------- */
function explainToday(slot){const p=P(),parts=[],m=modToday();
 parts.push(todaySlot().slot?`It's one of your planned days.`:`It's an extra day you chose.`);
 parts.push(calDone()?'The amounts come from your recent sessions.':'While I get to know you, everything starts at the beginner level.');
 const last=[...(p.sessions||[])].reverse().find(s=>s.reason&&!s.simulated);if(last)parts.push('Last time: '+last.reason);
 if(easePending())parts.push(`It's a bit lighter because ${easeWhy(p.ease)} last time.`);
 if(m.short)parts.push('You asked for the short version.');
 if(m.skip.length||Object.keys(m.swap).length)parts.push('You changed '+[...m.skip.map(x=>'skipped '+PSHORT[x]),...Object.keys(m.swap).map(x=>'swapped '+PSHORT[x])].join(', ')+'.');
 return parts.join(' ')}
{const _t=SC.today;SC.today=()=>{let h=_t();if(!E()||!h.includes('id="todayWorkout"'))return h;const ts=todaySlot(),slot=ts.slot||P().plan.weeks[0][0],m=modToday();
 h=h.replace(/<p class="sm" id="whyLine">[\s\S]*?<\/p><\/div>/,`<p class="sm" id="whyLine"><b>Why this workout:</b> ${esc(explainToday(slot))}</p>`+
  ((m.short||m.skip.length||Object.keys(m.swap).length)?`<button class="link" id="modUndo" onclick="modUndo()">Undo my changes</button>`:'')+
  `<button class="btn sec" id="modOpen" onclick="openMod()">Change something</button></div>`);
 if(easePending()&&!m.short)h=h.replace('<div class="card" id="todayWorkout">',`<div class="card" id="easeCard"><b>A lighter session today</b><p class="sm">Last time ${easeWhy(P().ease)}, so today has slightly fewer reps or seconds. Your level stays the same, and nothing moves up or down.</p><button class="link" id="easeDecline" onclick="declineEase()">I feel fine, use the usual amount</button></div><div class="card" id="todayWorkout">`);
 if(m.short)h=h.replace(/id="startSession" onclick="startSession\('full'\)">Start workout/,'id="startSession" onclick="startSession(\'short\')">Start short workout').replace(/<button class="btn sec" id="startShort"[^>]*>[^<]*<\/button>/,'');
 return h}}
/* session done: say when the next session will be lighter */
{const _d=SC.sessionDone;SC.sessionDone=()=>{let h=_d();const e=P().ease,s=(P().sessions||[]).find(x=>x.id===S.lastSession);
 if(e&&s&&e.from===s.id&&!e.usedAt)h=h.replace('<button class="btn','<p class="sm" id="easeNext">Next time will be a bit lighter because '+easeWhy(e)+'. Your level stays the same.</p><button class="btn');return h}}

/* ---------- 4. Older data that already met calibration on upgrade ---------- */
{const _t=SC.today;SC.today=()=>{let h=_t();if(calDone()&&calState().fromHistory&&!calState().planShown)h=h.replace('Built from your own sessions.','Your earlier workouts already gave me enough to build your plan, so there\'s no "getting to know you" step this time.');return h}}

/* ---------- boot (moved from v0.6 so every v0.7 override is in place first) ---------- */
if(E()){calState();if(P().pendingPost&&S.screen!=='postCheck'){S.screen='postCheck';S.hist=[]}
 if(!calDone()&&calib().complete){completeCalibration(null);calState().fromHistory=true;logEv('calibration_complete_from_history',{sessions:calib().sessions})}
 P().mods=P().mods||{};save()}
if(S.screen==='postCheck'&&!P().pendingPost)S.screen=E()?'today':'s1';
if(S.screen==='modify'&&!S.mod)S.screen=E()?'today':'s1';
render();
/* v0.7.2: the spoken-caption bar never covers Stop/Skip: #app gets bottom space equal to the bar's height */
(function(){const c=document.getElementById('cap');if(!c||!('ResizeObserver' in window))return;new ResizeObserver(()=>{document.documentElement.style.setProperty('--caph',(c.offsetHeight||0)+'px')}).observe(c)})();
