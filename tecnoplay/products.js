/* ============================================================
   TecnoPlay — configuración de la tienda y catálogo
   Editá este archivo para cambiar datos de contacto, precios
   y productos. No hace falta tocar app.js.
   ============================================================ */

window.TP_CONFIG = {
  // Número de WhatsApp que recibe los pedidos (formato internacional, sin + ni espacios)
  whatsapp: "5491100000000",
  email: "ventas@tecnoplay.com.ar",
  address: "Av. Corrientes 1234, CABA",
  hours: "Lun a Vie 9 a 18 hs · Sáb 9 a 13 hs",
  // Descuento por transferencia (0.10 = 10%)
  transferDiscount: 0.10,
  // Precio gremio = precio público × este factor
  gremioFactor: 0.82,
  // Monto desde el que el envío es gratis
  freeShippingFrom: 150000,
  // Productos por página en el catálogo
  pageSize: 12
};

window.TP_CATEGORIES = [
  { id: "modulos",      name: "Módulos y pantallas", short: "Módulos" },
  { id: "baterias",     name: "Baterías",            short: "Baterías" },
  { id: "pines",        name: "Pines y placas de carga", short: "Pin de carga" },
  { id: "flex",         name: "Flex",                short: "Flex" },
  { id: "tapas",        name: "Tapas traseras",      short: "Tapas" },
  { id: "camaras",      name: "Cámaras",             short: "Cámaras" },
  { id: "herramientas", name: "Herramientas",        short: "Herramientas" },
  { id: "accesorios",   name: "Vidrios y accesorios", short: "Accesorios" }
];

window.TP_BRANDS = ["Samsung", "Motorola", "iPhone", "Xiaomi", "Huawei", "TCL", "LG", "Genérico"];

/* Formato compacto de cada producto:
   [categoría, marca, nombre, calidad, precio público, stock, precio anterior (opcional, para ofertas)]
   El código (SKU) se genera solo. */
