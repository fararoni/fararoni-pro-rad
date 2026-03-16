import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, RuleList } from './shared';
import { Plus, Trash2 } from 'lucide-react';
import { genId } from '../../utils/schema';

const CATALOG_PLACEHOLDERS = {
  comma: 'Activo, Inactivo, Pendiente, Cancelado',
  lines: 'Activo\nInactivo\nPendiente\nCancelado',
  json: '[{"id":1,"label":"Activo"},{"id":2,"label":"Inactivo"}]',
};

const COL_TYPES = [
  { value: 'text',     label: 'Texto' },
  { value: 'number',   label: 'Número' },
  { value: 'currency', label: 'Moneda' },
  { value: 'date',     label: 'Fecha' },
  { value: 'boolean',  label: 'Booleano' },
  { value: 'email',    label: 'Email' },
];

export default function ProjectInspector() {
  const { currentProject, updateProject, addRule, updateRule, deleteRule, addCatalog, updateCatalog, deleteCatalog } = useProjectStore();
  if (!currentProject) return null;
  const { meta, export_meta, global_rules = [], catalogs = [] } = currentProject;

  const setMeta = (key, val) => updateProject(p => ({ ...p, meta: { ...p.meta, [key]: val } }));
  const setExport = (key, val) => updateProject(p => ({ ...p, export_meta: { ...p.export_meta, [key]: val } }));

  const [tagsText, setTagsText] = useState((meta.tags || []).join(', '));
  const [rolesText, setRolesText] = useState((meta.roles || []).join(', '));

  return (
    <div>
      <Section title="Metadata del Proyecto">
        <Field label="Nombre">
          <input className="rad-input" value={meta.name} onChange={e => setMeta('name', e.target.value)} />
        </Field>
        <Field label="Descripción">
          <textarea className="rad-input" value={meta.description} onChange={e => setMeta('description', e.target.value)} rows={3} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Autor">
            <input className="rad-input" value={meta.author} onChange={e => setMeta('author', e.target.value)} />
          </Field>
          <Field label="Versión">
            <input className="rad-input" value={meta.version} onChange={e => setMeta('version', e.target.value)} />
          </Field>
        </div>
        <Field label="Tags (coma separado)">
          <input className="rad-input"
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
            onBlur={() => setMeta('tags', tagsText.split(',').map(t => t.trim()).filter(Boolean))} />
        </Field>
        <Field label="Actores / Roles del sistema" hint="Roles disponibles en todo el proyecto (coma separado)">
          <input className="rad-input"
            value={rolesText}
            onChange={e => setRolesText(e.target.value)}
            onBlur={() => setMeta('roles', rolesText.split(',').map(r => r.trim()).filter(Boolean))}
            placeholder="admin, usuario, supervisor, ..." />
        </Field>
      </Section>

      <Section title={`Catálogos del Proyecto (${catalogs.length})`} defaultOpen={catalogs.length > 0}>
        <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 10, lineHeight: 1.5 }}>
          Define catálogos reutilizables que pueden usarse en campos de selección de todos los formularios.
        </div>
        {catalogs.map(cat => (
          <CatalogEditor key={cat.id} catalog={cat}
            onUpdate={(key, val) => updateCatalog(cat.id, { [key]: val })}
            onDelete={() => deleteCatalog(cat.id)} />
        ))}
        <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6 }}
          onClick={addCatalog}>
          <Plus size={11} /> Agregar catálogo
        </button>
      </Section>

      <Section title="Contexto para IA">
        <Field label="ai_context" hint="Este texto se incluye al inicio del .md exportado">
          <textarea className="rad-input" rows={5} value={export_meta?.ai_context || ''}
            onChange={e => setExport('ai_context', e.target.value)}
            placeholder="Ej: Este sistema es un portal para gobierno municipal. BD es Oracle 12c. ..." />
        </Field>
        <Field label="Puntos Abiertos (uno por línea)">
          <textarea className="rad-input" rows={3} value={(export_meta?.open_issues || []).join('\n')}
            onChange={e => setExport('open_issues', e.target.value.split('\n').filter(Boolean))}
            placeholder="Pendiente: definir roles&#10;Pendiente: validar flujo de login" />
        </Field>
      </Section>

      <Section title="Reglas Globales" defaultOpen={false}>
        <RuleList
          rules={global_rules}
          onAdd={() => addRule('global')}
          onUpdate={(ruleId, updates) => updateRule('global', null, null, ruleId, updates)}
          onDelete={(ruleId) => deleteRule('global', null, null, ruleId)}
        />
      </Section>
    </div>
  );
}

