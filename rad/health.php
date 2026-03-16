<?php
/**
 * Pro-RAD Editor — Health Check
 * ─────────────────────────────────────────────────────────────────────────────
 * Abre este archivo en el navegador para diagnosticar la instalación.
 * No requiere autenticación. Útil para verificar permisos y configuración.
 *
 * URL: http://tuservidor/pro-rad/health.php
 */

$cfg = require __DIR__ . '/config.php';

header('Content-Type: text/html; charset=UTF-8');

$checks = [];

// PHP version
$phpOk = version_compare(PHP_VERSION, '8.0.0', '>=');
$checks[] = [
    'label'  => 'PHP versión',
    'value'  => PHP_VERSION,
    'ok'     => $phpOk,
    'detail' => $phpOk ? '' : 'Se requiere PHP 8.0 o superior',
];

// Extensiones requeridas
foreach (['json', 'mbstring'] as $ext) {
    $loaded = extension_loaded($ext);
    $checks[] = [
        'label'  => "Extensión PHP: $ext",
        'value'  => $loaded ? 'Cargada' : 'No disponible',
        'ok'     => $loaded,
        'detail' => $loaded ? '' : "Habilita $ext en php.ini",
    ];
}

// Directorio projects
$projDir = $cfg['projects_dir'];
$projExists  = is_dir($projDir);
$projWritable = $projExists && is_writable($projDir);
$projCount   = $projExists ? count(glob($projDir . '*.json') ?: []) : 0;
$checks[] = [
    'label'  => 'Directorio projects/',
    'value'  => $projExists ? ($projWritable ? "✔ Escribible ($projCount proyectos)" : '✘ Solo lectura') : '✘ No existe',
    'ok'     => $projWritable,
    'detail' => !$projExists ? 'Crea la carpeta projects/ manualmente' : (!$projWritable ? 'Ajusta permisos a 755' : ''),
];

// Directorio backups (opcional)
if ($cfg['backups_enabled']) {
    $backDir = $cfg['backups_dir'];
    $backExists   = is_dir($backDir);
    $backWritable = $backExists && is_writable($backDir);
    $checks[] = [
        'label'  => 'Directorio backups/',
        'value'  => $backExists ? ($backWritable ? '✔ Escribible' : '✘ Solo lectura') : '⚠ No existe (se creará al primer save)',
        'ok'     => !$backExists || $backWritable,
        'detail' => $backExists && !$backWritable ? 'Ajusta permisos a 755' : '',
    ];
}

// Directorio logs (opcional)
if ($cfg['logging_enabled']) {
    $logDir = $cfg['logs_dir'];
    $logExists   = is_dir($logDir);
    $logWritable = $logExists && is_writable($logDir);
    $checks[] = [
        'label'  => 'Directorio logs/',
        'value'  => $logExists ? ($logWritable ? '✔ Escribible' : '✘ Solo lectura') : '⚠ No existe (se creará automáticamente)',
        'ok'     => !$logExists || $logWritable,
        'detail' => $logExists && !$logWritable ? 'Ajusta permisos a 755' : '',
    ];
}

// .htaccess
$htExists = file_exists(__DIR__ . '/.htaccess');
$checks[] = [
    'label'  => '.htaccess',
    'value'  => $htExists ? '✔ Presente' : '✘ No encontrado',
    'ok'     => $htExists,
    'detail' => $htExists ? '' : 'Falta .htaccess — los proyectos JSON no estarán protegidos',
];

// Token configurado (sin mostrar el valor)
$tokenOk = $cfg['token'] !== 'rad-token-2024';
$checks[] = [
    'label'  => 'Token de seguridad',
    'value'  => $tokenOk ? '✔ Personalizado' : '⚠ Valor por defecto',
    'ok'     => $tokenOk,
    'detail' => $tokenOk ? '' : 'Cambia el token en config.php antes de usar en producción',
];

// Verificar que api.php responde
$apiPing = null;
$apiOk   = false;
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$apiUrl  = $protocol . '://' . $host . dirname($_SERVER['REQUEST_URI']) . '/api.php?action=ping';

