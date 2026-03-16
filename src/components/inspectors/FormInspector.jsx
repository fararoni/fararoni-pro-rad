import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, Toggle, RuleList } from './shared';
import { FORM_TYPES, RULE_TYPES, genId } from '../../utils/schema';
import { Plus, Trash2, X, Copy, CopyCheck, Clipboard } from 'lucide-react';

const findPageAnywhere = (project, pageId) => {
  const p = project?.pages?.find(p => p.id === pageId);
  if (p) return p;
  for (const m of project?.modules || []) {
    const pm = m.pages?.find(p => p.id === pageId);
    if (pm) return pm;
  }
  return null;
};

export default function FormInspector({ pageId, formId }) {
  const { currentProject, updateForm, addRule, updateRule, deleteRule, duplicateForm, copyForm, pasteForm, clipboardForm } = useProjectStore();
  const [showRulesModal, setShowRulesModal] = useState(false);

  const page = findPageAnywhere(currentProject, pageId);
  const form = page?.forms?.find(f => f.id === formId);
  if (!form) return null;

  const set = (key, val) => updateForm(pageId, formId, { [key]: val });
  const setOps = (key, val) => updateForm(pageId, formId, f => ({ ...f, operations: { ...f.operations, [key]: val } }));
  const setPag = (key, val) => updateForm(pageId, formId, f => ({ ...f, pagination: { ...f.pagination, [key]: val } }));

  const menuCfg = form.menu_config || { direction: 'horizontal', items: [] };
  const setMenu = (key, val) => updateForm(pageId, formId, f => ({ ...f, menu_config: { ...(f.menu_config || {}), [key]: val } }));
  const setMenuItems = (items) => setMenu('items', items);
  const addMenuItem = () => setMenuItems([...(menuCfg.items || []), { id: genId(), label: 'Nueva opción', url: '#', icon: '' }]);
  const updateMenuItem = (id, key, val) => setMenuItems(menuCfg.items.map(it => it.id === id ? { ...it, [key]: val } : it));
  const deleteMenuItem = (id) => setMenuItems(menuCfg.items.filter(it => it.id !== id));

  // Wizard config
  const wizCfg = form.wizard_config || { steps: ['Paso 1', 'Paso 2', 'Confirmación'] };
  const setWizSteps = (steps) => updateForm(pageId, formId, f => ({ ...f, wizard_config: { ...(f.wizard_config || {}), steps } }));

  // Tabs config
  const tabsCfg = form.tabs_config || { tabs: ['Pestaña 1', 'Pestaña 2'] };
  const setTabsList = (tabs) => updateForm(pageId, formId, f => ({ ...f, tabs_config: { ...(f.tabs_config || {}), tabs } }));

  // Timeline config (form type)
  const tlCfg = form.timeline_config || { orientation: 'horizontal', events: ['Inicio', 'Completado'] };
  const setTlEvents = (events) => updateForm(pageId, formId, f => ({ ...f, timeline_config: { ...(f.timeline_config || {}), events } }));
  const setTlOrientation = (o) => updateForm(pageId, formId, f => ({ ...f, timeline_config: { ...(f.timeline_config || {}), orientation: o } }));

  const rulesCount = (form.rules || []).length;

  return (
    <div>
      {/* Copy / Duplicate / Paste toolbar */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid #21262d', background: '#0d1117' }}>
        <button title="Duplicar formulario" onClick={() => duplicateForm(pageId, formId)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, padding: '5px 0', borderRadius: 6, border: '1px solid #21262d', background: 'transparent', color: '#8b949e', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#3fb950'; e.currentTarget.style.color = '#3fb950'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.color = '#8b949e'; }}>
          <CopyCheck size={12} /> Duplicar
        </button>
        <button title="Copiar formulario al portapapeles" onClick={() => copyForm(pageId, formId)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, padding: '5px 0', borderRadius: 6, border: '1px solid #21262d', background: clipboardForm?.title === form.title + ' (pegado)' ? 'rgba(56,139,253,0.1)' : 'transparent', color: '#8b949e', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#388bfd'; e.currentTarget.style.color = '#388bfd'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.color = '#8b949e'; }}>
          <Copy size={12} /> Copiar
        </button>
        {clipboardForm && (
          <button title={`Pegar "${clipboardForm.title}" en esta página`} onClick={() => pasteForm(pageId)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, padding: '5px 0', borderRadius: 6, border: '1px solid #388bfd', background: 'rgba(56,139,253,0.12)', color: '#388bfd', cursor: 'pointer' }}>
            <Clipboard size={12} /> Pegar
          </button>
        )}
      </div>

      <Section title="Propiedades">
        <Field label="Título">
          <input className="rad-input" value={form.title} onChange={e => set('title', e.target.value)} />
        </Field>
        <Field label="Tipo de Formulario">
          <select className="rad-input" value={form.type} onChange={e => set('type', e.target.value)}>
            {FORM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Descripción">
          <textarea className="rad-input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
        </Field>
      </Section>

      {form.type === 'menu' && (
        <Section title="Configuración de Menú">
          <Field label="Dirección">
            <div style={{ display: 'flex', gap: 8 }}>
              {['horizontal', 'vertical'].map(dir => (
                <button key={dir} onClick={() => setMenu('direction', dir)}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
                    borderColor: menuCfg.direction === dir ? '#388bfd' : '#21262d',
                    background: menuCfg.direction === dir ? 'rgba(56,139,253,0.12)' : 'transparent',
                    color: menuCfg.direction === dir ? '#388bfd' : '#8b949e',
                  }}>
                  {dir === 'horizontal' ? '↔ Horizontal' : '↕ Vertical'}
                </button>
              ))}
            </div>
          </Field>

          <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Opciones del menú</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
            {(menuCfg.items || []).length === 0 && (
              <div style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>
                Sin opciones — agrega la primera
              </div>
            )}
            {(menuCfg.items || []).map((item, idx) => (
              <div key={item.id} style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 7, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, minWidth: 18, textAlign: 'center' }}>{idx + 1}</span>
                  <input className="rad-input" style={{ fontSize: 12, flex: 1 }}
                    placeholder="Etiqueta" value={item.label}
                    onChange={e => updateMenuItem(item.id, 'label', e.target.value)} />
                  <button onClick={() => deleteMenuItem(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                    onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input className="rad-input" style={{ fontSize: 11, flex: 2 }}
                    placeholder="URL / ruta (#, /pagina, ...)" value={item.url}
                    onChange={e => updateMenuItem(item.id, 'url', e.target.value)} />
                  <input className="rad-input" style={{ fontSize: 11, flex: 1 }}
                    placeholder="Ícono" value={item.icon}
                    onChange={e => updateMenuItem(item.id, 'icon', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
          <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6 }}
            onClick={addMenuItem}>
            <Plus size={11} /> Agregar opción
          </button>
        </Section>
      )}

      {form.type === 'wizard' && (
        <Section title="Pasos del Wizard">
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Define los pasos que componen el wizard.</div>
          {(wizCfg.steps || []).map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", minWidth: 20, textAlign: 'center' }}>{i + 1}</span>
              <input className="rad-input" style={{ fontSize: 12, flex: 1 }} value={step}
                onChange={e => { const s = [...wizCfg.steps]; s[i] = e.target.value; setWizSteps(s); }} />
              <button onClick={() => setWizSteps(wizCfg.steps.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6 }}
            onClick={() => setWizSteps([...wizCfg.steps, `Paso ${wizCfg.steps.length + 1}`])}>
            <Plus size={11} /> Agregar paso
          </button>
        </Section>
      )}

      {form.type === 'tabs' && (
        <Section title="Pestañas">
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Define las pestañas del formulario.</div>
          {(tabsCfg.tabs || []).map((tab, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", minWidth: 20, textAlign: 'center' }}>{i + 1}</span>
              <input className="rad-input" style={{ fontSize: 12, flex: 1 }} value={tab}
                onChange={e => { const t = [...tabsCfg.tabs]; t[i] = e.target.value; setTabsList(t); }} />
              <button onClick={() => setTabsList(tabsCfg.tabs.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6 }}
            onClick={() => setTabsList([...tabsCfg.tabs, `Pestaña ${tabsCfg.tabs.length + 1}`])}>
            <Plus size={11} /> Agregar pestaña
          </button>
        </Section>
      )}

      {form.type === 'timeline' && (
        <Section title="Configuración de Timeline">
          <Field label="Orientación">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: 'horizontal', l: '↔ Horizontal' }, { v: 'vertical', l: '↕ Vertical' }].map(({ v, l }) => (
                <button key={v} onClick={() => setTlOrientation(v)}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
                    borderColor: (tlCfg.orientation || 'horizontal') === v ? '#bc8cff' : '#21262d',
                    background: (tlCfg.orientation || 'horizontal') === v ? 'rgba(188,140,255,0.12)' : 'transparent',
                    color: (tlCfg.orientation || 'horizontal') === v ? '#bc8cff' : '#8b949e',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Define los eventos / hitos de la línea del tiempo.</div>
          {(tlCfg.events || []).map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#bc8cff', flexShrink: 0, marginTop: 1 }} />
              <input className="rad-input" style={{ fontSize: 12, flex: 1 }} value={ev}
                onChange={e => { const evs = [...tlCfg.events]; evs[i] = e.target.value; setTlEvents(evs); }} />
              <button onClick={() => setTlEvents(tlCfg.events.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
                onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, width: '100%', justifyContent: 'center', gap: 6 }}
            onClick={() => setTlEvents([...tlCfg.events, `Evento ${tlCfg.events.length + 1}`])}>
            <Plus size={11} /> Agregar evento
          </button>
        </Section>
      )}

      <Section title="Operaciones Permitidas">
        <Toggle label="Insertar" value={form.operations?.allow_insert} onChange={v => setOps('allow_insert', v)} />
        <Toggle label="Actualizar" value={form.operations?.allow_update} onChange={v => setOps('allow_update', v)} />
        <Toggle label="Eliminar" value={form.operations?.allow_delete} onChange={v => setOps('allow_delete', v)} />
        <Toggle label="Buscar" value={form.operations?.allow_search} onChange={v => setOps('allow_search', v)} />
        <Toggle label="Exportar" value={form.operations?.allow_export} onChange={v => setOps('allow_export', v)} />
      </Section>

      <Section title="Paginación" defaultOpen={false}>
        <Toggle label="Activar paginación" value={form.pagination?.enabled} onChange={v => setPag('enabled', v)} />
        {form.pagination?.enabled && (
          <>
            <Field label="Registros por página">
              <input className="rad-input" type="number" value={form.pagination?.records_per_page || 20}
                onChange={e => setPag('records_per_page', +e.target.value)} />
            </Field>
            <Toggle label="Mostrar anterior/siguiente" value={form.pagination?.show_prev_next} onChange={v => setPag('show_prev_next', v)} />
            <Toggle label="Mostrar números de página" value={form.pagination?.show_page_numbers} onChange={v => setPag('show_page_numbers', v)} />
          </>
        )}
      </Section>

      <Section title="Reglas de Negocio" defaultOpen={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: rulesCount > 0 ? 8 : 0 }}>
          {rulesCount > 0 && (
            <span style={{ fontSize: 12, color: '#8b949e' }}>
              {rulesCount} regla{rulesCount !== 1 ? 's' : ''} definida{rulesCount !== 1 ? 's' : ''}
            </span>
          )}
          <button className="rad-btn" style={{ fontSize: 11, marginLeft: 'auto', background: 'rgba(56,139,253,0.12)', color: '#388bfd', border: '1px solid rgba(56,139,253,0.3)' }}
            onClick={() => setShowRulesModal(true)}>
            <Plus size={11} /> {rulesCount === 0 ? 'Definir reglas' : 'Gestionar reglas'}
          </button>
        </div>
        {rulesCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {(form.rules || []).map(rule => {
              const rt = RULE_TYPES.find(r => r.value === rule.type) || RULE_TYPES[0];
              return (
                <div key={rule.id} style={{ background: '#161b22', borderRadius: 6, border: '1px solid #21262d', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge" style={{ background: rt.color + '22', color: rt.color, fontSize: 10 }}>{rt.label}</span>
                  <span style={{ fontSize: 11, color: '#c9d1d9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rule.description || '(sin descripción)'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {showRulesModal && (
        <RulesModal
          form={form}
          onClose={() => setShowRulesModal(false)}
          onAdd={() => addRule('form', pageId, formId)}
          onUpdate={(ruleId, updates) => updateRule('form', pageId, formId, ruleId, updates)}
          onDelete={(ruleId) => deleteRule('form', pageId, formId, ruleId)}
        />
      )}
    </div>
  );
}

function RulesModal({ form, onClose, onAdd, onUpdate, onDelete }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d', borderRadius: 12,
        width: 560, maxWidth: '90vw', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e6edf3' }}>Reglas de Negocio</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{form.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
            onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {(form.rules || []).length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b949e', fontSize: 13 }}>
              Sin reglas definidas. Usa el botón de abajo para agregar la primera.
            </div>
          )}
          {(form.rules || []).map(rule => (
            <RuleEditorRow key={rule.id} rule={rule} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #21262d', display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#8b949e' }}>{(form.rules || []).length} regla(s)</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="rad-btn rad-btn-secondary" style={{ fontSize: 12 }} onClick={onAdd}>
              <Plus size={12} /> Nueva regla
            </button>
            <button className="rad-btn" style={{ fontSize: 12, background: '#238636', border: 'none', color: '#fff' }} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleEditorRow({ rule, onUpdate, onDelete }) {
  const [open, setOpen] = useState(true);
  const rt = RULE_TYPES.find(r => r.value === rule.type) || RULE_TYPES[0];

  return (
    <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, marginBottom: 10, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}>
        <span className="badge" style={{ background: rt.color + '22', color: rt.color }}>{rt.label}</span>
        <span style={{ fontSize: 13, color: '#c9d1d9', flex: 1 }}>
          {rule.description || <em style={{ color: '#8b949e' }}>sin descripción</em>}
        </span>
        <button onClick={e => { e.stopPropagation(); onDelete(rule.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = '#f85149'}
          onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
          <Trash2 size={13} />
        </button>
      </div>
      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #21262d' }}>
          <div style={{ marginTop: 10, marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Tipo de regla</label>
            <select className="rad-input" value={rule.type} onChange={e => onUpdate(rule.id, { type: e.target.value })}>
              {RULE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Descripción corta</label>
            <input className="rad-input" placeholder="Ej: El usuario debe ser mayor de 18 años..."
              value={rule.description} onChange={e => onUpdate(rule.id, { description: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#8b949e', display: 'block', marginBottom: 4 }}>Detalle para IA</label>
            <textarea className="rad-input" rows={3} style={{ minHeight: 70 }} placeholder="Describe con detalle la lógica, condiciones y efectos de la regla..."
              value={rule.detail} onChange={e => onUpdate(rule.id, { detail: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}
