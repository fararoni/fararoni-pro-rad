<?php
/**
 * Pro-RAD Editor — Migración de Proyectos v1 → v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Uso: abre en el navegador o ejecuta en CLI:
 *   php migrate.php
 *
 * Convierte proyectos con schema_version < 2.0 al schema v2.0.
 * Los originales se guardan en backups/ antes de migrar.
 */

$cfg = require __DIR__ . '/config.php';

$isCli = PHP_SAPI === 'cli';

if (!$isCli) {
    // Verificar token si se accede desde browser
    $token = $_SERVER['HTTP_X_RAD_TOKEN'] ?? $_GET['token'] ?? '';
    if ($token !== $cfg['token']) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Token requerido para ejecutar migración']);
        exit;
    }
    header('Content-Type: text/plain; charset=UTF-8');
}

function log_line(string $msg): void {
    echo $msg . "\n";
    flush();
}

function migrate_project(array $p): array {
    // Asegurar schema_version
    $p['schema_version'] = '2.0';

    // meta
    $p['meta']['spec_id']    = $p['meta']['spec_id']    ?? $p['id'] ?? bin2hex(random_bytes(5));
    $p['meta']['version']    = $p['meta']['version']    ?? '1.0.0';
    $p['meta']['author']     = $p['meta']['author']     ?? '';
    $p['meta']['tags']       = $p['meta']['tags']       ?? [];
    $p['meta']['created_at'] = $p['meta']['created_at'] ?? date('c');
    $p['meta']['updated_at'] = date('c');

    // database
    if (!isset($p['database'])) {
        $p['database'] = ['type' => 'mysql', 'host' => 'localhost', 'port' => 3306, 'name' => '', 'schema' => ''];
    }

    // global_rules
    $p['global_rules'] = $p['global_rules'] ?? [];

    // navigation
    $p['navigation'] = $p['navigation'] ?? [
        'login_page' => '', 'home_page' => '', 'header_page' => '', 'footer_page' => '', 'menu_structure' => [],
    ];

    // pages
    foreach ($p['pages'] as &$page) {
        $page['id']             = $page['id']             ?? bin2hex(random_bytes(5));
        $page['description']    = $page['description']    ?? '';
        $page['layout']         = $page['layout']         ?? 'simple';
        $page['security_level'] = $page['security_level'] ?? 1;
        $page['roles_allowed']  = $page['roles_allowed']  ?? ['usuario'];
        $page['is_generated']   = $page['is_generated']   ?? false;
        $page['page_rules']     = $page['page_rules']     ?? [];

        foreach (($page['forms'] ?? []) as &$form) {
            $form['id']          = $form['id']          ?? bin2hex(random_bytes(5));
            $form['description'] = $form['description'] ?? '';
            $form['type']        = $form['type']        ?? 'record';
            $form['order']       = $form['order']       ?? 0;
            $form['data_source'] = $form['data_source'] ?? ['table' => '', 'sql_custom' => null, 'order_field' => '', 'order_dir' => 'asc', 'where' => ''];
            $form['operations']  = $form['operations']  ?? ['allow_insert' => true, 'allow_update' => true, 'allow_delete' => false, 'allow_search' => true, 'allow_export' => false];
            $form['pagination']  = $form['pagination']  ?? ['enabled' => false, 'records_per_page' => 20, 'show_prev_next' => true, 'show_page_numbers' => true];
            $form['layout']      = $form['layout']      ?? ['orientation' => 'vertical', 'grid_type' => 'tabular'];
            $form['parameters']  = $form['parameters']  ?? [];
            $form['rules']       = $form['rules']       ?? [];

            foreach (($form['fields'] ?? []) as &$field) {
                $field['id']            = $field['id']            ?? bin2hex(random_bytes(5));
                $field['description']   = $field['description']   ?? '';
                $field['is_pk']         = $field['is_pk']         ?? false;
                $field['required']      = $field['required']      ?? false;
                $field['unique']        = $field['unique']        ?? false;
                $field['format']        = $field['format']        ?? 'text';
                $field['size']          = $field['size']          ?? 100;
                $field['max_length']    = $field['max_length']    ?? 255;
                $field['rows']          = $field['rows']          ?? 3;
                $field['default_value'] = $field['default_value'] ?? '';
                $field['placeholder']   = $field['placeholder']   ?? '';
                $field['help_text']     = $field['help_text']     ?? '';
                $field['lookup']        = $field['lookup']        ?? ['table' => '', 'id_field' => '', 'name_field' => '', 'sql' => '', 'lov' => ''];
                $field['validations']   = $field['validations']   ?? [];
                $field['display_rules'] = $field['display_rules'] ?? [];
            }
            unset($field);
        }
        unset($form);
    }
    unset($page);

    // components_library
    $p['components_library'] = $p['components_library'] ?? [];

    // export_meta
    $p['export_meta'] = $p['export_meta'] ?? ['ai_context' => '', 'tech_stack' => [], 'conventions' => [], 'open_issues' => []];

    return $p;
}

// ─── Ejecutar migración ───────────────────────────────────────────────────────
log_line('Pro-RAD — Migración de Schema v1 → v2');
log_line(str_repeat('─', 50));

$files = glob($cfg['projects_dir'] . '*.json') ?: [];
if (empty($files)) {
    log_line('No se encontraron proyectos en ' . $cfg['projects_dir']);
    exit(0);
}

log_line('Proyectos encontrados: ' . count($files));
log_line('');

$migrated = 0;
$skipped  = 0;
$errors   = 0;

foreach ($files as $file) {
    $name    = basename($file);
    $content = file_get_contents($file);
    $data    = json_decode($content, true);

    if (!$data) {
        log_line("  ✘ $name — JSON inválido, saltando");
        $errors++;
        continue;
    }

    $version = $data['schema_version'] ?? '1.0';
    if ($version === '2.0') {
        log_line("  ─ $name — ya es v2.0, sin cambios");
        $skipped++;
        continue;
    }

    // Backup del original
    $backupDir = $cfg['backups_dir'] . sanitize_id(pathinfo($name, PATHINFO_FILENAME)) . '/';
    if (!is_dir($backupDir)) mkdir($backupDir, 0755, true);
    $backupFile = $backupDir . 'pre_migration_' . date('Ymd_His') . '.json';
    copy($file, $backupFile);
    log_line("  ✔ $name (v$version) → backup: " . basename($backupFile));

    // Migrar
    try {
        $migrated_data = migrate_project($data);
        $json = json_encode($migrated_data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        file_put_contents($file, $json);
        log_line("    → Migrado a v2.0 correctamente");
        $migrated++;
    } catch (Throwable $e) {
        log_line("    ✘ Error al migrar: " . $e->getMessage());
        $errors++;
    }
}

function sanitize_id(string $id): string {
    return preg_replace('/[^a-z0-9\-_]/i', '', $id);
}

log_line('');
log_line(str_repeat('─', 50));
log_line("Resultado: $migrated migrados · $skipped sin cambios · $errors errores");
