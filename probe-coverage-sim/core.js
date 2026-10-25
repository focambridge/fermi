/* Probe-coverage simulator: simulation core.
   Works as a classic browser script (loaded by index.html) and as a Node module. */
'use strict';
const GRID=100, CELL=1000, RG=50000, HOP=7, AU_LY=63241, WINDOW=1e8;
const DISK_STARS=1e11, BULGE_STARS=2e10, RD=8500, SB=3000;
const SUN={x:-21000,y:15300};

function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}

const cellAt=new Int32Array(GRID*GRID).fill(-1);
const _cx=[],_cy=[],_gi=[],_gj=[];
for(let j=0;j<GRID;j++)for(let i=0;i<GRID;i++){
  const x=(i+0.5)*CELL-RG,y=(j+0.5)*CELL-RG;
  if(Math.hypot(x,y)<=RG){cellAt[j*GRID+i]=_cx.length;_cx.push(x);_cy.push(y);_gi.push(i);_gj.push(j);}
}
const NC=_cx.length;
const cx=Float64Array.from(_cx), cy=Float64Array.from(_cy), gi=Int32Array.from(_gi), gj=Int32Array.from(_gj);
const stars=new Float64Array(NC);
(function(){
  let sd=0,sb=0;const d=new Float64Array(NC),b=new Float64Array(NC);
  for(let k=0;k<NC;k++){const r=Math.hypot(cx[k],cy[k]);d[k]=Math.exp(-r/RD);b[k]=Math.exp(-r*r/(2*SB*SB));sd+=d[k];sb+=b[k];}
  for(let k=0;k<NC;k++)stars[k]=DISK_STARS*d[k]/sd+BULGE_STARS*b[k]/sb;
})();
let TOTAL=0;const cumStars=new Float64Array(NC);
for(let k=0;k<NC;k++){TOTAL+=stars[k];cumStars[k]=TOTAL;}
const sunCell=cellAt[Math.floor((SUN.y+RG)/CELL)*GRID+Math.floor((SUN.x+RG)/CELL)];

const nbStart=new Int32Array(NC+1);const _nl=[],_nd=[];
for(let k=0;k<NC;k++){
  nbStart[k]=_nl.length;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;const ii=gi[k]+dx,jj=gj[k]+dy;
    if(ii<0||jj<0||ii>=GRID||jj>=GRID)continue;const n=cellAt[jj*GRID+ii];if(n<0)continue;
    _nl.push(n);_nd.push(dx&&dy?CELL*Math.SQRT2:CELL);
  }
}
nbStart[NC]=_nl.length;
const nbList=Int32Array.from(_nl), nbDist=Float64Array.from(_nd);

class Heap{
  constructor(){this.k=[];this.v=[];this.lastKey=0;}
  get size(){return this.k.length;}
  push(key,val){const k=this.k,v=this.v;let i=k.length;k.push(key);v.push(val);
    while(i>0){const p=(i-1)>>1;if(k[p]<=key)break;k[i]=k[p];v[i]=v[p];i=p;}k[i]=key;v[i]=val;}
  pop(){const k=this.k,v=this.v;const topK=k[0],topV=v[0];const lk=k.pop(),lv=v.pop();const n=k.length;
    if(n>0){let i=0;for(;;){const l=2*i+1;if(l>=n)break;const r=l+1;const m=(r<n&&k[r]<k[l])?r:l;if(k[m]>=lk)break;k[i]=k[m];v[i]=v[m];i=m;}k[i]=lk;v[i]=lv;}
    this.lastKey=topK;return topV;}
}

function makeCfg(p){
  const v=p.speed/100, d=p.near/AU_LY;
  return {strategy:p.strategy,K:p.probes*d*d/4,v,range:p.range,prefer:p.prefer,lifeShare:p.lifeShare,
    probes:p.probes,reliab:p.reliab,vEff:HOP/(HOP/v+p.pause),T:p.period*1e6};
}

function genCivs(rng,p,cfg){
  const civs=[];
  for(let n=0;n<p.civs;n++){
    const u=rng()*TOTAL;let lo=0,hi=NC-1;
    while(lo<hi){const mid=(lo+hi)>>1;if(cumStars[mid]<u)lo=mid+1;else hi=mid;}
    const k=lo,x=cx[k]+(rng()-0.5)*CELL,y=cy[k]+(rng()-0.5)*CELL,t0=rng()*cfg.T;
    civs.push({x,y,k,t0,L:p.life,rSun:Math.hypot(x-SUN.x,y-SUN.y),rep:false,launch:Infinity,cL:0,cO:0,ownW:0,sunTime:Infinity});
  }
  const nRep=Math.round(p.repShare/100*p.civs);
  if(nRep>0){
    const idx=Array.from({length:civs.length},(_,i)=>i);
    for(let i=0;i<nRep;i++){
      const j=i+Math.floor(rng()*(idx.length-i));const tmp=idx[i];idx[i]=idx[j];idx[j]=tmp;
      const c=civs[idx[i]];c.rep=true;c.launch=c.t0+rng()*c.L;
    }
  }
  return civs;
}

