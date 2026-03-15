import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, Toggle, RuleList } from './shared';
import { FORM_TYPES } from '../../utils/schema';

export default function FormInspector({ pageId, formId }) {
  const { currentProject, updateForm, addRule, updateRule, deleteRule } = useProjectStore();
  const page = currentProject?.pages?.find(p => p.id === pageId);
  const form = page?.forms?.find(f => f.id === formId);
  if (!form) return null;

  const set = (key, val) => updateForm(pageId, formId, { [key]: val });
  const setDs = (key, val) => updateForm(pageId, formId, f => ({ ...f, data_source: { ...f.data_source, [key]: val } }));
  const setOps = (key, val) => updateForm(pageId, formId, f => ({ ...f, operations: { ...f.operations, [key]: val } }));
  const setPag = (key, val) => updateForm(pageId, formId, f => ({ ...f, pagination: { ...f.pagination, [key]: val } }));

  return (
    <div>
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

      <Section title="Fuente de Datos">
        <Field label="Tabla principal de BD">
          <input className="rad-input" placeholder="ej. ACTIVIDADES" value={form.data_source?.table || ''}
            onChange={e => setDs('table', e.target.value)} />
        </Field>
        <Field label="WHERE base (opcional)">
          <input className="rad-input" placeholder="ej. ACTIVO = 1" value={form.data_source?.where || ''}
            onChange={e => setDs('where', e.target.value)} />
        </Field>
        <Field label="SQL personalizado (opcional)">
          <textarea className="rad-input" rows={3} placeholder="SELECT ... FROM ..."
            value={form.data_source?.sql_custom || ''}
            onChange={e => setDs('sql_custom', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
          <Field label="Campo de orden">
            <input className="rad-input" value={form.data_source?.order_field || ''}
              onChange={e => setDs('order_field', e.target.value)} />
          </Field>
          <Field label="Dirección">
            <select className="rad-input" value={form.data_source?.order_dir || 'asc'}
              onChange={e => setDs('order_dir', e.target.value)}>
              <option value="asc">ASC</option>
              <option value="desc">DESC</option>
            </select>
          </Field>
        </div>
      </Section>

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

      <Section title="Reglas del Formulario" defaultOpen={false}>
        <RuleList
          rules={form.rules || []}
          onAdd={() => addRule('form', pageId, formId)}
          onUpdate={(ruleId, updates) => updateRule('form', pageId, formId, ruleId, updates)}
          onDelete={(ruleId) => deleteRule('form', pageId, formId, ruleId)}
        />
      </Section>
    </div>
  );
}
