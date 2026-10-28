/* v0.9.2 — Decision Round 2 (approved 2026-10-27, user approval). See docs/PRE-NATIVE-REVIEW.md and docs/CORE-PRODUCT-LOGICS-AMENDMENTS.md.
   D2-1  Ability summary: display-only average of the per-movement levels (levels stay the source of truth).
   D2-3  After calibration a "Something else" reason gets the short-version counter-offer first (never for pain; never a hard block).
   D2-4  Honest "can't promise the same progress" note on non-pain accepts after calibration (copy pending OQ-5 legal review).
   D2-5  During calibration: Easier / Harder, ±1 step per movement, at most once per movement per day, logged as a decision. */
function abilitySummary(){const e=E();if(!e)return null;const ls=ENG.PATS.map(p=>e.patterns[p]).filter(ps=>ps&&ps.status!=='notReady').map(ps=>ps.lvl+1);
 if(!ls.length)return null;return {avg:Math.round(ls.reduce((a,b)=>a+b,0)/ls.length*10)/10,of:ENG.MAXLVL+1,n:ls.length}}
function abilityCard(){const a=abilitySummary();if(!a)return '';return `<div class="card" id="abilityCard"><b>Ability: ${a.avg} of ${a.of}</b><p class="sm mut">Your average step across ${a.n} movements. Each movement has its own level; this is just the summary.</p></div>`}
{const _d=SC.sessionDone;SC.sessionDone=()=>{const h=_d();const i=h.indexOf('<details class="more">');return i<0?h:h.slice(0,i)+abilityCard()+h.slice(i)}}
/* D2-3 + D2-4 */
{const _mo=modOffer;modOffer=function(M){const C=CX.modCounter||{},post=calDone(),swapOther=post&&M.reason==='other'&&CX.modCounterOtherAfterCalibration;
 const keep=C.other;if(swapOther)C.other=CX.modCounterOtherAfterCalibration;let h;try{h=_mo(M)}finally{C.other=keep}
 if(post&&M.reason&&M.reason!=='pain')h+=`<p class="sm mut" id="modDisclaim">${esc(CX.modAcceptNote)}</p>`;return h}}
/* D2-5 */
function intensityCap(ps){return (ps.injury||ps.status==='gentle'||gentleMode())?ENG.GCAP:ENG.MAXLVL}
function canNudge(pat,dir){if(calDone()||!CX.calibrationIntensityControl)return false;const ps=E().patterns[pat],m=modToday();
 if(!ps||ps.status==='notReady'||(m.intensity||{})[pat])return false;const l=ps.lvl+dir;return l>=0&&l<=intensityCap(ps)}
function nudgeLevel(pat,dir){if(!canNudge(pat,dir))return;const e=E(),ps=e.patterns[pat],m=modToday(),from=ps.lvl;ps.lvl=from+dir;ps.prevLvl=from;
 ps.kind=kindFor(pat,ps.lvl);ps.target=ENG.range(ps.kind,gentleMode())[0];m.intensity=Object.assign({},m.intensity,{[pat]:dir});modSave(m);
 const d={code:dir>0?'USER_HARDER':'USER_EASIER',pattern:pat,from,to:ps.lvl,msg:dir>0?'You asked for a harder version.':'You asked for an easier version.',at:nowISO(),userInitiated:true};
 (e.decisions=e.decisions||[]).push(d);pushDecisions([d]);save();toast(dir>0?'Okay, one step harder today.':'Okay, one step easier today.');render()}
{const _m=SC.modify;SC.modify=()=>{let h=_m();const M=S.mod;if(!M||M.step!=='what'||calDone()||!CX.calibrationIntensityControl)return h;
 return h.replace(/<span><button class="chip" data-mod="swap" data-pat="(\w+)"/g,(s,pat)=>`<span>${canNudge(pat,-1)?`<button class="chip" data-mod="easier" data-pat="${pat}" onclick="nudgeLevel('${pat}',-1)">Easier</button>`:''}${canNudge(pat,1)?`<button class="chip" data-mod="harder" data-pat="${pat}" onclick="nudgeLevel('${pat}',1)">Harder</button>`:''}<button class="chip" data-mod="swap" data-pat="${pat}"`)
  .replace('<h1>Change today\'s workout</h1>','<h1>Change today\'s workout</h1><p class="sm mut" id="intensityHint">While I get to know you, you can make a movement one step easier or harder (once a day each).</p>')}}
/* undo keeps today's intensity record, so ±1 stays once per movement per day */
{const _u=modUndo;modUndo=function(){const k=modToday().intensity;_u();if(k){const m=modToday();m.intensity=k;modSave(m)}}}
