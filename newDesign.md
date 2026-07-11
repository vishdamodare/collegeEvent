<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CollegeEvents — Where Campus Life Happens</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
/* ============ TOKENS ============ */
:root{
  --bg:#0B0B08;
  --bg-elevated:#131309;
  --card:rgba(245,243,234,0.05);
  --card-hover:rgba(245,243,234,0.09);
  --border:rgba(245,243,234,0.14);
  --border-bright:rgba(245,243,234,0.30);
  --lime:#D7FF3D;
  --coral:#FF4B33;
  --butter:#FFD84D;
  --cobalt:#2451FF;
  --moss:#8BC53F;
  --orange:#F97316;
  --text:#F5F3EA;
  --text2:#C9C7BA;
  --muted:#8C8C82;
  --grad-primary:var(--lime);
  --grad-cyan:var(--cobalt);
  --ease:cubic-bezier(.16,1,.3,1);
  --ease-soft:cubic-bezier(.25,.8,.25,1);
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  background:var(--bg);
  color:var(--text);
  font-family:'Inter',system-ui,sans-serif;
  font-weight:300;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
  position:relative;
}
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.045;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
h1,h2,h3,.hero-content h1,.display{
  font-family:'Anton','Inter',sans-serif;
  font-weight:400;
  letter-spacing:-0.005em;
  text-transform:uppercase;
  line-height:0.98;
}
h4,h5,.logo,.fc-title{
  font-family:'Archivo','Inter',sans-serif;
  font-weight:800;
  letter-spacing:-0.01em;
  line-height:1.1;
}
a{color:inherit;text-decoration:none;}
button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}
img{display:block;max-width:100%;}
::selection{background:var(--lime);color:#0B0B08;}

::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(245,243,234,.18);border-radius:10px;}

@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important;}
}

.wrap{max-width:1360px;margin:0 auto;padding:0 40px;}
.eyebrow{
  display:inline-flex;align-items:center;gap:8px;
  font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:var(--text2);
  padding:6px 14px;border:1px solid var(--border);border-radius:100px;
  background:var(--card);backdrop-filter:blur(10px);
}
.eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--lime);box-shadow:0 0 10px var(--lime);}
.grad-text{
  color:var(--lime);
  text-shadow:3px 3px 0 var(--coral);
}
.section{padding:140px 0;}
.section-head{max-width:640px;margin-bottom:56px;}
.section-head h2{font-size:clamp(32px,4.2vw,52px);margin:16px 0 14px;}
.section-head p{color:var(--text2);font-size:17px;font-weight:400;line-height:1.6;}

.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:15px 28px;border-radius:100px;font-weight:600;font-size:15px;
  transition:transform .35s var(--ease), box-shadow .35s var(--ease), background .35s;
  white-space:nowrap;
}
.btn-primary{
  background:var(--lime);color:#0B0B08;font-weight:800;
  box-shadow:4px 4px 0 var(--coral);
}
.btn-primary:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--coral);background:var(--butter);}
.btn-glass{
  background:var(--card);border:1px solid var(--border);color:#fff;backdrop-filter:blur(14px);
}
.btn-glass:hover{background:var(--card-hover);border-color:var(--border-bright);transform:translateY(-3px);}
.btn-sm{padding:10px 18px;font-size:13px;}

