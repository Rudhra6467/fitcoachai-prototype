// Domain invariants, run inside the real page via Playwright (engine + config loaded by index.html).
const {chromium}=require('playwright-core');const URL=process.argv[2]||'http://127.0.0.1:8765/';
(async()=>{const br=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const pg=await br.newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await pg.goto(URL);
 const out=await pg.evaluate(()=>{const R=[];const ok=(c,m)=>R.push([!!c,m]);const D=864e5,T0=Date.parse('2026-01-05T12:00:00Z'),at=d=>new Date(T0+d*D).toISOString();
  const base=(st='ready',inj=false)=>ENG.init({nowISO:at(0),gentle:false,patterns:Object.fromEntries(ENG.PATS.map(p=>[p,{status:st,lvl:0,kind:'reps',injury:inj,baseline:true}]))});
  const top=(e,pats,eff='okay')=>pats.map(p=>{const x=ENG.prescribe(e,p,{});return {pattern:p,lvl:x.lvl,sets:Array(x.sets).fill(x.hi),effort:eff}});
  const run=(e,d,res,extra)=>ENG.applySession(e,{atISO:at(d),triage:'full',results:res,...(extra||{})},{gentle:false});
  // 1 one step-up per session
  let e=base();const P4=['squat','push','hinge','core'];e=run(e,0,top(e,P4)).eng;let r=run(e,2,top(e,P4));
  ok(r.decisions.filter(d=>d.code==='STEP_UP').length===1,'one STEP_UP in a session where 4 patterns qualify');
  ok(r.decisions.filter(d=>d.code==='STEP_UP_DEFERRED').length===3,'other 3 deferred with reason code');
  // fuzz: 300 seeded sessions
  let s=7;const rnd=()=>(s=(s*1103515245+12345)%2147483648)/2147483648;e=base();let maxUp=0,badDrop=0,bigDrop=0;
  for(let i=0;i<300;i++){const res=P4.map(p=>{const x=ENG.prescribe(e,p,{});if(!x)return null;const v=Math.floor(x.lo-2+rnd()*(x.hi-x.lo+4));return {pattern:p,lvl:x.lvl,sets:Array(x.sets).fill(v),effort:rnd()<0.2?'hard':'okay'}}).filter(Boolean);
   const before=JSON.parse(JSON.stringify(e.patterns));const o=run(e,i,res);maxUp=Math.max(maxUp,o.decisions.filter(d=>d.code==='STEP_UP').length);
   P4.forEach(p=>{const a=before[p],b=o.eng.patterns[p];if(a.lvl-b.lvl>1)bigDrop++;if(b.lvl<a.lvl&&a.bad===0&&!a.pendingVerify)badDrop++});e=o.eng}
  ok(maxUp<=1,'fuzz 300 sessions: never >1 step up per session');ok(bigDrop===0,'fuzz: never drops >1 level at once');ok(badDrop===0,'fuzz: a single bad day (after a non-bad one) never lowers a level');
  // 2 bad day
  e=base();e.patterns.squat.lvl=2;r=run(e,0,[{pattern:'squat',lvl:2,sets:[3,3],effort:'hard'}]);
  ok(r.eng.patterns.squat.lvl===2&&r.decisions.some(d=>d.code==='BAD_DAY_RETAIN'),'one bad day keeps the level (BAD_DAY_RETAIN)');
  // 3 pain stops the pattern
  e=base();r=run(e,0,[{pattern:'push',lvl:0,sets:[8],effort:'okay',pain:true}]);
  ok(r.eng.patterns.push.status==='notReady'&&ENG.prescribe(r.eng,'push',{})===null&&r.decisions.some(d=>d.code==='PAIN_STOP_PATTERN'),'pain -> pattern notReady and not prescribed');
  // 4 injured-area gate
  const gate=days=>{let e=base();e.patterns.hinge.status='notReady';e.patterns.hinge.injury=true;for(const d of days)e=run(e,d,top(e,['squat'])).eng;return e.patterns.hinge.status};
  ok(gate([0,1,2])==='notReady','3 pain-free sessions in 3 days: still notReady');
  ok(gate([0,3,7])==='gentle','3 pain-free sessions over 7 days: notReady -> gentle (one step)');
  ok(gate([0,3,7,8,10,14])==='gentle'&&gate([0,3,7,8,11,15])==='ready','next step needs another 3 sessions over 7+ days');
  ok(gate([0,0,0,0])==='notReady','same-day sessions count once');
  {let e=base();e.patterns.hinge.status='notReady';e.patterns.hinge.injury=true;e=run(e,0,top(e,['squat'])).eng;e=run(e,3,top(e,['squat'])).eng;e=run(e,5,top(e,['squat']),{checkinPain:true,painPatterns:['hinge']}).eng;e=run(e,7,top(e,['squat'])).eng;ok(e.patterns.hinge.status==='notReady'&&e.patterns.hinge.painFree.length===1,'pain resets the pain-free count')}
  {const t=ENG.tighten(base(),{push:'notReady'},at(0));ok(t.eng.patterns.push.status==='notReady','new injury restricts immediately');const t2=ENG.tighten(t.eng,{push:'ready'},at(1));ok(t2.eng.patterns.push.status==='notReady','no instant clearance via tighten')}
  // 5 determinism
  const seq=()=>{let e=base();let s2=3;const rr=()=>(s2=(s2*69069+1)%4294967296)/4294967296;for(let i=0;i<60;i++){e=run(e,i,P4.map(p=>{const x=ENG.prescribe(e,p,{});return x&&{pattern:p,lvl:x.lvl,sets:Array(x.sets).fill(Math.floor(5+rr()*9)),effort:rr()<.15?'hard':'okay',pain:rr()<.02}}).filter(Boolean)).eng}return JSON.stringify(e)};
  ok(seq()===seq(),'determinism: identical inputs -> identical engine state');
  ok(!/Date\.now|Math\.random|new Date\(\)/.test(ENG.applySession.toString()+ENG.init.toString()+ENG.tighten.toString()),'engine uses no clock or randomness');
  // score: no floor, ceiling
  e=base();const rx=P4.map(p=>ENG.prescribe(e,p,{}));const sc0=ENG.score(rx,P4.map(p=>({pattern:p,skipped:true})),e,at(0));ok(sc0.score===0,'score: skipping everything scores 0 (no floor)');
  const sc1=ENG.score(rx,top(e,P4),e,at(0));ok(sc1.score<=sc1.ceiling&&sc1.ceiling<100,'score: capped by evidence ceiling ('+sc1.score+'/'+sc1.ceiling+')');
  return R});
 let f=0;out.forEach(([c,m])=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)f++});if(errs.length){f++;console.log('FAIL errors',errs)}
 await br.close();console.log(f?f+' FAILURES':'ALL PASSED');process.exit(f?1:0)})();
