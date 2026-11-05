/* ---------- Simulation engine (no DOM) ---------- */
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS=[{s:'♠',n:'spades',black:true},{s:'♥',n:'hearts',black:false},{s:'♦',n:'diamonds',black:false},{s:'♣',n:'clubs',black:true}];
const rankValue=r=>r===0?1:(r>=10?12:r+1);           // ace=1, J/Q/K=12, others face value
const cardName=c=>RANKS[c.r]+SUITS[c.s].s;

function makeDeck(){const d=[];for(let s=0;s<4;s++)for(let r=0;r<13;r++)d.push({r,s,v:rankValue(r),black:SUITS[s].black});return d;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makeShoe(n){const k=Math.max(2,Math.ceil(2*n/52));let s=[];for(let i=0;i<k;i++)s=s.concat(makeDeck());return shuffle(s);}
const randInt=(lo,hi)=>lo+Math.floor(Math.random()*(hi-lo+1));

const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const variance=a=>{const m=mean(a);return a.length>1?a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1):0;};
function fitLine(x,y){const mx=mean(x),my=mean(y);let sxy=0,sxx=0;for(let i=0;i<x.length;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)*(x[i]-mx);}const b=sxx?sxy/sxx:0;return{b,a:my-b*mx};}

// Genotype: sum of two alleles. With dominance, a black/red pair counts twice the black card.
function genotype(c,dom){return dom&&c[0].black!==c[1].black?2*(c[0].black?c[0].v:c[1].v):c[0].v+c[1].v;}
// Phenotype = genotype + uniform integer environmental effect (0 if environment is off).
function makeInd(cards,P,isYou){const g=genotype(cards,P.dom);const env=P.env?randInt(P.lo,P.hi):0;return{cards,g,env,p:g+env,isYou:!!isYou};}

// Random pairs; each partner hands over one randomly chosen card and receives the other's.
function mate(pop,P){
  const idx=shuffle(pop.map((_,i)=>i)),off=[];
  for(let k=0;k+1<idx.length;k+=2){
    const A=pop[idx[k]],B=pop[idx[k+1]];
    const ia=Math.random()<.5?0:1,ib=Math.random()<.5?0:1;
    const mid=(A.p+B.p)/2;
    const a=makeInd([A.cards[1-ia],B.cards[ib]],P,A.isYou);
    const b=makeInd([B.cards[1-ib],A.cards[ia]],P,B.isYou);
    a.mid=b.mid=mid;
    if(A.isYou)a.swap={kept:A.cards[1-ia],gave:A.cards[ia],got:B.cards[ib],partner:B,partnerId:idx[k+1]};
    if(B.isYou)b.swap={kept:B.cards[1-ib],gave:B.cards[ib],got:A.cards[ia],partner:A,partnerId:idx[k]};
    off.push(a,b);
  }
  return off;
}

// Selection on phenotype. Survivors are always an even number, at least 2.
function applySelection(pop,P){
  const n=pop.length;
  for(let t=0;t<300;t++){
    let keep,extra=false;
    if(P.sel==='coin'){
      keep=pop.map(o=>{const f=Math.round(o.p/2);for(let j=0;j<f;j++)if(Math.random()<.5)return true;return false;});
    }else{
      let k=Math.round(n*P.frac/100);if((n-k)%2)k++;
      const dir=P.sel==='truncHigh'?-1:1;
      const order=shuffle(pop.map((_,i)=>i)).sort((a,b)=>dir*(pop[a].p-pop[b].p));
      keep=pop.map(()=>true);for(let j=0;j<k;j++)keep[order[j]]=false;
    }
    let alive=keep.map((v,i)=>v?i:-1).filter(i=>i>=0);
    if(alive.length%2){const r=alive[Math.floor(Math.random()*alive.length)];keep[r]=false;extra=true;alive=alive.filter(i=>i!==r);}
    if(alive.length>=2)return{keep,extra};
  }
  return{keep:pop.map((_,i)=>i<2),extra:false};
}