/* ============ NAVBAR ============ */
header{
  position:fixed;top:0;left:0;right:0;z-index:1000;
  padding:22px 0;transition:background .5s var(--ease), backdrop-filter .5s, padding .4s, border-color .5s;
  border-bottom:1px solid transparent;
}
header.scrolled{
  background:rgba(5,5,5,.65);backdrop-filter:blur(18px) saturate(160%);
  padding:14px 0;border-bottom-color:var(--border);
}
nav{display:flex;align-items:center;justify-content:space-between;}
.logo{display:flex;align-items:center;gap:10px;font-family:'Archivo';font-weight:700;font-size:19px;}
.logo svg{width:34px;height:34px;}
.nav-links{display:flex;align-items:center;gap:38px;}
.nav-links a{
  font-size:14.5px;font-weight:500;color:var(--text2);position:relative;padding:4px 0;
  transition:color .3s;
}
.nav-links a::after{
  content:'';position:absolute;left:0;bottom:-2px;width:0;height:1.5px;background:var(--grad-primary);
  transition:width .35s var(--ease);
}
.nav-links a:hover{color:#fff;}
.nav-links a:hover::after{width:100%;}
.nav-actions{display:flex;align-items:center;gap:14px;}
.nav-login{font-size:14.5px;font-weight:500;color:var(--text2);transition:color .3s;}
.nav-login:hover{color:#fff;}

.signup-wrap{position:relative;}
.signup-menu{
  position:absolute;top:calc(100% + 12px);right:0;min-width:190px;
  background:rgba(14,14,16,.9);border:1px solid var(--border);border-radius:16px;
  backdrop-filter:blur(20px);padding:8px;
  opacity:0;visibility:hidden;transform:translateY(-8px);
  transition:all .3s var(--ease);
}
.signup-wrap:hover .signup-menu, .signup-wrap:focus-within .signup-menu{opacity:1;visibility:visible;transform:translateY(0);}
.signup-menu a{
  display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;font-size:14px;font-weight:500;color:var(--text2);
}
.signup-menu a:hover{background:var(--card);color:#fff;}

.burger{display:none;width:40px;height:40px;border-radius:12px;background:var(--card);border:1px solid var(--border);align-items:center;justify-content:center;}
.burger span, .burger::before, .burger::after{content:'';display:block;width:16px;height:1.5px;background:#fff;position:absolute;transition:all .3s;}
.burger{position:relative;}
.burger span{position:absolute;}
.burger.open span{opacity:0;}
.burger.open::before{transform:rotate(45deg);}
.burger.open::after{transform:rotate(-45deg);}
.burger::before{top:18px;left:12px;}
.burger span{top:19.3px;left:12px;}
.burger::after{top:20.6px;left:12px;}

/* ============ HERO ============ */
.hero{
  position:relative;min-height:100vh;display:flex;align-items:center;
  padding:120px 0 60px;overflow:hidden;
}
.hero-bg{
  position:absolute;inset:0;z-index:0;
  background:
    radial-gradient(ellipse 900px 600px at 15% 20%, rgba(215,255,61,.16), transparent 60%),
    radial-gradient(ellipse 700px 700px at 85% 75%, rgba(255,75,51,.14), transparent 60%),
    radial-gradient(ellipse 1000px 800px at 50% 100%, rgba(36,81,255,.10), transparent 60%),
    var(--bg);
  transition:background 1.2s ease;
}
.hero-bg img{
  position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.28;
  mix-blend-mode:normal;filter:saturate(1.1) contrast(1.05);
  transition:opacity 1s ease;
}
.hero-bg::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(180deg, rgba(5,5,5,.2) 0%, rgba(5,5,5,.55) 60%, var(--bg) 100%),
             linear-gradient(90deg, rgba(5,5,5,.85) 0%, rgba(5,5,5,.2) 50%);
}
.particle{position:absolute;border-radius:50%;background:#fff;opacity:.5;filter:blur(.5px);animation:floatUp linear infinite;}
@keyframes floatUp{
  0%{transform:translateY(0) translateX(0);opacity:0;}
  10%{opacity:.6;}
  90%{opacity:.4;}
  100%{transform:translateY(-120vh) translateX(20px);opacity:0;}
}

.hero-grid{position:relative;z-index:2;display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;width:100%;}
.hero-content{max-width:560px;}
.hero-badges{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px;}
.hero-content h1{font-size:clamp(42px,5.6vw,74px);margin-bottom:20px;}
.hero-content h1 .line{display:block;overflow:hidden;}
.hero-content h1 span{display:inline-block;}
.hero-sub{font-size:17px;color:var(--text2);line-height:1.65;margin-bottom:30px;max-width:460px;font-weight:400;}

.event-meta{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:34px;}
.meta-chip{
  display:flex;align-items:center;gap:7px;padding:9px 15px;border-radius:100px;
  background:var(--card);border:1px solid var(--border);backdrop-filter:blur(10px);
  font-size:13px;font-weight:500;color:var(--text2);
}
.meta-chip svg{width:14px;height:14px;opacity:.8;}
.meta-chip b{color:#fff;font-weight:600;}
.hero-ctas{display:flex;gap:14px;}

/* carousel */
.carousel-wrap{position:relative;height:640px;perspective:1400px;}
.carousel-track{position:relative;height:100%;}
.event-card{
  position:absolute;left:50%;top:50%;width:280px;height:380px;border-radius:28px;
  overflow:hidden;cursor:pointer;
  border:1px solid var(--border);
  background:linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.02));
  box-shadow:0 30px 60px -20px rgba(0,0,0,.6);
  transition:transform .7s var(--ease), filter .7s var(--ease), opacity .7s var(--ease), box-shadow .7s var(--ease);
  transform-origin:center;
}
.event-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.event-card .card-shade{position:absolute;inset:0;background:linear-gradient(180deg, transparent 30%, rgba(0,0,0,.85) 100%);}
.event-card .card-info{position:absolute;left:18px;right:18px;bottom:18px;}
.event-card .cat{
  display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  padding:4px 10px;border-radius:100px;margin-bottom:8px;color:#fff;
  background:rgba(255,255,255,.14);backdrop-filter:blur(6px);
}
.event-card h4{font-size:17px;font-weight:600;font-family:'Archivo';margin-bottom:3px;}
.event-card .ed{font-size:12.5px;color:#cfcfcf;}

.event-card.pos-active{
  transform:translate(-50%,-50%) translateX(0) translateY(0) scale(1) rotateY(0deg);
  z-index:5;filter:brightness(1) blur(0);
  box-shadow:0 0 0 2px var(--lime), 0 40px 90px -20px rgba(215,255,61,.35);
}
.event-card.pos-r1{transform:translate(-50%,-50%) translateX(190px) translateY(30px) scale(.82) rotateY(-8deg);z-index:4;filter:brightness(.55) blur(1px);opacity:.85;}
.event-card.pos-r2{transform:translate(-50%,-50%) translateX(260px) translateY(90px) scale(.66) rotateY(-10deg);z-index:3;filter:brightness(.35) blur(2px);opacity:.6;}
.event-card.pos-l1{transform:translate(-50%,-50%) translateX(-190px) translateY(30px) scale(.82) rotateY(8deg);z-index:4;filter:brightness(.55) blur(1px);opacity:.85;}
.event-card.pos-l2{transform:translate(-50%,-50%) translateX(-260px) translateY(90px) scale(.66) rotateY(10deg);z-index:3;filter:brightness(.35) blur(2px);opacity:.6;}
.event-card.pos-hidden{transform:translate(-50%,-50%) translateY(200px) scale(.5);opacity:0;z-index:1;}
.event-card:hover.pos-active{transform:translate(-50%,-50%) scale(1.03);}

.carousel-dots{display:flex;gap:8px;justify-content:center;margin-top:28px;position:relative;z-index:5;}
.carousel-dots button{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.25);transition:all .4s var(--ease);}
.carousel-dots button.active{width:22px;border-radius:6px;background:var(--lime);}

.scroll-cue{
  position:absolute;bottom:36px;left:40px;display:flex;align-items:center;gap:10px;z-index:3;
  font-size:12px;color:var(--muted);letter-spacing:.05em;
}
.scroll-cue .stick{width:1px;height:34px;background:linear-gradient(var(--muted),transparent);position:relative;overflow:hidden;}
.scroll-cue .stick::after{content:'';position:absolute;top:-100%;left:0;width:100%;height:100%;background:#fff;animation:scrollcue 1.8s infinite ease;}
@keyframes scrollcue{50%{top:100%;}100%{top:100%;}}

/* ============ REVEAL ============ */
.reveal{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease), transform .9s var(--ease);}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger > *{opacity:0;transform:translateY(28px);transition:opacity .8s var(--ease), transform .8s var(--ease);}
.stagger.in > *{opacity:1;transform:translateY(0);}
.stagger.in > *:nth-child(1){transition-delay:.05s;}
.stagger.in > *:nth-child(2){transition-delay:.12s;}
.stagger.in > *:nth-child(3){transition-delay:.19s;}
.stagger.in > *:nth-child(4){transition-delay:.26s;}
.stagger.in > *:nth-child(5){transition-delay:.33s;}
.stagger.in > *:nth-child(6){transition-delay:.4s;}

/* ============ FEATURED EVENTS ============ */
.h-scroll{display:flex;gap:24px;overflow-x:auto;padding:6px 4px 24px;scroll-snap-type:x mandatory;}
.h-scroll::-webkit-scrollbar{display:none;}
.feat-card{
  scroll-snap-align:start;flex:0 0 340px;border-radius:26px;overflow:hidden;position:relative;
  background:var(--card);border:1px solid var(--border);cursor:pointer;
  transition:transform .5s var(--ease), border-color .5s, box-shadow .5s;
}
.feat-card:hover{transform:translateY(-10px) rotate(-1deg);border-color:var(--border-bright);box-shadow:0 30px 60px -20px rgba(215,255,61,.25);}
.feat-card .img-wrap{height:230px;overflow:hidden;position:relative;}
.feat-card .img-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .7s var(--ease);}
.feat-card:hover .img-wrap img{transform:scale(1.08);}
.feat-card .fc-body{padding:20px 22px 24px;}
.feat-card .cat-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.cat-badge{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:5px 11px;border-radius:100px;}
.fc-title{font-size:19px;margin-bottom:6px;}
.fc-sub{font-size:13.5px;color:var(--muted);margin-bottom:16px;}
.fc-foot{display:flex;justify-content:space-between;align-items:center;padding-top:14px;border-top:1px solid var(--border);}
.fc-foot span{font-size:12.5px;color:var(--text2);}

.b-blue{background:rgba(36,81,255,.20);color:#9db1ff;}
.b-purple{background:rgba(255,216,77,.20);color:#ffe38a;}
.b-pink{background:rgba(255,75,51,.20);color:#ff9c8a;}
.b-cyan{background:rgba(215,255,61,.20);color:#e4ffab;}
.b-green{background:rgba(139,197,63,.20);color:#c3e894;}
.b-orange{background:rgba(249,115,22,.20);color:#ffbb80;}

/* ============ TIMELINE ============ */
.timeline{position:relative;padding-left:34px;}
.timeline-track{position:absolute;left:5px;top:6px;bottom:6px;width:1.5px;background:var(--border);}
.timeline-fill{
  position:absolute;left:5px;top:6px;width:1.5px;height:0px;
  background:linear-gradient(var(--lime), rgba(215,255,61,.15));
  box-shadow:0 0 10px 1px rgba(215,255,61,.6), 0 0 22px 2px rgba(215,255,61,.25);
  border-radius:2px;
}
.timeline-glow{
  position:absolute;left:50%;bottom:-5px;transform:translateX(-50%);
  width:11px;height:11px;border-radius:50%;background:var(--lime);
  box-shadow:0 0 14px 4px rgba(215,255,61,.85), 0 0 32px 10px rgba(215,255,61,.35);
  animation:timelinePulse 1.6s ease-in-out infinite;
}
@keyframes timelinePulse{0%,100%{opacity:.75;transform:translateX(-50%) scale(.9);}50%{opacity:1;transform:translateX(-50%) scale(1.2);}}
.t-item{position:relative;padding-bottom:44px;display:grid;grid-template-columns:110px 1fr;gap:24px;align-items:center;}
.t-item:last-child{padding-bottom:0;}
.t-item::before{
  content:'';position:absolute;left:-34px;top:6px;width:11px;height:11px;border-radius:50%;background:rgba(245,243,234,.2);
  box-shadow:none;transition:background .4s var(--ease), box-shadow .4s var(--ease);
}
.t-item.lit::before{background:var(--lime);box-shadow:0 0 0 5px rgba(215,255,61,.15), 0 0 16px rgba(215,255,61,.7);}
.t-date{font-size:13px;font-weight:600;color:var(--text2);font-family:'Archivo';}
.t-date small{display:block;font-size:11px;color:var(--muted);font-weight:400;margin-top:2px;}
.t-card{
  display:flex;align-items:center;gap:18px;padding:18px 22px;border-radius:20px;
  background:var(--card);border:1px solid var(--border);backdrop-filter:blur(10px);cursor:pointer;
  transition:transform .4s var(--ease), border-color .4s, background .4s;
}
.t-card:hover{transform:translateX(8px);border-color:var(--border-bright);background:var(--card-hover);}
.t-thumb{width:64px;height:64px;border-radius:14px;overflow:hidden;flex:none;}
.t-thumb img{width:100%;height:100%;object-fit:cover;}
.t-info h4{font-size:16px;font-weight:600;font-family:'Archivo';margin-bottom:3px;}
.t-info span{font-size:12.5px;color:var(--muted);}
.t-arrow{margin-left:auto;width:36px;height:36px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex:none;transition:all .4s var(--ease);}
.t-card:hover .t-arrow{background:var(--lime);color:#0B0B08;border-color:transparent;transform:rotate(45deg);}

/* ============ CATEGORIES ============ */
.cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;}
.cat-tile{
  position:relative;padding:26px 22px;border-radius:22px;min-height:150px;
  background:var(--card);border:1px solid var(--border);overflow:hidden;
  display:flex;flex-direction:column;justify-content:space-between;
  transition:transform .45s var(--ease), border-color .45s;
}
.cat-tile::before{
  content:'';position:absolute;inset:0;opacity:0;transition:opacity .45s;
  background:radial-gradient(circle at 30% 20%, var(--glow,rgba(215,255,61,.35)), transparent 65%);
}
.cat-tile:hover{transform:translateY(-6px) scale(1.02);border-color:var(--border-bright);}
.cat-tile:hover::before{opacity:1;}
.cat-tile svg{width:26px;height:26px;position:relative;z-index:1;}
.cat-tile .cname{font-size:16.5px;font-weight:600;font-family:'Archivo';position:relative;z-index:1;}
.cat-tile .ccount{font-size:12px;color:var(--muted);position:relative;z-index:1;}

/* ============ COLLEGES ============ */
.college-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.college-card{border-radius:24px;overflow:hidden;position:relative;height:340px;border:1px solid var(--border);cursor:pointer;}
.college-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s var(--ease);}
.college-card:hover img{transform:scale(1.08);}
.college-card::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg, transparent 20%, rgba(0,0,0,.9) 100%);}
.college-rank{
  position:absolute;top:18px;left:18px;z-index:2;width:38px;height:38px;border-radius:12px;
  background:rgba(255,255,255,.12);backdrop-filter:blur(10px);border:1px solid var(--border-bright);
  display:flex;align-items:center;justify-content:center;font-family:'Archivo';font-weight:700;font-size:15px;
}
.college-info{position:absolute;left:22px;right:22px;bottom:20px;z-index:2;}
.college-info h4{font-size:20px;margin-bottom:4px;}
.college-info .loc{font-size:12.5px;color:var(--text2);display:flex;align-items:center;gap:5px;margin-bottom:10px;}
.college-stats{display:flex;gap:16px;}
.college-stats span{font-size:12px;color:var(--muted);}
.college-stats b{color:#fff;font-weight:600;}

/* ============ TESTIMONIALS ============ */
.testi-track{display:flex;gap:22px;transition:transform .7s var(--ease);}
.testi-viewport{overflow:hidden;}
.testi-card{
  flex:0 0 calc(33.333% - 15px);padding:28px;border-radius:22px;
  background:var(--card);border:1px solid var(--border);backdrop-filter:blur(10px);
}
.testi-quote{font-size:15px;line-height:1.65;color:var(--text2);margin-bottom:22px;min-height:105px;}
.testi-person{display:flex;align-items:center;gap:12px;}
.testi-avatar{width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid var(--border-bright);}
.testi-person h5{font-size:14.5px;font-weight:600;}
.testi-person span{font-size:12.5px;color:var(--muted);}
.testi-nav{display:flex;gap:12px;margin-top:30px;}
.testi-nav button{width:44px;height:44px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;transition:all .3s;}
.testi-nav button:hover{background:var(--card-hover);border-color:var(--border-bright);}

/* ============ STATS ============ */
.stats-section{
  border-radius:28px;border:2px solid var(--border-bright);
  background:rgba(215,255,61,.045);
  padding:64px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;
}
.stat-num{font-size:clamp(38px,4vw,56px);font-family:'Anton';font-weight:400;color:var(--lime);}
.stat-label{font-size:13.5px;color:var(--muted);margin-top:8px;letter-spacing:.03em;}

/* ============ FOOTER ============ */
footer{border-top:1px solid var(--border);padding:80px 0 30px;}
.footer-grid{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:40px;margin-bottom:60px;}
.footer-brand p{color:var(--muted);font-size:14px;margin:16px 0 20px;max-width:280px;line-height:1.6;}
.footer-col h5{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:18px;}
.footer-col a{display:block;font-size:14.5px;color:var(--text2);margin-bottom:13px;transition:color .3s;}
.footer-col a:hover{color:#fff;}
.social-row{display:flex;gap:10px;}
.social-row a{width:38px;height:38px;border-radius:50%;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0;}
.social-row a:hover{background:var(--card-hover);}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:26px;border-top:1px solid var(--border);font-size:13px;color:var(--muted);}

/* ============ MOBILE DRAWER ============ */
.drawer{
  position:fixed;top:0;right:0;height:100vh;width:78%;max-width:340px;z-index:1200;
  background:rgba(10,10,12,.98);border-left:1px solid var(--border);backdrop-filter:blur(20px);
  padding:100px 32px 40px;transform:translateX(100%);transition:transform .5s var(--ease);
  display:flex;flex-direction:column;gap:26px;
}
.drawer.open{transform:translateX(0);}
.drawer a{font-size:19px;font-weight:500;}
.drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1100;opacity:0;visibility:hidden;transition:opacity .4s;}
.drawer-overlay.open{opacity:1;visibility:visible;}

/* ============ DETAIL / REGISTER PAGES ============ */
.page-view{
  position:fixed;inset:0;z-index:1500;background:var(--bg);overflow-y:auto;
  transform:translateY(100%);opacity:0;visibility:hidden;
  transition:transform .55s var(--ease), opacity .5s var(--ease), visibility 0s linear .55s;
}
.page-view.open{transform:translateY(0);opacity:1;visibility:visible;transition:transform .55s var(--ease), opacity .5s var(--ease);}
.page-topbar{
  position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;
  padding:20px 40px;background:rgba(11,11,8,.75);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);
}
.back-btn{
  display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:var(--text2);
  padding:9px 16px 9px 12px;border-radius:100px;border:1px solid var(--border);background:var(--card);
  transition:all .3s var(--ease);
}
.back-btn:hover{color:#fff;border-color:var(--border-bright);background:var(--card-hover);transform:translateX(-3px);}

.detail-hero{position:relative;height:420px;overflow:hidden;}
.detail-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
.detail-hero::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(180deg, rgba(11,11,8,.15) 0%, rgba(11,11,8,.55) 55%, var(--bg) 100%);
}
.detail-hero-content{position:absolute;left:50%;bottom:0;transform:translateX(-50%);z-index:2;padding:0 40px 40px;max-width:1360px;width:100%;}
.detail-hero-content .cat-badge{margin-bottom:14px;}
.detail-hero-content h1{font-size:clamp(34px,5vw,58px);margin-bottom:10px;}
.detail-hero-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px;}

.detail-body{max-width:1360px;margin:0 auto;padding:56px 40px 120px;display:grid;grid-template-columns:1fr 360px;gap:56px;}
.detail-main h3{font-size:22px;margin-bottom:16px;letter-spacing:0;}
.detail-main p.lead{font-size:16.5px;line-height:1.75;color:var(--text2);margin-bottom:44px;}
.detail-block{margin-bottom:52px;}

.about-college{display:flex;gap:20px;padding:24px;border-radius:20px;background:var(--card);border:1px solid var(--border);margin-bottom:20px;}
.about-college img{width:96px;height:96px;border-radius:16px;object-fit:cover;flex:none;}
.about-college h4{font-size:19px;margin-bottom:6px;}
.about-college .loc{font-size:13px;color:var(--muted);margin-bottom:10px;}
.about-college .stats{display:flex;gap:18px;flex-wrap:wrap;}
.about-college .stats span{font-size:12.5px;color:var(--text2);}
.about-college .stats b{color:var(--lime);font-weight:700;}

.past-events{display:flex;flex-direction:column;gap:14px;}
.past-item{
  display:flex;align-items:center;gap:16px;padding:16px 18px;border-radius:16px;
  background:var(--card);border:1px solid var(--border);
}
.past-item .p-thumb{width:52px;height:52px;border-radius:12px;background:rgba(215,255,61,.12);display:flex;align-items:center;justify-content:center;font-size:20px;flex:none;}
.past-item h5{font-size:14.5px;font-weight:600;margin-bottom:3px;}
.past-item span{font-size:12.5px;color:var(--muted);}
.past-item .p-badge{margin-left:auto;font-size:11px;color:var(--moss);font-weight:700;letter-spacing:.04em;text-transform:uppercase;flex:none;}

.detail-timeline{position:relative;padding-left:30px;}
.detail-timeline::before{content:'';position:absolute;left:5px;top:6px;bottom:6px;width:1.5px;background:var(--border);}
.dt-item{position:relative;padding-bottom:30px;}
.dt-item:last-child{padding-bottom:0;}
.dt-item::before{content:'';position:absolute;left:-30px;top:4px;width:10px;height:10px;border-radius:50%;background:var(--border-bright);}
.dt-item.now::before{background:var(--lime);box-shadow:0 0 0 5px rgba(215,255,61,.18);}
.dt-item .dt-day{font-size:12.5px;color:var(--muted);font-weight:600;margin-bottom:3px;}
.dt-item h5{font-size:15px;font-weight:600;}
.dt-item p{font-size:12.5px;color:var(--text2);margin-top:2px;}

.detail-side{position:sticky;top:110px;align-self:start;}
.reg-card{
  border-radius:24px;border:1px solid var(--border-bright);background:rgba(215,255,61,.045);
  padding:28px;margin-bottom:20px;
}
.reg-card .price{font-size:13px;color:var(--muted);margin-bottom:4px;}
.reg-card .price b{font-size:26px;color:var(--lime);font-family:'Archivo';display:block;margin-top:2px;}
.reg-card .btn{width:100%;margin-top:18px;}
.reg-facts{display:flex;flex-direction:column;gap:12px;margin-top:20px;padding-top:20px;border-top:1px solid var(--border);}
.reg-facts .rf{display:flex;justify-content:space-between;font-size:13px;}
.reg-facts .rf span:first-child{color:var(--muted);}
.reg-facts .rf span:last-child{font-weight:600;color:#fff;}

.gallery-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
.gallery-strip img{width:100%;height:90px;object-fit:cover;border-radius:12px;}

/* ============ REGISTER PAGE ============ */
.reg-page-wrap{max-width:640px;margin:0 auto;padding:64px 40px 120px;}
.reg-page-wrap .eyebrow{margin-bottom:20px;}
.reg-page-wrap h1{font-size:clamp(30px,4.5vw,44px);margin-bottom:12px;}
.reg-summary{
  display:flex;align-items:center;gap:16px;padding:18px 20px;border-radius:18px;
  background:var(--card);border:1px solid var(--border);margin:28px 0 40px;
}
.reg-summary img{width:60px;height:60px;border-radius:12px;object-fit:cover;flex:none;}
.reg-summary h5{font-size:15.5px;font-weight:600;}
.reg-summary span{font-size:12.5px;color:var(--muted);}

.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.form-field{display:flex;flex-direction:column;gap:8px;margin-bottom:18px;}
.form-field.full{grid-column:1/-1;}
.form-field label{font-size:13px;font-weight:600;color:var(--text2);}
.form-field input, .form-field select{
  padding:13px 16px;border-radius:12px;background:var(--card);border:1px solid var(--border);
  color:#fff;font-family:inherit;font-size:14.5px;transition:border-color .3s, background .3s;
}
.form-field input:focus, .form-field select:focus{outline:none;border-color:var(--lime);background:var(--card-hover);}
.form-field input::placeholder{color:var(--muted);}
.reg-submit{width:100%;margin-top:8px;padding:17px;font-size:15.5px;}

.reg-success{text-align:center;padding:60px 20px;}
.reg-success .check{
  width:78px;height:78px;border-radius:50%;background:rgba(215,255,61,.12);border:2px solid var(--lime);
  display:flex;align-items:center;justify-content:center;margin:0 auto 28px;font-size:34px;color:var(--lime);
}
.reg-success h2{font-size:28px;margin-bottom:12px;}
.reg-success p{color:var(--text2);font-size:15px;margin-bottom:32px;}

@media (max-width:900px){
  .detail-body{grid-template-columns:1fr;}
  .detail-side{position:static;}
  .about-college{flex-direction:column;}
  .form-grid{grid-template-columns:1fr;}
}

/* ============ RESPONSIVE ============ */
@media (max-width:980px){
  .nav-links{display:none;}
  .burger{display:flex;}
  .hero-grid{grid-template-columns:1fr;}
  .carousel-wrap{height:440px;margin-top:20px;}
  .event-card{width:200px;height:280px;}
  .cat-grid{grid-template-columns:repeat(2,1fr);}
  .college-grid{grid-template-columns:1fr;}
  .footer-grid{grid-template-columns:1fr 1fr;}
  .stats-section{grid-template-columns:repeat(2,1fr);}
  .testi-card{flex:0 0 100%;}
  .wrap{padding:0 22px;}
  .section{padding:90px 0;}
  .page-topbar{padding:16px 20px;}
  .detail-body{padding:40px 20px 90px;}
  .reg-page-wrap{padding:40px 20px 90px;}
}
@media (max-width:560px){
  .hero-ctas{flex-direction:column;}
  .hero-ctas .btn{width:100%;}
  .footer-grid{grid-template-columns:1fr;}
}
</style>
</head>
<body>

<!-- ============ NAVBAR ============ -->
<header id="header">
  <div class="wrap">
    <nav>
      <a href="#" class="logo">
        <svg viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stop-color="#D7FF3D"/>
              <stop offset="100%" stop-color="#FF4B33"/>
            </linearGradient>
          </defs>
          <path d="M28 6C17 6 8 14.5 8 25c0 3 .6 5.7 1.8 8.2.3.6-.1 1.3-.8 1.3H6" stroke="url(#lg1)" stroke-width="4.2" stroke-linecap="round" fill="none"/>
          <circle cx="30" cy="9" r="3.4" fill="#FFD84D"/>
        </svg>
        CollegeEvents
      </a>
      <div class="nav-links">
        <a href="#home">Home</a>
        <a href="#events">Events</a>
        <a href="#colleges">Colleges</a>
        <a href="#about">About</a>
        <a href="#footer">Contact</a>
      </div>
      <div class="nav-actions">
        <a href="#" class="nav-login">Log in</a>
        <div class="signup-wrap">
          <button class="btn btn-primary btn-sm">Sign up</button>
          <div class="signup-menu">
            <a href="#">🎓 As a Student</a>
            <a href="#">🏛️ As an Admin</a>
          </div>
        </div>
        <button class="burger" id="burger"><span></span></button>
      </div>
    </nav>
  </div>
</header>

<div class="drawer-overlay" id="drawerOverlay"></div>
<div class="drawer" id="drawer">
  <a href="#home">Home</a>
  <a href="#events">Events</a>
  <a href="#colleges">Colleges</a>
  <a href="#about">About</a>
  <a href="#footer">Contact</a>
  <div style="height:1px;background:var(--border);margin:6px 0;"></div>
  <a href="#">Log in</a>
  <button class="btn btn-primary" style="width:100%;">Sign up</button>
</div>

<!-- ============ HERO ============ -->
<section class="hero" id="home">
  <div class="hero-bg" id="heroBg">
    <img id="heroImg" src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop" alt="">
  </div>
  <div id="particles"></div>
  <div class="wrap hero-grid">
    <div class="hero-content">
      <div class="hero-badges">
        <span class="eyebrow"><span class="dot"></span> Live across 120+ campuses</span>
      </div>
      <h1>
        <span class="line"><span id="heroTitle">GLOBAL<br>HACKATHON</span></span>
      </h1>
      <p class="hero-sub" id="heroSub">48 hours. 4,000 builders. One campus turned into the biggest hack-night of the year — teams ship real products, judges are ex-founders, and the after-party doesn't stop till sunrise.</p>

      <div class="event-meta" id="heroMeta">
        <span class="meta-chip">🏫 <b>IIT Bombay</b></span>
        <span class="meta-chip">📅 <b>Aug 22–24</b></span>
        <span class="meta-chip">📍 <b>Tech Quad</b></span>
        <span class="meta-chip">👥 <b>4,000+</b></span>
        <span class="meta-chip">🏆 <b>₹12L Prize Pool</b></span>
      </div>

      <div class="hero-ctas">
        <button class="btn btn-primary" id="heroRegisterBtn">Register now</button>
        <button class="btn btn-glass" id="heroDetailsBtn">View details</button>
      </div>
    </div>

    <div class="carousel-wrap">
      <div class="carousel-track" id="carouselTrack"></div>
    </div>
  </div>

  <div class="carousel-dots" id="carouselDots" style="position:absolute;bottom:30px;right:40px;left:auto;"></div>

  <div class="scroll-cue">
    <div class="stick"></div> Scroll to explore
  </div>
</section>

<!-- ============ FEATURED EVENTS ============ -->
<section class="section" id="events">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span> Handpicked for you</span>
      <h2>Featured events this week</h2>
      <p>The ones your group chat is already talking about.</p>
    </div>
    <div class="h-scroll" id="featuredScroll"></div>
  </div>
</section>

<!-- ============ TIMELINE ============ -->
<section class="section" style="padding-top:0;">
  <div class="wrap" style="max-width:900px;">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span> Don't miss out</span>
      <h2>Upcoming on your radar</h2>
      <p>A running order of what's next across your favorite campuses.</p>
    </div>
    <div class="timeline stagger" id="timelineList">
      <div class="timeline-track"></div>
      <div class="timeline-fill" id="timelineFill"><div class="timeline-glow"></div></div>
    </div>
  </div>
</section>

<!-- ============ CATEGORIES ============ -->
<section class="section">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span> Find your scene</span>
      <h2>Browse by category</h2>
      <p>Nine ways to spend your weekend. Pick more than one.</p>
    </div>
    <div class="cat-grid stagger" id="catGrid"></div>
  </div>
</section>

<!-- ============ COLLEGES ============ -->
<section class="section" id="colleges">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span> Ranked by energy</span>
      <h2>Trending colleges</h2>
      <p>Where the biggest crowds are showing up this semester.</p>
    </div>
    <div class="college-grid stagger" id="collegeGrid"></div>
  </div>
</section>

<!-- ============ TESTIMONIALS ============ -->
<section class="section" id="about">
  <div class="wrap">
    <div class="section-head reveal">
      <span class="eyebrow"><span class="dot"></span> The word on campus</span>
      <h2>What students are saying</h2>
    </div>
    <div class="testi-viewport reveal">
      <div class="testi-track" id="testiTrack"></div>
    </div>
    <div class="testi-nav">
      <button id="testiPrev">←</button>
      <button id="testiNext">→</button>
    </div>
  </div>
</section>

<!-- ============ STATS ============ -->
<section class="section" style="padding-top:0;">
  <div class="wrap">
    <div class="stats-section reveal" id="statsSection">
      <div><div class="stat-num" data-target="480000">0</div><div class="stat-label">Students connected</div></div>
      <div><div class="stat-num" data-target="12400">0</div><div class="stat-label">Events hosted</div></div>
      <div><div class="stat-num" data-target="620">0</div><div class="stat-label">Colleges onboard</div></div>
      <div><div class="stat-num" data-target="1900000">0</div><div class="stat-label">Registrations</div></div>
    </div>
  </div>
</section>

<!-- ============ FOOTER ============ -->
<footer id="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <svg viewBox="0 0 40 40" fill="none" style="width:30px;height:30px;">
            <path d="M28 6C17 6 8 14.5 8 25c0 3 .6 5.7 1.8 8.2.3.6-.1 1.3-.8 1.3H6" stroke="url(#lg1)" stroke-width="4.2" stroke-linecap="round" fill="none"/>
            <circle cx="30" cy="9" r="3.4" fill="#FFD84D"/>
          </svg>
          CollegeEvents
        </a>
        <p>The platform where students discover, register for, and live campus life across every university.</p>
        <div class="social-row">
          <a href="#">𝕏</a><a href="#">◎</a><a href="#">in</a><a href="#">▶</a>
        </div>
      </div>
      <div class="footer-col">
        <h5>Explore</h5>
        <a href="#events">Events</a>
        <a href="#colleges">Colleges</a>
        <a href="#">Categories</a>
        <a href="#">Cities</a>
      </div>
      <div class="footer-col">
        <h5>Company</h5>
        <a href="#about">About</a>
        <a href="#">Careers</a>
        <a href="#">Press</a>
        <a href="#">Blog</a>
      </div>
      <div class="footer-col">
        <h5>Support</h5>
        <a href="#">Help center</a>
        <a href="#">Organizer login</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 CollegeEvents. Made for every campus.</span>
      <span>Built for students, by students.</span>
    </div>
  </div>
</footer>

<!-- ============ EVENT DETAIL PAGE ============ -->
<div class="page-view" id="detailPage">
  <div class="page-topbar">
    <button class="back-btn" id="detailBack">← Back</button>
    <button class="btn btn-glass btn-sm" id="detailShare">Share</button>
  </div>
  <div class="detail-hero">
    <img id="detailHeroImg" src="" alt="">
    <div class="detail-hero-content">
      <span class="cat-badge" id="detailCatBadge"></span>
      <h1 id="detailTitle"></h1>
      <div class="detail-hero-meta" id="detailHeroMeta"></div>
    </div>
  </div>
  <div class="detail-body">
    <div class="detail-main">
      <p class="lead" id="detailLead"></p>

      <div class="detail-block">
        <h3>About the host college</h3>
        <div class="about-college" id="aboutCollege"></div>
        <div class="gallery-strip" id="gallery"></div>
      </div>

      <div class="detail-block">
        <h3>Past events at this college</h3>
        <div class="past-events" id="pastEvents"></div>
      </div>

      <div class="detail-block">
        <h3>Event timeline</h3>
        <div class="detail-timeline" id="detailTimeline"></div>
      </div>
    </div>

    <div class="detail-side">
      <div class="reg-card">
        <div class="price">Entry</div>
        <b id="detailPrize"></b>
        <button class="btn btn-primary" id="detailRegisterBtn">Register for this event</button>
        <button class="btn btn-glass" style="width:100%;margin-top:10px;" id="detailShareBtn">Add to calendar</button>
        <div class="reg-facts">
          <div class="rf"><span>Date</span><span id="factDate"></span></div>
          <div class="rf"><span>Venue</span><span id="factVenue"></span></div>
          <div class="rf"><span>College</span><span id="factCollege"></span></div>
          <div class="rf"><span>Expected</span><span id="factParticipants"></span></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ============ REGISTER PAGE ============ -->
<div class="page-view" id="registerPage">
  <div class="page-topbar">
    <button class="back-btn" id="registerBack">← Back</button>
  </div>
  <div class="reg-page-wrap" id="registerContent">
    <span class="eyebrow"><span class="dot"></span> Almost there</span>
    <h1>Register for the event</h1>
    <p style="color:var(--text2);font-size:15.5px;">Fill in your details below — a confirmation with your entry pass will land in your inbox.</p>

    <div class="reg-summary" id="regSummary"></div>

    <form id="registerForm">
      <div class="form-grid">
        <div class="form-field">
          <label>Full name</label>
          <input type="text" placeholder="e.g. Aarav Mehta" required>
        </div>
        <div class="form-field">
          <label>Email</label>
          <input type="email" placeholder="you@college.edu" required>
        </div>
        <div class="form-field">
          <label>Phone number</label>
          <input type="tel" placeholder="+91 98765 43210" required>
        </div>
        <div class="form-field">
          <label>College</label>
          <input type="text" placeholder="Your institution" required>
        </div>
        <div class="form-field full">
          <label>Team size</label>
          <select>
            <option>Just me (solo)</option>
            <option>2–3 people</option>
            <option>4–5 people</option>
            <option>6+ people</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn btn-primary reg-submit">Confirm registration</button>
    </form>
  </div>

  <div class="reg-page-wrap" id="registerSuccess" style="display:none;">
    <div class="reg-success">
      <div class="check">✓</div>
      <h2>You're registered!</h2>
      <p id="successText">Your spot is confirmed. Check your email for the entry pass and event updates.</p>
      <button class="btn btn-primary" id="successBackBtn">Back to home</button>
    </div>
  </div>
</div>

<script>
/* ================= DATA ================= */
const EVENTS = [
  {id:"hackathon", title:"Global Hackathon", cat:"HACKATHON", college:"IIT Bombay", venue:"Tech Quad", date:"Aug 22–24", participants:"4,000+", prize:"₹12L Prize Pool",
    img:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
    sub:"48 hours. 4,000 builders. One campus turned into the biggest hack-night of the year — teams ship real products, judges are ex-founders, and the after-party doesn't stop till sunrise.", badge:"b-blue"},
  {id:"musicfest", title:"Neon Music Fest", cat:"MUSIC", college:"BITS Pilani", venue:"Open Air Arena", date:"Sep 5–6", participants:"9,500+", prize:"Headliner: Anonymous DJ",
    img:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
    sub:"Two nights, three stages, and a lineup built entirely around campus talent plus one surprise headliner nobody's naming yet.", badge:"b-pink"},
  {id:"startup", title:"Startup Sprint", cat:"STARTUP", college:"NMIMS Mumbai", venue:"Innovation Hall", date:"Sep 12", participants:"1,200+", prize:"₹8L Funding Pool",
    img:"https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
    sub:"Pitch a company in 72 hours flat. Real VCs sit on the panel, and the winning team walks out with a term sheet, not just a trophy.", badge:"b-orange"},
  {id:"dance", title:"Dance Nationals", cat:"DANCE", college:"Delhi University", venue:"Convocation Ground", date:"Sep 18–19", participants:"3,000+", prize:"₹5L + Nationals Trophy",
    img:"https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=1600&auto=format&fit=crop",
    sub:"Sixty crews, one floor, and a scoreboard that changes every round. This is the final stop before the national title is decided.", badge:"b-purple"},
  {id:"aisummit", title:"AI Builders Summit", cat:"AI", college:"IIT Delhi", venue:"CS Auditorium", date:"Sep 25", participants:"2,600+", prize:"Compute credits + mentorship",
    img:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1600&auto=format&fit=crop",
    sub:"A day of workshops and demos from students actually shipping AI products, followed by an open build-night with GPUs on tap.", badge:"b-cyan"},
  {id:"cricket", title:"Campus Cricket Cup", cat:"SPORTS", college:"Manipal University", venue:"Sports Complex", date:"Oct 2–4", participants:"5,000+ spectators", prize:"Inter-campus Trophy",
    img:"https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1600&auto=format&fit=crop",
    sub:"Sixteen colleges, three days, one trophy. Bring your college colors — the stands get loud for this one.", badge:"b-green"},
];

const CATEGORIES = [
  {name:"Hackathons", count:"1,240 events", icon:"💻", glow:"rgba(36,81,255,.4)"},
  {name:"Sports", count:"980 events", icon:"🏆", glow:"rgba(139,197,63,.4)"},
  {name:"Technical", count:"1,510 events", icon:"⚙️", glow:"rgba(215,255,61,.4)"},
  {name:"Music", count:"860 events", icon:"🎧", glow:"rgba(255,75,51,.4)"},
  {name:"Dance", count:"640 events", icon:"💃", glow:"rgba(255,216,77,.4)"},
  {name:"Gaming", count:"1,110 events", icon:"🎮", glow:"rgba(215,255,61,.4)"},
  {name:"Startup", count:"470 events", icon:"🚀", glow:"rgba(249,115,22,.4)"},
  {name:"Robotics", count:"390 events", icon:"🤖", glow:"rgba(36,81,255,.4)"},
];

/* Extra per-college info used on the detail page */
const COLLEGE_INFO = {
  "IIT Bombay": {loc:"Powai, Mumbai, India", founded:"1958", students:"11,000", events:"340",
    img:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    about:"One of India's premier engineering institutes, known for its buzzing tech culture and a campus that turns into a 24-hour build lab every fest season.",
    gallery:["https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=400&auto=format&fit=crop"],
    past:[{name:"Techfest 2025", icon:"⚡", type:"Flagship · 90k attendees"},{name:"Robotics Rumble", icon:"🤖", type:"Technical · 2,200 teams"},{name:"Mood Indigo Prelude", icon:"🎨", type:"Cultural · 15k footfall"}]},
  "BITS Pilani": {loc:"Pilani, Rajasthan, India", founded:"1964", students:"9,000", events:"280",
    img:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop",
    about:"A desert campus with an outsized reputation for its annual cultural fest, Oasis — three days that turn Pilani into the loudest town in Rajasthan.",
    gallery:["https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=401&auto=format&fit=crop"],
    past:[{name:"Oasis 2025", icon:"🎪", type:"Cultural · 60k attendees"},{name:"Apogee", icon:"🔬", type:"Technical · 8,000 teams"},{name:"Battle of Bands", icon:"🎸", type:"Music · 40 colleges"}]},
  "NMIMS Mumbai": {loc:"Vile Parle, Mumbai, India", founded:"1981", students:"6,500", events:"190",
    img:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
    about:"A management-first campus that treats its startup and business fests as seriously as a real accelerator demo day.",
    gallery:["https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop"],
    past:[{name:"Umang Business Fest", icon:"📈", type:"Startup · 3,000 attendees"},{name:"Case Crunch Finals", icon:"📊", type:"Case comp · 400 teams"},{name:"Founders' Night", icon:"🚀", type:"Networking · 800 founders"}]},
  "Delhi University": {loc:"North Campus, Delhi, India", founded:"1922", students:"18,000", events:"410",
    img:"https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=800&auto=format&fit=crop",
    about:"India's largest and oldest campus culture hub — every college within DU runs its own fest, making the calendar packed year-round.",
    gallery:["https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1508997449629-303059a039c0?q=80&w=400&auto=format&fit=crop"],
    past:[{name:"Antardhwani 2025", icon:"🎭", type:"Cultural · 25k attendees"},{name:"Ritmo Dance Meet", icon:"💃", type:"Dance · 55 crews"},{name:"Crossroads Fest", icon:"🎶", type:"Music · 30k attendees"}]},
  "IIT Delhi": {loc:"Hauz Khas, Delhi, India", founded:"1961", students:"8,900", events:"260",
    img:"https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=800&auto=format&fit=crop",
    about:"A research-heavy campus where the AI and robotics labs spill straight into student-run summits and open build-nights.",
    gallery:["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop"],
    past:[{name:"Rendezvous 2025", icon:"🎉", type:"Flagship · 50k attendees"},{name:"ML Summer School", icon:"🧠", type:"Technical · 1,000 attendees"},{name:"Open Source Day", icon:"💻", type:"Hackathon · 600 devs"}]},
  "Manipal University": {loc:"Manipal, Karnataka, India", founded:"1953", students:"14,000", events:"300",
    img:"https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=800&auto=format&fit=crop",
    about:"A sprawling multi-disciplinary campus with a sports culture that fills stands for even the inter-hostel matches.",
    gallery:["https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop","https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop"],
    past:[{name:"Manipal Sports Meet 2025", icon:"🏅", type:"Sports · 12k spectators"},{name:"Revels Cultural Fest", icon:"🎊", type:"Cultural · 20k attendees"},{name:"Kar-Manipal Cup", icon:"🏏", type:"Cricket · 16 colleges"}]},
};

const COLLEGES = [
  {name:"IIT Bombay", loc:"Mumbai, India", events:"340", students:"11k", img:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"},
  {name:"BITS Pilani", loc:"Pilani, India", events:"280", students:"9k", img:"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop"},
  {name:"Delhi University", loc:"Delhi, India", events:"410", students:"18k", img:"https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=1200&auto=format&fit=crop"},
];

const TESTIMONIALS = [
  {quote:"Found the AI summit through CollegeEvents two days before it happened, showed up solo, left with a team and a mentor.", name:"Aarav Mehta", role:"BTech CSE, IIT Delhi", avatar:"https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop"},
  {quote:"The event carousel is genuinely the only reason I know what's happening on other campuses, not just mine.", name:"Simran Kaur", role:"Design, NID Ahmedabad", avatar:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"},
  {quote:"Registered for Nationals in under a minute on my phone between classes. No app has ever felt this fast.", name:"Rohan Iyer", role:"Dance Society Lead, DU", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"},
  {quote:"As an organizer, our sign-ups tripled the week we listed on here. The reach across colleges is unmatched.", name:"Priya Nair", role:"Fest Coordinator, BITS Pilani", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"},
];

/* ================= NAVBAR ================= */
const header = document.getElementById('header');
window.addEventListener('scroll', ()=>{
  header.classList.toggle('scrolled', window.scrollY > 40);
});

const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
function toggleDrawer(open){
  burger.classList.toggle('open', open);
  drawer.classList.toggle('open', open);
  drawerOverlay.classList.toggle('open', open);
}
burger.addEventListener('click', ()=>toggleDrawer(!drawer.classList.contains('open')));
drawerOverlay.addEventListener('click', ()=>toggleDrawer(false));
drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>toggleDrawer(false)));

/* ================= PARTICLES ================= */
const particleHost = document.getElementById('particles');
for(let i=0;i<26;i++){
  const p = document.createElement('div');
  p.className='particle';
  const size = Math.random()*3+1;
  p.style.width=size+'px'; p.style.height=size+'px';
  p.style.left = Math.random()*100+'%';
  p.style.top = 90+Math.random()*10+'%';
  p.style.animationDuration = (10+Math.random()*14)+'s';
  p.style.animationDelay = (Math.random()*10)+'s';
  particleHost.appendChild(p);
}

/* ================= HERO CAROUSEL ================= */
const track = document.getElementById('carouselTrack');
const dotsHost = document.getElementById('carouselDots');
let activeIdx = 0;

function renderCarousel(){
  track.innerHTML='';
  dotsHost.innerHTML='';
  EVENTS.forEach((ev, i)=>{
    const card = document.createElement('div');
    card.className='event-card pos-hidden';
    card.innerHTML = `<img src="${ev.img}" alt="">
      <div class="card-shade"></div>
      <div class="card-info">
        <span class="cat">${ev.cat}</span>
        <h4>${ev.title}</h4>
        <div class="ed">${ev.college} · ${ev.date}</div>
      </div>`;
    card.addEventListener('click', ()=>{
      if(i===activeIdx){ openDetailPage(ev.id); }
      else{ setActive(i); }
    });
    track.appendChild(card);

    const dot = document.createElement('button');
    if(i===activeIdx) dot.classList.add('active');
    dot.addEventListener('click', ()=>setActive(i));
    dotsHost.appendChild(dot);
  });
  positionCards();
}

function positionCards(){
  const cards = track.children;
  const n = EVENTS.length;
  for(let i=0;i<n;i++){
    let diff = i - activeIdx;
    if(diff > n/2) diff -= n;
    if(diff < -n/2) diff += n;
    cards[i].classList.remove('pos-active','pos-l1','pos-l2','pos-r1','pos-r2','pos-hidden');
    if(diff===0) cards[i].classList.add('pos-active');
    else if(diff===1) cards[i].classList.add('pos-r1');
    else if(diff===2) cards[i].classList.add('pos-r2');
    else if(diff===-1) cards[i].classList.add('pos-l1');
    else if(diff===-2) cards[i].classList.add('pos-l2');
    else cards[i].classList.add('pos-hidden');
  }
  [...dotsHost.children].forEach((d,i)=>d.classList.toggle('active', i===activeIdx));
}

function setActive(i){
  activeIdx = i;
  positionCards();
  updateHero();
}

function updateHero(){
  const ev = EVENTS[activeIdx];
  document.getElementById('heroImg').style.opacity = 0;
  setTimeout(()=>{
    document.getElementById('heroImg').src = ev.img;
    document.getElementById('heroImg').style.opacity = .28;
  }, 250);
  document.getElementById('heroTitle').innerHTML = ev.title.toUpperCase().replace(' ', '<br>');
  document.getElementById('heroSub').textContent = ev.sub;
  document.getElementById('heroMeta').innerHTML = `
    <span class="meta-chip">🏫 <b>${ev.college}</b></span>
    <span class="meta-chip">📅 <b>${ev.date}</b></span>
    <span class="meta-chip">📍 <b>${ev.venue}</b></span>
    <span class="meta-chip">👥 <b>${ev.participants}</b></span>
    <span class="meta-chip">🏆 <b>${ev.prize}</b></span>`;
}
renderCarousel();

let autoTimer = setInterval(()=>setActive((activeIdx+1)%EVENTS.length), 6000);
track.addEventListener('mouseenter', ()=>clearInterval(autoTimer));
track.addEventListener('mouseleave', ()=>{autoTimer = setInterval(()=>setActive((activeIdx+1)%EVENTS.length), 6000);});

document.getElementById('heroDetailsBtn').addEventListener('click', ()=>openDetailPage(EVENTS[activeIdx].id));
document.getElementById('heroRegisterBtn').addEventListener('click', ()=>openRegisterPage(EVENTS[activeIdx].id));

/* ================= FEATURED EVENTS ================= */
const featuredHost = document.getElementById('featuredScroll');
EVENTS.forEach(ev=>{
  const el = document.createElement('div');
  el.className='feat-card';
  el.innerHTML = `
    <div class="img-wrap"><img src="${ev.img}" alt=""></div>
    <div class="fc-body">
      <div class="cat-row"><span class="cat-badge ${ev.badge}">${ev.cat}</span></div>
      <div class="fc-title">${ev.title}</div>
      <div class="fc-sub">${ev.college} · ${ev.venue}</div>
      <div class="fc-foot">
        <span>${ev.date}</span>
        <button class="btn btn-glass btn-sm fc-details-btn">Details</button>
      </div>
    </div>`;
  el.addEventListener('click', ()=>openDetailPage(ev.id));
  el.querySelector('.fc-details-btn').addEventListener('click', (e)=>{ e.stopPropagation(); openDetailPage(ev.id); });
  featuredHost.appendChild(el);
});

/* ================= TIMELINE ================= */
const timelineHost = document.getElementById('timelineList');
EVENTS.forEach(ev=>{
  const el = document.createElement('div');
  el.className='t-item';
  el.innerHTML = `
    <div class="t-date">${ev.date.split('–')[0]}<small>${ev.college}</small></div>
    <div class="t-card">
      <div class="t-thumb"><img src="${ev.img}" alt=""></div>
      <div class="t-info"><h4>${ev.title}</h4><span>${ev.venue} · ${ev.cat}</span></div>
      <div class="t-arrow">→</div>
    </div>`;
  el.querySelector('.t-card').addEventListener('click', ()=>openDetailPage(ev.id));
  timelineHost.appendChild(el);
});

const timelineFillEl = document.getElementById('timelineFill');
const timelineItems = [...timelineHost.querySelectorAll('.t-item')];
function updateTimelineFill(){
  const rect = timelineHost.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = Math.min(Math.max((vh - rect.top) / (rect.height + vh), 0), 1);
  const fillPx = progress * rect.height;
  timelineFillEl.style.height = fillPx + 'px';
  timelineItems.forEach(item=>{
    item.classList.toggle('lit', item.offsetTop <= fillPx);
  });
}
window.addEventListener('scroll', updateTimelineFill, {passive:true});
window.addEventListener('resize', updateTimelineFill);
updateTimelineFill();

/* ================= CATEGORIES ================= */
const catHost = document.getElementById('catGrid');
CATEGORIES.forEach(c=>{
  const el = document.createElement('div');
  el.className='cat-tile';
  el.style.setProperty('--glow', c.glow);
  el.innerHTML = `<div style="font-size:26px;">${c.icon}</div>
    <div><div class="cname">${c.name}</div><div class="ccount">${c.count}</div></div>`;
  catHost.appendChild(el);
});

/* ================= COLLEGES ================= */
const collegeHost = document.getElementById('collegeGrid');
COLLEGES.forEach((c,i)=>{
  const el = document.createElement('div');
  el.className='college-card';
  el.innerHTML = `
    <img src="${c.img}" alt="">
    <div class="college-rank">${i+1}</div>
    <div class="college-info">
      <h4>${c.name}</h4>
      <div class="loc">📍 ${c.loc}</div>
      <div class="college-stats"><span><b>${c.events}</b> events</span><span><b>${c.students}</b> students</span></div>
    </div>`;
  el.addEventListener('click', ()=>{
    const ev = EVENTS.find(e=>e.college===c.name) || EVENTS[0];
    openDetailPage(ev.id);
  });
  collegeHost.appendChild(el);
});

/* ================= TESTIMONIALS ================= */
const testiTrack = document.getElementById('testiTrack');
TESTIMONIALS.forEach(t=>{
  const el = document.createElement('div');
  el.className='testi-card';
  el.innerHTML = `
    <div class="testi-quote">"${t.quote}"</div>
    <div class="testi-person">
      <img class="testi-avatar" src="${t.avatar}" alt="">
      <div><h5>${t.name}</h5><span>${t.role}</span></div>
    </div>`;
  testiTrack.appendChild(el);
});
let testiIdx = 0;
function scrollTesti(){
  const cardW = testiTrack.children[0].getBoundingClientRect().width + 22;
  testiTrack.style.transform = `translateX(-${testiIdx*cardW}px)`;
}
document.getElementById('testiNext').addEventListener('click', ()=>{
  testiIdx = Math.min(testiIdx+1, TESTIMONIALS.length - (window.innerWidth<980?1:3));
  scrollTesti();
});
document.getElementById('testiPrev').addEventListener('click', ()=>{
  testiIdx = Math.max(testiIdx-1, 0);
  scrollTesti();
});

/* ================= SCROLL REVEAL ================= */
const revealEls = document.querySelectorAll('.reveal, .stagger');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, {threshold:.15});
revealEls.forEach(el=>io.observe(el));

/* ================= STAT COUNTERS ================= */
const statNums = document.querySelectorAll('.stat-num');
const statIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      animateCount(e.target);
      statIO.unobserve(e.target);
    }
  });
}, {threshold:.4});
statNums.forEach(el=>statIO.observe(el));

