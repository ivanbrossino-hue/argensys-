/* ============================================================
   TecnoPlay — lógica de la tienda
   Catálogo, filtros, búsqueda, carrito y pedido por WhatsApp.
   Los datos viven en products.js.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.TP_CONFIG;
  var CATS = window.TP_CATEGORIES;
  var BRANDS = window.TP_BRANDS;
  var PRODUCTS = window.TP_PRODUCTS;
  var BY_ID = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; });
  var CAT_BY_ID = {};
  CATS.forEach(function (c) { CAT_BY_ID[c.id] = c; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Almacenamiento local (tolerante a fallos) ---------- */
  var store = {
    get: function (k, def) {
      try { var v = localStorage.getItem("tp_" + k); return v === null ? def : JSON.parse(v); }
      catch (e) { return def; }
    },
    set: function (k, v) {
      try { localStorage.setItem("tp_" + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ }
    }
  };

  /* ---------- Utilidades ---------- */
  var money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  function fmt(n) { return money.format(Math.round(n)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function waLink(text) { return "https://wa.me/" + CFG.whatsapp + (text ? "?text=" + encodeURIComponent(text) : ""); }

  var gremio = !!store.get("gremio", false);
  function unitPrice(p) { return gremio ? Math.round(p.price * CFG.gremioFactor / 10) * 10 : p.price; }
  function oldUnitPrice(p) { return p.oldPrice ? (gremio ? Math.round(p.oldPrice * CFG.gremioFactor / 10) * 10 : p.oldPrice) : null; }
  function discountPct(p) { return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }

  /* ---------- Ilustraciones SVG por categoría ---------- */
  var BRAND_TINT = {
    Samsung: "#1565D8", Motorola: "#0B3D91", iPhone: "#3A4A63", Xiaomi: "#29B6F6",
    Huawei: "#1E88E5", TCL: "#0277BD", LG: "#4FC3F7", "Genérico": "#1565D8"
  };
  function art(cat, brand) {
    var t = BRAND_TINT[brand] || "#1565D8";
    var s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    switch (cat) {
      case "modulos":
        s += '<rect x="58" y="14" width="84" height="172" rx="16" fill="#0F1B33"/>' +
             '<rect x="63" y="22" width="74" height="156" rx="11" fill="' + t + '"/>' +
             '<path d="M63 120 L137 46 L137 90 L63 164z" fill="#fff" opacity=".18"/>' +
             '<rect x="88" y="26" width="24" height="6" rx="3" fill="#0F1B33"/>' +
             '<circle cx="100" cy="100" r="16" fill="#FFC928"/><path d="M95 91l14 9-14 9z" fill="' + t + '"/>';
        break;
      case "baterias":
        s += '<rect x="52" y="26" width="96" height="152" rx="10" fill="#0F1B33"/>' +
             '<rect x="58" y="32" width="84" height="104" rx="6" fill="' + t + '"/>' +
             '<rect x="58" y="142" width="84" height="30" rx="4" fill="#FFC928"/>' +
             '<rect x="68" y="150" width="10" height="14" rx="2" fill="#0F1B33"/><rect x="82" y="150" width="10" height="14" rx="2" fill="#0F1B33"/><rect x="96" y="150" width="10" height="14" rx="2" fill="#0F1B33"/>' +
             '<path d="M106 50 L84 90 L100 90 L92 120 L118 78 L102 78z" fill="#FFC928"/>';
        break;
      case "pines":
        s += '<rect x="40" y="56" width="120" height="96" rx="10" fill="' + t + '"/>' +
             '<path d="M52 72h30M52 84h20M118 72h30M128 84h20M52 136h96" stroke="#4FC3F7" stroke-width="3" stroke-linecap="round"/>' +
             '<rect x="70" y="120" width="60" height="20" rx="10" fill="#C9D3E3"/><rect x="80" y="126" width="40" height="8" rx="4" fill="#0F1B33"/>' +
             '<circle cx="100" cy="94" r="10" fill="#FFC928"/><rect x="88" y="40" width="24" height="18" rx="3" fill="#0F1B33"/>';
        break;
      case "flex":
        s += '<path d="M30 60 H120 Q150 60 150 90 V110 Q150 140 120 140 H60" fill="none" stroke="#FFB300" stroke-width="22" stroke-linejoin="round"/>' +
             '<path d="M30 60 H120 Q150 60 150 90 V110 Q150 140 120 140 H60" fill="none" stroke="#FFC928" stroke-width="12" stroke-linejoin="round"/>' +
             '<rect x="18" y="46" width="30" height="28" rx="4" fill="' + t + '"/><rect x="44" y="126" width="30" height="28" rx="4" fill="' + t + '"/>' +
             '<path d="M24 54h18M24 60h18M24 66h18M50 134h18M50 140h18M50 146h18" stroke="#fff" stroke-width="2"/>';
        break;
      case "tapas":
        s += '<rect x="56" y="14" width="88" height="172" rx="18" fill="' + t + '"/>' +
             '<path d="M56 140 L144 52 L144 96 L80 160z" fill="#fff" opacity=".14"/>' +
             '<rect x="66" y="26" width="34" height="56" rx="10" fill="#0F1B33"/>' +
             '<circle cx="83" cy="42" r="8" fill="#3A4A63" stroke="#4FC3F7" stroke-width="2"/><circle cx="83" cy="66" r="8" fill="#3A4A63" stroke="#4FC3F7" stroke-width="2"/>' +
             '<circle cx="112" cy="34" r="4" fill="#FFC928"/>';
        break;
      case "camaras":
        s += '<rect x="44" y="50" width="112" height="100" rx="14" fill="#0F1B33"/>' +
             '<circle cx="100" cy="100" r="36" fill="' + t + '"/><circle cx="100" cy="100" r="24" fill="#0F1B33"/>' +
             '<circle cx="100" cy="100" r="13" fill="#4FC3F7"/><circle cx="94" cy="94" r="5" fill="#fff" opacity=".8"/>' +
             '<rect x="132" y="60" width="16" height="10" rx="3" fill="#FFC928"/><path d="M100 150 v26 h40" stroke="#FFB300" stroke-width="8" fill="none"/>';
        break;
      case "herramientas":
        s += '<g transform="rotate(-40 100 100)"><rect x="92" y="18" width="16" height="70" rx="6" fill="' + t + '"/>' +
             '<rect x="94" y="22" width="4" height="62" rx="2" fill="#fff" opacity=".3"/>' +
             '<rect x="97" y="86" width="6" height="74" fill="#C9D3E3"/><path d="M97 160h6l-1 14h-4z" fill="#7D89A1"/></g>' +
             '<g transform="rotate(35 100 100)"><path d="M94 20 L100 178 L106 20 Z" fill="none"/><rect x="84" y="24" width="10" height="150" rx="5" fill="#FFC928"/><rect x="106" y="24" width="10" height="150" rx="5" fill="#FFB300"/><rect x="84" y="24" width="32" height="16" rx="6" fill="#0F1B33"/></g>';
        break;
      default: // accesorios
        s += '<rect x="46" y="22" width="92" height="160" rx="16" fill="#4FC3F7" opacity=".35"/>' +
             '<rect x="62" y="16" width="92" height="160" rx="16" fill="#E8F7FE" stroke="' + t + '" stroke-width="4"/>' +
             '<path d="M70 120 L146 44 L146 70 L70 146z" fill="#fff"/>' +
             '<rect x="96" y="22" width="24" height="5" rx="2.5" fill="' + t + '"/>' +
             '<path d="M120 150 L140 150 L132 166 L146 166 L118 190 L126 172 L112 172z" fill="#FFC928"/>';
    }
    return s + "</svg>";
  }

  /* ---------- Estado ---------- */
  var state = {
    q: "",
    cats: [],
    brands: [],
    qualities: [],
    stock: false,
    offer: false,
    sort: "relevance",
    limit: CFG.pageSize
  };
  var cart = store.get("cart", []).filter(function (l) { return BY_ID[l.id] && l.qty > 0; });

  var QUALITIES = [];
  PRODUCTS.forEach(function (p) { if (QUALITIES.indexOf(p.quality) < 0) QUALITIES.push(p.quality); });

  function matchesQuery(p, q) {
    if (!q) return true;
    var hay = norm(p.name + " " + p.brand + " " + CAT_BY_ID[p.cat].name + " " + p.quality + " " + p.id);
    return norm(q).split(/\s+/).filter(Boolean).every(function (tok) { return hay.indexOf(tok) >= 0; });
  }

  // Aplica todos los filtros excepto el indicado (para calcular contadores por faceta)
  function filtered(except) {
    return PRODUCTS.filter(function (p) {
      if (!matchesQuery(p, state.q)) return false;
      if (except !== "cats" && state.cats.length && state.cats.indexOf(p.cat) < 0) return false;
      if (except !== "brands" && state.brands.length && state.brands.indexOf(p.brand) < 0) return false;
      if (except !== "qualities" && state.qualities.length && state.qualities.indexOf(p.quality) < 0) return false;
      if (state.stock && p.stock <= 0) return false;
      if (state.offer && !p.oldPrice) return false;
      return true;
    });
  }

  function sorted(list) {
    var l = list.slice();
    switch (state.sort) {
      case "price-asc": l.sort(function (a, b) { return a.price - b.price; }); break;
      case "price-desc": l.sort(function (a, b) { return b.price - a.price; }); break;
      case "name": l.sort(function (a, b) { return a.name.localeCompare(b.name, "es"); }); break;
      default: l.sort(function (a, b) { return ((b.stock > 0) - (a.stock > 0)) || a.order - b.order; });
    }
    return l;
  }

  /* ---------- Render: navegación, categorías, marcas ---------- */
  function renderStatic() {
    var counts = {};
    PRODUCTS.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });

    $("#catnavList").innerHTML =
      '<a href="#catalogo" data-cat="">Todos los productos</a>' +
      CATS.map(function (c) { return '<a href="#catalogo" data-cat="' + c.id + '">' + esc(c.short) + "</a>"; }).join("") +
      '<a href="#catalogo" data-offer="1" class="hot">🔥 Ofertas</a>';

    $("#catGrid").innerHTML = CATS.map(function (c) {
      return '<a href="#catalogo" class="cat-card" data-cat="' + c.id + '">' +
        '<span class="cat-ico">' + art(c.id, "Genérico") + "</span>" +
        "<b>" + esc(c.name) + "</b><small>" + (counts[c.id] || 0) + " productos</small></a>";
    }).join("");

    $("#brandRow").innerHTML = BRANDS.map(function (b) {
      return '<a href="#catalogo" class="brand-chip" data-brand="' + esc(b) + '">' + esc(b) + "</a>";
    }).join("");

    $("#footerCats").innerHTML = CATS.map(function (c) {
      return '<li><a href="#catalogo" data-cat="' + c.id + '">' + esc(c.name) + "</a></li>";
    }).join("");

    $$(".slide-art").forEach(function (el) { el.innerHTML = art(el.getAttribute("data-art"), "Samsung"); });

    $("#cfgAddress").textContent = CFG.address;
    $("#cfgHours").textContent = CFG.hours;
    $("#cfgEmail").textContent = CFG.email;
    $("#cfgEmail").href = "mailto:" + CFG.email;
    $("#cfgWhatsapp").href = waLink("Hola TecnoPlay! Quería hacer una consulta.");
    $("#waFloat").href = waLink("Hola TecnoPlay! Quería hacer una consulta.");
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Render: filtros ---------- */
  function facetHTML(key, values, labelFn, field) {
    var base = filtered(key);
    return values.map(function (v) {
      var n = base.filter(function (p) { return p[field] === v; }).length;
      var on = state[key].indexOf(v) >= 0;
      if (!n && !on) return "";
      return '<label class="check"><input type="checkbox" data-facet="' + key + '" value="' + esc(v) + '"' + (on ? " checked" : "") + "/>" +
        "<span>" + esc(labelFn(v)) + '</span><span class="n">' + n + "</span></label>";
    }).join("");
  }

  function renderFilters() {
    $("#filterCats").innerHTML = facetHTML("cats", CATS.map(function (c) { return c.id; }), function (id) { return CAT_BY_ID[id].name; }, "cat");
    $("#filterBrands").innerHTML = facetHTML("brands", BRANDS, function (b) { return b; }, "brand");
    $("#filterQuality").innerHTML = facetHTML("qualities", QUALITIES, function (q) { return q; }, "quality");
    $("#filterStock").checked = state.stock;
    $("#filterOffer").checked = state.offer;

    var chips = [];
    if (state.q) chips.push(["q", "", "“" + state.q + "”"]);
    state.cats.forEach(function (c) { chips.push(["cats", c, CAT_BY_ID[c].short]); });
    state.brands.forEach(function (b) { chips.push(["brands", b, b]); });
    state.qualities.forEach(function (q) { chips.push(["qualities", q, q]); });
    if (state.stock) chips.push(["stock", "", "Con stock"]);
    if (state.offer) chips.push(["offer", "", "Ofertas"]);
    $("#activeChips").innerHTML = chips.map(function (c) {
      return '<span class="chip">' + esc(c[2]) + '<button data-chip="' + c[0] + '" data-val="' + esc(c[1]) + '" aria-label="Quitar filtro ' + esc(c[2]) + '">✕</button></span>';
    }).join("");

    // Resaltar navegación activa
    $$("#catnavList a").forEach(function (a) {
      var cat = a.getAttribute("data-cat");
      var active = a.hasAttribute("data-offer") ? state.offer && !state.cats.length :
        cat === "" ? !state.cats.length && !state.offer : state.cats.length === 1 && state.cats[0] === cat;
      a.classList.toggle("active", active);
    });
    $$(".brand-chip").forEach(function (a) {
      a.classList.toggle("active", state.brands.indexOf(a.getAttribute("data-brand")) >= 0);
    });

    var title = "Todos los <span>productos</span>";
    if (state.cats.length === 1) title = esc(CAT_BY_ID[state.cats[0]].name.split(" ")[0]) + " <span>" + esc(CAT_BY_ID[state.cats[0]].name.split(" ").slice(1).join(" ") || "") + "</span>";
    if (state.offer && !state.cats.length) title = "Ofertas <span>de la semana</span>";
    if (state.q) title = "Resultados para <span>“" + esc(state.q) + "”</span>";
    $("#catalogTitle").innerHTML = title;
  }

  /* ---------- Render: productos ---------- */
  function cardHTML(p) {
    var out = p.stock <= 0;
    var pct = discountPct(p);
    var old = oldUnitPrice(p);
    var price = unitPrice(p);
    return '<article class="card" data-id="' + p.id + '">' +
      '<div class="card-img" data-open="' + p.id + '">' + art(p.cat, p.brand) +
        '<div class="badges">' +
          (pct ? '<span class="badge badge-off">' + pct + "% OFF</span>" : "") +
          (p.quality !== "Genérico" ? '<span class="badge badge-q">' + esc(p.quality) + "</span>" : "") +
          (out ? '<span class="badge badge-out">Sin stock</span>' : "") +
        "</div></div>" +
      '<div class="card-body">' +
        '<div class="card-meta"><span class="brand">' + esc(p.brand) + "</span><span>" + p.id + "</span></div>" +
        '<h3 class="card-name" data-open="' + p.id + '">' + esc(p.name) + "</h3>" +
        '<div class="price-box">' +
          (old ? '<div class="price-old">' + fmt(old) + "</div>" : "") +
          '<div class="price">' + fmt(price) + (gremio ? '<span class="price-tag">GREMIO</span>' : "") + "</div>" +
          '<div class="price-transfer">' + fmt(price * (1 - CFG.transferDiscount)) + " con transferencia</div>" +
        "</div>" +
        '<button class="card-add" data-add="' + p.id + '"' + (out ? " disabled" : "") + ">" +
          (out ? "Sin stock" : '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Agregar') +
        "</button>" +
      "</div></article>";
  }

  function renderGrid() {
    var list = sorted(filtered());
    var shown = list.slice(0, state.limit);
    $("#productGrid").innerHTML = shown.map(cardHTML).join("");
    $("#emptyState").hidden = list.length > 0;
    $("#loadMore").hidden = list.length <= state.limit;
    $("#resultCount").textContent = list.length + (list.length === 1 ? " producto" : " productos");
  }

  function render() { renderFilters(); renderGrid(); }

  function resetFilters(keepQuery) {
    state.cats = []; state.brands = []; state.qualities = [];
    state.stock = false; state.offer = false; state.limit = CFG.pageSize;
    if (!keepQuery) { state.q = ""; $("#searchInput").value = ""; }
  }

  function goCatalog() {
    closeMobileNav();
    var el = $("#catalogo");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- Carrito ---------- */
  function saveCart() { store.set("cart", cart); }
  function cartLine(id) { for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i]; return null; }
  function cartSubtotal() { return cart.reduce(function (s, l) { return s + unitPrice(BY_ID[l.id]) * l.qty; }, 0); }
  function cartUnits() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }

  function addToCart(id, qty) {
    var p = BY_ID[id];
    if (!p || p.stock <= 0) return;
    var line = cartLine(id);
    var current = line ? line.qty : 0;
    var next = Math.min(p.stock, current + (qty || 1));
    if (next === current) { toast("Alcanzaste el stock disponible de este producto"); return; }
    if (line) line.qty = next; else cart.push({ id: id, qty: next });
    saveCart();
    renderCart();
    var c = $("#cartCount");
    c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump");
    toast("✓ " + p.name + " agregado", "Ver carrito", openCart);
  }

  function setQty(id, qty) {
    var p = BY_ID[id];
    var line = cartLine(id);
    if (!line) return;
    qty = Math.max(0, Math.min(p.stock, qty));
    if (qty === 0) cart = cart.filter(function (l) { return l.id !== id; });
    else line.qty = qty;
    saveCart();
    renderCart();
  }

  function renderCart() {
    var sub = cartSubtotal();
    $("#cartCount").textContent = cartUnits();
    $("#cartTotalHeader").textContent = fmt(sub);
    $("#cartSubtotal").textContent = fmt(sub);
    $("#cartTransfer").textContent = fmt(sub * (1 - CFG.transferDiscount));

    var missing = CFG.freeShippingFrom - sub;
    var pct = Math.min(100, sub / CFG.freeShippingFrom * 100);
    $("#shipBar").innerHTML = (missing > 0
      ? "Te faltan <b>" + fmt(missing) + "</b> para tener <b>envío gratis</b> 🚚"
      : "🎉 ¡Tenés <b>envío gratis</b>!") + '<div class="bar"><i style="width:' + pct + '%"></i></div>';

    if (!cart.length) {
      $("#cartItems").innerHTML = '<div class="cart-empty"><div>🛒</div><p>Tu carrito está vacío.</p><button class="btn btn-blue" data-close-cart style="margin-top:16px">Ver productos</button></div>';
      $("#cartFoot").hidden = true;
      return;
    }
    $("#cartFoot").hidden = false;
    $("#cartItems").innerHTML = cart.map(function (l) {
      var p = BY_ID[l.id];
      var u = unitPrice(p);
      return '<div class="ci">' +
        '<div class="ci-img">' + art(p.cat, p.brand) + "</div>" +
        "<div><div class=\"ci-name\">" + esc(p.name) + '</div><div class="ci-price">' + fmt(u) + " c/u</div>" +
          '<button class="ci-remove" data-remove="' + p.id + '">Quitar</button></div>' +
        '<div class="ci-right"><div class="ci-total">' + fmt(u * l.qty) + "</div>" +
          '<div class="qty"><button data-dec="' + p.id + '" aria-label="Restar">−</button><span>' + l.qty + '</span><button data-inc="' + p.id + '" aria-label="Sumar">+</button></div>' +
        "</div></div>";
    }).join("");
  }

  /* ---------- Paneles: carrito, filtros, modales ---------- */
  var openPanel = null;
  function lock(on) { document.body.classList.toggle("locked", on); $("#overlay").classList.toggle("open", on); }
  function openCart() { closeAll(); $("#cartDrawer").classList.add("open"); openPanel = "cart"; lock(true); }
  function openFilters() { closeAll(); $("#filters").classList.add("open"); openPanel = "filters"; lock(true); }
  function openModal(id) {
    $$(".modal.open").forEach(function (m) { m.classList.remove("open"); });
    $("#cartDrawer").classList.remove("open");
    $("#filters").classList.remove("open");
    $(id).classList.add("open");
    $("#toast").classList.remove("show");
    openPanel = id;
    document.body.classList.add("locked");
    $("#overlay").classList.remove("open");
    var f = $(id + " input, " + id + " button.btn");
    if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 50);
  }
  function closeAll() {
    $("#cartDrawer").classList.remove("open");
    $("#filters").classList.remove("open");
    $$(".modal.open").forEach(function (m) { m.classList.remove("open"); });
    openPanel = null;
    lock(false);
  }
  function closeMobileNav() { $("#catnav").classList.remove("open"); }

  function showProduct(id) {
    var p = BY_ID[id];
    if (!p) return;
    var price = unitPrice(p);
    var old = oldUnitPrice(p);
    var stockCls = p.stock <= 0 ? "out" : p.stock <= 5 ? "low" : "ok";
    var stockTxt = p.stock <= 0 ? "Sin stock — consultá reposición" : p.stock <= 5 ? "¡Últimas " + p.stock + " unidades!" : "En stock";
    var pct = discountPct(p);
    $("#productModalBody").innerHTML =
      '<div class="pm">' +
        '<div class="pm-img">' + art(p.cat, p.brand) +
          '<div class="badges">' + (pct ? '<span class="badge badge-off">' + pct + "% OFF</span>" : "") +
          (p.quality !== "Genérico" ? '<span class="badge badge-q">' + esc(p.quality) + "</span>" : "") + "</div></div>" +
        '<div class="pm-info">' +
          '<div class="pm-brand">' + esc(p.brand) + " · " + esc(CAT_BY_ID[p.cat].name) + "</div>" +
          '<h3 id="pmTitle">' + esc(p.name) + "</h3>" +
          '<div class="pm-sku">Código: ' + p.id + " · Calidad: " + esc(p.quality) + "</div>" +
          (old ? '<div class="price-old">' + fmt(old) + "</div>" : "") +
          '<div class="price">' + fmt(price) + (gremio ? '<span class="price-tag">GREMIO</span>' : "") + "</div>" +
          '<div class="price-transfer">' + fmt(price * (1 - CFG.transferDiscount)) + " pagando con transferencia</div>" +
          '<div class="pm-stock ' + stockCls + '">' + stockTxt + "</div>" +
          (p.stock > 0
            ? '<div class="pm-actions"><div class="qty"><button data-pm-dec aria-label="Restar">−</button><input id="pmQty" type="number" min="1" max="' + p.stock + '" value="1" inputmode="numeric" aria-label="Cantidad"/><button data-pm-inc aria-label="Sumar">+</button></div>' +
              '<button class="btn btn-yellow" data-pm-add="' + p.id + '">Agregar al carrito</button></div>'
            : '<div class="pm-actions"><a class="btn btn-wa" target="_blank" rel="noopener" href="' + waLink("Hola! Quería consultar reposición de: " + p.name + " (" + p.id + ")") + '">Avisame cuando ingrese</a></div>') +
          '<ul class="pm-list"><li>Garantía de 30 días</li><li>Despacho en 24 hs hábiles</li><li>Hasta 3 cuotas sin interés</li></ul>' +
          '<a class="pm-wa" target="_blank" rel="noopener" href="' + waLink("Hola! Consulta por: " + p.name + " (" + p.id + ")") + '">💬 Consultar por WhatsApp</a>' +
        "</div>" +
      "</div>";
    openModal("#productModal");
  }

  function openCheckout() {
    if (!cart.length) return;
    renderCheckoutSummary();
    $("#formError").hidden = true;
    $("#checkoutForm").hidden = false;
    $("#checkoutDone").hidden = true;
    openModal("#checkoutModal");
  }

  function checkoutValues() {
    var f = $("#checkoutForm");
    var data = {};
    $$("input, textarea", f).forEach(function (el) {
      if (el.type === "radio") { if (el.checked) data[el.name] = el.value; }
      else data[el.name] = el.value.trim();
    });
    return data;
  }

  function renderCheckoutSummary() {
    var d = checkoutValues();
    var sub = cartSubtotal();
    var disc = d.pago === "Transferencia" ? sub * CFG.transferDiscount : 0;
    $("#shipFields").hidden = d.entrega !== "Envío a domicilio";
    if (d.entrega !== "Envío a domicilio") $$("#shipFields input").forEach(function (el) { el.classList.remove("invalid"); });
    $("#coSummary").innerHTML =
      '<div class="sum-row"><span>' + cartUnits() + (cartUnits() === 1 ? " producto" : " productos") + "</span><span>" + fmt(sub) + "</span></div>" +
      (disc ? '<div class="sum-row" style="color:var(--ok)"><span>Descuento transferencia</span><span>−' + fmt(disc) + "</span></div>" : "") +
      '<div class="sum-row"><span>Envío</span><span>' + (d.entrega !== "Envío a domicilio" ? "Retiro sin cargo" : sub >= CFG.freeShippingFrom ? "Gratis" : "A cotizar") + "</span></div>" +
      '<div class="sum-row"><span><b>Total</b></span><b>' + fmt(sub - disc) + "</b></div>";
  }

  function submitCheckout(e) {
    e.preventDefault();
    var d = checkoutValues();
    var f = $("#checkoutForm");
    var required = ["nombre", "telefono"];
    if (d.entrega === "Envío a domicilio") required.push("direccion", "localidad", "cp");
    var missing = required.filter(function (k) { return !d[k]; });
    $$("input", f).forEach(function (el) { el.classList.toggle("invalid", missing.indexOf(el.name) >= 0); });
    if (missing.length) {
      $("#formError").textContent = "Completá los campos marcados para continuar.";
      $("#formError").hidden = false;
      var first = $('[name="' + missing[0] + '"]', f);
      if (first) first.focus();
      return;
    }
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) {
      $("#formError").textContent = "Revisá el email ingresado.";
      $("#formError").hidden = false;
      return;
    }
    $("#formError").hidden = true;

    var sub = cartSubtotal();
    var disc = d.pago === "Transferencia" ? sub * CFG.transferDiscount : 0;
    var lines = cart.map(function (l) {
      var p = BY_ID[l.id];
      return "• " + l.qty + " x " + p.name + " (" + p.id + ") — " + fmt(unitPrice(p) * l.qty);
    });
    var msg = [
      "*Nuevo pedido TecnoPlay*" + (gremio ? " (precio gremio)" : ""),
      "",
      lines.join("\n"),
      "",
      "Subtotal: " + fmt(sub),
      disc ? "Descuento transferencia: −" + fmt(disc) : null,
      "*Total: " + fmt(sub - disc) + "*",
      "",
      "*Cliente:* " + d.nombre,
      "*Tel:* " + d.telefono,
      d.email ? "*Email:* " + d.email : null,
      "*Entrega:* " + d.entrega,
      d.entrega === "Envío a domicilio" ? "*Dirección:* " + d.direccion + ", " + d.localidad + " (CP " + d.cp + ")" : null,
      "*Pago:* " + d.pago,
      d.comentarios ? "*Comentarios:* " + d.comentarios : null
    ].filter(function (x) { return x !== null; }).join("\n");

    // Paso de confirmación con un enlace real (los pop-ups abiertos por script suelen bloquearse)
    $("#coMessage").textContent = msg;
    $("#coSend").href = waLink(msg);
    f.hidden = true;
    $("#checkoutDone").hidden = false;
    $("#coSend").focus();
  }

  function finishOrder() {
    cart = [];
    saveCart();
    renderCart();
    $("#checkoutForm").reset();
    setTimeout(function () {
      closeAll();
      toast("¡Pedido enviado! Te respondemos a la brevedad por WhatsApp.");
    }, 300);
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(text, action, fn) {
    var t = $("#toast");
    t.innerHTML = "<span>" + esc(text) + "</span>" + (action ? "<button>" + esc(action) + "</button>" : "");
    if (action) $("button", t).onclick = function () { t.classList.remove("show"); fn(); };
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }

  /* ---------- Búsqueda con sugerencias ---------- */
  var sugIndex = -1;
  function renderSuggest() {
    var box = $("#searchSuggest");
    var q = $("#searchInput").value.trim();
    sugIndex = -1;
    if (q.length < 2) { box.classList.remove("open"); return; }
    var res = PRODUCTS.filter(function (p) { return matchesQuery(p, q); });
    if (!res.length) {
      box.innerHTML = '<div class="sug-item">Sin resultados para “' + esc(q) + '”</div>';
    } else {
      box.innerHTML = res.slice(0, 6).map(function (p) {
        return '<button type="button" class="sug-item" data-open="' + p.id + '"><span class="sug-thumb">' + art(p.cat, p.brand) + '</span><span class="sug-name">' + esc(p.name) + '</span><span class="sug-price">' + fmt(unitPrice(p)) + "</span></button>";
      }).join("") + '<button type="submit" class="sug-all">Ver los ' + res.length + " resultados →</button>";
    }
    box.classList.add("open");
  }

  /* ---------- Slider ---------- */
  function initSlider() {
    var slides = $("#slides");
    var n = slides.children.length;
    var i = 0, timer;
    $("#sliderDots").innerHTML = Array.apply(null, Array(n)).map(function (_, k) {
      return '<button aria-label="Ir al slide ' + (k + 1) + '"></button>';
    }).join("");
    var dots = $$("#sliderDots button");
    function go(k) {
      i = (k + n) % n;
      slides.style.transform = "translateX(-" + i * 100 + "%)";
      dots.forEach(function (d, j) { d.classList.toggle("active", j === i); });
    }
    function auto() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6000); }
    $("#slidePrev").onclick = function () { go(i - 1); auto(); };
    $("#slideNext").onclick = function () { go(i + 1); auto(); };
    dots.forEach(function (d, j) { d.onclick = function () { go(j); auto(); }; });
    var x0 = null;
    slides.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slides.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); auto(); }
      x0 = null;
    });
    go(0); auto();
  }

  /* ---------- Modo gremio ---------- */
  function setGremio(on) {
    gremio = on;
    store.set("gremio", on);
    $("#gremioToggle").checked = on;
    renderGrid();
    renderCart();
  }

  /* ---------- Eventos ---------- */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      var el;

      if ((el = t.closest("[data-add]"))) { addToCart(el.getAttribute("data-add"), 1); el.classList.add("added"); el.innerHTML = "✓ Agregado"; setTimeout(renderGrid, 900); return; }
      if ((el = t.closest("[data-open]"))) { $("#searchSuggest").classList.remove("open"); showProduct(el.getAttribute("data-open")); return; }
      if ((el = t.closest("[data-pm-add]"))) {
        var q = parseInt($("#pmQty").value, 10) || 1;
        addToCart(el.getAttribute("data-pm-add"), q);
        closeAll();
        return;
      }
      if (t.closest("[data-pm-inc]") || t.closest("[data-pm-dec]")) {
        var inp = $("#pmQty");
        var v = (parseInt(inp.value, 10) || 1) + (t.closest("[data-pm-inc]") ? 1 : -1);
        inp.value = Math.max(1, Math.min(parseInt(inp.max, 10), v));
        return;
      }
      if ((el = t.closest("[data-inc]"))) { var l1 = cartLine(el.getAttribute("data-inc")); if (l1.qty >= BY_ID[l1.id].stock) toast("Alcanzaste el stock disponible"); setQty(l1.id, l1.qty + 1); return; }
      if ((el = t.closest("[data-dec]"))) { var l2 = cartLine(el.getAttribute("data-dec")); setQty(l2.id, l2.qty - 1); return; }
      if ((el = t.closest("[data-remove]"))) { setQty(el.getAttribute("data-remove"), 0); return; }
      if (t.closest("[data-close-cart]")) { closeAll(); goCatalog(); return; }
      if (t.closest("[data-close]") || t.classList.contains("modal")) { closeAll(); return; }

      if ((el = t.closest("[data-chip]"))) {
        var k = el.getAttribute("data-chip"), val = el.getAttribute("data-val");
        if (k === "q") { state.q = ""; $("#searchInput").value = ""; }
        else if (k === "stock" || k === "offer") state[k] = false;
        else state[k] = state[k].filter(function (x) { return x !== val; });
        state.limit = CFG.pageSize;
        render();
        return;
      }
      if ((el = t.closest("[data-cat]"))) {
        e.preventDefault();
        resetFilters(false);
        var c = el.getAttribute("data-cat");
        if (c) state.cats = [c];
        render(); goCatalog();
        return;
      }
      if ((el = t.closest("[data-offer]"))) { e.preventDefault(); resetFilters(false); state.offer = true; render(); goCatalog(); return; }
      if ((el = t.closest("[data-brand]"))) {
        e.preventDefault();
        var b = el.getAttribute("data-brand");
        var has = state.brands.length === 1 && state.brands[0] === b;
        state.brands = has ? [] : [b];
        state.limit = CFG.pageSize;
        render(); goCatalog();
        return;
      }
      if ((el = t.closest("[data-goto-cat]"))) { e.preventDefault(); resetFilters(false); state.cats = [el.getAttribute("data-goto-cat")]; render(); goCatalog(); return; }

      if (!t.closest("#searchForm")) $("#searchSuggest").classList.remove("open");
    });

    $("#filters").addEventListener("change", function (e) {
      var el = e.target;
      var facet = el.getAttribute("data-facet");
      if (facet) {
        var arr = state[facet];
        if (el.checked) { if (arr.indexOf(el.value) < 0) arr.push(el.value); }
        else state[facet] = arr.filter(function (x) { return x !== el.value; });
      }
      if (el.id === "filterStock") state.stock = el.checked;
      if (el.id === "filterOffer") state.offer = el.checked;
      state.limit = CFG.pageSize;
      render();
    });

    $("#clearFilters").onclick = function () { resetFilters(false); render(); };
    $("#emptyClear").onclick = function () { resetFilters(false); render(); };
    $("#sortSelect").onchange = function () { state.sort = this.value; renderGrid(); };
    $("#loadMore").onclick = function () { state.limit += CFG.pageSize; renderGrid(); };
    $("#filtersOpen").onclick = openFilters;
    $("#filtersClose").onclick = closeAll;
    $("#cartBtn").onclick = openCart;
    $("#cartClose").onclick = closeAll;
    $("#keepShopping").onclick = closeAll;
    $("#overlay").onclick = closeAll;
    $("#checkoutBtn").onclick = openCheckout;
    $("#checkoutForm").addEventListener("change", renderCheckoutSummary);
    $("#checkoutForm").addEventListener("submit", submitCheckout);
    $("#coSend").addEventListener("click", finishOrder);
    $("#coBack").onclick = function () { $("#checkoutDone").hidden = true; $("#checkoutForm").hidden = false; };
    $("#gremioToggle").onchange = function () {
      setGremio(this.checked);
      toast(this.checked ? "Precios gremio activados" : "Mostrando precios al público");
    };
    $("#heroGremio").onclick = function () {
      setGremio(true);
      toast("Precios gremio activados");
      goCatalog();
    };
    $("#menuBtn").onclick = function () { $("#catnav").classList.toggle("open"); };

    var input = $("#searchInput");
    var deb;
    input.addEventListener("input", function () { clearTimeout(deb); deb = setTimeout(renderSuggest, 120); });
    input.addEventListener("focus", renderSuggest);
    input.addEventListener("keydown", function (e) {
      var items = $$("#searchSuggest .sug-item[data-open]");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!items.length) return;
        e.preventDefault();
        sugIndex = (sugIndex + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (it, j) { it.classList.toggle("active", j === sugIndex); });
      } else if (e.key === "Enter" && sugIndex >= 0 && items[sugIndex]) {
        e.preventDefault();
        $("#searchSuggest").classList.remove("open");
        showProduct(items[sugIndex].getAttribute("data-open"));
      } else if (e.key === "Escape") {
        $("#searchSuggest").classList.remove("open");
      }
    });
    $("#searchForm").addEventListener("submit", function (e) {
      e.preventDefault();
      resetFilters(true);
      state.q = input.value.trim();
      $("#searchSuggest").classList.remove("open");
      input.blur();
      render(); goCatalog();
    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openPanel) closeAll(); });
  }

  /* ---------- Inicio ---------- */
  renderStatic();
  $("#gremioToggle").checked = gremio;
  render();
  renderCart();
  initSlider();
  bind();
})();
