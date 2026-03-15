import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, Toggle } from './shared';
import { FIELD_TYPES } from '../../utils/schema';
import { Plus, Trash2 } from 'lucide-react';

export default function FieldInspector({ pageId, formId, fieldId }) {
  const { currentProject, updateField } = useProjectStore();
  const page = currentProject?.pages?.find(p => p.id === pageId);
  const form = page?.forms?.find(f => f.id === formId);
  const field = form?.fields?.find(f => f.id === fieldId);
  if (!field) return null;

  const set = (key, val) => updateField(pageId, formId, fieldId, { [key]: val });
  const setLookup = (key, val) => updateField(pageId, formId, fieldId, f => ({ ...f, lookup: { ...f.lookup, [key]: val } }));

  const hasLookup = ['listbox','multiselect','radio','checkbox_group'].includes(field.type);

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
            {['Básicos','Selección','Acción'].map(group => (
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

      {hasLookup && (
        <Section title="Lookup / Fuente de opciones">
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
        </Section>
      )}

      <Section title="Validaciones" defaultOpen={false}>
        {(field.validations || []).map((v, i) => (
          <div key={i} style={{ background: '#161b22', borderRadius: 8, border: '1px solid #21262d', padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <select className="rad-input" style={{ fontSize: 11 }} value={v.rule} onChange={e => updateValidation(i, 'rule', e.target.value)}>
                {['min_length','max_length','regex','range','email','numeric','date_range','custom'].map(r => <option key={r} value={r}>{r}</option>)}
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
                {['show','hide','enable','disable','required'].map(a => <option key={a} value={a}>{a}</option>)}
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