// A whole class, start to finish, used for replicate runs.
function runClass(P){
  const shoe=makeShoe(P.N),g0=[];
  for(let i=0;i<P.N;i++)g0.push(makeInd([shoe.pop(),shoe.pop()],P,i===0));
  const g1=mate(g0,P);
  const h2=fitLine(g1.map(o=>o.mid),g1.map(o=>o.p)).b;
  const sel=applySelection(g1,P),sv=g1.filter((_,i)=>sel.keep[i]);
  const m1=mean(g1.map(o=>o.p)),ms=mean(sv.map(o=>o.p));
  const g2=mate(sv,P),m2=mean(g2.map(o=>o.p));
  return{h2,S:ms-m1,Rpred:h2*(ms-m1),Robs:m2-m1};
}
/* ---------- SVG charts (drawn to scale from one scale per axis) ---------- */
const fmt=(x,d=2)=>Number.isFinite(x)?x.toFixed(d).replace('-','−'):'–';
const sgn=(x,d=2)=>Number.isFinite(x)?(x>0?'+':'')+fmt(x,d):'–';
function niceStep(r){const p=Math.pow(10,Math.floor(Math.log10(r)));const f=r/p;return(f<1.5?1:f<3?2:f<7?5:10)*p;}
function ticks(lo,hi,n){const st=niceStep((hi-lo)/n||1),a=[];for(let v=Math.ceil(lo/st-1e-9)*st;v<=hi+1e-9;v+=st)a.push(+v.toFixed(6));return a;}
const tl=v=>String(v).replace('-','−');

function xAxis(tk,X,y,title,W,mr){
  return tk.map(v=>`<line class="gl" x1="${X(v)}" x2="${X(v)}" y1="${y}" y2="${y+4}"/><text x="${X(v)}" y="${y+16}" text-anchor="middle">${tl(v)}</text>`).join('')
   +`<line class="ax" x1="${X(tk[0])}" x2="${X(tk[tk.length-1])}" y1="${y}" y2="${y}"/>`
   +(title?`<text x="${W-mr}" y="${y+30}" text-anchor="end">${title}</text>`:'');
}

// Histogram of phenotypes. removed[] shades individuals selected against. marks: [{x,label,cls}]
function hist(vals,removed,marks){
  const W=560,H=210,m={l:34,r:12,t:30,b:38};
  const all=vals.concat(marks.map(k=>k.x));
  let lo=Math.floor(Math.min(...all))-1,hi=Math.ceil(Math.max(...all))+1;
  const bw=Math.max(1,Math.round((hi-lo)/16));lo=Math.floor(lo/bw)*bw;hi=Math.ceil(hi/bw)*bw;
  const nb=Math.round((hi-lo)/bw),kc=Array(nb).fill(0),oc=Array(nb).fill(0);
  vals.forEach((v,i)=>{const b=Math.min(nb-1,Math.max(0,Math.floor((v-lo)/bw)));(removed&&removed[i]?oc:kc)[b]++;});
  const maxC=Math.max(1,...kc.map((k,i)=>k+oc[i]));
  const X=v=>m.l+(v-lo)/(hi-lo)*(W-m.l-m.r),Y=c=>H-m.b-c/maxC*(H-m.t-m.b);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Histogram of phenotype values">`;
  ticks(0,maxC,4).filter(Number.isInteger).forEach(c=>{s+=`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${Y(c)}" y2="${Y(c)}"/><text x="${m.l-6}" y="${Y(c)+4}" text-anchor="end">${c}</text>`;});
  for(let b=0;b<nb;b++){
    const x0=X(lo+b*bw)+1,w=X(lo+(b+1)*bw)-X(lo+b*bw)-2;
    if(kc[b])s+=`<rect class="keep" x="${x0}" y="${Y(kc[b])}" width="${w}" height="${Y(0)-Y(kc[b])}"/>`;
    if(oc[b])s+=`<rect class="out" x="${x0}" y="${Y(kc[b]+oc[b])}" width="${w}" height="${Y(kc[b])-Y(kc[b]+oc[b])}"/>`;
  }
  s+=xAxis(ticks(lo,hi,8),X,H-m.b,'phenotype',W,m.r);
  marks.forEach((k,i)=>{const right=X(k.x)>W/2;s+=`<line class="${k.cls}" x1="${X(k.x)}" x2="${X(k.x)}" y1="${m.t-4+i*0}" y2="${H-m.b}"/><text class="${k.cls==='mk1'?'t1':'t0'}" x="${X(k.x)+(right?-4:4)}" y="${12+i*12}" text-anchor="${right?'end':'start'}">${k.label}</text>`;});
  return s+'</svg>';
}

