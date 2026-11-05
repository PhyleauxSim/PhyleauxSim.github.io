/* Card Lab Student Station: one student's path through the exercise. */
const RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SUITS=[{s:'♠',n:'spades',black:true},{s:'♥',n:'hearts',black:false},{s:'♦',n:'diamonds',black:false},{s:'♣',n:'clubs',black:true}];
const rankValue=r=>r===0?1:(r>=10?12:r+1);
const mkCard=(r,s)=>({r,s,v:rankValue(r),black:SUITS[s].black});
const cardName=c=>RANKS[c.r]+SUITS[c.s].s;
const randInt=(lo,hi)=>lo+Math.floor(Math.random()*(hi-lo+1));
const tl=v=>String(v).replace('-','−');
const sgn=v=>(v>0?'+':'')+tl(v);
const fmt=(x,d=1)=>tl(Number(x).toFixed(d));
const $=s=>document.querySelector(s);
const KEY='card-lab-student-v1';

function makeDeck(){const d=[];for(let s=0;s<4;s++)for(let r=0;r<13;r++)d.push(mkCard(r,s));return d;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function genotype(c,dom){return dom&&c[0].black!==c[1].black?2*(c[0].black?c[0].v:c[1].v):c[0].v+c[1].v;}

/* ---------- state ---------- */
const defaultCfg=()=>({env:true,lo:-9,hi:9,dom:false,sel:'gt',T:20});
let S={cfg:defaultCfg(),a:null,b:null,c:null,give1:null,give2:null,pp1:null,pp2:null,survived:null,flips:null,draft:{}};
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const t=localStorage.getItem(KEY);if(t){const o=JSON.parse(t);if(o&&o.cfg)S=Object.assign(S,o);}}catch(e){}}

/* stage is derived from what exists, so it can never disagree with the data */
const stage=()=>S.c?4:S.survived!==null?3:S.b?2:(S.a&&S.a.p!==undefined)?1:0;
const locked=()=>!!S.a;

/* ---------- settings ---------- */
function cfgToCode(c){return (c.env?`env:${c.lo}:${c.hi}`:'env:off')+`;dom:${c.dom?1:0};`+(c.sel==='coin'?'sel:coin':`sel:${c.sel}:${c.T}`);}
function parseCode(t){
  const c=defaultCfg();
  for(const part of t.trim().toLowerCase().split(';')){
    const p=part.trim().split(':');
    if(p[0]==='env'){if(p[1]==='off')c.env=false;else{c.env=true;c.lo=parseInt(p[1],10);c.hi=parseInt(p[2],10);if(!Number.isFinite(c.lo)||!Number.isFinite(c.hi))return null;}}
    else if(p[0]==='dom')c.dom=p[1]==='1';
    else if(p[0]==='sel'){if(p[1]==='coin')c.sel='coin';else if(p[1]==='gt'||p[1]==='lt'){c.sel=p[1];c.T=parseInt(p[2],10);if(!Number.isFinite(c.T))return null;}else return null;}
    else if(part.trim()!=='')return null;
  }
  if(c.lo>c.hi)[c.lo,c.hi]=[c.hi,c.lo];
  return c;
}
function readCfg(){
  const c=S.cfg;
  c.env=$('#cEnv').checked;c.dom=$('#cDom').checked;c.sel=$('#cSel').value;
  const lo=parseInt($('#cLo').value,10),hi=parseInt($('#cHi').value,10),T=parseInt($('#cT').value,10);
  if(Number.isFinite(lo))c.lo=Math.max(-40,Math.min(40,lo));if(Number.isFinite(hi))c.hi=Math.max(-40,Math.min(40,hi));
  if(c.lo>c.hi){const t=c.lo;c.lo=c.hi;c.hi=t;}
  if(Number.isFinite(T))c.T=T;
}
function syncCfgUI(skipNumbers){
  const c=S.cfg,L=locked();
  $('#cEnv').checked=c.env;$('#cDom').checked=c.dom;$('#cSel').value=c.sel;
  if(!skipNumbers){$('#cLo').value=c.lo;$('#cHi').value=c.hi;$('#cT').value=c.T;}
  $('#cEnv').disabled=$('#cDom').disabled=$('#cSel').disabled=$('#applyCode').disabled=L;
  $('#cLo').disabled=$('#cHi').disabled=L||!c.env;
  $('#cT').disabled=L||c.sel==='coin';
  $('#cCode').value=cfgToCode(c);$('#cCode').disabled=L;
  $('#cfgMsg').textContent=L?'Settings are locked while you work. Use Start over to change them.':
    (c.env?`Environment: integers from ${tl(c.lo)} to ${c.hi}, equally likely. `:'Environment is off. ')+(c.dom?'Dominance is on. ':'Dominance is off. ')+
    (c.sel==='coin'?'Selection is by coin flips.':`Students ${c.sel==='gt'?'above':'below'} ${tl(c.T)} are removed; ${tl(c.T)} itself survives.`);
}

