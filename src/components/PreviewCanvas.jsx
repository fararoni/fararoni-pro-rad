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

function HeaderPreview({ form }) {
  return (
    <div style={{ background: '#161b22', borderBottom: '1px solid #21262d', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 24 }}>
      <span style={{ fontWeight: 700, fontSize: 15, color: '#e6edf3', marginRight: 8 }}>{form.title}</span>
      {form.fields?.map(field => {
        if (field.type === 'nav_menu') {
          return (
            <nav key={field.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {['Inicio', 'Módulo 1', 'Módulo 2', 'Perfil'].map(item => (
                <a key={item} href="#" style={{ fontSize: 13, color: '#c9d1d9', textDecoration: 'none', padding: '6px 10px', borderRadius: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#21262d'; e.currentTarget.style.color = '#e6edf3'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9d1d9'; }}>
                  {item}
                </a>
              ))}
            </nav>
          );
        }
        return null;
      })}
    </div>
  );
}

function HeroPreview({ form }) {
  const titleField    = form.fields?.find(f => f.name === 'HERO_TITULO')    || form.fields?.[0];
  const subtitleField = form.fields?.find(f => f.name === 'HERO_SUBTITULO') || form.fields?.[1];
  const ctaFields     = form.fields?.filter(f => f.type === 'button') || [];
  const otherFields   = form.fields?.filter(f => !['HERO_TITULO','HERO_SUBTITULO'].includes(f.name) && f.type !== 'button') || [];

  return (
    <div style={{ background: 'linear-gradient(160deg, #0d1117 0%, #161b22 50%, #0d1117 100%)', padding: '72px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% -20%, rgba(188,140,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
      {titleField && (
        <h1 style={{ fontSize: 42, fontWeight: 800, color: '#e6edf3', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
          {titleField.caption}
        </h1>
      )}
      {subtitleField && (
        <p style={{ fontSize: 18, color: '#8b949e', margin: '0 auto 36px', maxWidth: 520, lineHeight: 1.6 }}>
          {subtitleField.caption}
        </p>
      )}
      {otherFields.map(f => (
        <p key={f.id} style={{ fontSize: 14, color: '#8b949e', margin: '0 auto 16px', maxWidth: 520 }}>{f.caption}</p>
      ))}
      {ctaFields.length > 0 && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {ctaFields.map((f, i) => (
            <button key={f.id} style={{ background: i === 0 ? '#238636' : 'transparent', border: i === 0 ? 'none' : '1px solid #30363d', borderRadius: 8, color: i === 0 ? '#fff' : '#c9d1d9', padding: '11px 28px', fontSize: 15, cursor: 'pointer', fontWeight: 600 }}>
              {f.caption}
            </button>
          ))}
        </div>
      )}
      {form.fields?.length === 0 && (
        <p style={{ color: '#8b949e', fontStyle: 'italic', fontSize: 14 }}>Sin campos definidos</p>
      )}
    </div>
  );
}

function GridPreview({ form }) {
  const visibleFields = (form.fields || []).filter(f => f.type !== 'hidden');
  const mockRows = visibleFields.length === 0 ? [] : [1, 2, 3].map(row => visibleFields.reduce((acc, f) => {
    const vals = { text: `Valor ${row}`, number: String(row * 10), currency: `$ ${(row * 1250).toLocaleString()}`, date: `${String(row + 10).padStart(2,'0')}/03/2025`, email: `usuario${row}@ejemplo.com`, listbox: 'Activo', radio: 'Sí', checkbox: row % 2 === 0 ? '✓' : '—', url_link: '→ Ver', button: '', label: f.caption };
    acc[f.id] = vals[f.type] || `Dato ${row}`;
    return acc;
  }, {}));

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Toolbar row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, padding: '6px 12px', fontSize: 12, color: '#8b949e', display: 'flex', alignItems: 'center', gap: 8, minWidth: 180 }}>
          <span>🔍</span><span>Buscar...</span>
        </div>
        {form.operations?.allow_insert && (
          <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>+ Nuevo</button>
        )}
      </div>
      {visibleFields.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b949e', fontSize: 13 }}>Sin campos definidos</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#161b22', borderBottom: '2px solid #21262d' }}>
              {visibleFields.map(f => (
                <th key={f.id} style={{ padding: '10px 14px', textAlign: 'left', color: '#8b949e', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>
                  {f.caption}{f.is_pk ? ' 🔑' : ''}{f.required ? ' *' : ''}
                </th>
              ))}
              <th style={{ padding: '10px 14px', width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {mockRows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #21262d', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#161b22'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
                {visibleFields.map(f => (
                  <td key={f.id} style={{ padding: '9px 14px', color: f.is_pk ? '#fbbf24' : '#c9d1d9', fontFamily: f.is_pk ? "'JetBrains Mono', monospace" : 'inherit', fontSize: 13 }}>
                    {row[f.id]}
                  </td>
                ))}
                <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    {form.operations?.allow_update && <button style={{ background: 'transparent', border: '1px solid #21262d', borderRadius: 4, color: '#8b949e', padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>✏️</button>}
                    {form.operations?.allow_delete && <button style={{ background: 'transparent', border: '1px solid #21262d', borderRadius: 4, color: '#f85149', padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>🗑</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Pagination */}
      {form.pagination?.enabled && visibleFields.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: '#8b949e' }}>
          <span>Mostrando 1–3 de 3 registros</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['‹', '1', '2', '3', '›'].map(p => (
              <button key={p} style={{ background: p === '1' ? 'rgba(56,139,253,0.15)' : 'transparent', border: '1px solid', borderColor: p === '1' ? '#388bfd' : '#21262d', borderRadius: 4, color: p === '1' ? '#388bfd' : '#8b949e', padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>{p}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModalPreview({ form, fields, FieldRenderer }) {
  return (
    <div style={{ position: 'relative', minHeight: 320, borderRadius: 12, overflow: 'hidden' }}>
      {/* Dimmed backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(1,4,9,0.75)', backdropFilter: 'blur(2px)' }} />
      {/* Modal dialog */}
      <div style={{ position: 'relative', margin: '32px auto', maxWidth: 480, background: '#161b22', border: '1px solid #30363d', borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: '#1c2128', borderBottom: '1px solid #21262d', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#e6edf3' }}>{form.title}</h3>
          <span style={{ color: '#8b949e', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>✕</span>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields}
          {form.fields?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#8b949e', fontSize: 13 }}>Sin campos definidos</div>
          )}
        </div>
        {/* Footer */}
        <div style={{ borderTop: '1px solid #21262d', padding: '12px 24px', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#1c2128' }}>
          <button style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          {form.operations?.allow_insert && (
            <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Guardar</button>
          )}
        </div>
      </div>
    </div>
  );
}

function FooterPreview({ form }) {
  const copyrightField = form.fields?.find(f => f.type === 'copyright');
  return (
    <div style={{ background: '#0d1117', borderTop: '1px solid #21262d', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 12, color: '#8b949e' }}>
        {copyrightField?.caption || '© 2024 - Todos los derechos reservados'}
      </span>
    </div>
  );
}

export default function PreviewCanvas({ page, form }) {
  const [viewport, setViewport] = useState('desktop');

  const widths = { desktop: '100%', tablet: 768, mobile: 375 };
  const w = widths[viewport];

  const isLookupField = ['listbox','multiselect','radio','checkbox_group'].includes(form?.type);

  if (form.type === 'header') {
    return (
      <div style={{ flex: 1, overflow: 'auto', background: '#0a0f16' }}>
        <HeaderPreview form={form} />
      </div>
    );
  }

  if (form.type === 'footer') {
    return (
      <div style={{ flex: 1, overflow: 'auto', background: '#0a0f16' }}>
        <FooterPreview form={form} />
      </div>
    );
  }

  if (form.type === 'hero') {
    return (
      <div style={{ flex: 1, overflow: 'auto', background: '#0a0f16' }}>
        <HeroPreview form={form} />
      </div>
    );
  }

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

        {/* Grid type — render as table */}
        {form.type === 'grid' ? (
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden', padding: '16px 20px' }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>{form.title}</h3>
              {form.description && <p style={{ margin: 0, fontSize: 12, color: '#8b949e' }}>{form.description}</p>}
            </div>
            <GridPreview form={form} />
          </div>
        ) : form.type === 'modal' ? (
          /* Modal type — floating dialog */
          <ModalPreview form={form} fields={
            form.fields?.filter(f => f.type !== 'hidden').map(field => (
              <div key={field.id}>
                {field.type !== 'button' && field.type !== 'url_link' && field.type !== 'label' && (
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c9d1d9', marginBottom: 6 }}>
                    {field.caption}{field.required && <span style={{ color: '#f85149', marginLeft: 3 }}>*</span>}
                  </label>
                )}
                {field.type === 'textarea' ? (
                  <textarea readOnly style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', resize: 'none', fontFamily: 'inherit' }}
                    value={mockValue(field.type)} rows={field.rows || 3} />
                ) : field.type === 'button' ? (
                  <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>{field.caption || 'Aceptar'}</button>
                ) : field.type === 'label' ? (
                  <div style={{ fontSize: 13, color: '#e6edf3', fontStyle: 'italic' }}>{field.caption}</div>
                ) : field.type === 'listbox' || field.type === 'multiselect' ? (
                  <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#8b949e', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{field.lookup?.lov ? field.lookup.lov.split(';')[0].split('=')[1] || 'Seleccionar...' : '▼ Datos desde BD'}</span>
                    <span style={{ fontSize: 10 }}>▼</span>
                  </div>
                ) : field.type === 'checkbox' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid #388bfd' }} />
                    <span style={{ fontSize: 13, color: '#c9d1d9' }}>{field.caption}</span>
                  </label>
                ) : (
                  <input readOnly value={mockValue(field.type, field.lookup)}
                    style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', fontFamily: 'inherit' }} />
                )}
                {field.help_text && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>ℹ️ {field.help_text}</div>}
              </div>
            ))
          } />
        ) : (
          /* record / search / report / menu — standard card */
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #21262d', background: '#1c2128' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>{form.title}</h3>
              {form.description && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8b949e' }}>{form.description}</p>}
            </div>

            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {form.fields?.filter(f => f.type !== 'hidden').map(field => (
                <div key={field.id}>
                  {field.type !== 'button' && field.type !== 'url_link' && (
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#c9d1d9', marginBottom: 6 }}>
                      {field.caption}
                      {field.required && <span style={{ color: '#f85149', marginLeft: 3 }}>*</span>}
                      {field.is_pk && <span style={{ marginLeft: 6, fontSize: 10, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace", background: '#fbbf2422', padding: '1px 5px', borderRadius: 3 }}>PK</span>}
                    </label>
                  )}
                  {field.type === 'textarea' ? (
                    <textarea readOnly style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', resize: 'none', fontFamily: 'inherit' }}
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
                  {field.help_text && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>ℹ️ {field.help_text}</div>}
                </div>
              ))}

              {form.fields?.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#8b949e', fontSize: 13 }}>Sin campos definidos</div>
              )}
            </div>

            {form.type === 'record' && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid #21262d', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button style={{ background: 'transparent', border: '1px solid #21262d', borderRadius: 6, color: '#8b949e', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                {form.operations?.allow_insert && (
                  <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Guardar</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