// Offspring vs mid-parent scatter with least-squares line. The slope estimates h^2.
function scatter(off){
  const W=560,H=320,m={l:40,r:14,t:14,b:40};
  const xs=off.map(o=>o.mid),ys=off.map(o=>o.p),all=xs.concat(ys);
  const lo=Math.floor(Math.min(...all))-1,hi=Math.ceil(Math.max(...all))+1;
  const X=v=>m.l+(v-lo)/(hi-lo)*(W-m.l-m.r),Y=v=>H-m.b-(v-lo)/(hi-lo)*(H-m.t-m.b);
  const fit=fitLine(xs,ys),tk=ticks(lo,hi,6);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of offspring phenotype against mid-parent phenotype">`;
  tk.forEach(v=>{s+=`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${m.l-6}" y="${Y(v)+4}" text-anchor="end">${tl(v)}</text>`;});
  s+=xAxis(tk,X,H-m.b,'mid-parent phenotype',W,m.r)+`<text x="${m.l}" y="${m.t-2}">offspring phenotype</text>`;
  off.forEach(o=>{if(!o.isYou)s+=`<circle class="dot" cx="${X(o.mid)}" cy="${Y(o.p)}" r="4"/>`;});
  off.forEach(o=>{if(o.isYou)s+=`<circle class="you" cx="${X(o.mid)}" cy="${Y(o.p)}" r="6"><title>You</title></circle>`;});
  s+=`<line class="fit" x1="${X(lo)}" y1="${Y(fit.a+fit.b*lo)}" x2="${X(hi)}" y2="${Y(fit.a+fit.b*hi)}"/>`;
  return s+'</svg>';
}

// Predicted vs observed response, as bars either side of zero.
function compareBars(pred,obs){
  const W=560,H=96,l=110,r=70,mx=Math.max(Math.abs(pred),Math.abs(obs),0.5)*1.15;
  const X=v=>l+(v+mx)/(2*mx)*(W-l-r),z=X(0);
  const bar=(v,y,c)=>`<rect class="${c}" x="${Math.min(z,X(v))}" y="${y}" width="${Math.abs(X(v)-z)}" height="22"/><text class="lab" x="${v>=0?X(v)+6:X(v)-6}" y="${y+15}" text-anchor="${v>=0?'start':'end'}">${sgn(v)}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Predicted and observed response to selection">
    <line class="ax" x1="${z}" x2="${z}" y1="6" y2="${H-8}"/>
    <text x="${l-10}" y="30" text-anchor="end">predicted R</text><text x="${l-10}" y="66" text-anchor="end">observed R</text>
    ${bar(pred,16,'pbar')}${bar(obs,52,'obar')}</svg>`;
}

// Replicate classes: observed R against predicted R with the 1:1 line.
function repScatter(pts){
  const W=560,H=320,m={l:40,r:14,t:16,b:40};
  const all=pts.flatMap(p=>[p.Rpred,p.Robs]);
  const lo=Math.floor(Math.min(...all,0)-1),hi=Math.ceil(Math.max(...all,0)+1);
  const X=v=>m.l+(v-lo)/(hi-lo)*(W-m.l-m.r),Y=v=>H-m.b-(v-lo)/(hi-lo)*(H-m.t-m.b),tk=ticks(lo,hi,6);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Observed response against predicted response for many simulated classes">`;
  tk.forEach(v=>{s+=`<line class="gl" x1="${m.l}" x2="${W-m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${m.l-6}" y="${Y(v)+4}" text-anchor="end">${tl(v)}</text>`;});
  s+=xAxis(tk,X,H-m.b,'predicted R = h²S',W,m.r)+`<text x="${m.l}" y="${m.t-4}">observed R</text>`;
  s+=`<line class="one" x1="${X(lo)}" y1="${Y(lo)}" x2="${X(hi)}" y2="${Y(hi)}"/>`;
  pts.forEach(p=>{s+=`<circle class="dot" cx="${X(p.Rpred)}" cy="${Y(p.Robs)}" r="3"/>`;});
  return s+'</svg>';
}
/* ---------- Interface ---------- */
const $=s=>document.querySelector(s);
let S=null;