/* ---------- builders ---------- */
function cardEl(c){const r=RANKS[c.r],s=SUITS[c.s].s;
  return `<div class="card${c.black?'':' red'}" role="img" aria-label="${r} of ${SUITS[c.s].n}"><span class="idx">${r}<br>${s}</span><span class="pip">${s}</span><span class="idx b">${r}<br>${s}</span></div>`;}
const backEl='<div class="card back" role="img" aria-label="face-down card"></div>';
const slot=(inner,cap)=>`<figure class="slot">${inner}<figcaption>${cap}</figcaption></figure>`;
const kpi=(l,v)=>`<div class="kpi"><span>${l}</span><div class="big">${v}</div></div>`;
const stick=(env)=>`<div class="stick">${sgn(env)}</div>`;
function indiv(ind,showEnv){
  let h='<div class="slots">'+slot(cardEl(ind.cards[0]),'value '+ind.cards[0].v)+slot(cardEl(ind.cards[1]),'value '+ind.cards[1].v)+kpi('Genotype',ind.g);
  if(S.cfg.env&&showEnv)h+=slot(stick(ind.env),'environment')+kpi('Phenotype',ind.p);
  return h+'</div>';
}
function pickerHTML(k){
  const d=S.draft,r=d['r'+k],s=d['s'+k];
  const ro=['<option value="">Rank</option>'].concat(RANKS.map((x,i)=>`<option value="${i}"${String(r)===String(i)?' selected':''}>${x}</option>`)).join('');
  const so=['<option value="">Suit</option>'].concat(SUITS.map((x,i)=>`<option value="${i}"${String(s)===String(i)?' selected':''}>${x.s} ${x.n}</option>`)).join('');
  return `<div class="picker"><label class="f">Rank<select id="r${k}" data-draft>${ro}</select></label><label class="f">Suit<select id="s${k}" data-draft>${so}</select></label></div>`;
}
function recvCard(k){const r=S.draft['r'+k],s=S.draft['s'+k];return(r===undefined||r===''||s===undefined||s==='')?null:mkCard(+r,+s);}
function ppValue(k){const t=S.draft['pp'+k];if(t===undefined||String(t).trim()==='')return null;const n=Number(t);return Number.isInteger(n)?n:NaN;}

/* ---------- step 1 ---------- */
function body1(){
  const c=S.cfg;
  let h='<div><h2>Draw your alleles</h2><p class="small" style="max-width:70ch">Each card is one allele. Your genotype is the sum of your two alleles'+(c.dom?', with dominance: one black and one red card count twice the black card':'')+'.'+(c.env?` Then draw an environmental effect, an integer from ${tl(c.lo)} to ${c.hi}, to get your phenotype.`:' Environmental effects are off, so your phenotype equals your genotype.')+'</p></div>';
  if(!S.a)return h+`<div class="slots">${slot(backEl,'allele 1')}${slot(backEl,'allele 2')}${c.env?slot('<div class="stick back">?</div>','environment'):''}</div><div class="row"><button class="btn" data-act="draw" type="button">Draw two cards</button></div>`;
  h+=indiv(S.a,S.a.p!==undefined);
  if(S.a.p===undefined){
    return h+`<div class="slots">${slot('<div class="stick back">?</div>','environment')}</div><div class="row"><button class="btn" data-act="env0" type="button">Draw environment stick</button></div>`;
  }
  return h+`<div class="note ok">Write down your <b>genotype ${S.a.g}</b>${c.env?` and <b>phenotype ${S.a.p}</b>`:''} and report ${c.env?'them':'it'} to your instructor.</div>`;
}

