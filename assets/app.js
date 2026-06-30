/* ============================================================
   ARGENSYS — Shared interactivity (all pages)
   ============================================================ */
(function(){
'use strict';
/* base prefix so links work both at domain root and on a project subpath.
   Each page sets window.ARG_BASE = "" (home) or "../" (inner pages). */
const B=window.ARG_BASE||'';

/* ── ICON LIBRARY ───────────────────────── */
/* Central line-icon set. Any element with data-icon="name" gets the SVG.
   Shapes carry no stroke/fill attrs — CSS (.fcard-ico/.vico/.ct-ico svg) styles them. */
const ICONS={
  chat:'<path d="M21 11.5a7.5 7.5 0 0 1-10.8 6.7L4 20l1.8-5.2A7.5 7.5 0 1 1 21 11.5z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
  pin:'<path d="M12 21s7-6.3 7-11a7 7 0 0 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  alert:'<path d="M12 3 2 20h20L12 3z"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="12" y1="17" x2="12" y2="17.01"/>',
  crm:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5 16.5a3.5 3.5 0 0 1 7 0"/><path d="M14.5 9.5h3.5M14.5 12.5h3.5M14.5 15.5h2"/>',
  projects:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
  automation:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.2 5.2l1.8 1.8M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8"/>',
  phone:'<path d="M5 4h3l1.6 4-2 1.4a11 11 0 0 0 5 5l1.4-2 4 1.6v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  people:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19"/>',
  chart:'<path d="M3 20h18"/><rect x="5" y="11" width="3" height="7"/><rect x="10.5" y="6" width="3" height="12"/><rect x="16" y="13" width="3" height="5"/>',
  firewall:'<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9.3h18M3 14.6h18M9 4v5.3M15 9.3v5.3M9 14.6V20"/>',
  endpoint:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  radar:'<path d="M4.5 17a10 10 0 0 1 15 0"/><path d="M8 17a6 6 0 0 1 8 0"/><circle cx="12" cy="17" r="1.3"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><line x1="12" y1="14.5" x2="12" y2="16.5"/>',
  search:'<circle cx="11" cy="11" r="6"/><line x1="20" y1="20" x2="15.5" y2="15.5"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  training:'<path d="M12 4 2 9l10 5 10-5-10-5z"/><path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11"/>',
  server:'<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><line x1="7" y1="7" x2="7" y2="7"/><line x1="7" y1="17" x2="7" y2="17"/>',
  network:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.2 9h17.6M3.2 15h17.6"/>',
  storage:'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.6 3.6 2.8 8 2.8s8-1.2 8-2.8v-13"/><path d="M4 12c0 1.6 3.6 2.8 8 2.8s8-1.2 8-2.8"/>',
  cloud:'<path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17.5 18H7z"/>',
  wrench:'<path d="M15 6.5a4 4 0 0 0-5.3 5.1l-6.1 6.1 2 2 6.1-6.1A4 4 0 0 0 17 8.3l-2.4 2.4-1.9-1.9L15 6.5z"/>',
  shield:'<path d="M12 3l7 2.5v5.5c0 4.3-3 7.7-7 9.5-4-1.8-7-5.2-7-9.5V5.5L12 3z"/>',
  chip:'<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
  laptop:'<rect x="4" y="5" width="16" height="10" rx="1.5"/><path d="M2 19h20l-1.5-2.5H3.5L2 19z"/>',
  refresh:'<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>',
  heart:'<path d="M12 20s-7-4.7-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.3-7 10-7 10z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.9"/>',
  growth:'<path d="M3 17l5.5-5.5 4 4L21 7"/><path d="M15 7h6v6"/>',
  bolt:'<path d="M13 3 5 13h5l-1 8 8-10h-5l1-8z"/>',
  puzzle:'<path d="M9 4.5a2 2 0 0 1 4 0c0 1 .6 1.5 1.5 1.5H17v3c0 .9.5 1.5 1.5 1.5a2 2 0 0 1 0 4c-1 0-1.5.6-1.5 1.5V20h-3c-.9 0-1.5-.6-1.5-1.5a2 2 0 0 0-4 0c0 .9-.6 1.5-1.5 1.5H4v-3.5c0-.9-.6-1.5-1.5-1.5a2 2 0 0 1 0-4c.9 0 1.5-.6 1.5-1.5V6h3.5C8.4 6 9 5.4 9 4.5z"/>'
};
document.querySelectorAll('[data-icon]').forEach(el=>{
  const n=el.getAttribute('data-icon');
  if(ICONS[n])el.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'+ICONS[n]+'</svg>';
});

/* ── NAV scroll state ───────────────────── */
const nav=document.getElementById('nav');
if(nav){
  const isSolid=nav.classList.contains('solid');
  const onScroll=()=>{ if(!isSolid) nav.classList.toggle('on',scrollY>40); };
  onScroll();
  window.addEventListener('scroll',onScroll,{passive:true});
}

/* ── SCROLL PROGRESS BAR ─────────────────── */
const sbar=document.getElementById('scrollBar');
if(sbar){
  window.addEventListener('scroll',()=>{
    const h=document.body.scrollHeight-innerHeight;
    sbar.style.width=(h>0?scrollY/h*100:0)+'%';
  },{passive:true});
}

/* ── MOBILE DRAWER ──────────────────────── */
const burger=document.getElementById('burger'),drawer=document.getElementById('drawer');
if(burger&&drawer){
  const closeX=document.getElementById('drawerX');
  const close=()=>{drawer.classList.remove('open');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';};
  burger.addEventListener('click',()=>{drawer.classList.add('open');burger.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';});
  if(closeX)closeX.addEventListener('click',close);
  drawer.querySelectorAll('a').forEach(l=>l.addEventListener('click',close));
}

/* ── REVEAL ON SCROLL ───────────────────── */
const revealEls=document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s');
if(revealEls.length){
  const rio=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target);}});
  },{threshold:.1,rootMargin:'0px 0px -28px 0px'});
  revealEls.forEach(el=>rio.observe(el));
}