function prepAimed(c,cfg){
  const R=cfg.range;let S_=0;
  if(R<CELL*0.75){c.ownW=Math.min(1,Math.PI*R*R/(CELL*CELL));S_=stars[c.k]*c.ownW;}
  else{
    for(let i=0;i<NC;i++){
      const dx=cx[i]-c.x,dy=cy[i]-c.y,r=Math.sqrt(dx*dx+dy*dy);
      if(r>R+CELL*0.5)continue;const ww=Math.min(1,(R-r)/CELL+0.5);if(ww>0)S_+=stars[i]*ww;
    }
  }
  if(S_<=0){c.cL=c.cO=0;return;}
  const N=cfg.probes;
  if(cfg.prefer){
    const Sl=cfg.lifeShare*S_;
    if(N<=Sl){c.cL=N/Sl;c.cO=0;}else{c.cL=1;c.cO=Math.min(1,(N-Sl)/Math.max(1,S_-Sl));}
  }else{c.cL=c.cO=Math.min(1,N/S_);}
}

function fracAt(c,t,v){const tau=t-c.t0-c.rSun/v;if(tau<=0)return 0;return c.L>0?Math.min(1,tau/c.L):1;}

function sunWin(civs,ta,tb,cfg){
  let lg=0,ex=0;
  for(const c of civs){
    if(c.rep)continue;
    const d=fracAt(c,tb,cfg.v)-fracAt(c,ta,cfg.v);if(d<=0)continue;
    if(cfg.strategy==='random'){const r=Math.max(c.rSun,50);const E=cfg.K/(r*r)*d;lg-=E;ex+=E;}
    else{if(c.rSun>cfg.range)continue;const a=c.cL*d;ex+=a;lg+=a>=1?-Infinity:Math.log1p(-a);}
  }
  return {lg,ex};
}

const distBuf=new Float64Array(NC);
function wave(c,cfg,rng,settle,stopAtSun){
  distBuf.fill(Infinity);const h=new Heap();distBuf[c.k]=c.launch;h.push(c.launch,c.k);
  let size=0,pruned=false,dominated=false,sunTime=Infinity;
  const prune=settle&&cfg.reliab>=0.4;
  while(h.size){
    const u=h.pop(),tu=h.lastKey;if(tu>distBuf[u])continue;size++;
    if(settle){if(tu<settle[u])settle[u]=tu;else if(prune){dominated=true;continue;}}
    if(u===sunCell){sunTime=tu;if(stopAtSun)break;}
    for(let e=nbStart[u];e<nbStart[u+1];e++){
      const nb=nbList[e];if(distBuf[nb]<=tu)continue;
      if(rng()>=cfg.reliab)continue;
      const tn=tu+nbDist[e]/cfg.vEff*(0.85+0.3*rng());
      if(tn>cfg.T){pruned=true;continue;}
      if(tn<distBuf[nb]){distBuf[nb]=tn;h.push(tn,nb);}
    }
  }
  return {size,pruned,dominated,sunTime};
}

function pSunAt(st,t){if(st.settle[sunCell]<=t)return 1;return -Math.expm1(sunWin(st.civs,0,t,st.cfg).lg);}

function simulate(p,seed){
  const cfg=makeCfg(p),rng=mulberry32(seed),civs=genCivs(rng,p,cfg);
  if(cfg.strategy==='aimed')for(const c of civs)if(!c.rep)prepAimed(c,cfg);
  const settle=new Float64Array(NC).fill(Infinity);let released=0,fizzled=0;
  const reps=civs.filter(c=>c.rep&&c.launch<=cfg.T).sort((a,b)=>a.launch-b.launch);
  for(const c of reps){
    released++;
    const r=wave(c,cfg,rng,settle,false);c.sunTime=r.sunTime;
    if(!r.pruned&&!r.dominated&&r.size<NC*0.5)fizzled++;
  }
  const st={p,cfg,civs,settle,released,fizzled,T:cfg.T};
  const M=200;st.spark=new Float64Array(M+1);
  for(let m=0;m<=M;m++)st.spark[m]=pSunAt(st,m/M*cfg.T);
  return st;
}

function addA(logL,logO,i,c,m,two){
  const a=c.cL*m;logL[i]+=a>=1?-Infinity:Math.log1p(-a);
  if(two){const b=c.cO*m;logO[i]+=b>=1?-Infinity:Math.log1p(-b);}
}