/* ---------- mating form, shared by steps 2 and 4 ---------- */
function matingForm(k,parent){
  const c=S.cfg,give=S['give'+k];
  let h='';
  if(k===1)h+=`<div class="panel"><h3>1. Find a partner</h3><p class="small">Pair up with a classmate and compare phenotypes. The mid-parent value is the average of your two phenotypes.</p>
    <label class="f" style="max-width:240px">Your partner&rsquo;s phenotype<input id="pp1" data-draft type="number" step="1" value="${S.draft.pp1??''}"></label></div>`;
  else h+=`<div class="panel"><h3>1. Find a new partner among the survivors</h3><p class="small">Your partner&rsquo;s phenotype is only needed if your instructor wants mid-parent values for this round.</p>
    <label class="f" style="max-width:240px">Your partner&rsquo;s phenotype (optional)<input id="pp2" data-draft type="number" step="1" value="${S.draft.pp2??''}"></label></div>`;
  h+=`<div class="panel"><h3>2. Choose the card to give away</h3>`;
  if(give===null)h+=`<p class="small">Flip a coin to decide which of your two cards goes to your partner.</p><div class="slots">${slot(backEl,'card A')}${slot(backEl,'card B')}</div><div class="row"><button class="btn" data-act="give${k}" type="button">Flip a coin</button></div>`;
  else h+=`<div class="slots">${slot(cardEl(parent.cards[give]),'give to partner')}${slot(cardEl(parent.cards[1-give]),'keep')}</div><p class="small" style="margin:10px 0 0">Hand ${cardName(parent.cards[give])} to your partner and keep ${cardName(parent.cards[1-give])}.</p>`;
  h+='</div>';
  const rc=recvCard(k);
  h+=`<div class="panel"><h3>3. Enter the card your partner gave you</h3><div class="two"><div>${pickerHTML(k)}</div><div class="slots"><div id="pv${k}">${rc?cardEl(rc):backEl}</div></div></div></div>
    <div class="row"><button class="btn" id="mk${k}" data-act="mate${k}" type="button">Create my offspring${c.env?' and draw environment':''}</button><span class="small" id="mkhint${k}"></span></div>`;
  return h;
}
function updForm(k){
  if(!$('#mk'+k))return;
  const pv=ppValue(k),rc=recvCard(k),give=S['give'+k];
  const ppOK=k===1?(pv!==null&&!Number.isNaN(pv)):(pv===null||!Number.isNaN(pv));
  const ok=give!==null&&rc&&ppOK;
  $('#mk'+k).disabled=!ok;
  $('#pv'+k).innerHTML=rc?cardEl(rc):backEl;
  $('#mkhint'+k).textContent=ok?'':(give===null?'Flip the coin first.':!ppOK?'Enter your partner’s phenotype as a whole number.':'Choose the rank and suit of the card you received.');
}

function body2(){
  let h='<div><h2>Mate and swap a card</h2><p class="small" style="max-width:70ch">You and a partner each give one randomly chosen card to the other. Your offspring has the card you kept plus the card you received. The parents then die, and the offspring is generation 1.</p></div>';
  if(stage()<1)return h;
  if(!S.b)return h+matingForm(1,S.a);
  const b=S.b;
  return h+indiv(b,true)+`<div class="kpis"><div class="kpi"><span>Mid-parent phenotype</span><div class="big">${fmt(b.mid,1)}</div></div><div class="kpi"><span>Offspring phenotype</span><div class="big">${b.p}</div></div></div>
    <div class="note ok">You gave away ${cardName(S.a.cards[S.give1])}, kept ${cardName(S.a.cards[1-S.give1])} and received ${cardName(b.cards[1])}. Report your mid-parent phenotype <b>${fmt(b.mid,1)}</b> and offspring phenotype <b>${b.p}</b> so the class can estimate heritability from the slope of offspring on mid-parent phenotype.</div>`;
}

