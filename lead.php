<?php
/* ============================================================
   Argensys — relay seguro del formulario → Bitrix24 (crm.lead.add)
   Recibe el POST del formulario y crea un Prospecto en Bitrix24.
   La URL secreta del webhook vive en bitrix-config.php (NO se sube a repos).
   Requiere PHP con cURL (cualquier hosting de WordPress lo tiene).
   ============================================================ */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405); echo json_encode(['ok' => false, 'error' => 'method']); exit;
}

// Anti-spam: campo trampa (honeypot). Si un bot lo completa, fingimos éxito y no creamos nada.
if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; }

// Cargar la URL del webhook (archivo fuera del repo público)
$cfg = @include __DIR__ . '/bitrix-config.php';
$WEBHOOK = (is_array($cfg) && !empty($cfg['webhook'])) ? $cfg['webhook'] : '';
if (!$WEBHOOK) {
  http_response_code(500); echo json_encode(['ok' => false, 'error' => 'config']); exit;
}

function field($k) { return isset($_POST[$k]) ? trim((string) $_POST[$k]) : ''; }

$nombre   = field('nombre');
$empresa  = field('empresa');
$email    = field('email');
$telefono = field('tel') ?: field('telefono');   // home / contacto
$area     = field('area');                        // contacto: Área de interés (desplegable)
$size     = field('size');                        // home: Tamaño de empresa (sin campo propio en Bitrix)
$mensaje  = field('msg') ?: field('mensaje');     // "Contanos qué necesitás"

if ($nombre === '' || $email === '') {
  http_response_code(422); echo json_encode(['ok' => false, 'error' => 'campos']); exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422); echo json_encode(['ok' => false, 'error' => 'email']); exit;
}

// Comentario = solo lo que el usuario escribió. (El "Tamaño" del home no tiene campo propio: se anexa acá.)
$comments = $mensaje;
if ($size !== '') { $comments .= ($comments ? "\n\n" : '') . "Tamaño de empresa: $size"; }

$fields = [
  'TITLE'         => 'Web: ' . ($empresa ?: $nombre),
  'NAME'          => $nombre,          // dato de contacto del prospecto
  'COMPANY_TITLE' => $empresa,
  'SOURCE_ID'     => 'WEB',
  'COMMENTS'      => $comments,
  'OPENED'        => 'Y',
];
if ($email)    $fields['EMAIL'] = [['VALUE' => $email, 'VALUE_TYPE' => 'WORK']];
if ($telefono) $fields['PHONE'] = [['VALUE' => $telefono, 'VALUE_TYPE' => 'WORK']];

// --- Área de Interés (campo personalizado tipo lista) ---
// Bitrix guarda el ID numérico de la opción, NO el texto.
// PENDIENTE: completar $AREA_FIELD con el código (UF_CRM_...) y $AREA_MAP con el ID de cada opción.
$AREA_FIELD = 'UF_CRM_1782839712364';
$AREA_MAP = [
  // valor del <select> de la web  =>  ID de la opción en Bitrix
  'infraestructura' => 66,
  'soporte'         => 67,
  'ciberseguridad'  => 68,
  'bitrix24'        => 69,
  'sentinel'        => 70,
  'otro'            => 71,
];
if ($AREA_FIELD && $area !== '' && isset($AREA_MAP[$area])) {
  $fields[$AREA_FIELD] = $AREA_MAP[$area];
}

$url = rtrim($WEBHOOK, '/') . '/crm.lead.add.json';
$payload = http_build_query([
  'fields' => $fields,
  'params' => ['REGISTER_SONET_EVENT' => 'Y'],
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => $payload,
  CURLOPT_TIMEOUT        => 15,
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($resp, true);
if ($code === 200 && isset($data['result'])) {
  echo json_encode(['ok' => true, 'id' => $data['result']]);
} else {
  http_response_code(502);
  echo json_encode(['ok' => false, 'error' => 'bitrix', 'detail' => $data['error_description'] ?? '']);
}
