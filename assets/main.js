/* ═══════════════════════════════════════
   ARJUN BHADAURIA — SHARED JS
═══════════════════════════════════════ */

/* ── Custom cursor ── */
function initCursor() {
  const dot  = document.getElementById('cDot');
  const ring = document.getElementById('cRing');
  if (!dot || !ring) return;
  let mx=0,my=0,rx=0,ry=0,on=false;
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    if (!on) { on=true; document.body.classList.add('cursor-active'); dot.classList.add('on'); ring.classList.add('on'); }
  });
  document.querySelectorAll('a,button,.card,.art-item,.post-card').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('big'); ring.classList.add('big'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('big'); ring.classList.remove('big'); });
  });
  (function tick() {
    dot.style.left=mx+'px'; dot.style.top=my+'px';
    rx+=(mx-rx)*.13; ry+=(my-ry)*.13;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(tick);
  })();
}

/* ── Mobile nav ── */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  if (!toggle || !mobile) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    mobile.classList.toggle('open');
  });
}
function closeMobileNav() {
  document.getElementById('navToggle')?.classList.remove('open');
  document.getElementById('navMobile')?.classList.remove('open');
}

/* ── Smooth scroll with easing ── */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 50));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

function smoothScrollTo(target, duration) {
  const start = window.scrollY;
  const navH  = document.getElementById('nav')?.offsetHeight || 72;
  const end   = target.getBoundingClientRect().top + window.scrollY - navH;
  const dist  = end - start;
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + dist * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      smoothScrollTo(el, 900);
    });
  });
}

/* ── Smooth wheel scroll (inertia) ── */
function initSmoothWheel() {
  // Skip on touch/mobile — native momentum scroll is already great there
  if ('ontouchstart' in window) return;

  let current = window.scrollY;
  let target  = window.scrollY;
  let rafId   = null;
  const ease  = 0.09; // lower = more floaty, higher = snappier

  function tick() {
    current += (target - current) * ease;
    // Stop animating when close enough
    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo(0, current);
      rafId = null;
      return;
    }
    window.scrollTo(0, current);
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('wheel', e => {
    e.preventDefault();
    // Amplify a little so it doesn't feel sluggish
    target += e.deltaY * 1.2;
    // Clamp to page bounds
    target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: false });

  // Keep internal state in sync if user uses keyboard / scrollbar
  window.addEventListener('scroll', () => {
    if (!rafId) { current = window.scrollY; target = window.scrollY; }
  });
}


function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 70);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .07 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── Skill bars ── */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-bar-fill').forEach(b => b.classList.add('go'));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  document.querySelectorAll('.skill-group').forEach(g => obs.observe(g));
}

/* ── Generative Art ── */
function drawSpiral(canvas) {
  const ctx = canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;
  ctx.fillStyle='#09090f'; ctx.fillRect(0,0,w,h);
  const cx=w*.5, cy=h*.5;
  const colors=['rgba(155,89,246,','rgba(240,80,160,','rgba(0,212,204,','rgba(255,184,48,'];
  for(let i=0;i<300;i++){
    const t=i/300, a=t*Math.PI*16, r=t*Math.min(w,h)*.42;
    const x=cx+Math.cos(a)*r+Math.cos(a*2.3)*r*.22;
    const y=cy+Math.sin(a)*r+Math.sin(a*1.7)*r*.22;
    const c=colors[Math.floor(t*colors.length)];
    ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2);
    ctx.fillStyle=c+((.8-t*.6)+')'); ctx.fill();
  }
}

function drawGlow(canvas) {
  const ctx = canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;
  ctx.fillStyle='#09090f'; ctx.fillRect(0,0,w,h);
  const pairs=[
    [w*.35,h*.4,w*.55,h*.55,'rgba(155,89,246,','rgba(240,80,160,'],
    [w*.65,h*.3,w*.45,h*.6,'rgba(0,212,204,','rgba(54,240,160,'],
  ];
  pairs.forEach(([x1,y1,x2,y2,c1,c2])=>{
    const g=ctx.createRadialGradient(x1,y1,8,x2,y2,h*.55);
    g.addColorStop(0,c1+'0.28)'); g.addColorStop(.5,c2+'0.08)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  });
  for(let i=1;i<=7;i++){
    ctx.beginPath(); ctx.arc(w*.35,h*.42,i*h*.065,0,Math.PI*2);
    ctx.strokeStyle=`rgba(155,89,246,${.14-i*.016})`; ctx.lineWidth=.7; ctx.stroke();
  }
}

function drawFlowField(canvas) {
  const ctx = canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;
  ctx.fillStyle='#09090f'; ctx.fillRect(0,0,w,h);
  const colPalette=['rgba(155,89,246,','rgba(0,212,204,','rgba(240,80,160,'];
  for(let r=0;r<16;r++) for(let c=0;c<42;c++){
    const x=(c/42)*w+(w/42)*.5, y=(r/16)*h+(h/16)*.5;
    const angle=Math.sin(c*.26+r*.48)*Math.PI+Math.cos(c*.12)*0.4;
    const len=8+Math.sin(c*.18+r*.7)*5;
    const alpha=.07+Math.abs(Math.sin(c*.13+r*.36))*.22;
    const col=colPalette[Math.floor((c+r)%3)];
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2,0);
    ctx.strokeStyle=col+alpha+')'; ctx.lineWidth=.9; ctx.stroke();
    ctx.restore();
  }
}

function drawStars(canvas) {
  const ctx = canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;
  ctx.fillStyle='#09090f'; ctx.fillRect(0,0,w,h);
  const palette=[
    v=>`rgba(155,89,246,${v})`,
    v=>`rgba(0,212,204,${v})`,
    v=>`rgba(240,80,160,${v})`,
    v=>`rgba(255,184,48,${v})`,
    v=>`rgba(54,240,160,${v})`,
  ];
  for(let i=0;i<160;i++){
    const x=Math.random()*w, y=Math.random()*h, sz=Math.random()*2.6+.4;
    const fn=palette[Math.floor(Math.random()*palette.length)];
    ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2);
    ctx.fillStyle=fn(Math.random()*.9+.1); ctx.fill();
  }
  for(let i=0;i<10;i++){
    ctx.beginPath();
    ctx.moveTo(Math.random()*w,Math.random()*h);
    ctx.lineTo(Math.random()*w,Math.random()*h);
    const fn=palette[Math.floor(Math.random()*palette.length)];
    ctx.strokeStyle=fn(.12); ctx.lineWidth=.5; ctx.stroke();
  }
}

function initArt() {
  function mk(id,w,h){ const c=document.getElementById(id); if(!c)return null; c.width=w;c.height=h; return c; }
  const c1=mk('c1',900,420); if(c1) drawSpiral(c1);
  const c2=mk('c2',420,420); if(c2) drawGlow(c2);
  const c3=mk('c3',420,360); if(c3) drawFlowField(c3);
  const c4=mk('c4',900,320); if(c4) drawStars(c4);
}

/* ── Init all ── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initMobileNav();
  initNavScroll();
  initSmoothLinks();
  initSmoothWheel();
  initReveal();
  initSkillBars();
  initArt();
});
