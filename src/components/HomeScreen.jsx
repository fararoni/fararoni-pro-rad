import { useEffect, useState } from 'react';
import { Plus, FolderOpen, Layers, Clock, Trash2, ChevronRight, Zap } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import WizardModal from './WizardModal';

export default function HomeScreen() {
  const { projects, loadProjects, loadProject, deleteProject } = useProjectStore();
  const [showWizard, setShowWizard] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);

  useEffect(() => { loadProjects(); }, []);

  const handleDelete = async (id) => {
    await deleteProject(id);
    setDelConfirm(null);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Header */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #21262d' }} className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ background: '#d97706', borderRadius: 8, padding: '6px 8px' }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 16, color: '#fbbf24' }}>
              PRO-RAD
            </div>
            <div style={{ fontSize: 11, color: '#8b949e', marginTop: -2 }}>Editor de Especificaciones v2.0</div>
          </div>
        </div>
        <button className="rad-btn rad-btn-amber" onClick={() => setShowWizard(true)}>
          <Plus size={16} /> Nuevo Proyecto
        </button>
      </div>

      <div className="px-8 py-10 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="mb-10">
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e6edf3', marginBottom: 8 }}>
            Mis Proyectos
          </h1>
          <p style={{ color: '#8b949e', fontSize: 14 }}>
            Diseña y especifica sistemas completos. Exporta a JSON + Markdown listos para IA.
          </p>
        </div>

        {/* Stats */}
        {projects.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Proyectos', value: projects.length, icon: FolderOpen },
              { label: 'Total páginas', value: projects.reduce((a, p) => a + (p.page_count || 0), 0), icon: Layers },
              { label: 'Último guardado', value: projects[0]?.updated_at?.slice(0, 10) || '—', icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '16px 20px' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} color="#8b949e" />
                  <span className="section-label">{label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Projects list */}
        {projects.length === 0 ? (
          <div style={{ border: '2px dashed #21262d', borderRadius: 12, padding: '60px 40px', textAlign: 'center' }}>
            <Zap size={40} color="#21262d" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#8b949e', marginBottom: 8 }}>
              Ningún proyecto todavía
            </div>
            <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 24 }}>
              Crea tu primer proyecto para empezar a especificar tu sistema
            </div>
            <button className="rad-btn rad-btn-amber" onClick={() => setShowWizard(true)}>
              <Plus size={16} /> Crear primer proyecto
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map(p => (
              <div key={p.id}
                style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '16px 20px' }}
                className="flex items-center justify-between hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => loadProject(p.id)}
              >
                <div className="flex items-center gap-4">
                  <div style={{ background: '#1c2128', borderRadius: 8, padding: 8 }}>
                    <Layers size={18} color="#388bfd" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#e6edf3' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>
                      {p.page_count || 0} páginas · Editado {p.updated_at?.slice(0, 10) || 'hoy'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {delConfirm === p.id ? (
                    <>
                      <span style={{ fontSize: 12, color: '#f85149' }}>¿Eliminar?</span>
                      <button className="rad-btn rad-btn-danger" style={{ padding: '3px 10px', fontSize: 12 }}
                        onClick={e => { e.stopPropagation(); handleDelete(p.id); }}>Sí</button>
                      <button className="rad-btn rad-btn-ghost" style={{ padding: '3px 10px', fontSize: 12 }}
                        onClick={e => { e.stopPropagation(); setDelConfirm(null); }}>No</button>
                    </>
                  ) : (
                    <>
                      <button className="rad-btn rad-btn-ghost opacity-0 group-hover:opacity-100"
                        onClick={e => { e.stopPropagation(); setDelConfirm(p.id); }}>
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={18} color="#8b949e" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showWizard && <WizardModal onClose={() => setShowWizard(false)} />}
    </div>
  );
}
