import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, Toggle } from './shared';
import { FIELD_TYPES } from '../../utils/schema';
import { Plus, Trash2, Zap } from 'lucide-react';

const findPageAnywhere = (project, pageId) => {
  const p = project?.pages?.find(p => p.id === pageId);
  if (p) return p;
  for (const m of project?.modules || []) {
    const pm = m.pages?.find(p => p.id === pageId);
    if (pm) return pm;
  }
  return null;
};

export default function FieldInspector({ pageId, formId, fieldId }) {
  const { currentProject, updateField, fillGridFromCatalog } = useProjectStore();
  const page = findPageAnywhere(currentProject, pageId);
  const form = page?.forms?.find(f => f.id === formId);
  const field = form?.fields?.find(f => f.id === fieldId);
  if (!field) return null;

  const catalogs = currentProject?.catalogs || [];

  const set = (key, val) => updateField(pageId, formId, fieldId, { [key]: val });
  const setLookup = (key, val) => updateField(pageId, formId, fieldId, f => ({ ...f, lookup: { ...f.lookup, [key]: val } }));
  const setTimeline = (key, val) => updateField(pageId, formId, fieldId, f => ({ ...f, timeline_config: { ...(f.timeline_config || {}), [key]: val } }));

  const hasLookup = ['listbox', 'multiselect', 'radio', 'checkbox'].includes(field.type);
  const isTimeline = field.type === 'timeline';
  const isTabla = field.type === 'tabla';
  const setTabla = (key, val) => updateField(pageId, formId, fieldId, f => ({ ...f, tabla_config: { ...(f.tabla_config || {}), [key]: val } }));
  const tablaCatalogs = catalogs.filter(c => c.input_mode === 'tabla' || c.input_mode === 'json');
  const selectedTablaCatalog = tablaCatalogs.find(c => c.id === (field.tabla_config?.catalog_id || ''));

  // Extract columns regardless of catalog mode
  const getColumnsFromCatalog = (cat) => {
    if (!cat) return [];
    if (cat.input_mode === 'tabla') return cat.columns || [];
    if (cat.input_mode === 'json') {
      try {
        const data = JSON.parse(cat.data || '[]');
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
          return Object.keys(data[0]).map(k => ({ id: k, name: k.toUpperCase(), label: k, type: 'text' }));
        }
      } catch {}
    }
    return [];
  };
  const selectedColumns = getColumnsFromCatalog(selectedTablaCatalog);
  const isGridForm = form?.type === 'grid';

  // Parent form step/tab/event assignment
  const isInWizard = form?.type === 'wizard';
  const isInTabs = form?.type === 'tabs';
  const isInTimeline = form?.type === 'timeline';
  const wizardSteps = form?.wizard_config?.steps || [];
  const tabsList = form?.tabs_config?.tabs || [];
  const timelineEvents = form?.timeline_config?.events || [];

  const addValidation = () => {
    updateField(pageId, formId, fieldId, f => ({
      ...f, validations: [...(f.validations || []), { rule: 'min_length', value: '', message: '' }]
    }));
  };

  const updateValidation = (i, key, val) => {
    updateField(pageId, formId, fieldId, f => {
      const v = [...(f.validations || [])];
      v[i] = { ...v[i], [key]: val };
      return { ...f, validations: v };
    });
  };

  const removeValidation = (i) => {
    updateField(pageId, formId, fieldId, f => ({ ...f, validations: f.validations.filter((_, idx) => idx !== i) }));
  };

  const addDisplayRule = () => {
    updateField(pageId, formId, fieldId, f => ({
      ...f, display_rules: [...(f.display_rules || []), { condition: '', action: 'show' }]
    }));
  };

  const updateDisplayRule = (i, key, val) => {
    updateField(pageId, formId, fieldId, f => {
      const dr = [...(f.display_rules || [])];
      dr[i] = { ...dr[i], [key]: val };
      return { ...f, display_rules: dr };
    });
  };

  const removeDisplayRule = (i) => {
    updateField(pageId, formId, fieldId, f => ({ ...f, display_rules: f.display_rules.filter((_, idx) => idx !== i) }));
  };

  return (
    <div>
      <Section title="Identificación">
        <Field label="Nombre técnico">
          <input className="rad-input" value={field.name}
            onChange={e => set('name', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
        </Field>
        <Field label="Etiqueta visible">
          <input className="rad-input" value={field.caption} onChange={e => set('caption', e.target.value)} />
        </Field>
        <Field label="Columna de BD">
          <input className="rad-input" value={field.data_source} onChange={e => set('data_source', e.target.value)}
            placeholder="ej. TABLA_CAMPO" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
        </Field>
        <Field label="Descripción funcional">
          <textarea className="rad-input" rows={2} value={field.description} onChange={e => set('description', e.target.value)} />
        </Field>
      </Section>

      <Section title="Tipo y Formato">
        <Field label="Tipo de campo">
          <select className="rad-input" value={field.type} onChange={e => set('type', e.target.value)}>
            {['Básicos', 'Selección', 'Acción', 'Layout', 'Datos'].map(group => (
              <optgroup key={group} label={group}>
                {FIELD_TYPES.filter(t => t.group === group).map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
          <Field label="Ancho (%)">
            <input className="rad-input" type="number" min={10} max={100} value={field.size}
              onChange={e => set('size', +e.target.value)} />
          </Field>
          <Field label="Max Long.">
            <input className="rad-input" type="number" value={field.max_length}
              onChange={e => set('max_length', +e.target.value)} />
          </Field>
        </div>
        {field.type === 'textarea' && (
          <Field label="Filas visibles">
            <input className="rad-input" type="number" min={1} max={20} value={field.rows}
              onChange={e => set('rows', +e.target.value)} />
          </Field>
        )}
        <Field label="Placeholder">
          <input className="rad-input" value={field.placeholder} onChange={e => set('placeholder', e.target.value)} />
        </Field>
        <Field label="Valor por defecto">
          <input className="rad-input" value={field.default_value} onChange={e => set('default_value', e.target.value)} />
        </Field>
        <Field label="Texto de ayuda">
          <input className="rad-input" value={field.help_text} onChange={e => set('help_text', e.target.value)} />
        </Field>
      </Section>

      <Section title="Opciones">
        <Toggle label="Es clave primaria (PK)" value={field.is_pk} onChange={v => set('is_pk', v)} />
        <Toggle label="Requerido" value={field.required} onChange={v => set('required', v)} />
        <Toggle label="Único" value={field.unique} onChange={v => set('unique', v)} />
      </Section>

      {(isInWizard || isInTabs || isInTimeline) && (
        <Section title={isInWizard ? 'Paso del Wizard' : isInTabs ? 'Pestaña' : 'Evento del Timeline'}>
          {isInWizard && (
            <Field label="Pertenece al paso">
              <select className="rad-input" value={field.wizard_step ?? 0} onChange={e => set('wizard_step', +e.target.value)}>
                {wizardSteps.map((step, i) => <option key={i} value={i}>Paso {i + 1}: {step}</option>)}
                {wizardSteps.length === 0 && <option value={0}>Sin pasos definidos</option>}
              </select>
            </Field>
          )}
          {isInTabs && (
            <Field label="Pertenece a la pestaña">
              <select className="rad-input" value={field.tab_index ?? 0} onChange={e => set('tab_index', +e.target.value)}>
                {tabsList.map((tab, i) => <option key={i} value={i}>{tab}</option>)}
                {tabsList.length === 0 && <option value={0}>Sin pestañas definidas</option>}
              </select>
            </Field>
          )}
          {isInTimeline && (
            <Field label="Pertenece al evento">
              <select className="rad-input" value={field.timeline_event ?? 0} onChange={e => set('timeline_event', +e.target.value)}>
                {timelineEvents.map((ev, i) => <option key={i} value={i}>{ev}</option>)}
                {timelineEvents.length === 0 && <option value={0}>Sin eventos definidos</option>}
              </select>
            </Field>
          )}
        </Section>
      )}

      {isTimeline && (
        <Section title="Configuración de Línea del Tiempo">
          <Field label="Orientación">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 'horizontal', l: '↔ Horizontal' }, { v: 'vertical', l: '↕ Vertical' }].map(({ v, l }) => (
                <button key={v} onClick={() => setTimeline('orientation', v)}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
                    borderColor: (field.timeline_config?.orientation || 'horizontal') === v ? '#bc8cff' : '#21262d',
                    background: (field.timeline_config?.orientation || 'horizontal') === v ? 'rgba(188,140,255,0.12)' : 'transparent',
                    color: (field.timeline_config?.orientation || 'horizontal') === v ? '#bc8cff' : '#8b949e',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Eventos / Hitos">
            {(field.timeline_config?.events || []).map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#bc8cff', flexShrink: 0 }} />
                <input className="rad-input" style={{ fontSize: 12, flex: 1 }} value={ev}
                  onChange={e => {
                    const evs = [...(field.timeline_config?.events || [])];
                    evs[i] = e.target.value;
                    setTimeline('events', evs);
                  }} />
                <button onClick={() => setTimeline('events', (field.timeline_config?.events || []).filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6 }}
              onClick={() => setTimeline('events', [...(field.timeline_config?.events || []), `Evento ${(field.timeline_config?.events || []).length + 1}`])}>
              <Plus size={11} /> Agregar evento
            </button>
          </Field>
        </Section>
      )}

      {hasLookup && (
        <Section title="Lookup / Fuente de opciones">
          {catalogs.length > 0 && (
            <Field label="Catálogo del proyecto" hint="Si seleccionas un catálogo, se usará como fuente de opciones">
              <select className="rad-input" value={field.lookup?.catalog_id || ''}
                onChange={e => setLookup('catalog_id', e.target.value)}>
                <option value="">— Sin catálogo (usar lookup manual) —</option>
                {catalogs.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}{cat.description ? ` — ${cat.description}` : ''}</option>
                ))}
              </select>
            </Field>
          )}

          {!field.lookup?.catalog_id && (
            <>
              <Field label="Tabla de BD">
                <input className="rad-input" value={field.lookup?.table || ''} onChange={e => setLookup('table', e.target.value)} placeholder="ej. CAT_PROCESOS" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Campo ID">
                  <input className="rad-input" value={field.lookup?.id_field || ''} onChange={e => setLookup('id_field', e.target.value)} placeholder="CVE_PROCESO" />
                </Field>
                <Field label="Campo Nombre">
                  <input className="rad-input" value={field.lookup?.name_field || ''} onChange={e => setLookup('name_field', e.target.value)} placeholder="NOM_PROCESO" />
                </Field>
              </div>
              <Field label="SQL personalizado">
                <textarea className="rad-input" rows={3} placeholder="SELECT id, nombre FROM tabla ORDER BY nombre"
                  value={field.lookup?.sql || ''} onChange={e => setLookup('sql', e.target.value)} />
              </Field>
              <Field label="LOV estática" hint="val1=Etiqueta 1;val2=Etiqueta 2">
                <textarea className="rad-input" rows={2} placeholder="1=Activo;2=Inactivo;3=Pendiente"
                  value={field.lookup?.lov || ''} onChange={e => setLookup('lov', e.target.value)} />
              </Field>
            </>
          )}

          {field.lookup?.catalog_id && (
            <div style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #21262d', padding: '10px 12px' }}>
              {(() => {
                const cat = catalogs.find(c => c.id === field.lookup?.catalog_id);
                return cat ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#d97706', marginBottom: 4 }}>{cat.name}</div>
                    {cat.description && <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>{cat.description}</div>}
                    <div style={{ fontSize: 11, color: '#8b949e' }}>Formato: <span style={{ color: '#c9d1d9' }}>{cat.input_mode}</span></div>
                    {cat.data && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4, fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.data.substring(0, 60)}{cat.data.length > 60 ? '...' : ''}</div>}
                  </>
                ) : <div style={{ fontSize: 12, color: '#f85149' }}>Catálogo no encontrado</div>;
              })()}
            </div>
          )}
        </Section>
      )}

      {isTabla && (
        <Section title="Fuente de Tabla">
          {tablaCatalogs.length === 0 ? (
            <div style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic', lineHeight: 1.5 }}>
              No hay catálogos de tipo <strong style={{ color: '#3fb950' }}>Tabla</strong> o <strong style={{ color: '#388bfd' }}>JSON</strong> en el proyecto.<br />
              Crea uno en el inspector del Proyecto.
            </div>
          ) : (
            <Field label="Catálogo fuente">
              <select className="rad-input" value={field.tabla_config?.catalog_id || ''}
                onChange={e => setTabla('catalog_id', e.target.value)}>
                <option value="">— Selecciona un catálogo —</option>
                {tablaCatalogs.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.input_mode.toUpperCase()}] {cat.name}{cat.description ? ` — ${cat.description}` : ''}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {selectedTablaCatalog && (
            <>
              <div style={{ background: '#0d1117', borderRadius: 8, border: '1px solid #21262d', padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#3fb950' }}>{selectedTablaCatalog.name}</div>
                  <span style={{ fontSize: 10, color: '#8b949e', background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>
                    {selectedTablaCatalog.input_mode}
                  </span>
                  <span style={{ fontSize: 10, color: '#8b949e', marginLeft: 'auto' }}>{selectedColumns.length} columnas</span>
                </div>
                {selectedColumns.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedColumns.map(col => (
                      <span key={col.id || col.name} style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", background: '#21262d', color: '#c9d1d9', padding: '2px 7px', borderRadius: 4 }}>
                        {col.name}<span style={{ color: '#8b949e' }}>:{col.type}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#8b949e', fontStyle: 'italic' }}>
                    {selectedTablaCatalog.input_mode === 'json' ? 'JSON vacío o sin estructura de objeto' : 'Sin columnas definidas'}
                  </div>
                )}
              </div>

              {isGridForm && selectedColumns.length > 0 && (
                <button
                  className="rad-btn"
                  style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12, background: 'rgba(63,185,80,0.12)', borderColor: '#3fb950', color: '#3fb950' }}
                  onClick={() => {
                    if (window.confirm(`¿Reemplazar todos los campos del formulario grid con las ${selectedColumns.length} columnas de "${selectedTablaCatalog.name}"?`)) {
                      fillGridFromCatalog(pageId, formId, selectedTablaCatalog.id);
                    }
                  }}>
                  <Zap size={13} /> Auto-llenar campos del grid
                </button>
              )}
              {!isGridForm && (
                <div style={{ fontSize: 11, color: '#8b949e', fontStyle: 'italic' }}>
                  El botón de auto-llenado solo está disponible en formularios tipo <strong style={{ color: '#c9d1d9' }}>Grid</strong>.
                </div>
              )}
            </>
          )}
        </Section>
      )}

      <Section title="Validaciones" defaultOpen={false}>
        {(field.validations || []).map((v, i) => (
          <div key={i} style={{ background: '#161b22', borderRadius: 8, border: '1px solid #21262d', padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <select className="rad-input" style={{ fontSize: 11 }} value={v.rule} onChange={e => updateValidation(i, 'rule', e.target.value)}>
                {['min_length', 'max_length', 'regex', 'range', 'email', 'numeric', 'date_range', 'custom'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', padding: '0 4px' }}
                onClick={() => removeValidation(i)}><Trash2 size={13} /></button>
            </div>
            <input className="rad-input" style={{ marginBottom: 6, fontSize: 11 }} placeholder="Valor (ej: 3, 255, regex...)"
              value={v.value} onChange={e => updateValidation(i, 'value', e.target.value)} />
            <input className="rad-input" style={{ fontSize: 11 }} placeholder="Mensaje de error al usuario..."
              value={v.message} onChange={e => updateValidation(i, 'message', e.target.value)} />
          </div>
        ))}
        <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%' }} onClick={addValidation}>
          <Plus size={11} /> Agregar validación
        </button>
      </Section>

      <Section title="Reglas de Display" defaultOpen={false}>
        {(field.display_rules || []).map((dr, i) => (
          <div key={i} style={{ background: '#161b22', borderRadius: 8, border: '1px solid #21262d', padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <select className="rad-input" style={{ fontSize: 11, flex: '0 0 110px' }} value={dr.action}
                onChange={e => updateDisplayRule(i, 'action', e.target.value)}>
                {['show', 'hide', 'enable', 'disable', 'required'].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <span style={{ fontSize: 11, color: '#8b949e', alignSelf: 'center' }}>si</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f85149', marginLeft: 'auto', padding: '0 4px' }}
                onClick={() => removeDisplayRule(i)}><Trash2 size={13} /></button>
            </div>
            <input className="rad-input" style={{ fontSize: 11 }} placeholder="ej: field:CVE_PROCESO != ''"
              value={dr.condition} onChange={e => updateDisplayRule(i, 'condition', e.target.value)} />
          </div>
        ))}
        <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%' }} onClick={addDisplayRule}>
          <Plus size={11} /> Agregar regla de display
        </button>
      </Section>
    </div>
  );
}