function animateCount(el){
  const target = parseInt(el.dataset.target);
  const dur = 1800;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now-start)/dur, 1);
    const eased = 1 - Math.pow(1-p, 3);
    const val = Math.floor(target*eased);
    el.textContent = val.toLocaleString();
    if(p<1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

/* smooth in-page nav for header links */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      const target = document.querySelector(id);
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
    }
  });
});

/* ================= DETAIL PAGE ================= */
const detailPage = document.getElementById('detailPage');
const registerPage = document.getElementById('registerPage');
let currentEventId = null;

function buildEventTimeline(ev){
  const base = [
    {day:"Day 1 · Morning", title:"Check-in & kits", desc:"Badge pickup, welcome kit, and campus orientation."},
    {day:"Day 1 · Afternoon", title:"Opening ceremony", desc:"Kickoff talk and rules briefing on the main stage."},
  ];
  const middle = {
    "HACKATHON":[{day:"Day 1 · Evening", title:"Hacking begins", desc:"Teams lock in ideas and start building."},{day:"Day 2", title:"Mentor rounds", desc:"Rotating mentor check-ins and mid-way demos."},{day:"Day 3", title:"Final demos & judging", desc:"Teams present to the judging panel."}],
    "MUSIC":[{day:"Night 1", title:"Opening acts", desc:"Campus bands warm up the main stage."},{day:"Night 1 · Late", title:"Headline set", desc:"The surprise headliner takes the stage."},{day:"Night 2", title:"Closing set & awards", desc:"Best act award and closing performance."}],
    "STARTUP":[{day:"Day 1", title:"Pitch prep", desc:"Teams refine decks with assigned mentors."},{day:"Day 2", title:"Pitch rounds", desc:"Teams pitch live in front of VC judges."},{day:"Day 3", title:"Term sheet reveal", desc:"Winning team announced and offer extended."}],
    "DANCE":[{day:"Day 1", title:"Prelims", desc:"Sixty crews battle down to the top sixteen."},{day:"Day 2 · Morning", title:"Quarterfinals", desc:"Score-based rounds with live judge commentary."},{day:"Day 2 · Night", title:"Finals", desc:"Top crews battle for the nationals trophy."}],
    "AI":[{day:"Morning", title:"Workshops", desc:"Hands-on sessions on the latest model tooling."},{day:"Afternoon", title:"Demo showcase", desc:"Students demo shipped AI products."},{day:"Evening", title:"Open build-night", desc:"Free-for-all build session with GPUs on tap."}],
    "SPORTS":[{day:"Day 1", title:"Group stage", desc:"Sixteen colleges split across four groups."},{day:"Day 2", title:"Knockouts", desc:"Quarterfinals and semifinals across the day."},{day:"Day 3-4", title:"Final", desc:"Championship match for the inter-campus trophy."}],
  };
  const end = [{day:"Closing", title:"Awards & wrap-up", desc:"Winners announced, prizes handed out, closing remarks."}];
  return [...base, ...(middle[ev.cat]||middle.HACKATHON), ...end];
}

