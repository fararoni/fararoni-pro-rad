import { useState } from 'react';
import { Save, Download, Home, Undo, Eye, Edit3, Zap, Circle } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import ExportModal from './ExportModal';

export default function Toolbar() {
  const { currentProject, saveStatus, saveProject, goHome, editorMode, setEditorMode } = useProjectStore();
  const [showExport, setShowExport] = useState(false);
  const name = currentProject?.meta?.name || 'Sin título';

  const saveColor = { saved: '#3fb950', saving: '#fbbf24', error: '#f85149', unsaved: '#8b949e' }[saveStatus];
  const saveLabel = { saved: 'Guardado', saving: 'Guardando...', error: 'Error al guardar', unsaved: 'Sin guardar' }[saveStatus];

  return (
    <>
      <div style={{
        height: 52, background: '#161b22', borderBottom: '1px solid #21262d',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
          <div style={{ background: '#d97706', borderRadius: 6, padding: '4px 6px' }}>
            <Zap size={14} color="#fff" />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: '#fbbf24' }}>
            PRO-RAD
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#21262d' }} />

        {/* Project name */}
        <span style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </span>

        {/* Save status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 4 }}>
          <Circle size={7} fill={saveColor} stroke="none" className={saveStatus === 'saving' ? 'saving-pulse' : ''} />
          <span style={{ fontSize: 11, color: saveColor, fontFamily: "'JetBrains Mono', monospace" }}>{saveLabel}</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: '#0d1117', borderRadius: 8, border: '1px solid #21262d', padding: 2, gap: 2 }}>
          {[
            { mode: 'editor', icon: Edit3, label: 'Editor' },
            { mode: 'preview', icon: Eye, label: 'Vista Previa' },
          ].map(({ mode, icon: Icon, label }) => (
            <button key={mode} onClick={() => setEditorMode(mode)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: 'none',
                background: editorMode === mode ? '#21262d' : 'transparent',
                color: editorMode === mode ? '#e6edf3' : '#8b949e',
                fontSize: 12, fontWeight: editorMode === mode ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s',
              }}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <button className="rad-btn rad-btn-secondary" style={{ fontSize: 12, padding: '5px 12px' }}
          onClick={() => saveProject()}>
          <Save size={13} /> Guardar
        </button>

        <button className="rad-btn rad-btn-amber" style={{ fontSize: 12, padding: '5px 12px' }}
          onClick={() => setShowExport(true)}>
          <Download size={13} /> Exportar
        </button>

        <button className="rad-btn rad-btn-ghost" onClick={goHome} title="Ir a inicio">
          <Home size={15} />
        </button>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
