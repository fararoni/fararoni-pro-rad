import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, Toggle, RuleList, RolesSelector } from './shared';

const findPageAnywhere = (project, pageId) => {
  const p = project?.pages?.find(p => p.id === pageId);
  if (p) return p;
  for (const m of project?.modules || []) {
    const pm = m.pages?.find(p => p.id === pageId);
    if (pm) return pm;
  }
  return null;
};

export default function PageInspector({ pageId, moduleId }) {
  const { currentProject, updatePage, addRule, updateRule, deleteRule } = useProjectStore();
  const page = findPageAnywhere(currentProject, pageId);
  if (!page) return null;

  const set = (key, val) => updatePage(pageId, { [key]: val });

  const mod = moduleId ? currentProject?.modules?.find(m => m.id === moduleId) : null;
  const modRoles = mod?.roles_allowed || [];
  const projectRoles = currentProject?.meta?.roles || [];
  const availableRoles = modRoles.length > 0 ? modRoles : projectRoles;

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
            <option value="landing">Landing</option>
            <option value="dashboard">Dashboard</option>
            <option value="aplicacion">Aplicación</option>
            <option value="crud">CRUD</option>
            <option value="limpio">Limpio</option>
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
        <Field label="Roles permitidos">
          <RolesSelector
            value={page.roles_allowed || []}
            availableRoles={availableRoles}
            onChange={val => set('roles_allowed', val)}
          />
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
