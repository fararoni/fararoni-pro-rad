import { useState } from 'react';

const mockValue = (type, lookup) => {
  if (lookup?.lov) return lookup.lov.split(';')[0]?.split('=')[1] || '—';
  const map = {
    text: 'Ejemplo de texto',
    textarea: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    number: '42',
    currency: '1,234.50',
    percentage: '75%',
    email: 'usuario@ejemplo.com',
    date: '15/03/2025',
    datetime: '15/03/2025 10:30',
    hidden: '',
    label: '',
    password: '••••••••',
    listbox: 'Opción seleccionada',
    radio: 'Opción 1',
    checkbox: '',
    url_link: '',
    button: '',
    file: 'ningún archivo',
  };
  return map[type] || '';
};

export default function PreviewCanvas({ page, form }) {
  const [viewport, setViewport] = useState('desktop');

  const widths = { desktop: '100%', tablet: 768, mobile: 375 };
  const w = widths[viewport];

  const isLookupField = ['listbox','multiselect','radio','checkbox_group'].includes(form?.type);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', background: '#0a0f16' }}>
      {/* Viewport controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span className="section-label">Viewport:</span>
        {['desktop','tablet','mobile'].map(v => (
          <button key={v} onClick={() => setViewport(v)}
            style={{
              padding: '4px 12px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer',
              borderColor: viewport === v ? '#388bfd' : '#21262d',
              background: viewport === v ? 'rgba(56,139,253,0.1)' : 'transparent',
              color: viewport === v ? '#388bfd' : '#8b949e',
            }}>
            {v === 'desktop' ? '🖥️' : v === 'tablet' ? '📱' : '📲'} {v}
          </button>
        ))}
        <span style={{ fontSize: 11, color: '#8b949e', marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace" }}>
          {viewport === 'desktop' ? 'Flexible' : `${w}px`}
        </span>
      </div>

      {/* Form preview */}
      <div style={{ width: typeof w === 'number' ? w : '100%', maxWidth: typeof w === 'number' ? w : 800, margin: '0 auto' }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
          {/* Form title bar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #21262d', background: '#1c2128' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>{form.title}</h3>
            {form.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8b949e' }}>{form.description}</p>}
          </div>

          {/* Fields */}
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {form.fields?.filter(f => f.type !== 'hidden').map(field => (
              <div key={field.id}>
                {/* Label */}
                {field.type !== 'button' && field.type !== 'url_link' && (
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c9d1d9', marginBottom: 6 }}>
                    {field.caption}
                    {field.required && <span style={{ color: '#f85149', marginLeft: 3 }}>*</span>}
                    {field.is_pk && <span style={{ marginLeft: 6, fontSize: 10, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace", background: '#fbbf2422', padding: '1px 5px', borderRadius: 3 }}>PK</span>}
                  </label>
                )}

                {/* Control */}
                {field.type === 'textarea' ? (
                  <textarea readOnly style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', resize: 'none', rows: field.rows || 3, fontFamily: 'inherit' }}
                    value={mockValue(field.type)} rows={field.rows || 3} />
                ) : field.type === 'radio' ? (
                  <div style={{ display: 'flex', gap: 16 }}>
                    {(field.lookup?.lov || '1=Sí;2=No').split(';').map(opt => {
                      const [v, l] = opt.split('=');
                      return (
                        <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#c9d1d9', cursor: 'pointer' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #388bfd', background: v === '1' ? '#388bfd' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {v === '1' && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                          </div>
                          {l || v}
                        </label>
                      );
                    })}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid #388bfd', background: 'transparent' }} />
                    <span style={{ fontSize: 13, color: '#c9d1d9' }}>{field.caption}</span>
                  </label>
                ) : field.type === 'listbox' || field.type === 'multiselect' ? (
                  <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#8b949e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{field.lookup?.lov ? field.lookup.lov.split(';')[0].split('=')[1] || 'Seleccionar...' : '▼ Datos desde BD'}</span>
                    <span style={{ fontSize: 10 }}>▼</span>
                  </div>
                ) : field.type === 'button' ? (
                  <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '8px 20px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {field.caption || 'Guardar'}
                  </button>
                ) : field.type === 'url_link' ? (
                  <a href="#" style={{ color: '#388bfd', fontSize: 13, textDecoration: 'underline' }}>{field.caption || '→ Ver más'}</a>
                ) : field.type === 'label' ? (
                  <div style={{ fontSize: 13, color: '#e6edf3', fontStyle: 'italic' }}>{field.caption}</div>
                ) : field.type === 'file' ? (
                  <div style={{ background: '#0d1117', border: '2px dashed #21262d', borderRadius: 6, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#8b949e' }}>
                    📎 Seleccionar archivo...
                  </div>
                ) : (
                  <input readOnly value={mockValue(field.type, field.lookup)}
                    style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', fontFamily: field.type === 'password' ? 'monospace' : 'inherit' }} />
                )}

                {field.help_text && (
                  <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>ℹ️ {field.help_text}</div>
                )}
              </div>
            ))}

            {form.fields?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b949e', fontSize: 13 }}>
                Sin campos definidos
              </div>
            )}
          </div>

          {/* Action buttons row */}
          {form.type === 'record' && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid #21262d', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ background: 'transparent', border: '1px solid #21262d', borderRadius: 6, color: '#8b949e', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
              {form.operations?.allow_insert && (
                <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>
                  Guardar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
