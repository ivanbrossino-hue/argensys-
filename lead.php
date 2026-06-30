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
$telefono = field('tel') ?: field('telefono');     // home / contacto
$extra    = field('size') ?: field('area');        // tamaño de empresa / área de interés
$mensaje  = field('msg') ?: field('mensaje');

if ($nombre === '' || $email === '') {
  http_response_code(422); echo json_encode(['ok' => false, 'error' => 'campos']); exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422); echo json_encode(['ok' => false, 'error' => 'email']); exit;
}

$comments = '';
if ($empresa) $comments .= "Empresa: $empresa\n";
if ($extra)   $comments .= "Detalle: $extra\n";
if ($mensaje) $comments .= "Mensaje: $mensaje\n";

$fields = [
  'TITLE'         => 'Web: ' . ($empresa ?: $nombre),
  'NAME'          => $nombre,
  'COMPANY_TITLE' => $empresa,
  'SOURCE_ID'     => 'WEB',
  'COMMENTS'      => $comments,
  'OPENED'        => 'Y',
];
if ($email)    $fields['EMAIL'] = [['VALUE' => $email, 'VALUE_TYPE' => 'WORK']];
if ($telefono) $fields['PHONE'] = [['VALUE' => $telefono, 'VALUE_TYPE' => 'WORK']];

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
