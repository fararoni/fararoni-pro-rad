import { useState } from 'react';
import { X, Download, FileJson, FileText, BarChart2, CheckCircle, AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { exportJSON, exportMarkdown, exportSummary, downloadFile } from '../utils/exporters';

export default function ExportModal({ onClose }) {
  const { currentProject } = useProjectStore();
  const [exported, setExported] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const validate = () => {
    const errors = [];
    const { meta, pages = [] } = currentProject;
    if (!meta.name) errors.push('El proyecto no tiene nombre');
    pages.forEach(p => {
      p.forms?.forEach(f => {
        if (!f.data_source?.table && f.type !== 'menu') {
          // Warn, not error
        }
        f.fields?.forEach(field => {
          if (['listbox','multiselect','radio'].includes(field.type) && !field.lookup?.sql && !field.lookup?.lov && !field.lookup?.table) {
            errors.push(`${f.title} > ${field.name}: campo de selección sin fuente de datos`);
          }
        });
      });
    });
    return errors;
  };

  const handleExport = (type) => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
    }

    const name = currentProject.meta?.name?.replace(/\s+/g, '_') || 'proyecto';
    switch (type) {
      case 'json':
        downloadFile(exportJSON(currentProject), `${name}_spec.json`, 'application/json');
        break;
      case 'md':
        downloadFile(exportMarkdown(currentProject), `${name}_spec.md`, 'text/markdown');
        break;
      case 'summary':
        downloadFile(exportSummary(currentProject), `${name}_resumen.md`, 'text/markdown');
        break;
    }
    setExported(type);
  };

  const options = [
    {
      type: 'json',
      icon: FileJson,
      title: 'Especificación Técnica',
      subtitle: '.json — Schema v2.0 completo',
      desc: 'Formato estructurado para parseo por IA o herramientas de generación de código. Incluye todos los campos, reglas y metadata.',
      color: '#388bfd',
    },
    {
      type: 'md',
      icon: FileText,
      title: 'Documento Narrativo',
      subtitle: '.md — Markdown legible por IA',
      desc: 'Markdown con todas las páginas, formularios, campos y reglas en lenguaje natural. Ideal para prompting directo a IA.',
      color: '#3fb950',
    },
    {
      type: 'summary',
      icon: BarChart2,
      title: 'Resumen Ejecutivo',
      subtitle: '.md — Una página de inventario',
      desc: 'Resumen compacto con inventario: N páginas, N formularios, N campos. Para revisión rápida con stakeholders.',
      color: '#d97706',
    },
  ];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ minWidth: 520 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Exportar Especificación</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8b949e' }}>{currentProject?.meta?.name}</p>
          </div>
          <button className="rad-btn rad-btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Validation warnings */}
        {validationErrors.length > 0 && (
          <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <AlertCircle size={14} color="#f85149" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f85149' }}>{validationErrors.length} advertencia{validationErrors.length > 1 ? 's' : ''}</span>
            </div>
            {validationErrors.map((e, i) => (
              <div key={i} style={{ fontSize: 11, color: '#f85149', marginLeft: 22 }}>• {e}</div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => {
            const Icon = opt.icon;
            const done = exported === opt.type;
            return (
              <div key={opt.type}
                style={{ background: '#0d1117', border: `1px solid ${done ? opt.color : '#21262d'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', transition: 'all 0.15s' }}
                onClick={() => handleExport(opt.type)}
                onMouseEnter={e => e.currentTarget.style.borderColor = opt.color}
                onMouseLeave={e => { if (!done) e.currentTarget.style.borderColor = '#21262d'; }}>
                <div style={{ background: opt.color + '22', borderRadius: 8, padding: 8, flexShrink: 0 }}>
                  <Icon size={18} color={opt.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{opt.title}</span>
                    <span style={{ fontSize: 11, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace" }}>{opt.subtitle}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8b949e', lineHeight: 1.5 }}>{opt.desc}</p>
                </div>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>
                  {done
                    ? <CheckCircle size={18} color={opt.color} />
                    : <Download size={16} color="#8b949e" />}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #21262d', textAlign: 'center' }}>
          <button className="rad-btn rad-btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
