import { useProjectStore } from '../../store/useProjectStore';
import { Section, Field, RolesSelector } from './shared';

export default function ModuleInspector({ moduleId }) {
  const { currentProject, updateModule } = useProjectStore();
  const mod = currentProject?.modules?.find(m => m.id === moduleId);
  if (!mod) return null;

  const set = (key, val) => updateModule(moduleId, { [key]: val });
  const projectRoles = currentProject?.meta?.roles || [];

  return (
    <div>
      <Section title="Propiedades del Módulo">
        <Field label="Título">
          <input className="rad-input" value={mod.title} onChange={e => set('title', e.target.value)} />
        </Field>
        <Field label="Descripción">
          <textarea className="rad-input" rows={2} value={mod.description || ''} onChange={e => set('description', e.target.value)} />
        </Field>
        <Field label="Roles permitidos" hint="Roles que pueden acceder a este módulo">
          <RolesSelector
            value={mod.roles_allowed || []}
            availableRoles={projectRoles}
            onChange={val => set('roles_allowed', val)}
          />
        </Field>
      </Section>
    </div>
  );
}
