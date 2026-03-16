<?php
/**
 * Pro-RAD Editor — API Backend v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * CRUD de proyectos en disco (archivos JSON).
 * Requiere PHP 8.0+
 *
 * Endpoints:
 *   GET  ?action=list            → Lista todos los proyectos
 *   GET  ?action=get&id={id}     → Carga un proyecto
 *   GET  ?action=ping            → Health check sin autenticación
 *   POST {action:"save"}         → Guarda / actualiza un proyecto
 *   POST {action:"delete"}       → Elimina un proyecto
 *   POST {action:"duplicate"}    → Duplica un proyecto con nuevo nombre
 *   POST {action:"backup_list"}  → Lista backups de un proyecto
 *   POST {action:"backup_restore"} → Restaura un backup
 */

declare(strict_types=1);

// ─── Cargar configuración ────────────────────────────────────────────────────
$cfg = require __DIR__ . '/config.php';

// ─── CORS ────────────────────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $cfg['cors_origins'];

if (in_array('*', $allowed)) {
    header('Access-Control-Allow-Origin: *');
} elseif (in_array($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-RAD-Token');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Logging ─────────────────────────────────────────────────────────────────
function rad_log(string $level, string $message, array $context = []): void {
    global $cfg;
    if (!$cfg['logging_enabled']) return;

    $levels = ['error' => 0, 'info' => 1, 'debug' => 2];
    $cfgLevel = $levels[$cfg['log_level']] ?? 1;
    if (($levels[$level] ?? 99) > $cfgLevel) return;

    $logsDir = $cfg['logs_dir'];
    if (!is_dir($logsDir)) mkdir($logsDir, 0755, true);

    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ctx = empty($context) ? '' : ' ' . json_encode($context, JSON_UNESCAPED_UNICODE);
    $line = sprintf("[%s] [%s] [%s] %s%s\n",
        date('Y-m-d H:i:s'), strtoupper($level), $ip, $message, $ctx
    );
    file_put_contents($logsDir . 'api.log', $line, FILE_APPEND | LOCK_EX);
}

// ─── Respuestas ──────────────────────────────────────────────────────────────
function json_response(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function error_response(string $message, int $status = 400, array $extra = []): never {
    rad_log('error', $message, ['status' => $status]);
    json_response(['error' => $message, ...$extra], $status);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function sanitize_id(string $id): string {
    return preg_replace('/[^a-z0-9\-_]/i', '', $id);
}

function project_path(string $id): string {
    global $cfg;
    return $cfg['projects_dir'] . sanitize_id($id) . '.json';
}

function ensure_dir(string $path): void {
    if (!is_dir($path)) mkdir($path, 0755, true);
}

function project_summary(array $data, string $file): array {
    return [
        'id'         => $data['meta']['spec_id']   ?? basename($file, '.json'),
        'name'       => $data['meta']['name']       ?? 'Sin nombre',
        'author'     => $data['meta']['author']     ?? '',
        'version'    => $data['meta']['version']    ?? '',
        'created_at' => $data['meta']['created_at'] ?? '',
        'updated_at' => $data['meta']['updated_at'] ?? '',
        'page_count' => count($data['pages'] ?? []),
        'form_count' => array_sum(array_map(
            fn($p) => count($p['forms'] ?? []), $data['pages'] ?? []
        )),
        'tags'       => $data['meta']['tags'] ?? [],
        'db_type'    => $data['database']['type'] ?? '',
        'size_bytes' => filesize($file),
    ];
}

// ─── Validación de proyecto ──────────────────────────────────────────────────
function validate_project(array $project): array {
    global $cfg;
    $errors = [];

    if (($project['schema_version'] ?? '') !== $cfg['schema_version']) {
        $errors[] = "schema_version debe ser \"{$cfg['schema_version']}\"";
    }
    if (empty($project['meta']['spec_id'])) {
        $errors[] = 'meta.spec_id es requerido';
    }
    if (empty($project['meta']['name'])) {
        $errors[] = 'meta.name es requerido';
    }

    return $errors;
}

// ─── Backup ──────────────────────────────────────────────────────────────────
function make_backup(string $projectId, string $currentPath): void {
    global $cfg;
    if (!$cfg['backups_enabled']) return;
    if (!file_exists($currentPath)) return;

    $backupDir = $cfg['backups_dir'] . sanitize_id($projectId) . '/';
    ensure_dir($backupDir);

    $timestamp = date('Ymd_His');
    $dest = $backupDir . $timestamp . '.json';
    copy($currentPath, $dest);

    // Purgar backups viejos — conservar solo los N más recientes
    $keep  = max(1, (int)$cfg['backups_keep']);
    $files = glob($backupDir . '*.json');
    if ($files && count($files) > $keep) {
        sort($files); // más viejo primero
        $toDelete = array_slice($files, 0, count($files) - $keep);
        foreach ($toDelete as $old) unlink($old);
    }
}

// ─── Autenticación ───────────────────────────────────────────────────────────
function authenticate(): void {
    global $cfg;
    $token = $_SERVER['HTTP_X_RAD_TOKEN'] ?? '';
    if ($token !== $cfg['token']) {
        rad_log('error', 'Token inválido', ['token_preview' => substr($token, 0, 4) . '...']);
        http_response_code(401);
        echo json_encode(['error' => 'Token inválido. Revisa config.js y config.php.']);
        exit;
    }
}

// ─── Asegurar directorios base ────────────────────────────────────────────────
ensure_dir($cfg['projects_dir']);

// ─── Routing ─────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Ping — sin autenticación (útil para verificar que PHP responde)
if ($method === 'GET' && $action === 'ping') {
    json_response([
        'status'  => 'ok',
        'version' => '1.0',
        'php'     => PHP_VERSION,
        'time'    => date('c'),
    ]);
}

// Todas las demás rutas requieren autenticación
authenticate();

// ══════════════════════════════════════════════════════════════════════════════
// GET
// ══════════════════════════════════════════════════════════════════════════════
if ($method === 'GET') {

    switch ($action) {

        // ─── Listar todos los proyectos ──────────────────────────────────────
        case 'list':
            $files    = glob($cfg['projects_dir'] . '*.json') ?: [];
            $projects = [];

            foreach ($files as $file) {
                $content = file_get_contents($file);
                $data    = json_decode($content, true);
                if ($data && isset($data['meta'])) {
                    $projects[] = project_summary($data, $file);
                }
            }

            // Ordenar por updated_at desc
            usort($projects, fn($a, $b) => strcmp($b['updated_at'], $a['updated_at']));

            rad_log('info', 'list', ['count' => count($projects)]);
            json_response(['projects' => $projects, 'total' => count($projects)]);

        // ─── Cargar un proyecto ──────────────────────────────────────────────
        case 'get':
            $id = sanitize_id($_GET['id'] ?? '');
            if (!$id) error_response('Parámetro id requerido');

            $path = project_path($id);
            if (!file_exists($path)) error_response("Proyecto '$id' no encontrado", 404);

            $content = file_get_contents($path);
            $data    = json_decode($content, true);
            if (!$data) error_response('Archivo JSON corrupto o inválido', 500);

            rad_log('info', 'get', ['id' => $id]);
            json_response($data);

        // ─── Desconocido ─────────────────────────────────────────────────────
        default:
            error_response("Acción GET desconocida: '$action'");
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// POST
// ══════════════════════════════════════════════════════════════════════════════
if ($method === 'POST') {

    // Leer body
    $rawBody = file_get_contents('php://input');
    if (strlen($rawBody) > $cfg['max_file_size']) {
        error_response('El payload excede el tamaño máximo (' . ($cfg['max_file_size'] / 1048576) . ' MB)');
    }

    $payload = json_decode($rawBody, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_response('JSON inválido en el body: ' . json_last_error_msg());
    }

    $postAction = $payload['action'] ?? '';

    switch ($postAction) {

        // ─── Guardar / actualizar proyecto ───────────────────────────────────
        case 'save':
            $project = $payload['project'] ?? null;
            if (!is_array($project)) error_response('Campo "project" requerido y debe ser un objeto');

            // Validar estructura
            $errors = validate_project($project);
            if (!empty($errors)) {
                error_response('Proyecto inválido', 422, ['validation_errors' => $errors]);
            }

            $id   = sanitize_id($project['meta']['spec_id']);
            $path = project_path($id);

            // Verificar límite de proyectos (solo en nuevos)
            if (!file_exists($path)) {
                $existingCount = count(glob($cfg['projects_dir'] . '*.json') ?: []);
                if ($existingCount >= $cfg['max_projects']) {
                    error_response("Límite de {$cfg['max_projects']} proyectos alcanzado", 429);
                }
            }

            // Backup antes de sobreescribir
            make_backup($id, $path);

            // Guardar con escritura atómica (temp file → rename)
            $json    = json_encode($project, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            $tmpPath = $path . '.tmp';

            if (file_put_contents($tmpPath, $json, LOCK_EX) === false) {
                error_response('Error al escribir en disco', 500);
            }
            if (!rename($tmpPath, $path)) {
                @unlink($tmpPath);
                error_response('Error al guardar el archivo (rename falló)', 500);
            }

            rad_log('info', 'save', ['id' => $id, 'bytes' => strlen($json)]);
            json_response([
                'ok'         => true,
                'id'         => $id,
                'saved_at'   => date('c'),
                'size_bytes' => strlen($json),
            ]);

        // ─── Eliminar proyecto ───────────────────────────────────────────────
        case 'delete':
            $id   = sanitize_id($payload['id'] ?? '');
            if (!$id) error_response('Campo "id" requerido');

            $path = project_path($id);
            if (!file_exists($path)) error_response("Proyecto '$id' no encontrado", 404);

            // Backup antes de eliminar
            make_backup($id, $path);
            unlink($path);

            rad_log('info', 'delete', ['id' => $id]);
            json_response(['ok' => true, 'deleted' => $id]);

        // ─── Duplicar proyecto ───────────────────────────────────────────────
        case 'duplicate':
            $id      = sanitize_id($payload['id'] ?? '');
            $newName = trim($payload['new_name'] ?? '');
            if (!$id)      error_response('Campo "id" requerido');
            if (!$newName) error_response('Campo "new_name" requerido');

            $path = project_path($id);
            if (!file_exists($path)) error_response("Proyecto '$id' no encontrado", 404);

            $content = file_get_contents($path);
            $data    = json_decode($content, true);
            if (!$data) error_response('Error al leer el proyecto original', 500);

            // Nuevo ID y metadatos
            $newId = bin2hex(random_bytes(5)); // ID corto tipo a1b2c3d4e5
            $data['meta']['spec_id']   = $newId;
            $data['meta']['name']      = $newName;
            $data['meta']['created_at'] = date('c');
            $data['meta']['updated_at'] = date('c');

            $newPath = project_path($newId);
            $json    = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            if (file_put_contents($newPath, $json, LOCK_EX) === false) {
                error_response('Error al escribir el duplicado', 500);
            }

            rad_log('info', 'duplicate', ['from' => $id, 'to' => $newId]);
            json_response([
                'ok'    => true,
                'new_id' => $newId,
                'name'  => $newName,
            ]);

        // ─── Listar backups de un proyecto ───────────────────────────────────
        case 'backup_list':
            $id = sanitize_id($payload['id'] ?? '');
            if (!$id) error_response('Campo "id" requerido');

            $backupDir = $cfg['backups_dir'] . $id . '/';
            if (!is_dir($backupDir)) {
                json_response(['backups' => []]);
            }

            $files   = glob($backupDir . '*.json') ?: [];
            rsort($files); // más reciente primero
            $backups = array_map(fn($f) => [
                'filename'   => basename($f),
                'created_at' => date('c', filemtime($f)),
                'size_bytes' => filesize($f),
            ], $files);

            json_response(['backups' => $backups]);

        // ─── Restaurar un backup ─────────────────────────────────────────────
        case 'backup_restore':
            $id       = sanitize_id($payload['id'] ?? '');
            $filename = basename($payload['filename'] ?? '');  // Previene path traversal
            if (!$id || !$filename) error_response('Campos "id" y "filename" requeridos');

            // Solo archivos .json con nombre de timestamp
            if (!preg_match('/^\d{8}_\d{6}\.json$/', $filename)) {
                error_response('Nombre de backup inválido');
            }

            $backupPath  = $cfg['backups_dir'] . $id . '/' . $filename;
            $projectPath = project_path($id);

            if (!file_exists($backupPath)) error_response('Backup no encontrado', 404);

            // Hacer backup del estado actual antes de restaurar
            make_backup($id, $projectPath);

            // Restaurar
            if (!copy($backupPath, $projectPath)) {
                error_response('Error al restaurar el backup', 500);
            }

            rad_log('info', 'backup_restore', ['id' => $id, 'file' => $filename]);
            json_response(['ok' => true, 'restored' => $filename]);

        // ─── Desconocido ─────────────────────────────────────────────────────
        default:
            error_response("Acción POST desconocida: '$postAction'");
    }
}

// ─── Método no permitido ──────────────────────────────────────────────────────
error_response('Método HTTP no permitido', 405);