/* ── COUNTERS ───────────────────────────── */
function countUp(el){
  const t=parseFloat(el.dataset.count),pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
  const d=1600,s=performance.now();
  const tick=now=>{
    const p=Math.min((now-s)/d,1),e=1-Math.pow(1-p,3);
    el.textContent=pre+Math.floor(e*t)+suf;
    if(p<1)requestAnimationFrame(tick);else el.textContent=pre+t+suf;
  };
  requestAnimationFrame(tick);
}
const counters=document.querySelectorAll('[data-count]');
if(counters.length){
  const cio=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){countUp(e.target);cio.unobserve(e.target);}});
  },{threshold:.5});
  counters.forEach(el=>cio.observe(el));
}

/* ── ACCORDION ──────────────────────────── */
document.querySelectorAll('.acc-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const row=btn.closest('.acc-row'),open=row.classList.contains('open');
    const scope=btn.closest('.acc')||document;
    scope.querySelectorAll('.acc-row.open').forEach(r=>{r.classList.remove('open');r.querySelector('.acc-btn').setAttribute('aria-expanded','false');});
    if(!open){row.classList.add('open');btn.setAttribute('aria-expanded','true');}
  });
});

/* ── SMOOTH ANCHOR SCROLL ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  const href=a.getAttribute('href');
  if(href.length<2)return;
  a.addEventListener('click',e=>{
    const t=document.querySelector(href);
    if(t){e.preventDefault();window.scrollTo({top:t.getBoundingClientRect().top+scrollY-76,behavior:'smooth'});}
  });
});

/* ── CONTACT / LEAD FORMS ───────────────── */
document.querySelectorAll('form[data-lead]').forEach(form=>{
  form.addEventListener('submit',function(e){
    e.preventDefault();
    const b=this.querySelector('.fsub');
    if(!b)return;
    const orig=b.textContent;
    b.textContent='Enviando…';b.disabled=true;
    setTimeout(()=>{b.textContent='✓ ¡Listo! Te contactamos en las próximas horas.';b.style.background='#059669';},900);
  });
});

