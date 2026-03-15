## Especificación funcional del sistema
Ver: [docs/SpecFuncional_ProRAD_v2.md](docs/SpecFuncional_ProRAD_v2.md)

Esta especificación es la fuente de verdad del proyecto.
Cualquier decisión de diseño o implementación debe ser consistente con ella.



# Pro-RAD Editor — Contexto del Proyecto

## Qué es este proyecto
Editor visual de especificación de proyectos para IA. NO genera código.
Su output es un .json (schema v2.0) + .md narrativo para prompting de IA.

## Stack
- Frontend: React 18 + Vite + Tailwind CSS 3 + Zustand + @hello-pangea/dnd
- Backend: PHP puro (api.php) — CRUD de archivos JSON en disco
- Target: Apache (XAMPP local + Hostinger)

## Arquitectura clave
- `src/store/useProjectStore.js` — Estado global completo (Zustand)
- `src/utils/schema.js`         — Constructores y tipos del schema v2.0
- `src/utils/exporters.js`      — Generadores de .json y .md
- `api.php`                     — Backend, autenticado con X-RAD-Token

## Schema JSON
Versión 2.0. Estructura: meta → database → global_rules → pages[]
  → forms[] → fields[] + rules[]
Ver especificación completa en: SpecFuncional_ProRAD_v2.docx

## Convenciones
- Nombres de campos en BD: TABLA_CAMPO en MAYÚSCULAS (ej. SAC_DESCRIPCION)
- IDs internos: genId() de schema.js (no usar uuid directamente)
- Todo el estado muta solo via useProjectStore — nunca props drilling
- Tailwind solo para clases utilitarias; estilos complejos en index.css

## Lo que NO hace este sistema
- No genera código PHP/SQL
- No se conecta a BD real (solo especificación manual)
- No tiene autenticación multi-usuario
```

Además, puedes crear **subcarpetas** con instrucciones específicas por área:

```
pro-rad/
├── CLAUDE.md                  ← instrucciones raíz (siempre se lee)
├── src/
│   └── CLAUDE.md              ← contexto específico del frontend
└── api.php / backend
    └── CLAUDE.md              ← reglas del backend PHP
```

Claude Code lee el `CLAUDE.md` más cercano al archivo en el que estás trabajando, en cascada hacia la raíz.