function readCfg(){
  const N=Math.min(200,Math.max(8,Math.round((+$('#cfgN').value||32)/2)*2));
  let lo=Math.round(+$('#cfgLo').value),hi=Math.round(+$('#cfgHi').value);
  if(!Number.isFinite(lo))lo=-9;if(!Number.isFinite(hi))hi=9;if(lo>hi)[lo,hi]=[hi,lo];
  lo=Math.max(-40,lo);hi=Math.min(40,hi);
  const frac=Math.min(50,Math.max(10,Math.round(+$('#cfgFrac').value)||25));
  return{N,env:$('#cfgEnv').checked,lo,hi,dom:$('#cfgDom').checked,sel:$('#cfgSel').value,frac};
}
function writeCfg(P){$('#cfgN').value=P.N;$('#cfgLo').value=P.lo;$('#cfgHi').value=P.hi;$('#cfgFrac').value=P.frac;}
function updateCfgUI(){
  const on=$('#cfgEnv').checked;
  $('#cfgFrac').disabled=$('#cfgSel').value==='coin';
  $('#cfgLo').disabled=$('#cfgHi').disabled=!on;
  const a=Math.round(+$('#cfgLo').value),b=Math.round(+$('#cfgHi').value),lo=Math.min(a,b),hi=Math.max(a,b),n=hi-lo+1;
  $('#envInfo').textContent=on&&Number.isFinite(n)
    ?`Environment: integers from ${tl(lo)} to ${hi}, equally likely. Mean ${fmt((lo+hi)/2,1)}, variance ${fmt((n*n-1)/12,1)}. Settings apply when you start a new class.`
    :'Environment is off, so phenotype equals genotype. Settings apply when you start a new class.';
}
function newClass(){const P=readCfg();writeCfg(P);S={P,shoe:makeShoe(P.N),stage:0,youEnv:false};updateCfgUI();renderAll();}

/* ----- small builders ----- */
function cardEl(c,mini){const r=RANKS[c.r],s=SUITS[c.s].s;
  return `<div class="card${c.black?'':' red'}${mini?' mini':''}" role="img" aria-label="${r} of ${SUITS[c.s].n}"><span class="idx">${r}<br>${s}</span><span class="pip">${s}</span><span class="idx b">${r}<br>${s}</span></div>`;}
const backEl='<div class="card back" role="img" aria-label="face-down card"></div>';
const slot=(inner,cap)=>`<figure class="slot">${inner}<figcaption>${cap}</figcaption></figure>`;
const kpi=(label,val)=>`<div class="kpi"><span>${label}</span><div class="big">${val}</div></div>`;
function chips(pop,keep){return pop.map((o,i)=>`<div class="chip${o.isYou?' you':''}${keep&&!keep[i]?' out':''}" title="#${i+1}: ${cardName(o.cards[0])} + ${cardName(o.cards[1])}, genotype ${o.g}${S.P.env?', environment '+sgn(o.env,0)+', phenotype '+o.p:''}">${o.p}</div>`).join('');}
function stats(pop){
  const g=pop.map(o=>o.g),p=pop.map(o=>o.p),vg=variance(g),vp=variance(p);
  return `<table class="stats"><tr><th>Mean genotype</th><td>${fmt(mean(g))}</td></tr><tr><th>Mean phenotype</th><td>${fmt(mean(p))}</td></tr><tr><th>Variance of genotype</th><td>${fmt(vg)}</td></tr><tr><th>Variance of phenotype</th><td>${fmt(vp)}</td></tr><tr class="hl"><th>Genotypic variance / phenotypic variance</th><td>${fmt(vp?vg/vp:0)}</td></tr></table>`;
}
const legend=(extra)=>`<div class="legend"><span><i class="sw" style="background:var(--you)"></i>you</span>${extra||''}<span>hover a student for their cards</span></div>`;
const active=n=>S.stage>=n-1&&(n!==2||S.youEnv);

