import { useProjectStore } from '../store/useProjectStore';
import EditorCanvas from './EditorCanvas';
import PreviewCanvas from './PreviewCanvas';
import { Layers } from 'lucide-react';

export default function WorkArea() {
  const { selectedNode, currentProject, editorMode } = useProjectStore();

  // Find context
  let page = null, form = null;
  if (selectedNode && currentProject) {
    const { type, id, pageId, formId } = selectedNode;
    if (type === 'page') page = currentProject.pages?.find(p => p.id === id);
    if (type === 'form') {
      page = currentProject.pages?.find(p => p.id === pageId);
      form = page?.forms?.find(f => f.id === id);
    }
    if (type === 'field') {
      page = currentProject.pages?.find(p => p.id === pageId);
      form = page?.forms?.find(f => f.id === formId);
    }
  }

  if (!selectedNode || selectedNode.type === 'project') {
    return <ProjectOverview />;
  }

  if (!form) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#8b949e' }}>
        <Layers size={48} style={{ opacity: 0.2 }} />
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          {page ? `Página: ${page.title}` : 'Selecciona un formulario'}
        </div>
        <div style={{ fontSize: 13 }}>
          {page
            ? page.forms?.length === 0
              ? 'Esta página no tiene formularios todavía'
              : 'Selecciona un formulario del árbol para editar sus campos'
            : 'Selecciona o crea un formulario en el panel izquierdo'}
        </div>
      </div>
    );
  }

  return editorMode === 'preview'
    ? <PreviewCanvas page={page} form={form} />
    : <EditorCanvas page={page} form={form} />;
}

function ProjectOverview() {
  const { currentProject } = useProjectStore();
  if (!currentProject) return null;
  const { meta, pages = [] } = currentProject;
  let totalForms = 0, totalFields = 0;
  pages.forEach(p => { totalForms += p.forms?.length || 0; p.forms?.forEach(f => { totalFields += f.fields?.length || 0; }); });

  return (
    <div style={{ flex: 1, padding: 40, overflow: 'auto' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>{meta.name}</h1>
          {meta.description && <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.6 }}>{meta.description}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {(meta.tags || []).map(t => (
              <span key={t} className="badge" style={{ background: '#21262d', color: '#8b949e' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Páginas', value: pages.length, color: '#388bfd' },
            { label: 'Formularios', value: totalForms, color: '#d97706' },
            { label: 'Campos', value: totalFields, color: '#3fb950' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#161b22', borderRadius: 10, border: '1px solid #21262d', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
              <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Pages summary */}
        <div style={{ fontSize: 12, fontWeight: 600, color: '#8b949e', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
          RESUMEN DE PÁGINAS
        </div>
        {pages.length === 0 ? (
          <div style={{ color: '#8b949e', fontSize: 13 }}>Sin páginas. Agrega la primera desde el panel izquierdo.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pages.map(p => (
              <div key={p.id} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</span>
                  <span className="badge" style={{ background: '#21262d', color: '#8b949e' }}>Nivel {p.security_level}</span>
                </div>
                {p.description && <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>{p.description}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {p.forms?.map(f => (
                    <span key={f.id} className="badge" style={{ background: '#1c2128', color: '#c9d1d9', border: '1px solid #21262d' }}>
                      {f.title} ({f.type})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
