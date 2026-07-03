/**
 * Marketing landing page for taxmcp.ai2fin.com - served to BROWSERS (Accept:
 * text/html) on GET. Agents (POST JSON-RPC) get the MCP protocol untouched;
 * terminals get the ASCII card. Self-contained HTML, no external assets.
 * Designed via a multi-direction design pass; this file is the source of truth.
 * embracingearth.space
 */
/* eslint-disable */
export const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Tax MCP by AI2Fin - the tax brain your agent calls</title>
<meta name="description" content="A free, public tax brain your assistant or agent connects to. Every answer is source-cited to the national tax authority with a verified date. GST/VAT, income, company and capital-gains for ~50 countries. No login, no key.">
<link rel="canonical" href="https://taxmcp.ai2fin.com/">
<meta property="og:type" content="website">
<meta property="og:url" content="https://taxmcp.ai2fin.com/">
<meta property="og:title" content="The Tax MCP by AI2Fin - the tax brain your agent calls">
<meta property="og:description" content="Free, source-cited tax tools over MCP: GST/VAT, income, company and capital-gains for ~50 countries. No login, no key.">
<style>
  :root{
    --bg1:#020c15; --bg2:#041a2e; --bg3:#010810;
    --teal-300:#5eead4; --teal-400:#2dd4bf; --teal-500:#14b8a6; --cyan:#06b6d4;
    --ink:#eaf6f4; --muted:#9fc3c0; --muted2:#7ba3a0;
    --card:rgba(8,28,42,.66); --card2:rgba(6,22,36,.55); --line:rgba(94,234,212,.16); --line2:rgba(94,234,212,.10);
    --radius:20px;
    --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;font-family:var(--font);color:var(--ink);line-height:1.6;
    background:
      radial-gradient(1000px 560px at 78% -8%, rgba(20,184,166,.16), transparent 60%),
      linear-gradient(135deg,#020c15 0%,#041a2e 60%,#010810 100%);
    background-attachment:fixed;-webkit-font-smoothing:antialiased;overflow-x:hidden;font-size:16px;
  }
  a{color:var(--teal-300);text-decoration:none}
  a:hover{text-decoration:underline}
  :focus-visible{outline:3px solid var(--teal-300);outline-offset:3px;border-radius:6px}
  .wrap{max-width:1080px;margin:0 auto;padding:0 20px}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}
  .skip{position:absolute;left:-999px;top:8px;z-index:60;background:var(--teal-400);color:#012;padding:8px 14px;border-radius:8px;font-weight:700}
  .skip:focus{left:12px;text-decoration:none}

  /* ambient glow + rays */
  .glow{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
  .glow::before{content:"";position:absolute;top:-12%;left:50%;width:880px;height:880px;transform:translateX(-50%);
    background:radial-gradient(circle,rgba(20,184,166,.20),rgba(6,182,212,.07) 42%,transparent 70%);filter:blur(8px)}
  .rays{position:absolute;top:-160px;left:50%;width:1px;height:760px;transform-origin:top center}
  .rays span{position:absolute;top:0;left:0;width:240px;height:760px;transform-origin:top center;
    background:linear-gradient(to bottom,rgba(94,234,212,.10),transparent 60%);opacity:.5}
  .rays span:nth-child(1){transform:rotate(-26deg)}
  .rays span:nth-child(2){transform:rotate(-9deg)}
  .rays span:nth-child(3){transform:rotate(9deg)}
  .rays span:nth-child(4){transform:rotate(26deg)}

  /* header */
  header{position:sticky;top:0;z-index:40;backdrop-filter:blur(12px);
    background:linear-gradient(to bottom,rgba(2,12,21,.86),rgba(2,12,21,.36));border-bottom:1px solid var(--line2)}
  .nav{display:flex;align-items:center;justify-content:space-between;height:62px}
  .brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.2px;font-size:16px;color:var(--ink)}
  .brand:hover{text-decoration:none}
  .brand svg{filter:drop-shadow(0 2px 8px rgba(45,212,191,.4))}
  .brand b{background:linear-gradient(90deg,var(--teal-300),var(--cyan));-webkit-background-clip:text;background-clip:text;color:transparent}
  .navlinks{display:flex;gap:22px;align-items:center;font-size:14px;color:var(--muted)}
  .navlinks a{color:var(--muted)}
  .navlinks a:hover{color:var(--teal-300);text-decoration:none}
  .nav-cta{padding:8px 16px;border-radius:999px;font-weight:700;font-size:13.5px;color:#022;
    background:linear-gradient(90deg,var(--teal-300),var(--cyan));box-shadow:0 6px 18px rgba(20,184,166,.32)}
  .nav-cta:hover{text-decoration:none}
  @media(max-width:760px){.navlinks a:not(.nav-cta){display:none}}

  /* hero */
  .hero{padding:62px 0 28px;text-align:center}
  .pill{display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:999px;font-size:12.5px;font-weight:600;
    color:var(--teal-300);background:rgba(20,184,166,.10);border:1px solid var(--line);letter-spacing:.3px}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--teal-400);box-shadow:0 0 0 0 rgba(45,212,191,.6);animation:pulse 2.4s infinite}
  h1{font-size:clamp(34px,6.2vw,62px);line-height:1.05;margin:22px 0 0;letter-spacing:-1.4px;font-weight:850}
  h1 .clip{background:linear-gradient(94deg,#fff 4%,var(--teal-300) 48%,var(--cyan) 96%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{font-size:clamp(16px,2.3vw,20px);color:var(--muted);max-width:680px;margin:20px auto 0}
  .sub b{color:var(--ink);font-weight:700}

  /* endpoint cta */
  .endpoint{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin:30px auto 0;max-width:620px}
  .ep-box{display:flex;align-items:center;gap:12px;flex:1;min-width:280px;justify-content:space-between;
    padding:6px 6px 6px 18px;border-radius:14px;background:rgba(3,18,30,.85);border:1px solid var(--line);
    box-shadow:0 10px 30px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.04)}
  .ep-url{font-family:var(--mono);font-size:14.5px;color:var(--teal-300);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .copybtn{cursor:pointer;border:0;font-family:var(--font);font-weight:700;font-size:13.5px;color:#022;
    padding:11px 18px;border-radius:10px;background:linear-gradient(90deg,var(--teal-300),var(--cyan));
    box-shadow:0 6px 16px rgba(20,184,166,.3);transition:transform .15s ease, box-shadow .15s ease;white-space:nowrap;
    position:relative;overflow:hidden}
  .copybtn .shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.5) 50%,transparent 70%);transform:translateX(-130%);animation:shimmer 5s ease-in-out infinite}
  .copybtn:hover{transform:translateY(-1px);box-shadow:0 9px 22px rgba(20,184,166,.42)}
  .copybtn:active{transform:translateY(0)}
  .ep-meta{font-size:12.5px;color:var(--muted2);margin-top:14px}
  .ep-meta b{color:var(--teal-300)}

  /* ===== CHAT SHOWPIECE ===== */
  .stage{margin:46px auto 0;max-width:760px}
  .stage-label{text-align:center;font-size:12.5px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted2);margin-bottom:14px}
  .chat{border-radius:24px;border:1px solid var(--line);overflow:hidden;
    background:linear-gradient(180deg,rgba(6,24,38,.92),rgba(3,14,24,.94));
    box-shadow:0 30px 80px -24px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.05)}
  .chat-bar{display:flex;align-items:center;gap:8px;padding:13px 18px;border-bottom:1px solid var(--line2);background:rgba(2,12,20,.6)}
  .tl{width:11px;height:11px;border-radius:50%}
  .tl.r{background:#ff5f57}.tl.y{background:#febc2e}.tl.g{background:#28c840}
  .chat-title{margin-left:8px;font-size:13px;color:var(--muted);font-weight:600}
  .chat-title .agent{color:var(--teal-300)}
  .chat-body{padding:22px 20px 24px;display:flex;flex-direction:column;gap:16px}
  .msg{max-width:88%;animation:rise .5s ease both}
  .msg .who{font-size:11.5px;letter-spacing:.4px;text-transform:uppercase;color:var(--muted2);margin:0 4px 5px;font-weight:700}
  .bubble{padding:13px 16px;border-radius:16px;font-size:15px}
  .me{align-self:flex-end;text-align:right}
  .me .bubble{background:linear-gradient(135deg,rgba(20,184,166,.22),rgba(6,182,212,.16));border:1px solid var(--line);border-bottom-right-radius:5px;color:#eafffb}
  .ai{align-self:flex-start}
  .ai .bubble{background:rgba(255,255,255,.045);border:1px solid var(--line2);border-bottom-left-radius:5px}

  /* tool-call chip */
  .toolcall{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;max-width:88%;
    padding:9px 14px;border-radius:13px;font-size:13px;color:var(--teal-300);font-weight:600;
    background:rgba(20,184,166,.07);border:1px dashed var(--line);animation:rise .5s ease both}
  .toolcall .gear{width:15px;height:15px;animation:spin 4.5s linear infinite}
  .toolcall code{font-family:var(--mono);color:var(--teal-300);background:rgba(94,234,212,.12);padding:2px 7px;border-radius:6px;font-size:12.5px}
  .toolcall .ret{color:var(--muted2);font-weight:500}

  /* answer with receipt */
  .answer .bubble{background:linear-gradient(135deg,rgba(8,30,44,.9),rgba(6,22,34,.9));border:1px solid var(--line)}
  .answer .big{font-size:17px;font-weight:600;color:#fff}
  .answer .calc{display:flex;flex-wrap:wrap;gap:8px;margin:11px 0 4px}
  .answer .calc span{font-size:12.5px;color:var(--muted);background:rgba(255,255,255,.045);border:1px solid var(--line2);padding:5px 10px;border-radius:8px}
  .answer .calc b{color:var(--teal-300)}
  /* the source receipt — hero proof moment */
  .source{display:flex;align-items:center;gap:10px;margin-top:13px;padding:11px 14px;border-radius:12px;
    background:linear-gradient(90deg,rgba(20,184,166,.16),rgba(6,182,212,.06));
    border:1px solid rgba(94,234,212,.45);
    box-shadow:0 0 0 1px rgba(94,234,212,.08),0 14px 30px -16px rgba(20,184,166,.55);
    font-size:13px;color:var(--teal-300);position:relative;overflow:hidden}
  .source .shine{position:absolute;top:0;left:-60%;width:50%;height:100%;
    background:linear-gradient(100deg,transparent,rgba(255,255,255,.18),transparent);animation:sweep 4.5s ease-in-out infinite}
  .source .stamp{position:absolute;right:-6px;top:-7px;font-size:9.5px;font-weight:800;letter-spacing:.04em;
    background:var(--teal-400);color:#022;padding:4px 9px;border-radius:999px;transform:rotate(3deg);
    box-shadow:0 6px 14px -6px rgba(45,212,191,.7)}
  .source svg{flex-shrink:0}
  .source b{color:#eafffb}
  .source .lbl{font-weight:800;text-transform:uppercase;letter-spacing:.6px;font-size:11px;color:var(--teal-400)}
  .pointer{text-align:center;font-size:13px;color:var(--muted2);margin-top:16px}
  .pointer b{color:var(--teal-300)}

  /* sections */
  section{padding:54px 0}
  .kicker{text-align:center;font-size:12.5px;letter-spacing:2px;text-transform:uppercase;color:var(--teal-400);font-weight:700}
  h2{text-align:center;font-size:clamp(26px,4vw,40px);margin:10px 0 0;letter-spacing:-.8px;font-weight:820}
  h2 .clip{background:linear-gradient(94deg,#fff,var(--teal-300));-webkit-background-clip:text;background-clip:text;color:transparent}
  .lead{text-align:center;color:var(--muted);max-width:620px;margin:14px auto 0;font-size:16px}

  /* trust row */
  .trust{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 12px;margin-top:30px}
  .trust .p{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--muted);
    border:1px solid var(--line2);border-radius:999px;padding:8px 14px;background:rgba(255,255,255,.02)}
  .trust .p svg{flex-shrink:0;color:var(--teal-400)}

  /* steps */
  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:38px}
  .step{padding:24px 22px;border-radius:var(--radius);background:var(--card);border:1px solid var(--line2);position:relative;transition:transform .2s ease,border-color .2s ease}
  .step:hover{transform:translateY(-4px);border-color:var(--line)}
  .stepnum{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;
    font-weight:800;color:#022;background:linear-gradient(135deg,var(--teal-300),var(--cyan));margin-bottom:14px;font-size:15px}
  .step h3{margin:0 0 7px;font-size:16.5px;font-weight:750}
  .step p{margin:0;color:var(--muted);font-size:14px}
  .step code{font-family:var(--mono);font-size:12.5px;color:var(--teal-300);background:rgba(94,234,212,.1);padding:2px 7px;border-radius:6px;word-break:break-all}
  @media(max-width:720px){.steps{grid-template-columns:1fr}}

  /* tools */
  .tools{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:38px}
  .tool{padding:22px 20px;border-radius:18px;background:var(--card);border:1px solid var(--line2);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
  .tool:hover{transform:translateY(-3px);border-color:var(--line);box-shadow:0 16px 40px -18px rgba(20,184,166,.45)}
  .tool .ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:13px;
    background:rgba(20,184,166,.12);border:1px solid var(--line)}
  .tool h3{margin:0;font-size:15.5px;font-weight:750}
  .tool .nm{font-family:var(--mono);font-size:11.5px;color:var(--teal-400);display:block;margin:3px 0 8px}
  .tool p{margin:0;color:var(--muted);font-size:13.5px}
  .tool .geo{margin-top:9px;font-size:11px;color:var(--muted2);font-weight:700;letter-spacing:.3px}
  @media(max-width:820px){.tools{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.tools{grid-template-columns:1fr}}

  /* examples */
  .ex-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px}
  .ex{padding:20px;border-radius:18px;background:var(--card);border:1px solid var(--line2)}
  .ex .q{font-size:14px;color:var(--muted);margin:0 0 10px}
  .ex .q::before{content:"You  ";font-weight:800;color:var(--teal-400)}
  .ex .a{font-size:15px;color:#fff;font-weight:600;margin:0}
  .ex .a::before{content:"Fin  ";font-weight:800;color:var(--cyan)}
  .ex .src{font-size:12px;color:var(--teal-300);margin-top:10px;display:flex;align-items:center;gap:6px}
  @media(max-width:680px){.ex-grid{grid-template-columns:1fr}}

  /* VAT preview table */
  .vat{margin-top:20px;border:1px solid var(--line2);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.02)}
  .vat table{width:100%;border-collapse:collapse;font-size:14px}
  .vat caption{text-align:left;padding:13px 18px;color:var(--muted);font-size:13px;border-bottom:1px solid var(--line2)}
  .vat th,.vat td{padding:11px 18px;text-align:left;border-bottom:1px solid var(--line2)}
  .vat th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);font-weight:700}
  .vat tbody tr:last-child td{border-bottom:0}
  .vat td:first-child{font-weight:700;color:#eafaf6}
  .vat .num{font-variant-numeric:tabular-nums;color:var(--teal-300)}
  .vat .auth{color:var(--muted)}
  .vat .foot{padding:11px 18px;font-size:12px;color:var(--muted2);background:rgba(2,18,26,.4)}

  /* coverage strip */
  .cover{margin-top:24px;text-align:center;padding:22px;border-radius:18px;background:rgba(8,28,42,.5);border:1px solid var(--line2)}
  .cover .big{font-size:30px;font-weight:850;color:var(--teal-300)}
  .cover p{margin:6px 0 0;color:var(--muted);font-size:14px}
  .cover .chips{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:13px}
  .cover .chips span{font-size:12.5px;font-weight:600;color:#cbeee7;background:rgba(94,234,212,.08);border:1px solid var(--line);padding:4px 10px;border-radius:8px}
  .cover .chips .more{color:var(--muted2);background:transparent;border-color:transparent}

  /* two-server note */
  .twin{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:36px}
  .panel{padding:24px;border-radius:var(--radius);border:1px solid var(--line2)}
  .panel.pub{background:linear-gradient(155deg,rgba(20,184,166,.13),rgba(6,24,38,.6));border-color:var(--line)}
  .panel.acct{background:var(--card)}
  .panel .tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:12px}
  .panel.pub .tag{color:#022;background:linear-gradient(90deg,var(--teal-300),var(--cyan))}
  .panel.acct .tag{color:var(--teal-300);background:rgba(20,184,166,.12);border:1px solid var(--line)}
  .panel h3{margin:0 0 6px;font-size:17px}
  .panel p{margin:0;color:var(--muted);font-size:14px}
  .panel code{font-family:var(--mono);font-size:12.5px;color:var(--teal-300);background:rgba(94,234,212,.1);padding:2px 7px;border-radius:6px;word-break:break-all}
  .panel .this{display:inline-block;margin-top:12px;font-size:12px;font-weight:700;color:var(--teal-400)}
  @media(max-width:680px){.twin{grid-template-columns:1fr}}

  /* final cta */
  .final{margin:14px auto 0;text-align:center;padding:48px 26px;border-radius:26px;max-width:840px;
    background:radial-gradient(120% 140% at 50% 0%,rgba(20,184,166,.18),rgba(6,24,38,.55) 60%,rgba(3,14,24,.7));border:1px solid var(--line)}
  .final h2{margin-top:0}
  .btnrow{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:24px}
  .btn{padding:14px 26px;border-radius:13px;font-weight:750;font-size:15px;transition:transform .15s ease,box-shadow .15s ease}
  .btn.primary{color:#022;background:linear-gradient(90deg,var(--teal-300),var(--cyan));box-shadow:0 10px 26px rgba(20,184,166,.36)}
  .btn.primary:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(20,184,166,.5);text-decoration:none}
  .btn.ghost{color:var(--teal-300);border:1px solid var(--line);background:rgba(20,184,166,.06)}
  .btn.ghost:hover{background:rgba(20,184,166,.12);text-decoration:none}
  .ftrust{margin-top:22px;display:flex;gap:8px 22px;justify-content:center;flex-wrap:wrap;font-size:13px;color:var(--muted2)}
  .ftrust span{display:inline-flex;align-items:center;gap:7px}
  .ftrust svg{color:var(--teal-400)}

  /* footer */
  footer{padding:40px 0 56px;border-top:1px solid var(--line2);margin-top:48px;text-align:center}
  footer .brand{justify-content:center;margin-bottom:14px;display:inline-flex}
  .foot-links{display:flex;gap:22px;justify-content:center;flex-wrap:wrap;font-size:14px;margin-bottom:16px}
  .foot-links a{color:var(--muted)}
  .foot-note{font-size:12.5px;color:var(--muted2);max-width:620px;margin:0 auto}

  .toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);opacity:0;pointer-events:none;
    background:linear-gradient(90deg,var(--teal-300),var(--cyan));color:#022;font-weight:700;font-size:14px;padding:11px 20px;border-radius:12px;
    box-shadow:0 12px 30px rgba(20,184,166,.4);transition:opacity .25s ease,transform .25s ease;z-index:80}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(45,212,191,.55)}70%{box-shadow:0 0 0 12px rgba(45,212,191,0)}100%{box-shadow:0 0 0 0 rgba(45,212,191,0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sweep{0%{left:-60%}45%,100%{left:130%}}
  @keyframes shimmer{0%,55%{transform:translateX(-130%)}80%,100%{transform:translateX(130%)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  .finmascot{display:inline-block;animation:float 5s ease-in-out infinite}

  @media (prefers-reduced-motion: reduce){
    *,*::before,*::after{animation:none !important;transition:none !important;scroll-behavior:auto !important}
    .dot{box-shadow:0 0 0 3px rgba(45,212,191,.25)}
    .msg,.toolcall{opacity:1;transform:none}
  }
</style>
</head>
<body>
<a class="skip" href="#top">Skip to content</a>
<div class="glow" aria-hidden="true">
  <div class="rays"><span></span><span></span><span></span><span></span></div>
</div>

<header>
  <div class="wrap nav">
    <a class="brand" href="#top" aria-label="Tax MCP by AI2Fin home">
      <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M8 38c10-2 16-9 22-20 1 9-1 16-5 22 7 1 14-1 22-7-2 9-9 17-22 18-9 .7-15-4-17-13z" fill="#2dd4bf"/>
        <path d="M30 18c5-4 11-5 18-3-4 2-7 5-9 9-3-3-6-5-9-6z" fill="#5eead4"/>
        <circle cx="20" cy="33" r="2" fill="#022"/>
      </svg>
      <span>Tax MCP <b>by AI2Fin</b></span>
    </a>
    <nav class="navlinks" aria-label="Primary">
      <a href="#connect">Connect</a>
      <a href="#tools">Tools</a>
      <a href="#examples">Examples</a>
      <a class="nav-cta" href="#top">Copy endpoint</a>
    </nav>
  </div>
</header>

<main id="top">

  <!-- HERO -->
  <section class="hero">
    <div class="wrap">
      <span class="pill"><span class="dot" aria-hidden="true"></span> Free &middot; public &middot; no login, no key, stores nothing</span>
      <h1>The tax brain<br><span class="clip">your agent calls.</span></h1>
      <p class="sub">Point your assistant at one endpoint and it can look up real tax rates and run the maths for you. Every answer is <b>source-cited to the national tax authority</b> with a verified date - so you can see exactly where each number comes from.</p>

      <div class="endpoint">
        <div class="ep-box">
          <span class="ep-url" id="epUrl">https://taxmcp.ai2fin.com</span>
          <button class="copybtn" id="copyTop" type="button" aria-label="Copy the Tax MCP endpoint URL"><span class="shine" aria-hidden="true"></span>Copy endpoint</button>
        </div>
      </div>
      <p class="ep-meta">Paste it into <b>Claude</b>, <b>ChatGPT</b>, <b>Cursor</b>, or your own agent. Then just ask.</p>
    </div>
  </section>

  <!-- CHAT SHOWPIECE -->
  <section class="stage" aria-label="Example conversation showing the Tax MCP in action" style="padding-top:0">
    <div class="wrap">
      <p class="stage-label">Watch it work</p>
      <div class="chat">
        <div class="chat-bar">
          <span class="tl r"></span><span class="tl y"></span><span class="tl g"></span>
          <span class="chat-title">Your assistant &middot; connected to <span class="agent">Tax MCP</span></span>
        </div>
        <div class="chat-body">

          <div class="msg me" style="animation-delay:.05s">
            <div class="who">You</div>
            <div class="bubble">What's the GST on $4,400 in Australia?</div>
          </div>

          <div class="toolcall" style="animation-delay:.35s">
            <svg class="gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2Z"/></svg>
            Calling <code>compute_gst_vat</code> <span class="ret">&rarr; amount $4,400, country AU</span>
          </div>

          <div class="msg ai answer" style="animation-delay:.7s">
            <div class="who">Fin &middot; via Tax MCP</div>
            <div class="bubble">
              <div class="big">GST is <b style="color:var(--teal-300)">$400</b>.</div>
              <div class="calc">
                <span>Price before GST <b>$4,000</b></span>
                <span>GST (10%) <b>$400</b></span>
                <span>Total <b>$4,400</b></span>
              </div>
              <div class="source">
                <span class="shine" aria-hidden="true"></span>
                <span class="stamp" aria-hidden="true">see the source</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
                <span><span class="lbl">Source</span> &nbsp;<b>ATO</b> &middot; ato.gov.au, current as of <b>Jun 2026</b></span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <p class="pointer">That last line is the whole point. <b>Every figure traces back to the authority that set it</b> - a receipt you can read, not a guess dressed up as one.</p>

      <div class="trust">
        <span class="p"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z"/></svg> Cited to the tax authority</span>
        <span class="p"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Verified-as-of date on every answer</span>
        <span class="p"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg> Says "partial" instead of guessing</span>
      </div>
    </div>
  </section>

  <!-- CONNECT -->
  <section id="connect">
    <div class="wrap">
      <p class="kicker">Connect in 3 steps</p>
      <h2>From <span class="clip">paste to answer</span> in a minute</h2>
      <p class="lead">Works the same way in Claude, ChatGPT, Cursor, or your own agent - paste one endpoint and ask.</p>
      <div class="steps">
        <div class="step">
          <span class="stepnum">1</span>
          <h3>Copy the endpoint</h3>
          <p>Grab the one URL: <code>https://taxmcp.ai2fin.com</code> - no install, no key to request.</p>
        </div>
        <div class="step">
          <span class="stepnum">2</span>
          <h3>Add the connector</h3>
          <p>In Claude: <code>Settings &rarr; Connectors &rarr; Add custom connector</code> and paste it. Same idea in ChatGPT, Cursor, or your own agent.</p>
        </div>
        <div class="step">
          <span class="stepnum">3</span>
          <h3>Just ask</h3>
          <p>Ask any tax question in plain language. Your assistant calls the right tool and hands back a sourced answer.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- TOOLS -->
  <section id="tools">
    <div class="wrap">
      <p class="kicker">Six tools your agent can reach for</p>
      <h2>One brain, <span class="clip">six precise skills</span></h2>
      <p class="lead">Your assistant picks the right one for the question. Where coverage is partial, it tells you plainly - it never guesses.</p>
      <div class="tools">

        <div class="tool">
          <div class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg></div>
          <h3>Rate lookup</h3>
          <span class="nm">tax_rate_lookup</span>
          <p>A country's GST/VAT plus its top income and company rates, in one sourced call.</p>
        </div>

        <div class="tool">
          <div class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg></div>
          <h3>GST / VAT maths</h3>
          <span class="nm">compute_gst_vat</span>
          <p>Add or remove GST/VAT on any amount, with the breakdown shown.</p>
        </div>

        <div class="tool">
          <div class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2"><path d="M4 18V8M12 18V5M20 18v-7"/></svg></div>
          <h3>Compare countries</h3>
          <span class="nm">compare_countries</span>
          <p>Put rates side by side across markets, each row carrying its own source.</p>
        </div>

        <div class="tool">
          <div class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2"><path d="M12 3v18M7 7h7a3 3 0 0 1 0 6H7"/></svg></div>
          <h3>Income tax estimate</h3>
          <span class="nm">income_tax_estimate</span>
          <p>Take-home pay for Australia and New Zealand, levies included.</p>
          <div class="geo">Verified &middot; AU & NZ</div>
        </div>

        <div class="tool">
          <div class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2"><path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/></svg></div>
          <h3>Company tax estimate</h3>
          <span class="nm">company_tax_estimate</span>
          <p>Company tax for AU, US, UK, CA and IN entities.</p>
          <div class="geo">Verified &middot; AU &middot; US &middot; UK &middot; CA &middot; IN</div>
        </div>

        <div class="tool">
          <div class="ic" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2"><path d="M3 17l6-6 4 4 7-8"/><path d="M14 7h6v6"/></svg></div>
          <h3>Capital gains</h3>
          <span class="nm">cgt_estimate</span>
          <p>Australian CGT, including the 50% discount where it applies.</p>
          <div class="geo">Verified &middot; AU</div>
        </div>

      </div>

      <div class="cover">
        <div class="big">~50 countries</div>
        <p>GST/VAT plus headline income and company rates worldwide, with deeper calculators for the verified countries above.</p>
        <div class="chips" aria-hidden="true">
          <span>AU</span><span>NZ</span><span>US</span><span>UK</span><span>CA</span><span>IN</span><span>DE</span><span>FR</span><span>SG</span><span>IE</span><span class="more">+ many more</span>
        </div>
      </div>
    </div>
  </section>

  <!-- EXAMPLES -->
  <section id="examples">
    <div class="wrap">
      <p class="kicker">Real exchanges</p>
      <h2>Ask like a human, <span class="clip">get a sourced answer</span></h2>
      <div class="ex-grid">

        <div class="ex">
          <p class="q">What's my take-home on $90,000 in Australia?</p>
          <p class="a">About $70,412 - $17,788 income tax plus a $1,800 Medicare levy (2025-26).</p>
          <div class="src"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> ATO &middot; ato.gov.au, as of Jun 2026</div>
        </div>

        <div class="ex">
          <p class="q">Compare VAT in Germany, France and the UK.</p>
          <p class="a">Germany 19%, France 20%, UK 20% - a tidy three-row comparison, each rate cited to its own authority.</p>
          <div class="src"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg> compare_countries</div>
        </div>

      </div>

      <div class="vat">
        <table>
          <caption>What that VAT comparison returns - standard headline rate by country</caption>
          <thead><tr><th scope="col">Country</th><th scope="col">VAT</th><th scope="col">Authority</th></tr></thead>
          <tbody>
            <tr><td>Germany</td><td class="num">19%</td><td class="auth">BZSt</td></tr>
            <tr><td>France</td><td class="num">20%</td><td class="auth">DGFiP</td></tr>
            <tr><td>United Kingdom</td><td class="num">20%</td><td class="auth">HMRC</td></tr>
          </tbody>
        </table>
        <div class="foot">Each row carries its national authority &middot; current as of Jun 2026</div>
      </div>
    </div>
  </section>

  <!-- TWO SERVERS -->
  <section aria-label="Public rates server versus your own account data">
    <div class="wrap">
      <p class="kicker">Two doors, one ocean</p>
      <h2>Public rates here &middot; <span class="clip">your own data next door</span></h2>
      <div class="twin">
        <div class="panel pub">
          <span class="tag">You're here</span>
          <h3>Public Tax MCP</h3>
          <p>Rates and calculators for everyone. No login, no key, nothing stored. Connect at <code>https://taxmcp.ai2fin.com</code></p>
          <span class="this">This page &middot; rates + calculators only</span>
        </div>
        <div class="panel acct">
          <span class="tag">For your own data</span>
          <h3>Your 2Fin account server</h3>
          <p>A separate, authenticated sibling for your own transactions and live tax position at <code>https://api.ai2fin.com/mcp</code></p>
          <span class="this">Signed in &middot; your numbers</span>
        </div>
      </div>
    </div>
  </section>

  <!-- FINAL CTA -->
  <section style="padding-top:10px">
    <div class="wrap">
      <div class="final">
        <span class="finmascot" style="font-size:38px" aria-hidden="true">🐬</span>
        <h2>Give your agent a <span class="clip">tax brain it can cite</span></h2>
        <p class="lead">Copy the endpoint, add the connector, and start asking. Fin will fetch the rate, run the maths, and bring the source along every time.</p>
        <div class="endpoint" style="margin-top:26px">
          <div class="ep-box">
            <span class="ep-url">https://taxmcp.ai2fin.com</span>
            <button class="copybtn" id="copyBottom" type="button" aria-label="Copy the Tax MCP endpoint URL"><span class="shine" aria-hidden="true"></span>Copy endpoint</button>
          </div>
        </div>
        <div class="btnrow">
          <a class="btn primary" href="https://ai2fin.com/tools/taxmcp">Full details & setup</a>
          <a class="btn ghost" href="https://ai2fin.com/tools">Browser calculators</a>
        </div>
        <div class="ftrust">
          <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/></svg> No login &middot; no key</span>
          <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg> Every answer source-cited</span>
          <span><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Verified dates</span>
        </div>
      </div>
    </div>
  </section>

</main>

<footer>
  <div class="wrap">
    <span class="brand">
      <svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M8 38c10-2 16-9 22-20 1 9-1 16-5 22 7 1 14-1 22-7-2 9-9 17-22 18-9 .7-15-4-17-13z" fill="#2dd4bf"/>
        <path d="M30 18c5-4 11-5 18-3-4 2-7 5-9 9-3-3-6-5-9-6z" fill="#5eead4"/>
        <circle cx="20" cy="33" r="2" fill="#022"/>
      </svg>
      <span>Tax MCP <b>by AI2Fin</b></span>
    </span>
    <div class="foot-links">
      <a href="https://ai2fin.com/tools">Free tools</a>
      <a href="https://ai2fin.com/tools/taxmcp">Tax MCP details</a>
      <a href="https://ai2fin.com">ai2fin.com</a>
    </div>
    <p class="foot-note">A free, public Model Context Protocol server for tax rates and calculators. Figures are sourced to national tax authorities with verified dates and offered as guidance - check with a qualified adviser before you file. 🐬</p>
  </div>
</footer>

<div class="toast" id="toast" role="status" aria-live="polite">Endpoint copied</div>

<script>
(function(){
  var EP="https://taxmcp.ai2fin.com";
  var toast=document.getElementById("toast");
  function flash(){ if(!toast)return; toast.classList.add("show"); setTimeout(function(){toast.classList.remove("show");},1700); }
  function copy(btn){
    var lbl=btn.querySelector(".shine")?null:btn;
    var done=function(){ var t=btn.lastChild; var prev=t.nodeValue; t.nodeValue="Copied!"; flash(); setTimeout(function(){t.nodeValue=prev;},1700); };
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(EP).then(done).catch(function(){fallback();});
    } else { fallback(); }
    function fallback(){
      try{ var ta=document.createElement("textarea"); ta.value=EP; ta.setAttribute("readonly","");
        ta.style.position="absolute"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta); done(); }catch(e){ flash(); }
    }
  }
  ["copyTop","copyBottom"].forEach(function(id){
    var b=document.getElementById(id); if(b) b.addEventListener("click",function(){copy(b);});
  });
})();
</script>
</body>
</html>`;