/* ----- Step 1 ----- */
function body1(){
  const P=S.P,y=S.gen0&&S.gen0[0];
  const rule='Each card is one allele at a single locus. Ace = 1, face cards = 12, every other card = its number. Your genotype is the sum of your two alleles.'
    +(P.dom?' Dominance is on: black cards are dominant over red, so one black and one red card give twice the black card.':'')
    +(P.env?` Your phenotype is your genotype plus an environmental effect, an integer drawn uniformly from ${tl(P.lo)} to ${P.hi}.`:' Environmental effects are off, so your phenotype equals your genotype.');
  let h=`<div><h2>Draw your alleles</h2><p class="small" style="max-width:70ch">${rule}</p></div>`;
  h+='<div class="slots">';
  if(S.stage===0){
    h+=slot(backEl,'allele 1')+slot(backEl,'allele 2');
    if(P.env)h+=slot('<div class="stick back">?</div>','environment');
    h+='</div><div class="row"><button class="btn" data-act="draw" type="button">Draw two cards</button><span class="small">The class will draw too.</span></div>';
    return h;
  }
  h+=slot(cardEl(y.cards[0]),'value '+y.cards[0].v)+slot(cardEl(y.cards[1]),'value '+y.cards[1].v)+kpi('Genotype',y.g);
  if(P.env){
    h+=slot(S.youEnv?`<div class="stick">${sgn(y.env,0)}</div>`:'<div class="stick back">?</div>','environment');
    if(S.youEnv)h+=kpi('Phenotype',y.p);
  }
  h+='</div>';
  if(!S.youEnv){return h+'<div class="row"><button class="btn" data-act="env" type="button">Draw environment stick</button></div>';}
  h+=`<div class="two"><div class="panel"><h3>The class: phenotype of each student</h3><div class="chips">${chips(S.gen0)}</div>${legend()}</div>
    <div class="panel"><h3>Generation 0</h3>${stats(S.gen0)}</div></div>
    <div class="panel"><h3>Distribution of phenotypes</h3>${hist(S.gen0.map(o=>o.p),null,[{x:mean(S.gen0.map(o=>o.p)),label:'mean '+fmt(mean(S.gen0.map(o=>o.p))),cls:'mk0'}])}</div>
    <div class="predict"><h3>Predict</h3><p>What proportion of the phenotypic variation is due to genetic variation? Enter your prediction for the heritability h&sup2; (0 to 1).</p>
    <input id="predH" type="number" step="0.05" min="0" max="2" value="${S.predH??''}" aria-label="Predicted heritability"></div>`;
  return h;
}

/* ----- Step 2 ----- */
const blurb2='Pair up at random with the matching numbered stick. Average the two parents’ phenotypes to get the mid-parent score. Swap one card with your partner. The parents die and everyone becomes an offspring in generation 1. The slope of offspring against mid-parent phenotype is the heritability.';
function body2(){
  let h=`<div><h2>Mate and measure heritability</h2><p class="small" style="max-width:70ch">${blurb2}</p></div>`;
  if(!active(2))return h;
  if(S.stage===1)return h+'<div class="row"><button class="btn" data-act="mate" type="button">Mate and swap a card</button></div>';
  const P=S.P,y=S.gen1.find(o=>o.isYou),sw=y.swap;
  const why=(!P.env&&!P.dom)?'With one locus, purely additive alleles and no environment, all variation is genetic, so h² should be close to 1.'
    :'Environmental variation and dominance add variation that parents do not pass on, so the slope falls below 1.';
  h+=`<div class="two"><div class="panel"><h3>Your pairing</h3><div class="slots">${slot(cardEl(sw.kept,true),'kept')}${slot(cardEl(sw.got,true),'from partner')}</div>
    <p class="small" style="margin:10px 0 0">You paired with student #${sw.partnerId+1} (phenotype ${sw.partner.p}). The mid-parent score is ${fmt(y.mid,1)}. You gave away ${cardName(sw.gave)}. Your offspring genotype is ${y.g}${P.env?', the environmental effect is '+sgn(y.env,0)+' and the phenotype is '+y.p:''}.</p></div>
    <div class="panel"><h3>Generation 1</h3>${stats(S.gen1)}</div></div>
    <div class="panel"><h3>Offspring against mid-parent phenotype</h3>${scatter(S.gen1)}
    <div class="kpis" style="margin-top:10px">${kpi('Estimated h²',fmt(S.h2))}${S.predH!==undefined&&S.predH!==''?kpi('Your prediction',fmt(+S.predH)):''}</div>
    <p class="small" style="margin:10px 0 0">${why} Your point is the red dot. The amber line is the least-squares fit.</p></div>`;
  return h;
}

