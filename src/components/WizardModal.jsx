import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Zap } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { DB_TYPES } from '../utils/schema';

const STEPS = ['Identidad', 'Base de Datos', 'Primera Página'];

export default function WizardModal({ onClose }) {
  const { createProject } = useProjectStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', description: '', author: '', version: '1.0.0', tags: '',
    db_type: 'mysql', db_host: 'localhost', db_port: 3306, db_name: '', db_schema: '',
    firstPage: 'Inicio', firstPageLayout: 'simple', firstPageSecurity: 1,
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const canNext = () => {
    if (step === 0) return data.name.trim().length >= 2;
    return true;
  };

  const handleFinish = async () => {
    if (!data.firstPage.trim()) return;
    setLoading(true);
    try {
      await createProject(data);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap size={18} color="#d97706" />
            <span style={{ fontWeight: 700, fontSize: 16 }}>Nuevo Proyecto</span>
          </div>
          <button className="rad-btn rad-btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div style={{
                width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < step ? '#3fb950' : i === step ? '#d97706' : '#21262d',
                color: i < step ? '#0d1117' : i === step ? '#fff' : '#8b949e',
                fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.2s',
              }}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: i === step ? 600 : 400, color: i === step ? '#e6edf3' : '#8b949e' }}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight size={14} color="#21262d" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ minHeight: 200 }}>
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="section-label block mb-2">Nombre del Sistema *</label>
                <input className="rad-input" placeholder="ej. Sistema de Gestión Municipal" value={data.name}
                  onChange={e => set('name', e.target.value)} autoFocus />
              </div>
              <div>
                <label className="section-label block mb-2">Descripción</label>
                <textarea className="rad-input" rows={2} placeholder="Descripción funcional de alto nivel..."
                  value={data.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-2">Autor</label>
                  <input className="rad-input" placeholder="Tu nombre" value={data.author} onChange={e => set('author', e.target.value)} />
                </div>
                <div>
                  <label className="section-label block mb-2">Versión</label>
                  <input className="rad-input" value={data.version} onChange={e => set('version', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Tags (separados por coma)</label>
                <input className="rad-input" placeholder="gobierno, oracle, react" value={data.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div style={{ padding: '10px 12px', background: '#0d1117', borderRadius: 8, border: '1px solid #21262d', fontSize: 12, color: '#8b949e' }}>
                💡 Las credenciales de BD son solo para referencia en la especificación. Pro-RAD no se conecta a la BD.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-2">Motor de BD</label>
                  <select className="rad-input" value={data.db_type} onChange={e => set('db_type', e.target.value)}>
                    {DB_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-2">Puerto</label>
                  <input className="rad-input" type="number" value={data.db_port} onChange={e => set('db_port', +e.target.value)} />
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Host</label>
                <input className="rad-input" placeholder="localhost" value={data.db_host} onChange={e => set('db_host', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-2">Nombre BD</label>
                  <input className="rad-input" placeholder="mi_base_de_datos" value={data.db_name} onChange={e => set('db_name', e.target.value)} />
                </div>
                <div>
                  <label className="section-label block mb-2">Schema / Owner</label>
                  <input className="rad-input" placeholder="SIEPPE (Oracle)" value={data.db_schema} onChange={e => set('db_schema', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="section-label block mb-2">Nombre de la Primera Página *</label>
                <input className="rad-input" placeholder="ej. Inicio, Login, Menu Principal" value={data.firstPage}
                  onChange={e => set('firstPage', e.target.value)} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-label block mb-2">Layout</label>
                  <select className="rad-input" value={data.firstPageLayout} onChange={e => set('firstPageLayout', e.target.value)}>
                    <option value="simple">Simple</option>
                    <option value="two_column">Dos columnas</option>
                    <option value="dashboard">Dashboard</option>
                  </select>
                </div>
                <div>
                  <label className="section-label block mb-2">Nivel de Seguridad</label>
                  <select className="rad-input" value={data.firstPageSecurity} onChange={e => set('firstPageSecurity', +e.target.value)}>
                    <option value={0}>0 — Público</option>
                    <option value={1}>1 — Usuario autenticado</option>
                    <option value={2}>2 — Administrador</option>
                    <option value={3}>3 — Superadmin</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid #21262d' }}>
          <button className="rad-btn rad-btn-secondary" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>
            {step === 0 ? <><X size={14} /> Cancelar</> : <><ChevronLeft size={14} /> Atrás</>}
          </button>
          {step < 2 ? (
            <button className="rad-btn rad-btn-amber" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button className="rad-btn rad-btn-primary" disabled={loading || !data.firstPage.trim()} onClick={handleFinish}>
              {loading ? 'Creando...' : <><Check size={14} /> Crear Proyecto</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