/* ---------- step 3 ---------- */
function body3(){
  const c=S.cfg;
  let h='<div><h2>Selection event</h2><p class="small" style="max-width:70ch">'+(c.sel==='coin'?'Halve your phenotype and round to the nearest integer. That is how many coins you flip. If any lands heads, you survive.':`Selection acts on phenotype. Students with a phenotype ${c.sel==='gt'?'above':'below'} ${tl(c.T)} are removed. A phenotype of exactly ${tl(c.T)} survives.`)+'</p></div>';
  if(stage()<2)return h;
  const b=S.b;
  if(S.survived===null)return h+`<div class="kpis">${kpi('Your phenotype',b.p)}${c.sel==='coin'?kpi('Coins to flip',Math.max(0,Math.round(b.p/2))):kpi('Cutoff',tl(c.T))}</div><div class="row"><button class="btn" data-act="select" type="button">${c.sel==='coin'?'Flip the coins':'Apply selection'}</button></div>`;
  let why;
  if(c.sel==='coin'){const f=S.flips;why=f.length?`You flipped ${Math.round(b.p/2)} coin${Math.round(b.p/2)===1?'':'s'}`+(S.survived?` and got heads on flip ${f.length}.`:' and never got heads.'):'Your phenotype rounds to zero flips, so there was no chance of heads.';
    if(f.length)why+=`<div class="flips" aria-label="flip results">${f.map(x=>x?'H':'T').join(' ')}</div>`;}
  else why=`Your phenotype is ${b.p}, and the cutoff is ${tl(c.T)}.`;
  return h+`<div class="note ${S.survived?'ok':'bad'}"><b>${S.survived?'You survived.':'You were selected against.'}</b> ${why}</div>
    <p class="small">Tell your instructor whether you survived. The instructor will calculate the class means before and after selection, and from those the selection differential S.</p>`;
}

/* ---------- step 4 ---------- */
function body4(){
  let h='<div><h2>Second round of mating</h2><p class="small" style="max-width:70ch">Survivors find new partners and swap one random card again. Their offspring are generation 2.</p></div>';
  if(S.survived===null)return h;
  if(!S.survived)return h+'<div class="note bad">You were removed in step 3, so you do not mate this round. Watch the survivors, and report your values to your instructor.</div>';
  if(!S.c)return h+matingForm(2,S.b);
  const c=S.c;
  return h+indiv(c,true)+`<div class="note ok">You gave away ${cardName(S.b.cards[S.give2])}, kept ${cardName(S.b.cards[1-S.give2])} and received ${cardName(c.cards[1])}. Report your generation 2 phenotype <b>${c.p}</b>. The class mean of these values, compared with the generation 1 mean, is the observed response R.</div>`;
}

/* ---------- record ---------- */
function recordRows(){
  const a=S.a,b=S.b,c=S.c,cf=S.cfg;
  const n=x=>x?cardName(x.cards[0])+' '+cardName(x.cards[1]):'';
  return[['Gen 0 cards',a?n(a):''],['Gen 0 genotype',a?a.g:''],['Gen 0 environment',a&&cf.env&&a.env!==undefined?a.env:''],['Gen 0 phenotype',a&&a.p!==undefined?a.p:''],
    ['Partner phenotype (round 1)',S.pp1??''],['Mid-parent phenotype',b?b.mid:''],
    ['Gen 1 cards',n(b)],['Gen 1 genotype',b?b.g:''],['Gen 1 environment',b&&cf.env?b.env:''],['Gen 1 phenotype',b?b.p:''],
    ['Survived selection',S.survived===null?'':S.survived?'yes':'no'],
    ['Partner phenotype (round 2)',S.pp2??''],['Gen 2 cards',n(c)],['Gen 2 genotype',c?c.g:''],['Gen 2 environment',c&&cf.env?c.env:''],['Gen 2 phenotype',c?c.p:'']];
}
function renderRecord(){
  const el=$('#record'),done=S.c||(S.survived===false);
  el.hidden=!S.a;
  if(!S.a)return;
  const rows=recordRows();
  el.innerHTML=`<h3>Your results</h3><div class="table-wrap"><table class="stats sum">${rows.map(r=>`<tr><th>${r[0]}</th><td>${r[1]===''?'–':String(r[1]).replace('-','−')}</td></tr>`).join('')}</table></div>
    <p class="small" style="margin:10px 0 6px">${done?'Finished.':'Still in progress.'} One tab-separated row, ready to paste into a spreadsheet:</p>
    <textarea id="tsv" readonly aria-label="Results as one tab-separated row">${rows.map(r=>String(r[1])).join('\t')}</textarea>
    <div class="row" style="margin-top:8px"><button class="btn ghost" data-act="copytsv" type="button">Copy row</button><span class="small" id="copyMsg"></span></div>`;
}

