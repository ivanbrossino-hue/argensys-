/* ============================================================
   ARGENSYS — Shared interactivity (all pages)
   ============================================================ */
(function(){
'use strict';
/* base prefix so links work both at domain root and on a project subpath.
   Each page sets window.ARG_BASE = "" (home) or "../" (inner pages). */
const B=window.ARG_BASE||'';

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