(function () {
  var rows = [
    // Módulos
    ["modulos", "Samsung",  "Módulo Samsung A10 con marco",          "Original", 32500, 14],
    ["modulos", "Samsung",  "Módulo Samsung A12 con marco",          "Original", 34900, 22],
    ["modulos", "Samsung",  "Módulo Samsung A32 4G",                 "OLED",     58900, 9, 66500],
    ["modulos", "Samsung",  "Módulo Samsung A52 con marco",          "OLED",     79900, 6],
    ["modulos", "Samsung",  "Módulo Samsung A54 5G",                 "Original", 129900, 3],
    ["modulos", "Samsung",  "Módulo Samsung S21 FE",                 "Original", 189900, 2],
    ["modulos", "Motorola", "Módulo Motorola G9 Play",               "Original", 31900, 18],
    ["modulos", "Motorola", "Módulo Motorola E20",                   "Original", 27500, 25],
    ["modulos", "Motorola", "Módulo Motorola G52",                   "OLED",     62900, 7, 69900],
    ["modulos", "Motorola", "Módulo Motorola Edge 30",               "OLED",     94900, 0],
    ["modulos", "iPhone",   "Módulo iPhone 11",                      "Incell",   49900, 12],
    ["modulos", "iPhone",   "Módulo iPhone 12 / 12 Pro",             "OLED",     119900, 5],
    ["modulos", "iPhone",   "Módulo iPhone 13",                      "OLED",     149900, 4],
    ["modulos", "Xiaomi",   "Módulo Xiaomi Redmi Note 10",           "OLED",     64900, 8],
    ["modulos", "Xiaomi",   "Módulo Xiaomi Redmi 9A",                "Original", 28900, 16],
    ["modulos", "Huawei",   "Módulo Huawei P30 Lite",                "Original", 45900, 0],
    ["modulos", "TCL",      "Módulo TCL 20 SE",                      "Original", 36900, 6],
    // Baterías
    ["baterias", "Samsung",  "Batería Samsung A10 / A20s",           "Original", 15900, 30],
    ["baterias", "Samsung",  "Batería Samsung A32 / A52",            "Original", 19900, 20, 23500],
    ["baterias", "Motorola", "Batería Motorola G9 / G8 Power (MC50)","Original", 17500, 26],
    ["baterias", "Motorola", "Batería Motorola E7 / E20 (MT41)",     "Alta capacidad", 14900, 0],
    ["baterias", "iPhone",   "Batería iPhone 11",                    "Alta capacidad", 29900, 15, 34900],
    ["baterias", "iPhone",   "Batería iPhone XR",                    "Alta capacidad", 26900, 10],
    ["baterias", "Xiaomi",   "Batería Xiaomi Redmi Note 9 (BN54)",   "Original", 18900, 12],
    // Pines y placas de carga
    ["pines", "Samsung",  "Placa de carga Samsung A12",              "Original", 8900, 40],
    ["pines", "Samsung",  "Placa de carga Samsung A32",              "Original", 11900, 24],
    ["pines", "Motorola", "Placa de carga Motorola G20",             "Original", 9500, 18, 11200],
    ["pines", "Genérico", "Pin de carga USB-C 16 pines (x10)",       "Genérico", 6500, 60],
    ["pines", "Genérico", "Pin de carga Micro USB 5 pines (x10)",    "Genérico", 4900, 0],
    ["pines", "iPhone",   "Flex de carga iPhone 11",                 "Original", 15900, 9],
    // Flex
    ["flex", "Samsung",  "Flex principal Samsung A20 (LCD)",         "Original", 7900, 15],
    ["flex", "Motorola", "Flex de encendido y volumen Moto G8",      "Original", 5900, 20],
    ["flex", "iPhone",   "Flex de encendido iPhone 12",              "Original", 12900, 8],
    ["flex", "Xiaomi",   "Flex principal Redmi Note 8",              "Original", 8500, 0],
    // Tapas
    ["tapas", "Samsung",  "Tapa trasera Samsung A12 negra",          "Original", 9900, 14],
    ["tapas", "Samsung",  "Tapa trasera Samsung A52 azul",           "Original", 13900, 6],
    ["tapas", "Motorola", "Tapa trasera Motorola G9 Play",           "Original", 9500, 11],
    ["tapas", "iPhone",   "Tapa vidrio trasero iPhone 11",           "Genérico", 11900, 9, 13900],
    // Cámaras
    ["camaras", "Samsung",  "Cámara trasera Samsung A32 64MP",       "Original", 21900, 5],
    ["camaras", "iPhone",   "Cámara trasera iPhone 11",              "Original", 39900, 3],
    ["camaras", "Motorola", "Cámara frontal Motorola G52",           "Original", 9900, 7],
    // Herramientas
    ["herramientas", "Genérico", "Estación de soldado Yaxun 2 en 1",  "Profesional", 119900, 4, 134900],
    ["herramientas", "Genérico", "Kit destornilladores de precisión 115 en 1", "Profesional", 18900, 22],
    ["herramientas", "Genérico", "Separadora de pantallas 7\" con bomba de vacío", "Profesional", 89900, 3],
    ["herramientas", "Genérico", "Pegamento B-7000 50 ml",            "Genérico", 2900, 80],
    ["herramientas", "Genérico", "Pegamento T-7000 negro 50 ml",      "Genérico", 3200, 64],
    ["herramientas", "Genérico", "Fuente regulable 30V 5A",           "Profesional", 74900, 5],
    ["herramientas", "Genérico", "Kit de púas y espátulas de apertura","Genérico", 3900, 50],
    // Accesorios
    ["accesorios", "Genérico", "Vidrio templado 9D (pack x10)",       "Genérico", 7900, 100],
    ["accesorios", "Genérico", "Vidrio templado cerámico mate (x10)", "Genérico", 9900, 45, 11900],
    ["accesorios", "Genérico", "Cable USB-C a USB-C 1 m reforzado",   "Genérico", 4500, 70],
    ["accesorios", "Samsung",  "Cargador Samsung 25W carga rápida",   "Original", 19900, 12]
  ];

  var prefix = { modulos: "MOD", baterias: "BAT", pines: "PIN", flex: "FLX", tapas: "TAP", camaras: "CAM", herramientas: "HER", accesorios: "ACC" };

  window.TP_PRODUCTS = rows.map(function (r, i) {
    return {
      id: prefix[r[0]] + "-" + String(1001 + i),
      cat: r[0],
      brand: r[1],
      name: r[2],
      quality: r[3],
      price: r[4],
      stock: r[5],
      oldPrice: r[6] || null,
      order: i
    };
  });
})();
