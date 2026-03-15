# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Especificación funcional

Ver: [docs/SpecFuncional_ProRAD_v2.md](docs/SpecFuncional_ProRAD_v2.md)

Esta especificación es la fuente de verdad del proyecto. Cualquier decisión de diseño o implementación debe ser consistente con ella.

---

## Qué es este proyecto

Editor visual de especificación de proyectos para IA. **NO genera código.**
Su output es un `.json` (schema v2.0) + `.md` narrativo para prompting de IA.

## Stack

- Frontend: React 18 + Vite + Tailwind CSS 3 + Zustand + @hello-pangea/dnd
- Backend: PHP puro (`api.php`) — CRUD de archivos JSON en disco
- Target: Apache (XAMPP local + Hostinger)

---

## Comandos de desarrollo

```bash
npm run dev       # Dev server (Vite HMR)
npm run build     # Build de producción → dist/
npm run lint      # ESLint
npm run preview   # Preview del build
```

No hay tests configurados (no jest/vitest).

---

## Arquitectura clave

### Estado global — `src/store/useProjectStore.js`

Zustand store único. Todo el estado muta solo aquí — **nunca props drilling**.

```
State shape:
  screen: 'home' | 'editor'
  selectedNode: { type, id, pageId?, formId? }
  editorMode: 'editor' | 'preview'
  saveStatus: 'saved' | 'saving' | 'error' | 'unsaved'
  projects: []
  currentProject: null   ← schema v2.0 completo
  expandedNodes: Set()
```

Las acciones cubren CRUD completo de: proyectos, páginas, formularios, campos y reglas.

### Schema v2.0 — `src/utils/schema.js`

Constructores (`newProject`, `newPage`, `newForm`, `newField`, `newRule`) y constantes de tipos (`FIELD_TYPES`, `FORM_TYPES`, `DB_TYPES`, `RULE_TYPES`).

- Siempre usar `genId()` de aquí para IDs — no importar `uuid` directamente.
- Estructura del schema: `meta → database → global_rules → pages[] → forms[] → fields[] + rules[]`

### Exportadores — `src/utils/exporters.js`

- `exportJSON(project)` — JSON string con `meta.updated_at` actualizado
- `exportMarkdown(project)` — Documento narrativo completo
- `exportSummary(project)` — Resumen ejecutivo compacto
- `downloadFile(content, filename, mime)` — Descarga via Blob/anchor

### Layout del editor — `src/components/EditorLayout.jsx`

```
Toolbar (52px)
├─ StructurePanel (272px)   ← árbol: Proyecto → Páginas → Formularios → Campos
├─ WorkArea (flex)          ← EditorCanvas | PreviewCanvas | ProjectOverview
└─ InspectorPanel (320px)   ← inspectors/ según selectedNode.type
```

Los inspectores (`src/components/inspectors/`) se enrutan por `selectedNode.type`: `project`, `page`, `form`, `field`.

### Auto-save — `src/hooks/useAutoSave.js`

Debounce de 2.5s: cuando `saveStatus === 'unsaved'` dispara `saveProject()`.

### Backend API

Configurado en `window.RAD_CONFIG.apiBase` y `.token`.
- Default: `/api.php` + header `X-RAD-Token: rad-token-2024`
- Fallback automático a localStorage si la API no responde.
- Doble escritura: localStorage siempre + API remota cuando disponible.

---

## Convenciones

- **Campos BD:** `TABLA_CAMPO` en MAYÚSCULAS (ej. `SAC_DESCRIPCION`)
- **IDs internos:** `genId()` de `schema.js` — string de 9 chars
- **Tailwind:** solo clases utilitarias; estilos de componentes en `src/index.css`
- **Colores custom:** paleta `rad.*` en `tailwind.config.js` (tema oscuro estilo GitHub)

## Lo que NO hace este sistema

- No genera código PHP/SQL
- No se conecta a BD real (solo especificación manual)
- No tiene autenticación multi-usuario
