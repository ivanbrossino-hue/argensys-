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

// Separar Nombre y Apellido a partir del campo único del formulario ("Pablo Perez")
$parts     = preg_split('/\s+/', $nombre, 2);
$first_name = $parts[0] ?? $nombre;
$last_name  = $parts[1] ?? '';

$emailArr = $email    ? [['VALUE' => $email,    'VALUE_TYPE' => 'WORK']] : null;
$phoneArr = $telefono ? [['VALUE' => $telefono, 'VALUE_TYPE' => 'WORK']] : null;

// Helper para llamar al REST de Bitrix24
function bitrix_call($webhook, $method, $fields) {
  $url = rtrim($webhook, '/') . '/' . $method . '.json';
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query(['fields' => $fields, 'params' => ['REGISTER_SONET_EVENT' => 'Y']]),
    CURLOPT_TIMEOUT        => 20,
  ]);
  $resp = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return [$code, json_decode($resp, true)];
}

// 1) Crear la Compañía (si vino el nombre de empresa)
$companyId = 0;
if ($empresa !== '') {
  $companyFields = ['TITLE' => $empresa, 'OPENED' => 'Y'];
  if ($emailArr) $companyFields['EMAIL'] = $emailArr;
  if ($phoneArr) $companyFields['PHONE'] = $phoneArr;
  list($coCode, $coData) = bitrix_call($WEBHOOK, 'crm.company.add', $companyFields);
  $companyId = ($coCode === 200 && isset($coData['result'])) ? (int) $coData['result'] : 0;
}

// 2) Crear el Contacto (el "Cliente" del prospecto), vinculado a la Compañía
$contactFields = ['NAME' => $first_name, 'LAST_NAME' => $last_name, 'OPENED' => 'Y', 'SOURCE_ID' => 'WEB'];
if ($companyId) $contactFields['COMPANY_ID'] = $companyId;
if ($emailArr)  $contactFields['EMAIL'] = $emailArr;
if ($phoneArr)  $contactFields['PHONE'] = $phoneArr;
list($cCode, $cData) = bitrix_call($WEBHOOK, 'crm.contact.add', $contactFields);
$contactId = ($cCode === 200 && isset($cData['result'])) ? (int) $cData['result'] : 0;

// 3) Crear el Prospecto, vinculado al Contacto y a la Compañía
$fields = [
  'TITLE'         => 'Web: ' . ($empresa ?: $nombre),
  'NAME'          => $first_name,
  'LAST_NAME'     => $last_name,
  'COMPANY_TITLE' => $empresa,
  'SOURCE_ID'     => 'WEB',
  'COMMENTS'      => $comments,
  'OPENED'        => 'Y',
];
if ($contactId) $fields['CONTACT_ID'] = $contactId;
if ($companyId) $fields['COMPANY_ID'] = $companyId;
if ($emailArr)  $fields['EMAIL'] = $emailArr;
if ($phoneArr)  $fields['PHONE'] = $phoneArr;

// --- Área de Interés (campo personalizado tipo lista) ---
// Bitrix guarda el ID numérico de la opción, no el texto; acá traducimos.
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

list($code, $data) = bitrix_call($WEBHOOK, 'crm.lead.add', $fields);
if ($code === 200 && isset($data['result'])) {
  echo json_encode(['ok' => true, 'id' => $data['result'], 'contact' => $contactId, 'company' => $companyId]);
} else {
  http_response_code(502);
  echo json_encode(['ok' => false, 'error' => 'bitrix', 'detail' => $data['error_description'] ?? '']);
}