/* ----- Step 3 ----- */
function selDesc(P){
  if(P.sel==='coin')return 'Each student halves their phenotype, rounds to the nearest integer, and flips a coin that many times. Any heads means survival. Larger phenotypes survive more often, but nothing is guaranteed.';
  return `Selection removes about ${Math.round(P.N*P.frac/100)} of ${P.N} students: the ones with the ${P.sel==='truncHigh'?'highest':'lowest'} phenotypes. An even number must remain to form pairs.`;
}
function body3(){
  const P=S.P;
  let h=`<div><h2>Selection event</h2><p class="small" style="max-width:70ch">${selDesc(P)} Selection acts on phenotype, and the survivors’ mean tells you the selection differential S.</p></div>`;
  if(!active(3))return h;
  if(S.stage===2)return h+'<div class="row"><button class="btn" data-act="select" type="button">Run the selection event</button></div>';
  const yi=S.gen1.findIndex(o=>o.isYou),youKeep=S.keep[yi],nOut=S.keep.filter(v=>!v).length;
  let ov='';
  if(P.sel!=='coin'&&(P.env||P.dom)){
    const dir=P.sel==='truncHigh'?-1:1,ord=S.gen1.map((_,i)=>i).sort((a,b)=>dir*(S.gen1[a].g-S.gen1[b].g)).slice(0,nOut);
    const hit=ord.filter(i=>!S.keep[i]).length;
    ov=`<p class="small">Selection acts on phenotype, not genotype. Of the ${nOut} students removed, ${hit} also had genotypes among the ${nOut} most extreme in that direction.</p>`;
  }
  h+=`<div class="note">${youKeep?'You survived. You will mate again in step 4.':'You were selected against. You can keep following the class, but your alleles do not reach generation 2.'}${S.extra?' One extra survivor was removed at random so the survivors can form pairs.':''}</div>
    <div class="two"><div class="panel"><h3>Generation 1 after selection</h3><div class="chips">${chips(S.gen1,S.keep)}</div>${legend('<span><i class="sw" style="background:var(--amber)"></i>selected against</span>')}</div>
    <div class="panel"><h3>Selection and prediction</h3><div class="kpis">${kpi('S',sgn(S.Sd))}${kpi('h²',fmt(S.h2))}${kpi('R = h²S',sgn(S.Rpred))}</div>
    <p class="small" style="margin:10px 0 0">Mean before selection ${fmt(S.m1)}, after ${fmt(S.ms)}. The theory predicts a next-generation mean of ${fmt(S.m1+S.Rpred)}.</p>${ov}</div></div>
    <div class="panel"><h3>Phenotypes before and after selection</h3>${hist(S.gen1.map(o=>o.p),S.keep.map(v=>!v),[{x:S.m1,label:'before '+fmt(S.m1),cls:'mk0'},{x:S.ms,label:'survivors '+fmt(S.ms),cls:'mk1'}])}</div>
    <div class="predict"><h3>Predict</h3><p>Using R = h&sup2;S, what will the mean phenotype of generation 2 be? Enter your prediction.</p>
    <input id="predMean" type="number" step="0.1" value="${S.predMean??''}" aria-label="Predicted mean of generation 2"></div>`;
  return h;
}

