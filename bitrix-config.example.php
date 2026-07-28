<?php
/* ============================================================
   PLANTILLA — copiá este archivo como  bitrix-config.php  EN EL SERVIDOR
   y pegá la URL de tu webhook entrante de Bitrix24.

   IMPORTANTE: bitrix-config.php NO se sube a GitHub (está en .gitignore).
   La URL es secreta: solo debe vivir en el servidor del hosting.
   ============================================================ */
return [
  // Webhook entrante de Bitrix24 con permiso CRM. Ejemplo:
  // https://argensys.bitrix24.com/rest/1/abcd1234efgh5678/
  'webhook' => 'https://TU-PORTAL.bitrix24.com/rest/USER_ID/TOKEN_SECRETO/',

  // Cloudflare Turnstile — SECRET KEY (clave secreta, va solo en el servidor).
  // La sacás en Cloudflare → Turnstile → tu sitio. Si lo dejás vacío, no se valida el captcha.
  'turnstile_secret' => 'TU_SECRET_KEY_DE_TURNSTILE',
];