function openDetailPage(eventId){
  const ev = EVENTS.find(e=>e.id===eventId);
  if(!ev) return;
  currentEventId = eventId;
  const college = COLLEGE_INFO[ev.college] || {};

  document.getElementById('detailHeroImg').src = ev.img;
  document.getElementById('detailCatBadge').className = 'cat-badge ' + ev.badge;
  document.getElementById('detailCatBadge').textContent = ev.cat;
  document.getElementById('detailTitle').textContent = ev.title;
  document.getElementById('detailHeroMeta').innerHTML = `
    <span class="meta-chip">🏫 <b>${ev.college}</b></span>
    <span class="meta-chip">📅 <b>${ev.date}</b></span>
    <span class="meta-chip">📍 <b>${ev.venue}</b></span>
    <span class="meta-chip">👥 <b>${ev.participants}</b></span>`;
  document.getElementById('detailLead').textContent = ev.sub;
  document.getElementById('detailPrize').textContent = ev.prize;
  document.getElementById('factDate').textContent = ev.date;
  document.getElementById('factVenue').textContent = ev.venue;
  document.getElementById('factCollege').textContent = ev.college;
  document.getElementById('factParticipants').textContent = ev.participants;

  document.getElementById('aboutCollege').innerHTML = `
    <img src="${college.img||ev.img}" alt="">
    <div>
      <h4>${ev.college}</h4>
      <div class="loc">📍 ${college.loc||ev.venue} · Est. ${college.founded||'—'}</div>
      <p style="font-size:13.5px;color:var(--text2);line-height:1.6;margin-bottom:12px;">${college.about||''}</p>
      <div class="stats">
        <span><b>${college.students||'—'}</b> students</span>
        <span><b>${college.events||'—'}</b> events hosted</span>
      </div>
    </div>`;

  document.getElementById('gallery').innerHTML = (college.gallery||[ev.img]).map(src=>`<img src="${src}" alt="">`).join('');

  document.getElementById('pastEvents').innerHTML = (college.past||[]).map(p=>`
    <div class="past-item">
      <div class="p-thumb">${p.icon}</div>
      <div><h5>${p.name}</h5><span>${p.type}</span></div>
      <span class="p-badge">Completed</span>
    </div>`).join('') || `<div class="past-item"><div class="p-thumb">📅</div><div><h5>No past events listed yet</h5><span>Check back soon</span></div></div>`;

  const tl = buildEventTimeline(ev);
  document.getElementById('detailTimeline').innerHTML = tl.map((t,i)=>`
    <div class="dt-item ${i===0?'now':''}">
      <div class="dt-day">${t.day}</div>
      <h5>${t.title}</h5>
      <p>${t.desc}</p>
    </div>`).join('');

  detailPage.classList.add('open');
  detailPage.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeDetailPage(){
  detailPage.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('detailBack').addEventListener('click', closeDetailPage);
document.getElementById('detailShare').addEventListener('click', ()=>alert('Link copied to clipboard (demo).'));
document.getElementById('detailShareBtn').addEventListener('click', ()=>alert('Added to calendar (demo).'));
document.getElementById('detailRegisterBtn').addEventListener('click', ()=>openRegisterPage(currentEventId));

/* ================= REGISTER PAGE ================= */
const registerContent = document.getElementById('registerContent');
const registerSuccess = document.getElementById('registerSuccess');
const registerForm = document.getElementById('registerForm');

function openRegisterPage(eventId){
  const ev = EVENTS.find(e=>e.id===eventId) || EVENTS[activeIdx];
  currentEventId = ev.id;
  registerContent.style.display = '';
  registerSuccess.style.display = 'none';
  registerForm.reset();

  document.getElementById('regSummary').innerHTML = `
    <img src="${ev.img}" alt="">
    <div>
      <h5>${ev.title}</h5>
      <span>${ev.college} · ${ev.date} · ${ev.venue}</span>
    </div>`;

  registerPage.classList.add('open');
  registerPage.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeRegisterPage(){
  registerPage.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('registerBack').addEventListener('click', closeRegisterPage);

registerForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const ev = EVENTS.find(e=>e.id===currentEventId) || EVENTS[0];
  document.getElementById('successText').textContent = `Your spot for ${ev.title} is confirmed. Check your email for the entry pass and event updates.`;
  registerContent.style.display = 'none';
  registerSuccess.style.display = '';
  registerPage.scrollTop = 0;
});

document.getElementById('successBackBtn').addEventListener('click', closeRegisterPage);
</script>
</body>
</html>