/* ----- Step 4 ----- */
function body4(){
  let h=`<div><h2>Second round of mating</h2><p class="small" style="max-width:70ch">The survivors pick new mating sticks and swap alleles again. Their offspring are generation 2. If heritability and selection are both present, the class mean should shift by about R.</p></div>`;
  if(!active(4))return h;
  if(S.stage===3)return h+'<div class="row"><button class="btn" data-act="mate2" type="button">Mate the survivors</button></div>';
  const P=S.P,m0=mean(S.gen0.map(o=>o.p)),diff=S.Robs-S.Rpred,se=Math.sqrt(variance(S.gen2.map(o=>o.p))/S.gen2.length),tol=2*Math.SQRT2*se;
  const dirOk=Math.sign(S.Robs)===Math.sign(S.Rpred);
  const row=(a,b,c)=>`<tr${c?' class="hl"':''}><th>${a}</th><td>${b}</td></tr>`;
  h+=`<div class="two"><div class="panel"><h3>Class data</h3><div class="table-wrap"><table class="stats">
    ${row('Generation 0 mean',fmt(m0))}${row('Generation 1 mean',fmt(S.m1))}${row('Heritability h²',fmt(S.h2))}${row('Generation 1 mean after selection',fmt(S.ms))}${row('Selection differential S',sgn(S.Sd))}${row('Generation 2 mean',fmt(S.m2))}${row('Response R (observed)',sgn(S.Robs),1)}${row('Response R = h²S (predicted)',sgn(S.Rpred),1)}
    ${S.predH!==undefined&&S.predH!==''?row('Your predicted h²',fmt(+S.predH)):''}${S.predMean!==undefined&&S.predMean!==''?row('Your predicted generation 2 mean',fmt(+S.predMean)):''}</table></div></div>
    <div class="panel"><h3>Predicted and observed response</h3>${compareBars(S.Rpred,S.Robs)}
    <p style="margin:10px 0 0">The theory predicted ${sgn(S.Rpred)}. The class showed ${sgn(S.Robs)}, a gap of ${fmt(Math.abs(diff))}. ${dirOk?'The mean moved in the predicted direction.':'The mean did not move in the predicted direction.'} Sampling noise in a class of ${P.N} is roughly ±${fmt(tol,1)}, so the gap is ${Math.abs(diff)<=tol?'within':'larger than'} what chance alone usually produces.</p></div></div>
    <div class="panel"><h3>Generation 2 phenotypes</h3>${hist(S.gen2.map(o=>o.p),null,[{x:S.m1,label:'generation 1 mean '+fmt(S.m1),cls:'mk0'},{x:S.m2,label:'generation 2 mean '+fmt(S.m2),cls:'mk1'}])}</div>
    <div class="panel"><h3>Is one class enough?</h3><p class="small">A single small class is noisy. Run many simulated classes with your current settings and compare observed R with predicted R each time.</p>
    <div class="row" style="margin-bottom:10px"><button class="btn ghost" data-act="rep" type="button">Run 300 simulated classes</button></div>${S.rep?repHTML():''}</div>`;
  return h;
}
function repHTML(){
  const x=S.rep.map(p=>p.Rpred),y=S.rep.map(p=>p.Robs),f=fitLine(x,y);
  return repScatter(S.rep)+`<p class="small" style="margin:10px 0 0">Across ${S.rep.length} classes the average predicted R was ${sgn(mean(x))} and the average observed R was ${sgn(mean(y))}. The slope of observed on predicted R is ${fmt(f.b)}; a slope of 1 on the dashed line would be a perfect match.</p>`;
}

/* ----- wiring ----- */
const BODIES=[null,body1,body2,body3,body4];
function renderStep(n){$('#step'+n).classList.toggle('locked',!active(n));$('#body'+n).innerHTML=BODIES[n]();}
function renderAll(){[1,2,3,4].forEach(renderStep);}
const ACT={
  draw(){const P=S.P,sh=S.shoe,pop=[];for(let i=0;i<P.N;i++)pop.push(makeInd([sh.pop(),sh.pop()],P,i===0));S.gen0=pop;S.stage=1;S.youEnv=!P.env;renderAll();},
  env(){S.youEnv=true;renderAll();},
  mate(){S.gen1=mate(S.gen0,S.P);S.h2=fitLine(S.gen1.map(o=>o.mid),S.gen1.map(o=>o.p)).b;S.stage=2;renderAll();},
  select(){const r=applySelection(S.gen1,S.P);S.keep=r.keep;S.extra=r.extra;S.sv=S.gen1.filter((_,i)=>r.keep[i]);
    S.m1=mean(S.gen1.map(o=>o.p));S.ms=mean(S.sv.map(o=>o.p));S.Sd=S.ms-S.m1;S.Rpred=S.h2*S.Sd;S.stage=3;renderAll();},
  mate2(){S.gen2=mate(S.sv,S.P);S.m2=mean(S.gen2.map(o=>o.p));S.Robs=S.m2-S.m1;S.stage=4;renderAll();},
  rep(){const pts=[];for(let i=0;i<300;i++)pts.push(runClass(S.P));S.rep=pts;renderStep(4);}
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled&&ACT[b.dataset.act])ACT[b.dataset.act]();});
document.addEventListener('input',e=>{
  if(!S)return;
  if(e.target.id==='predH')S.predH=e.target.value;
  else if(e.target.id==='predMean')S.predMean=e.target.value;
  else if(e.target.closest&&e.target.closest('.settings'))updateCfgUI();
});
$('#newClass').addEventListener('click',newClass);
newClass();
