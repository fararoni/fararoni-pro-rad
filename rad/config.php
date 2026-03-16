<?php
/**
 * Pro-RAD Editor — Configuración del Backend
 * ─────────────────────────────────────────────────────────────────────────────
 * Edita SOLO este archivo para personalizar el backend.
 * NO modifiques api.php directamente.
 */

return [

    // ─── Seguridad ───────────────────────────────────────────────────────────
    // Token que debe coincidir con config.js en el frontend (X-RAD-Token header)
    // CAMBIA este valor antes de subir a producción. Usa algo como:
    //   php -r "echo bin2hex(random_bytes(24));"
    'token' => 'rad-token-2024',

    // Orígenes permitidos para CORS. '*' sirve para desarrollo local.
    // En producción pon tu dominio: ['https://tudominio.com']
    'cors_origins' => ['*'],

    // ─── Rutas ───────────────────────────────────────────────────────────────
    // Directorio donde se guardan los proyectos JSON
    'projects_dir' => __DIR__ . '/projects/',

    // Directorio de backups automáticos (se crea solo si habilitas backups)
    'backups_dir'  => __DIR__ . '/backups/',

    // Directorio de logs (se crea solo si habilitas logging)
    'logs_dir'     => __DIR__ . '/logs/',

    // ─── Límites ─────────────────────────────────────────────────────────────
    // Tamaño máximo de un proyecto JSON en bytes
    'max_file_size' => 5 * 1024 * 1024, // 5 MB

    // Máximo número de proyectos permitidos en disco
    'max_projects'  => 100,

    // ─── Backups automáticos ─────────────────────────────────────────────────
    // Si true, guarda una copia del proyecto antes de cada sobreescritura
    'backups_enabled' => true,

    // Cuántas versiones de backup conservar por proyecto
    'backups_keep'    => 5,

    // ─── Logging ─────────────────────────────────────────────────────────────
    // Si true, registra cada operación en logs/api.log
    'logging_enabled' => true,

    // Nivel: 'error' | 'info' | 'debug'
    'log_level' => 'info',

    // ─── Schema ──────────────────────────────────────────────────────────────
    // Versión de schema aceptada. Rechaza proyectos de versiones distintas.
    'schema_version' => '2.0',

];