/* ---------- actions ---------- */
function envDraw(){return S.cfg.env?randInt(S.cfg.lo,S.cfg.hi):0;}
function offspring(k,parent){
  const give=S['give'+k],rc=recvCard(k),pv=ppValue(k);
  const cards=[parent.cards[1-give],rc],g=genotype(cards,S.cfg.dom),env=envDraw();
  const o={cards,g,env,p:g+env};
  if(pv!==null){S['pp'+k]=pv;o.mid=(parent.p+pv)/2;}
  return o;
}
const ACT={
  draw(){const d=shuffle(makeDeck());const cards=[d[0],d[1]];S.a={cards,g:genotype(cards,S.cfg.dom)};
    if(!S.cfg.env){S.a.env=0;S.a.p=S.a.g;}render();},
  env0(){S.a.env=randInt(S.cfg.lo,S.cfg.hi);S.a.p=S.a.g+S.a.env;render();},
  give1(){S.give1=Math.random()<.5?0:1;render();},
  give2(){S.give2=Math.random()<.5?0:1;render();},
  mate1(){S.b=offspring(1,S.a);render();},
  mate2(){S.c=offspring(2,S.b);render();},
  select(){
    const c=S.cfg,p=S.b.p;
    if(c.sel==='coin'){const n=Math.max(0,Math.round(p/2)),f=[];for(let i=0;i<n;i++){const h=Math.random()<.5;f.push(h);if(h)break;}S.flips=f;S.survived=f.some(Boolean);}
    else S.survived=c.sel==='gt'?p<=c.T:p>=c.T;
    render();},
  copytsv(){
    const t=$('#tsv');
    const done=()=>{$('#copyMsg').textContent='Copied.';};
    const fallback=()=>{t.focus();t.select();$('#copyMsg').textContent='Press Ctrl+C (or Cmd+C) to copy the selected row.';};
    try{navigator.clipboard.writeText(t.value).then(done,fallback);}catch(e){fallback();}}
};
let resetArmed=0;
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');
  if(b&&!b.disabled&&ACT[b.dataset.act]){ACT[b.dataset.act]();if(b.dataset.act!=='copytsv')save();}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.hasAttribute&&t.hasAttribute('data-draft')){S.draft[t.id]=t.value;save();updForm(+t.id.slice(-1));}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.hasAttribute&&t.hasAttribute('data-draft')){S.draft[t.id]=t.value;save();updForm(+t.id.slice(-1));}
});
['#cEnv','#cDom','#cSel','#cLo','#cHi','#cT'].forEach(id=>$(id).addEventListener('input',()=>{if(locked())return;readCfg();syncCfgUI(true);save();render(true);}));
$('#applyCode').addEventListener('click',()=>{
  const c=parseCode($('#cCode').value);
  if(!c){$('#cfgMsg').textContent='That code was not recognized. A code looks like env:-9:9;dom:0;sel:gt:20';return;}
  S.cfg=c;syncCfgUI();save();render(true);
});
$('#copyCode').addEventListener('click',()=>{
  const v=cfgToCode(S.cfg),i=$('#cCode');
  const sel=()=>{i.focus();i.select();};
  try{navigator.clipboard.writeText(v).then(()=>{$('#cfgMsg').textContent='Code copied.';},sel);}catch(e){sel();}
});
$('#reset').addEventListener('click',()=>{
  const b=$('#reset');
  if(!resetArmed){resetArmed=1;b.textContent='Click again to erase your cards';setTimeout(()=>{resetArmed=0;b.textContent='Start over';},4000);return;}
  resetArmed=0;b.textContent='Start over';
  S={cfg:S.cfg,a:null,b:null,c:null,give1:null,give2:null,pp1:null,pp2:null,survived:null,flips:null,draft:{}};
  save();render();
});

/* ---------- render ---------- */
const BODIES=[null,body1,body2,body3,body4];
function render(keepForms){
  const st=stage();
  syncCfgUI(keepForms);
  [1,2,3,4].forEach(n=>{
    const unlocked=n===1||(n===2&&st>=1)||(n===3&&st>=2)||(n===4&&st>=3);
    $('#step'+n).classList.toggle('locked',!unlocked);
    $('#body'+n).innerHTML=BODIES[n]();
  });
  updForm(1);updForm(2);renderRecord();
}
load();render();