/* ── PARTNER MODAL ──────────────────────── */
const partners={
  fortinet:{color:'#E8442A',logo:B+'logos/fortinet.svg',name:'Fortinet',cert:'Advanced Partner',
    what:'Fortinet es el líder mundial en ciberseguridad de redes. Sus soluciones Next-Generation Firewall protegen millones de empresas en más de 100 países con inspección de tráfico en tiempo real y detección de amenazas basada en inteligencia artificial.',
    how:'Como Advanced Partner certificado, implementamos y gestionamos el ecosistema Fortinet completo en tu infraestructura: desde el firewall perimetral hasta la protección de endpoints y el análisis centralizado de eventos. Cada instalación es configurada por ingenieros certificados y monitoreada de forma continua.',
    cases:['Protección del perímetro de red contra ataques externos e internos','Control y cifrado de VPN para equipos que trabajan de forma remota','Inspección de tráfico cifrado HTTPS/SSL sin impacto en el rendimiento','Segmentación de red para aislar áreas críticas del negocio','Filtrado web y control de aplicaciones por usuario o grupo'],
    products:['FortiGate NGFW','FortiClient VPN','FortiEDR','FortiAnalyzer','FortiSandbox']},
  ibm:{color:'#1755C4',logo:B+'logos/ibm.svg',name:'IBM',cert:'Business Partner',
    what:'IBM es una empresa global con más de 100 años de historia que hoy lidera en inteligencia artificial aplicada a la seguridad, infraestructura empresarial de alto rendimiento y servicios de nube híbrida. Su plataforma QRadar es el estándar de industria para centros de operaciones de seguridad (SOC).',
    how:'Como IBM Business Partner, integramos las soluciones IBM en tu entorno para centralizar y correlacionar eventos de seguridad de toda tu organización. Detectamos amenazas que los sistemas tradicionales no ven, reduciendo el tiempo de respuesta ante incidentes de días a minutos.',
    cases:['Centralización y correlación de logs de seguridad en tiempo real','Detección de comportamientos anómalos e insider threats','Cumplimiento normativo y auditoría automatizada','Análisis forense post-incidente con trazabilidad completa','Infraestructura de servidores de alta disponibilidad para entornos críticos'],
    products:['IBM QRadar SIEM','IBM FlashSystem','IBM Cloud Pak','IBM Security Verify','IBM Cognos']},
  lenovo:{color:'#E65C00',logo:B+'logos/lenovo.svg',name:'Lenovo',cert:'Authorized Partner',
    what:'Lenovo es el fabricante de hardware empresarial más grande del mundo, con líneas ThinkPad, ThinkCentre y ThinkSystem diseñadas para entornos corporativos exigentes. Sus equipos incluyen protecciones de hardware como TPM, encriptación de disco y gestión remota fuera de banda.',
    how:'Como Authorized Partner, proveemos, configuramos y desplegamos equipamiento Lenovo con las políticas de seguridad correctas desde el primer día. No entregamos un equipo genérico: cada dispositivo sale configurado con encriptación activa, gestión centralizada y acceso remoto seguro para soporte.',
    cases:['Renovación de parque de PCs y laptops con configuración segura de fábrica','Servidores ThinkSystem para virtualización y almacenamiento crítico','Dispositivos configurados para trabajo remoto seguro con VPN integrada','Estaciones de trabajo ThinkStation para entornos de alto rendimiento','Gestión centralizada de activos de hardware con inventario automático'],
    products:['ThinkPad','ThinkCentre','ThinkSystem','ThinkStation','ThinkBook']},
  bitrix:{color:'#0099B5',logoTxt:'Bitrix24',logoColor:'#2C9FD4',name:'Bitrix24',cert:'Silver Partner',
    what:'Bitrix24 es la plataforma all-in-one para empresas que centraliza CRM, comunicación interna, gestión de proyectos, automatización de procesos y videollamadas. Con más de 15 millones de empresas usuarias en el mundo, elimina la necesidad de múltiples herramientas dispersas.',
    how:'Como Silver Partner certificado, implementamos y personalizamos Bitrix24 para que tu empresa trabaje de forma más organizada, segura y conectada. Migramos tus datos, entrenamos a tu equipo y configuramos los flujos de trabajo adaptados a tu operación real.',
    cases:['CRM para gestión integral de clientes, leads y oportunidades de venta','Comunicación interna unificada: chat, videollamadas y tareas en un solo lugar','Automatización de procesos comerciales y aprobaciones','Gestión de proyectos con asignación de tareas y seguimiento en tiempo real','Portal del empleado e intranet para empresas con equipos distribuidos'],
    products:['CRM & Pipeline','Intranet & Portal','Gestión de Proyectos','Automatización','Video HD']},
  cato:{color:'#158864',logoTxt:'Cato',logoColor:'#158864',name:'Cato Networks',cert:'SASE Partner',
    what:'Cato Networks es el pionero global de SASE (Secure Access Service Edge): una plataforma cloud-native que unifica red y seguridad en un único servicio. Conecta de forma segura todas tus sedes, usuarios remotos y aplicaciones en la nube a través de una red privada global, sin appliances complejos.',
    how:'Como partner de Cato, reemplazamos tu mix de VPNs, firewalls y enlaces MPLS por una sola plataforma gestionada. Conectamos tus oficinas y empleados remotos a la red global de Cato, con seguridad de nivel empresarial aplicada de forma uniforme en todos lados — y la administramos por vos.',
    cases:['Conexión segura de sucursales y empleados remotos sin VPNs tradicionales','Reemplazo de enlaces MPLS costosos por SD-WAN cloud-native','Seguridad uniforme (FWaaS, IPS, anti-malware) para todo el tráfico','Acceso Zero Trust (ZTNA) a aplicaciones internas y en la nube','Optimización y monitoreo del rendimiento de red en tiempo real'],
    products:['SASE Cloud','SD-WAN','FWaaS','ZTNA','SSE 360']}
};
const overlay=document.getElementById('pmOverlay');
if(overlay){
  const pmCard=document.getElementById('pmCard'),pmBar=document.getElementById('pmBar'),pmIco=document.getElementById('pmIco');
  const pmTitle=document.getElementById('pmTitle'),pmCert=document.getElementById('pmCert'),pmBody=document.getElementById('pmBody');
  const close=()=>{overlay.classList.remove('open');document.body.style.overflow='';};
  window.closePartner=close;
  function open(key){
    const p=partners[key];if(!p)return;
    pmBar.style.background=p.color;
    if(p.logo)pmIco.innerHTML='<img src="'+p.logo+'" alt="'+p.name+'" style="max-width:40px;max-height:40px;object-fit:contain">';
    else pmIco.innerHTML='<span style="font-weight:800;font-size:1.05rem;letter-spacing:-.02em;color:'+(p.logoColor||p.color)+'">'+(p.logoTxt||p.name)+'</span>';
    pmTitle.textContent=p.name;
    pmCert.textContent=p.cert;pmCert.style.color=p.color;
    pmBody.innerHTML=
      '<div><div class="pm-section-title">Quiénes son</div><p class="pm-text">'+p.what+'</p></div>'+
      '<div><div class="pm-section-title">Cómo Argensys lo aplica a tu empresa</div><p class="pm-text">'+p.how+'</p></div>'+
      '<div><div class="pm-section-title">Casos de uso en tu negocio</div><div class="pm-cases">'+p.cases.map(c=>'<div class="pm-case" style="--dot:'+p.color+'">'+c+'</div>').join('')+'</div></div>'+
      '<div><div class="pm-section-title">Soluciones disponibles</div><div class="pm-chips">'+p.products.map(pr=>'<span class="pm-chip" style="color:'+p.color+';background:'+p.color+'12;border-color:'+p.color+'28">'+pr+'</span>').join('')+'</div></div>'+
      '<a href="'+B+'contacto/index.html" class="pm-cta" style="background:linear-gradient(135deg,'+p.color+','+p.color+'cc)">Consultanos sobre '+p.name+' →</a>';
    overlay.classList.add('open');document.body.style.overflow='hidden';pmCard.focus();
  }
  window.openPartner=open;
  document.getElementById('pmClose').addEventListener('click',close);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  document.querySelectorAll('[data-partner]').forEach(btn=>btn.addEventListener('click',()=>open(btn.dataset.partner)));
}