$ctx = stream_context_create(['http' => ['timeout' => 3, 'ignore_errors' => true]]);
$apiResponse = @file_get_contents($apiUrl, false, $ctx);
if ($apiResponse !== false) {
    $decoded = json_decode($apiResponse, true);
    $apiOk   = ($decoded['status'] ?? '') === 'ok';
    $apiPing = $decoded;
}
$checks[] = [
    'label'  => 'api.php ?action=ping',
    'value'  => $apiOk ? '✔ Responde OK' : ('✘ No responde (' . $apiUrl . ')'),
    'ok'     => $apiOk,
    'detail' => $apiOk ? '' : 'Verifica que api.php existe y Apache está corriendo',
];

$allOk = !array_filter($checks, fn($c) => !$c['ok']);

?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pro-RAD — Health Check</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0d1117; color: #e6edf3; padding: 40px 20px; }
  .container { max-width: 700px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .sub { color: #8b949e; font-size: 13px; margin-bottom: 32px; }
  .status-banner { padding: 14px 20px; border-radius: 10px; margin-bottom: 28px; font-weight: 600; font-size: 15px; }
  .status-ok  { background: rgba(63,185,80,0.15); border: 1px solid rgba(63,185,80,0.4); color: #3fb950; }
  .status-err { background: rgba(248,81,73,0.15); border: 1px solid rgba(248,81,73,0.4); color: #f85149; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; color: #8b949e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; padding: 8px 12px; border-bottom: 1px solid #21262d; }
  td { padding: 12px 12px; border-bottom: 1px solid #21262d; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .ok   { color: #3fb950; }
  .warn { color: #fbbf24; }
  .err  { color: #f85149; }
  .label { font-weight: 600; color: #c9d1d9; }
  .detail { font-size: 11px; color: #8b949e; margin-top: 4px; font-style: italic; }
  .mono { font-family: 'Courier New', monospace; font-size: 12px; background: #161b22; padding: 2px 6px; border-radius: 4px; }
  .section { margin-top: 32px; }
  .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #8b949e; margin-bottom: 12px; }
  pre { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 16px; font-size: 12px; overflow-x: auto; color: #e6edf3; }
</style>
</head>
<body>
<div class="container">
  <h1>⚡ Pro-RAD — Health Check</h1>
  <div class="sub">Diagnóstico de instalación · <?= date('d/m/Y H:i:s') ?></div>

  <div class="status-banner <?= $allOk ? 'status-ok' : 'status-err' ?>">
    <?= $allOk ? '✅ Todo en orden — el backend está listo para usar' : '❌ Hay problemas que resolver antes de usar el sistema' ?>
  </div>

  <table>
    <thead>
      <tr><th>Componente</th><th>Estado</th></tr>
    </thead>
    <tbody>
    <?php foreach ($checks as $c): ?>
      <tr>
        <td class="label"><?= htmlspecialchars($c['label']) ?></td>
        <td>
          <span class="<?= $c['ok'] ? 'ok' : (str_starts_with($c['value'], '⚠') ? 'warn' : 'err') ?>">
            <?= htmlspecialchars($c['value']) ?>
          </span>
          <?php if ($c['detail']): ?>
            <div class="detail"><?= htmlspecialchars($c['detail']) ?></div>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>

  <?php if ($apiPing): ?>
  <div class="section">
    <div class="section-title">Respuesta de api.php?action=ping</div>
    <pre><?= htmlspecialchars(json_encode($apiPing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) ?></pre>
  </div>
  <?php endif; ?>

  <div class="section">
    <div class="section-title">Configuración activa (config.php)</div>
    <pre><?= htmlspecialchars(json_encode([
      'token'           => str_repeat('*', strlen($cfg['token'])) . ' (' . strlen($cfg['token']) . ' chars)',
      'projects_dir'    => $cfg['projects_dir'],
      'max_file_size'   => ($cfg['max_file_size'] / 1048576) . ' MB',
      'max_projects'    => $cfg['max_projects'],
      'backups_enabled' => $cfg['backups_enabled'],
      'backups_keep'    => $cfg['backups_keep'],
      'logging_enabled' => $cfg['logging_enabled'],
      'log_level'       => $cfg['log_level'],
      'schema_version'  => $cfg['schema_version'],
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)) ?></pre>
  </div>

  <p style="margin-top:32px; font-size:11px; color:#8b949e; text-align:center;">
    Pro-RAD Backend v1.0 · PHP <?= PHP_VERSION ?> · <?= php_uname('s') ?>
  </p>
</div>
</body>
</html>
