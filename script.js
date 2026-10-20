(()=>{
"use strict";
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const top=$(".top"), fab=$("#fab");

/* ---------- hero v5: one real storefront photo; scroll pushes in to the door, the doors part, we step inside ---------- */
const hero=$("#hero"), cv=$("#film"), ctx=cv.getContext("2d",{alpha:false});
const intro=$("#intro"), hint=$("#hint"), hline=$("#hline"), hfade=$("#hfade"), hload=$("#hload");
const hEye=hline.querySelector(".eyebrow"), hWhere=hline.querySelector(".where");
const IW=1440, IH=2560;                       // every hero image is 1440 px wide (faithful 2x of the 720p source)
const DOOR={x0:0,x1:366,y0:958,y1:1752,seam:117}; // the real glass double door in the storefront photo
const SRC={front_s:"media/hero5/front_s.webp",front:"media/hero5/front.webp",hall:"media/hero5/hall.webp",coats:"media/hero5/coats.webp",shawls:"media/hero5/shawls.webp"};
const img={}; let nLoaded=0; const NIMG=Object.keys(SRC).length;
for(const k of Object.keys(SRC)){ const im=new Image(); im.decoding="async"; im.src=SRC[k];
  im.onload=()=>{ const done=()=>{ img[k]=im; nLoaded++; hload.style.transform=`scaleX(${nLoaded/NIMG})`; if(nLoaded===NIMG) hload.parentElement.style.opacity=0; kick(true); }; im.decode?im.decode().then(done,done):done(); }; }
const F=()=>img.front||img.front_s;
const FADE=/[?&]door=fade\b/.test(location.search);  // fallback: dissolve through the closed door instead of opening it
let vw=0,vh=0,dpr=1,hTop=0,hLen=1,panelW=0;
function size(){ vw=innerWidth; vh=innerHeight; dpr=Math.min(devicePixelRatio||1,2); cv.width=Math.round(vw*dpr); cv.height=Math.round(vh*dpr);
  ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high";
  hTop=hero.getBoundingClientRect().top+scrollY; hLen=Math.max(hero.offsetHeight-vh,1); }
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;   // cubic in-out
const seg=(p,a,b)=>clamp((p-a)/(b-a),0,1);
// viewport: whole screen on phones; on wide screens a full-height portrait panel (words beside it)
function viewport(){ const W=cv.width,H=cv.height; if(W/H>0.85){ const w=Math.round(H*0.5625); return {x:0,y:0,w,h:H,wide:true}; } return {x:0,y:0,w:W,h:H,wide:false}; }
// camera over an image: centre (cx,cy) + visible width Vw, clamped inside the image
function cam(V,cx,cy,Vw,iw=IW,ih=IH){ const a=V.w/V.h; let Vh=Vw/a; if(Vh>ih){Vh=ih;Vw=Vh*a;} if(Vw>iw){Vw=iw;Vh=Vw/a;}
  cx=clamp(cx,Vw/2,iw-Vw/2); cy=clamp(cy,Vh/2,ih-Vh/2); const k=V.w/Vw; return {k,ox:V.x+V.w/2-cx*k,oy:V.y+V.h/2-cy*k}; }
const sx=(c,x)=>c.ox+x*c.k, sy=(c,y)=>c.oy+y*c.k;
function coverDraw(im,V,zoom,fx=.5,fy=.5,alpha=1){ if(!im) return; const iw=im.naturalWidth,ih=im.naturalHeight; const s=Math.max(V.w/iw,V.h/ih)*zoom;
  const dw=iw*s,dh=ih*s; const x=clamp(V.x+V.w/2-fx*dw,V.x+V.w-dw,V.x), y=clamp(V.y+V.h/2-fy*dh,V.y+V.h-dh,V.y);
  ctx.globalAlpha=alpha; ctx.drawImage(im,x,y,dw,dh); ctx.globalAlpha=1; }
// one door leaf, swung inward about its hinge by angle th, drawn as perspective strips of its own real pixels
function leaf(c,im,sx0,sx1,hingeX,th,A=1){ const sc=im.naturalWidth/IW, dir=Math.sign(sx0+sx1-2*hingeX)||1;  // +1: leaf lies right of hinge
  const w=Math.abs((dir>0?sx1:sx0)-hingeX), yc=(DOOR.y0+DOOR.y1)/2, hgt=DOOR.y1-DOOR.y0, f=2.6*w, cs=Math.cos(th), sn=Math.sin(th), N=Math.max(24,Math.min(160,Math.round(w*cs*c.k/1.5)));
  for(let i=0;i<N;i++){ const xa=sx0+(sx1-sx0)*i/N, xb=sx0+(sx1-sx0)*(i+1)/N;
    const ua=Math.abs(xa-hingeX)/w, ub=Math.abs(xb-hingeX)/w, ka=f/(f+ua*w*sn), kb=f/(f+ub*w*sn);
    const da=hingeX+dir*ua*w*cs*ka, db=hingeX+dir*ub*w*cs*kb, k=(ka+kb)/2, hh=hgt*k;
    const X0=Math.min(da,db), X1=Math.max(da,db); if(X1-X0<.3) continue;
    ctx.globalAlpha=A; ctx.drawImage(im,xa*sc,DOOR.y0*sc,(xb-xa)*sc,hgt*sc,sx(c,X0),sy(c,yc-hh/2),(X1-X0)*c.k+.6,hh*c.k); ctx.globalAlpha=1;
    const shade=(.06+.30*sn*(0.4+0.6*(ua+ub)/2))*A; ctx.fillStyle=`rgba(10,12,20,${shade.toFixed(3)})`; ctx.fillRect(sx(c,X0),sy(c,yc-hh/2),(X1-X0)*c.k+.6,hh*c.k); } }
// timeline (fraction of the hero's scroll length)
const T={push0:.03,push1:.40,open0:.37,open1:.54,thru0:.50,thru1:.64,hall1:.76,coats0:.72,coats1:.78,shaw0:.86,shaw1:.92,end:.97};
function render(p){
  const W=cv.width,H=cv.height, V=viewport(); const front=F();
  ctx.fillStyle="#202539"; ctx.fillRect(0,0,W,H);
  if(V.wide&&panelW!==V.w){ panelW=V.w; hero.style.setProperty("--panel-text",`calc(100% - ${(V.w/dpr).toFixed(0)}px)`); }
  const a=V.w/V.h, dcx=(DOOR.x0+DOOR.x1)/2, dcy=(DOOR.y0+DOOR.y1)/2, dw=DOOR.x1-DOOR.x0, dh=DOOR.y1-DOOR.y0;
  const Vthru=Math.min(dw,dh*a)*0.9;          // doorway a little larger than the view: both leaves are out of shot
  const Vend=Math.min(Math.max(dw*1.75,640),IW);
  const tp=ease(seg(p,T.push0,T.push1)), tt=ease(seg(p,T.thru0,T.thru1)), to=ease(seg(p,T.open0,T.open1));
  if(p<T.thru1+0.002){
    // camera on the facade: whole storefront -> the door -> through the doorway (log-space zoom = constant-speed push)
    const V0=IW; let Vw=Math.exp(Math.log(V0)+(Math.log(Vend)-Math.log(V0))*tp); let cx=lerp(IW/2,dcx,tp), cy=lerp(IH/2,dcy,tp);
    if(tt>0){ Vw=Math.exp(Math.log(Vend)+(Math.log(Vthru)-Math.log(Vend))*tt); }
    const c=cam(V,cx,cy,Vw);
    const R={x:sx(c,DOOR.x0),y:sy(c,DOOR.y0),w:dw*c.k,h:dh*c.k};
    // the room behind the doors (real interior of the same branch)
    if(!FADE&&to>0&&img.hall){ ctx.save(); ctx.beginPath(); ctx.rect(R.x,R.y,R.w,R.h); ctx.clip();
      const sCov=Math.max(V.w/IW,V.h/IH), sR=Math.max(R.w/IW,R.h/IH), s=Math.max(sR,sCov*Math.pow(Math.min(R.w/V.w,1),.55));
      const iw=IW*s, ih=IH*s; ctx.drawImage(img.hall,R.x+R.w/2-iw/2,R.y+R.h/2-ih/2,iw,ih);
      ctx.fillStyle=`rgba(8,10,18,${(0.55*(1-to)).toFixed(3)})`; ctx.fillRect(R.x,R.y,R.w,R.h); ctx.restore(); }
    // the facade, with the doorway left open once the doors move
    if(front){ const sc=front.naturalWidth/IW;
      if(FADE){ ctx.drawImage(front,sx(c,0),sy(c,0),IW*c.k,IH*c.k);
        if(to>0&&img.hall){ ctx.save(); ctx.beginPath(); ctx.rect(R.x,R.y,R.w,R.h); ctx.clip(); ctx.globalAlpha=ease(to);
          const sCov=Math.max(V.w/IW,V.h/IH), sR=Math.max(R.w/IW,R.h/IH), s=Math.max(sR,sCov*Math.pow(Math.min(R.w/V.w,1),.55)), iw=IW*s, ih=IH*s;
          ctx.drawImage(img.hall,R.x+R.w/2-iw/2,R.y+R.h/2-ih/2,iw,ih); ctx.globalAlpha=1; ctx.restore(); } }
      else {
      if(to>0){ ctx.save(); ctx.beginPath(); ctx.rect(V.x,V.y,V.w,V.h); ctx.rect(R.x,R.y,R.w,R.h); ctx.clip("evenodd"); }
      ctx.drawImage(front,sx(c,0),sy(c,0),IW*c.k,IH*c.k);
      if(to>0){ ctx.restore();
        ctx.save(); ctx.beginPath(); ctx.rect(R.x,R.y,R.w,R.h); ctx.clip();
        const th=to*1.36;                                          // ~78 degrees fully open
        const A=1-0.42*ease(to);                                   // tinted glass: the lit room shows through the leaves as they turn
        leaf(c,front,DOOR.seam,DOOR.x1,DOOR.x1,th,A);             // right leaf, hinged on the right post
        leaf(c,front,DOOR.x0,DOOR.seam,DOOR.seam-(DOOR.x1-DOOR.seam),th,A); // left leaf, hinge out of frame on the left
        ctx.restore(); } } }
  } else {
    // inside: the room, then the coats, then the shawls - slow real-photo pushes with soft cross-dissolves
    const th=seg(p,T.thru1,T.hall1), tc=seg(p,T.coats0,T.shaw1), ts=seg(p,T.shaw0,1);
    const cE=cam(V,dcx,dcy,Vthru), RwE=dw*cE.k, RhE=dh*cE.k, sCovE=Math.max(V.w/IW,V.h/IH), Z0=Math.max(Math.max(RwE/IW,RhE/IH),sCovE*Math.pow(Math.min(RwE/V.w,1),.55))/sCovE;
    coverDraw(img.hall,V,Z0*(1+0.08*th),.5,.5);
    const ac=seg(p,T.coats0,T.coats1); if(ac>0) coverDraw(img.coats,V,1.0+0.08*tc,.5,.45,ease(ac));
    const as=seg(p,T.shaw0,T.shaw1); if(as>0) coverDraw(img.shawls,V,1.0+0.07*ts,.5,.5,ease(as));
  }
  if(V.wide&&V.w<W){ ctx.fillStyle="#202539"; ctx.fillRect(V.w,0,W-V.w,H); }
  // words
  const io=V.wide?1-seg(p,.30,.38):1-seg(p,0,.06); intro.style.opacity=io; intro.style.setProperty("--iy",`${(-24*(1-io)).toFixed(1)}px`); intro.style.visibility=io<.01?"hidden":"visible";
  hint.style.opacity=1-seg(p,0,.03);
  let cap=null; if(p>=T.thru1-.02&&p<T.coats0+.02) cap=0; else if(p>=T.coats1-.02&&p<T.shaw0+.02) cap=1; else if(p>=T.shaw1-.02&&p<T.end) cap=2;
  const C=[["من الداخل","صالة الأسمر"],["المجموعة","أكوات تركية وإيطالية"],["المجموعة","شيلان بشمينا وكشمير"]];
  if(cap!==null){ if(hline.dataset.c!=String(cap)){ hline.dataset.c=cap; hEye.textContent=C[cap][0]; hWhere.textContent=C[cap][1]; }
    const win=[[T.thru1,T.coats0],[T.coats1,T.shaw0],[T.shaw1,T.end]][cap]; const lo=seg(p,win[0]-.01,win[0]+.02)*(1-seg(p,win[1]-.02,win[1]+.005)); hline.style.opacity=lo; } else hline.style.opacity=0;
  hfade.style.opacity=seg(p,T.end,1);
}
const readP=()=>clamp((scrollY-hTop)/hLen,0,1);
let target=0, cur=0, raf=0, dirty=true;
function frame(){ raf=0; const d=target-cur; cur=Math.abs(d)<2e-4?target:cur+d*0.16; render(cur); dirty=false; if(cur!==target) kick(); }
function kick(force){ if(force) dirty=true; if(!raf) raf=requestAnimationFrame(frame); }
function onScroll(){ target=readP(); const y=scrollY, past=y>hTop+hLen-10;
  top.classList.toggle("solid",past); top.classList.toggle("hide",!past); fab&&fab.classList.toggle("show",past); kick(); }
addEventListener("scroll",onScroll,{passive:true});
addEventListener("resize",()=>{ size(); onScroll(); kick(true); });
size(); target=cur=readP(); onScroll(); render(cur);
window.__hero={render:p=>{cur=target=p;render(p);}, loaded:()=>nLoaded===NIMG};

/* ---------- videos: muted preview; the sound button restarts with sound (one at a time) ---------- */
const vids=[...document.querySelectorAll("video.lazyv")]; let soundOn=null;
const btnOf=v=>v.parentElement.querySelector(".snd");
function ensureSrc(v){ if(!v.src&&v.dataset.src){ v.src=v.dataset.src; } }
function setBtn(v,on){ const b=btnOf(v); if(!b) return; b.classList.toggle("on",on); b.querySelector(".tx").textContent=on?"كتم الصوت":"تشغيل بالصوت"; b.setAttribute("aria-label",on?"كتم الصوت":"شغّل الفيديو بالصوت"); }
function toPreview(v){ v.muted=true; v.controls=false; v.loop=true; v.dataset.mode="preview"; setBtn(v,false); }
function withSound(v){
  if(soundOn&&soundOn!==v) toPreview(soundOn);
  ensureSrc(v); v.dataset.mode="sound"; v.loop=false; v.muted=false; v.volume=1; v.controls=true; soundOn=v; setBtn(v,true);
  try{ v.currentTime=0; }catch(e){}
  const pr=v.play(); pr&&pr.catch(()=>{ if(v.dataset.mode==="sound"){ v.muted=true; v.play().catch(()=>{}); setBtn(v,false); } });
}
vids.forEach(v=>{ toPreview(v); const b=btnOf(v);
  b&&b.addEventListener("click",e=>{ e.preventDefault(); e.stopPropagation(); if(v.dataset.mode==="sound"&&!v.muted){ toPreview(v); soundOn=null; } else withSound(v); });
  v.addEventListener("click",e=>{ if(v.dataset.mode!=="sound"){ e.preventDefault(); withSound(v); } });
  v.addEventListener("volumechange",()=>{ if(v.dataset.mode==="sound") setBtn(v,!v.muted); });
  v.addEventListener("ended",()=>{ if(v.dataset.mode==="sound"){ soundOn=null; toPreview(v); v.play().catch(()=>{}); } });
});
const vio=new IntersectionObserver(es=>{ for(const e of es){ const v=e.target;
  if(e.isIntersecting){ ensureSrc(v); v.dataset.vis="1"; if(v.dataset.mode!=="sound"){ const pr=v.play(); pr&&pr.catch(()=>{}); } }
  else { v.dataset.vis="0"; if(!v.paused) v.pause(); } } },{rootMargin:"150px 0px",threshold:0.3});
vids.forEach(v=>vio.observe(v));

/* ---------- quiet reveal ---------- */
const io=new IntersectionObserver(es=>{ for(const e of es) if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
document.querySelectorAll(".rv").forEach(el=>io.observe(el));
})();
