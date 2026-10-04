# TecnoPlay — tienda de repuestos para celulares

Sitio estático (HTML + CSS + JS, sin dependencias). Se puede subir tal cual a cualquier hosting.

## Archivos
- `index.html` — estructura de la página.
- `styles.css` — estilos (paleta: azul `#0B3D91`, celeste `#4FC3F7`, blanco y amarillo `#FFC928`).
- `products.js` — **configuración y catálogo**: es el único archivo que hace falta editar.
- `app.js` — lógica: filtros, búsqueda, carrito y pedido por WhatsApp.

## Antes de publicar
En `products.js`, dentro de `TP_CONFIG`, completá:
- `whatsapp`: número que recibe los pedidos (ej. `5491155551234`).
- `email`, `address`, `hours`.
- `transferDiscount`, `gremioFactor` y `freeShippingFrom` según tu política comercial.

## Cargar productos
Cada fila de `rows` en `products.js` es un producto:

```js
["modulos", "Samsung", "Módulo Samsung A32 4G", "OLED", 58900, 9, 66500]
//  categoría  marca     nombre                   calidad precio stock precio anterior (opcional → oferta)
```

Stock `0` muestra el producto como "Sin stock" con botón para consultar reposición.

## Cómo funciona la compra
El cliente arma el carrito, completa sus datos y el pedido se envía armado por WhatsApp
para confirmar stock y pasar los datos de pago. El carrito y el modo "precio gremio" se guardan en el navegador.