/* ── HERO PARALLAX (home) ───────────────── */
const heroBlob=document.querySelector('.hero-blob'),heroDots=document.querySelector('.hero-dots');
if(heroBlob||heroDots){
  window.addEventListener('scroll',()=>{
    if(scrollY<innerHeight){
      if(heroBlob)heroBlob.style.transform='translateY('+scrollY*.28+'px)';
      if(heroDots)heroDots.style.transform='translateY('+scrollY*.14+'px)';
    }
  },{passive:true});
}

/* ── CINEMATIC INTRO (only if present) ──── */
const intro=document.getElementById('intro');
if(intro){
  const mid=document.getElementById('introMid');
  const curtains=intro.querySelectorAll('.intro-c');
  setTimeout(()=>{
    mid.classList.add('out');
    setTimeout(()=>{
      curtains.forEach(c=>c.classList.add('out'));
      setTimeout(()=>intro.remove(),1150);
    },420);
  },1750);
}

/* ── CHECKLIST (home) ───────────────────── */
const checkList=document.getElementById('checkList');
if(checkList){
  const scoreEl=()=>document.getElementById('checkScore');
  const resultEl=document.getElementById('checkResult');
  const items=checkList.querySelectorAll('.check-item');
  function refresh(){
    const n=checkList.querySelectorAll('.check-item.chk').length;
    if(n===0)resultEl.innerHTML='Marcá cada punto que tu empresa ya tiene cubierto. <strong id="checkScore" style="color:var(--blue)">0/5</strong> cubiertos.';
    else if(n<3)resultEl.innerHTML='<strong style="color:var(--blue)">'+n+'/5</strong> cubiertos. Hay puntos críticos que necesitan atención urgente. <a href="'+B+'contacto/index.html">Hablemos →</a>';
    else if(n<5)resultEl.innerHTML='<strong style="color:var(--blue)">'+n+'/5</strong> cubiertos. Bien encaminado, pero los puntos faltantes pueden ser tu mayor vulnerabilidad. <a href="'+B+'contacto/index.html">Cerremos esas brechas →</a>';
    else resultEl.innerHTML='<strong style="color:var(--blue)">5/5 ✓</strong> Excelente base. ¿Querés una auditoría para confirmarlo? <a href="'+B+'contacto/index.html">Contactanos →</a>';
  }
  items.forEach(item=>{
    function toggle(){item.classList.toggle('chk');item.setAttribute('aria-checked',item.classList.contains('chk'));refresh();}
    item.addEventListener('click',toggle);
    item.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
  });
}

})();