function makeField(){return {logL:new Float64Array(NC),logO:new Float64Array(NC),cov:new Float32Array(NC),rep:new Uint8Array(NC),gal:0,life:0};}

function field(st,t,out){
  const cfg=st.cfg,v=cfg.v,random=cfg.strategy==='random',two=!random&&cfg.prefer;
  const logL=out.logL,logO=out.logO;logL.fill(0);if(two)logO.fill(0);
  for(const c of st.civs){
    if(c.rep||t<=c.t0)continue;
    const reach=v*(t-c.t0),L=c.L;
    if(random){
      const K=cfg.K;if(!(K>0))continue;
      const reach2=reach*reach,fullR=v*(t-c.t0-L),fullR2=fullR>0?fullR*fullR:-1;
      for(let i=0;i<NC;i++){
        const dx=cx[i]-c.x,dy=cy[i]-c.y,r2=dx*dx+dy*dy;if(r2>reach2)continue;
        const rr2=r2<2500?2500:r2;
        if(r2<=fullR2){logL[i]-=K/rr2;continue;}
        const tau=t-c.t0-Math.sqrt(r2)/v,f=L>0?(tau>=L?1:tau/L):1;
        logL[i]-=K/rr2*f;
      }
    }else{
      if(c.cL<=0&&c.cO<=0)continue;const R=cfg.range;
      if(R<CELL*0.75){
        const r=R*0.5;if(r>reach)continue;const tau=t-c.t0-r/v,f=L>0?Math.min(1,tau/L):1;
        addA(logL,logO,c.k,c,f*c.ownW,two);
      }else{
        const lim=Math.min(reach,R+CELL*0.5);
        for(let i=0;i<NC;i++){
          const dx=cx[i]-c.x,dy=cy[i]-c.y,r=Math.sqrt(dx*dx+dy*dy);if(r>lim)continue;
          const ww=(R-r)/CELL+0.5;if(ww<=0)continue;
          const tau=t-c.t0-r/v,f=L>0?(tau>=L?1:tau/L):1;
          addA(logL,logO,i,c,f*(ww>1?1:ww),two);
        }
      }
    }
  }
  const cov=out.cov,rep=out.rep,fl=cfg.lifeShare;let gal=0,life=0;
  for(let i=0;i<NC;i++){
    let a=-Math.expm1(logL[i]),b=two?-Math.expm1(logO[i]):a;
    const isRep=st.settle[i]<=t;rep[i]=isRep?1:0;if(isRep){a=1;b=1;}
    const cv=two?fl*a+(1-fl)*b:a;cov[i]=cv;gal+=stars[i]*cv;life+=stars[i]*a;
  }
  out.gal=gal/TOTAL;out.life=life/TOTAL;return out;
}

function sunStats(st,t){
  const cfg=st.cfg,all=sunWin(st.civs,0,t,cfg),repSun=st.settle[sunCell]<=t;
  const pSun=repSun?1:-Math.expm1(all.lg);
  const ta=Math.max(0,t-WINDOW),rec=sunWin(st.civs,ta,t,cfg);
  let repRecent=false,visNow=0,ever=0,reach=0;
  for(const c of st.civs){
    const arr=c.t0+c.rSun;if(arr<=t){ever++;if(t<=arr+c.L)visNow++;}
    if(c.rep){if(c.launch<=t&&c.launch+c.rSun/cfg.vEff<=t)reach++;if(c.sunTime<=t&&c.sunTime>ta)repRecent=true;}
    else if(t>c.t0&&cfg.v*(t-c.t0)>=c.rSun&&(cfg.strategy==='random'||c.rSun<=cfg.range))reach++;
  }
  const pRecent=repRecent?1:-Math.expm1(rec.lg);
  return {pSun,pRecent,ex:all.ex,visNow,ever,reach};
}

function sunOnce(p,cfg,sd){
  const rng=mulberry32(sd),civs=genCivs(rng,p,cfg);
  if(cfg.strategy==='aimed')for(const c of civs)if(!c.rep&&c.rSun<=cfg.range)prepAimed(c,cfg);
  for(const c of civs){
    if(!c.rep||c.launch>cfg.T)continue;
    const r=wave(c,cfg,rng,null,true);if(r.sunTime<=cfg.T)return {p:1,rep:true};
  }
  return {p:-Math.expm1(sunWin(civs,0,cfg.T,cfg).lg),rep:false};
}

if(typeof module!=='undefined'&&module.exports){
  module.exports={simulate,field,makeField,sunStats,sunOnce,makeCfg,pSunAt,genCivs,
    sunCell,stars,cx,cy,NC,TOTAL,GRID,CELL,RG,HOP,AU_LY,WINDOW,SUN};
}
