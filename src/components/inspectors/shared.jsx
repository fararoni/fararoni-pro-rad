import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { RULE_TYPES } from '../../utils/schema';

/* ─── Field row ─── */
export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="section-label" style={{ display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

/* ─── Collapsible section ─── */
export function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #21262d' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: '#e6edf3' }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{title}</span>
        {open ? <ChevronDown size={13} color="#8b949e" /> : <ChevronRight size={13} color="#8b949e" />}
      </button>
      {open && <div style={{ padding: '0 16px 14px' }}>{children}</div>}
    </div>
  );
}

/* ─── Checkbox toggle ─── */
export function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#c9d1d9' }}>{label}</span>
      <button onClick={() => onChange(!value)}
        style={{
          width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
          background: value ? '#238636' : '#21262d', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
        <div style={{
          position: 'absolute', top: 2, left: value ? 18 : 2, width: 16, height: 16,
          borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

/* ─── Rule list editor ─── */
export function RuleList({ rules = [], onAdd, onUpdate, onDelete }) {
  const [expandedRule, setExpandedRule] = useState(null);

  return (
    <div>
      {rules.map(rule => {
        const rt = RULE_TYPES.find(r => r.value === rule.type) || RULE_TYPES[0];
        const isOpen = expandedRule === rule.id;
        return (
          <div key={rule.id} style={{ marginBottom: 6, background: '#161b22', borderRadius: 8, border: '1px solid #21262d', overflow: 'hidden' }}>
            <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              onClick={() => setExpandedRule(isOpen ? null : rule.id)}>
              <span className="badge" style={{ background: rt.color + '22', color: rt.color }}>{rt.label}</span>
              <span style={{ fontSize: 12, color: '#c9d1d9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rule.description || '(sin descripción)'}
              </span>
              <button onClick={e => { e.stopPropagation(); onDelete(rule.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 2 }}>
                <Trash2 size={12} />
              </button>
            </div>
            {isOpen && (
              <div style={{ padding: '0 10px 10px', borderTop: '1px solid #21262d' }}>
                <div style={{ marginTop: 8, marginBottom: 6 }}>
                  <select className="rad-input" style={{ fontSize: 11 }} value={rule.type}
                    onChange={e => onUpdate(rule.id, { type: e.target.value })}>
                    {RULE_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <input className="rad-input" style={{ fontSize: 11, marginBottom: 6 }} placeholder="Descripción corta..."
                  value={rule.description} onChange={e => onUpdate(rule.id, { description: e.target.value })} />
                <textarea className="rad-input" style={{ fontSize: 11, minHeight: 60 }} placeholder="Detalle para IA..."
                  value={rule.detail} onChange={e => onUpdate(rule.id, { detail: e.target.value })} />
              </div>
            )}
          </div>
        );
      })}
      <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11, marginTop: 4, width: '100%' }} onClick={onAdd}>
        <Plus size={11} /> Agregar Regla
      </button>
    </div>
  );
}