function CatalogEditor({ catalog, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const modes = [
    { value: 'comma', label: 'Comas' },
    { value: 'lines', label: 'Renglones' },
    { value: 'json',  label: 'JSON' },
    { value: 'tabla', label: 'Tabla' },
  ];

  const isTabla = catalog.input_mode === 'tabla';
  const columns = catalog.columns || [];

  const addColumn = () => {
    onUpdate('columns', [...columns, { id: genId(), name: 'COLUMNA', label: 'Columna', type: 'text' }]);
  };
  const updateColumn = (idx, key, val) => {
    const cols = columns.map((c, i) => i === idx ? { ...c, [key]: val } : c);
    onUpdate('columns', cols);
  };
  const deleteColumn = (idx) => {
    onUpdate('columns', columns.filter((_, i) => i !== idx));
  };

  const modeColor = isTabla ? '#3fb950' : '#388bfd';

  return (
    <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#d97706', flex: 1, fontWeight: 600 }}>
          {catalog.name || 'SIN NOMBRE'}
        </span>
        <span className="badge" style={{ background: '#21262d', color: isTabla ? '#3fb950' : '#8b949e', fontSize: 10 }}>
          {isTabla ? `tabla (${columns.length} cols)` : catalog.input_mode}
        </span>
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
          onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
          <Trash2 size={12} />
        </button>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #21262d' }}>
          <Field label="Nombre técnico">
            <input className="rad-input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
              value={catalog.name}
              onChange={e => onUpdate('name', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))} />
          </Field>
          <Field label="Descripción">
            <input className="rad-input" value={catalog.description}
              onChange={e => onUpdate('description', e.target.value)}
              placeholder="Para qué se usa este catálogo..." />
          </Field>
          <Field label="Tipo de catálogo">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {modes.map(m => (
                <button key={m.value} onClick={() => onUpdate('input_mode', m.value)}
                  style={{
                    flex: 1, minWidth: 60, padding: '5px 0', borderRadius: 6, border: '1px solid', fontSize: 11, cursor: 'pointer',
                    borderColor: catalog.input_mode === m.value ? modeColor : '#21262d',
                    background: catalog.input_mode === m.value ? `rgba(${m.value === 'tabla' ? '63,185,80' : '56,139,253'},0.12)` : 'transparent',
                    color: catalog.input_mode === m.value ? modeColor : '#8b949e',
                  }}>
                  {m.label}
                </button>
              ))}
            </div>
          </Field>

          {isTabla ? (
            <Field label="Columnas de la tabla">
              {columns.length === 0 && (
                <div style={{ fontSize: 11, color: '#8b949e', padding: '6px 0', fontStyle: 'italic' }}>
                  Sin columnas. Agrega al menos una.
                </div>
              )}
              {columns.map((col, idx) => (
                <div key={col.id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <input className="rad-input" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, flex: '0 0 90px' }}
                    value={col.name}
                    placeholder="NOMBRE"
                    onChange={e => updateColumn(idx, 'name', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))} />
                  <input className="rad-input" style={{ fontSize: 11, flex: 1 }}
                    value={col.label}
                    placeholder="Etiqueta"
                    onChange={e => updateColumn(idx, 'label', e.target.value)} />
                  <select className="rad-input" style={{ fontSize: 11, flex: '0 0 80px' }}
                    value={col.type}
                    onChange={e => updateColumn(idx, 'type', e.target.value)}>
                    {COL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <button onClick={() => deleteColumn(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6, marginTop: 2 }}
                onClick={addColumn}>
                <Plus size={11} /> Agregar columna
              </button>
            </Field>
          ) : (
            <Field label="Datos">
              <textarea className="rad-input"
                rows={catalog.input_mode === 'json' ? 5 : 3}
                style={{ fontFamily: catalog.input_mode === 'json' ? "'JetBrains Mono', monospace" : 'inherit', fontSize: 11 }}
                placeholder={CATALOG_PLACEHOLDERS[catalog.input_mode]}
                value={catalog.data || ''}
                onChange={e => onUpdate('data', e.target.value)} />
            </Field>
          )}
        </div>
      )}
    </div>
  );
}
