import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, RuleList } from './shared';
import { DB_TYPES } from '../../utils/schema';

export default function ProjectInspector() {
  const { currentProject, updateProject, addRule, updateRule, deleteRule } = useProjectStore();
  if (!currentProject) return null;
  const { meta, database, export_meta, global_rules = [] } = currentProject;

  const setMeta = (key, val) => updateProject(p => ({ ...p, meta: { ...p.meta, [key]: val } }));
  const setDb = (key, val) => updateProject(p => ({ ...p, database: { ...p.database, [key]: val } }));
  const setExport = (key, val) => updateProject(p => ({ ...p, export_meta: { ...p.export_meta, [key]: val } }));

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
          <input className="rad-input" value={(meta.tags || []).join(', ')} onChange={e => setMeta('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} />
        </Field>
      </Section>

      <Section title="Base de Datos">
        <Field label="Motor">
          <select className="rad-input" value={database.type} onChange={e => setDb('type', e.target.value)}>
            {DB_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
          <Field label="Host">
            <input className="rad-input" value={database.host} onChange={e => setDb('host', e.target.value)} />
          </Field>
          <Field label="Puerto">
            <input className="rad-input" type="number" value={database.port} onChange={e => setDb('port', +e.target.value)} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Field label="Nombre BD">
            <input className="rad-input" value={database.name} onChange={e => setDb('name', e.target.value)} />
          </Field>
          <Field label="Schema">
            <input className="rad-input" value={database.schema} onChange={e => setDb('schema', e.target.value)} />
          </Field>
        </div>
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
