import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, Toggle, RuleList } from './shared';

export default function PageInspector({ pageId }) {
  const { currentProject, updatePage, addRule, updateRule, deleteRule } = useProjectStore();
  const page = currentProject?.pages?.find(p => p.id === pageId);
  if (!page) return null;

  const set = (key, val) => updatePage(pageId, { [key]: val });

  return (
    <div>
      <Section title="Propiedades de Página">
        <Field label="Título">
          <input className="rad-input" value={page.title} onChange={e => set('title', e.target.value)} />
        </Field>
        <Field label="Descripción">
          <textarea className="rad-input" rows={2} value={page.description} onChange={e => set('description', e.target.value)} />
        </Field>
        <Field label="Layout">
          <select className="rad-input" value={page.layout} onChange={e => set('layout', e.target.value)}>
            <option value="simple">Simple</option>
            <option value="two_column">Dos columnas</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </Field>
        <Field label="Nivel de Seguridad">
          <select className="rad-input" value={page.security_level} onChange={e => set('security_level', +e.target.value)}>
            <option value={0}>0 — Público</option>
            <option value={1}>1 — Usuario autenticado</option>
            <option value={2}>2 — Administrador</option>
            <option value={3}>3 — Superadmin</option>
          </select>
        </Field>
        <Field label="Roles permitidos (coma separado)">
          <input className="rad-input" value={(page.roles_allowed || []).join(', ')}
            onChange={e => set('roles_allowed', e.target.value.split(',').map(r => r.trim()).filter(Boolean))} />
        </Field>
      </Section>
      <Section title="Reglas de Página" defaultOpen={false}>
        <RuleList
          rules={page.page_rules || []}
          onAdd={() => addRule('page', pageId)}
          onUpdate={(ruleId, updates) => updateRule('page', pageId, null, ruleId, updates)}
          onDelete={(ruleId) => deleteRule('page', pageId, null, ruleId)}
        />
      </Section>
    </div>
  );
}
