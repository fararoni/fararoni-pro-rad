import { useState, useContext, createContext } from 'react';
import { useProjectStore } from '../store/useProjectStore';

/* ─── Catalog context so FieldPreviewItem can resolve catalog items ─── */
const CatalogsCtx = createContext([]);

const parseCatalogItems = (catalog) => {
  if (!catalog?.data?.trim()) return [];
  try {
    if (catalog.input_mode === 'json') {
      const parsed = JSON.parse(catalog.data);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        if (typeof item === 'string') return { id: item, label: item };
        return {
          id: String(item.id ?? item.value ?? item.key ?? ''),
          label: String(item.label ?? item.text ?? item.name ?? item.id ?? ''),
        };
      });
    }
    if (catalog.input_mode === 'lines') {
      return catalog.data.split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ id: s, label: s }));
    }
    return catalog.data.split(',').map(s => s.trim()).filter(Boolean).map(s => ({ id: s, label: s }));
  } catch { return []; }
};

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
  const navField = form.fields?.find(f => f.type === 'nav_menu');
  const logoField = form.fields?.find(f => f.type === 'image');
  const labelFields = form.fields?.filter(f => f.type === 'label') || [];
  const linkFields = form.fields?.filter(f => f.type === 'url_link') || [];
  const buttonFields = form.fields?.filter(f => f.type === 'button') || [];

  return (
    <div style={{ background: '#161b22', borderBottom: '1px solid #21262d', padding: '0 20px', display: 'flex', alignItems: 'center', minHeight: 56, gap: 16, flexWrap: 'wrap' }}>
      {/* Logo / brand */}
      {logoField ? (
        <div style={{ width: 32, height: 32, background: '#21262d', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🖼</div>
      ) : (
        <span style={{ fontWeight: 700, fontSize: 15, color: '#e6edf3', flexShrink: 0 }}>{form.title}</span>
      )}

      {/* Nav menu */}
      {navField && (
        <nav style={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
          {['Inicio', 'Módulo 1', 'Módulo 2', 'Perfil'].map((item, i) => (
            <a key={item} href="#" style={{ fontSize: 13, color: i === 0 ? '#e6edf3' : '#8b949e', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, borderBottom: i === 0 ? '2px solid #388bfd' : '2px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#21262d'; e.currentTarget.style.color = '#e6edf3'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = i === 0 ? '#e6edf3' : '#8b949e'; }}>
              {item}
            </a>
          ))}
          <span style={{ fontSize: 10, color: '#8b949e', marginLeft: 6, fontStyle: 'italic' }}>{navField.caption}</span>
        </nav>
      )}

      {/* Label fields */}
      {labelFields.map(f => (
        <span key={f.id} style={{ fontSize: 13, color: '#c9d1d9' }}>{f.caption}</span>
      ))}

      {/* Link fields */}
      {linkFields.map(f => (
        <a key={f.id} href="#" style={{ fontSize: 13, color: '#388bfd', textDecoration: 'none' }}>{f.caption}</a>
      ))}

      {/* Buttons (right side) */}
      {buttonFields.length > 0 && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {buttonFields.map((f, i) => (
            <button key={f.id} style={{ background: i === 0 ? '#238636' : 'transparent', border: i === 0 ? 'none' : '1px solid #30363d', borderRadius: 6, color: i === 0 ? '#fff' : '#c9d1d9', padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>
              {f.caption}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!form.fields?.length && (
        <span style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>Sin campos definidos</span>
      )}
    </div>
  );
}

function MenuPreview({ form }) {
  const cfg = form.menu_config || { direction: 'horizontal', items: [] };
  const isH = cfg.direction !== 'vertical';
  const items = cfg.items || [];

  if (isH) {
    return (
      <nav style={{ background: '#161b22', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', padding: '0 24px', minHeight: 52, gap: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#e6edf3', marginRight: 24, flexShrink: 0 }}>{form.title}</span>
        {items.map((item, i) => (
          <a key={item.id} href={item.url || '#'}
            style={{ padding: '16px 14px', fontSize: 13, color: i === 0 ? '#e6edf3' : '#8b949e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, borderBottom: i === 0 ? '2px solid #388bfd' : '2px solid transparent', transition: 'color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={e => { e.currentTarget.style.color = i === 0 ? '#e6edf3' : '#8b949e'; }}>
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </a>
        ))}
        {items.length === 0 && <span style={{ fontSize: 13, color: '#8b949e', fontStyle: 'italic' }}>Sin opciones</span>}
      </nav>
    );
  }

  return (
    <nav style={{ background: '#161b22', borderRight: '1px solid #21262d', width: 220, display: 'flex', flexDirection: 'column', padding: '12px 0', minHeight: 200 }}>
      <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #21262d', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#e6edf3' }}>{form.title}</span>
      </div>
      {items.map((item, i) => (
        <a key={item.id} href={item.url || '#'}
          style={{ padding: '9px 16px', fontSize: 13, color: i === 0 ? '#e6edf3' : '#8b949e', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, borderLeft: i === 0 ? '3px solid #388bfd' : '3px solid transparent', background: i === 0 ? 'rgba(56,139,253,0.08)' : 'transparent', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,139,253,0.06)'; e.currentTarget.style.color = '#e6edf3'; }}
          onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? 'rgba(56,139,253,0.08)' : 'transparent'; e.currentTarget.style.color = i === 0 ? '#e6edf3' : '#8b949e'; }}>
          {item.icon && <span style={{ fontSize: 15 }}>{item.icon}</span>}
          <span>{item.label}</span>
        </a>
      ))}
      {items.length === 0 && <span style={{ fontSize: 13, color: '#8b949e', fontStyle: 'italic', padding: '8px 16px' }}>Sin opciones</span>}
    </nav>
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

function FieldPreviewItem({ field }) {
  if (field.type === 'hidden') return null;
  const catalogs = useContext(CatalogsCtx);
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#c9d1d9', marginBottom: 6 };
  const inputStyle = { background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', fontFamily: 'inherit' };

  // Resolve catalog items for selection fields
  const getCatalogItems = () => {
    if (field.lookup?.catalog_id) {
      const cat = catalogs.find(c => c.id === field.lookup.catalog_id);
      if (cat) return parseCatalogItems(cat);
    }
    if (field.lookup?.lov) {
      return field.lookup.lov.split(';').map(opt => {
        const [id, label] = opt.split('=');
        return { id: id?.trim() || '', label: label?.trim() || id?.trim() || '' };
      }).filter(o => o.id);
    }
    return null; // null = use BD placeholder
  };

  const control = (() => {
    if (field.type === 'textarea') return <textarea readOnly style={{ ...inputStyle, resize: 'none' }} value={mockValue(field.type)} rows={field.rows || 3} />;
    if (field.type === 'radio') {
      const items = getCatalogItems();
      const radioItems = items || [{ id: '1', label: 'Sí' }, { id: '2', label: 'No' }];
      return (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {radioItems.map((opt, i) => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#c9d1d9', cursor: 'pointer' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #388bfd', background: i === 0 ? '#388bfd' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i === 0 && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
              </div>
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    if (field.type === 'checkbox') {
      const items = getCatalogItems();
      if (items && items.length > 1) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((opt, i) => (
              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid #388bfd', background: i === 0 ? '#388bfd22' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i === 0 && <span style={{ fontSize: 10, color: '#388bfd' }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: '#c9d1d9' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, border: '2px solid #388bfd', background: 'transparent' }} />
          <span style={{ fontSize: 13, color: '#c9d1d9' }}>{field.caption}</span>
        </label>
      );
    }
    if (field.type === 'listbox' || field.type === 'multiselect') {
      const items = getCatalogItems();
      const firstLabel = items ? (items[0]?.label || 'Seleccionar...') : '▼ Datos desde BD';
      return (
        <div style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: items ? '#e6edf3' : '#8b949e' }}>{firstLabel}</span>
          <span style={{ fontSize: 10 }}>▼</span>
        </div>
      );
    }
    if (field.type === 'button') return <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '8px 20px', fontSize: 13, cursor: 'pointer' }}>{field.caption || 'Guardar'}</button>;
    if (field.type === 'url_link') return <a href="#" style={{ color: '#388bfd', fontSize: 13, textDecoration: 'underline' }}>{field.caption || '→ Ver más'}</a>;
    if (field.type === 'label') return <div style={{ fontSize: 13, color: '#e6edf3', fontStyle: 'italic' }}>{field.caption}</div>;
    if (field.type === 'file') return <div style={{ ...inputStyle, background: '#0d1117', border: '2px dashed #21262d', display: 'flex', alignItems: 'center', gap: 10, color: '#8b949e' }}>📎 Seleccionar archivo...</div>;
    if (field.type === 'timeline') {
      const isH = (field.timeline_config?.orientation || 'horizontal') === 'horizontal';
      const events = (field.timeline_config?.events?.length > 0)
        ? field.timeline_config.events
        : ['Evento 1', 'Evento 2', 'Evento 3'];
      if (isH) return (
        <div style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', overflowX: 'auto' }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 80 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: i === 0 ? '#bc8cff' : i === 1 ? '#388bfd' : '#21262d', border: `2px solid ${i <= 1 ? '#bc8cff' : '#30363d'}`, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: i <= 1 ? '#c9d1d9' : '#8b949e', textAlign: 'center', whiteSpace: 'nowrap' }}>{ev}</span>
              </div>
              {i < events.length - 1 && <div style={{ flex: 1, height: 2, background: i === 0 ? '#bc8cff' : '#21262d', margin: '0 4px', marginBottom: 22 }} />}
            </div>
          ))}
        </div>
      );
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '4px 0' }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: i <= 1 ? '#bc8cff' : '#21262d', border: `2px solid ${i <= 1 ? '#bc8cff' : '#30363d'}`, flexShrink: 0 }} />
                {i < events.length - 1 && <div style={{ width: 2, height: 24, background: i === 0 ? '#bc8cff' : '#21262d' }} />}
              </div>
              <div style={{ paddingBottom: i < events.length - 1 ? 0 : 0 }}>
                <span style={{ fontSize: 13, color: i <= 1 ? '#e6edf3' : '#8b949e' }}>{ev}</span>
                {i === 1 && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 2 }}>En proceso — actualización en curso</div>}
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (field.type === 'tabla') {
      const cat = catalogs.find(c => c.id === field.tabla_config?.catalog_id);
      const cols = cat?.columns || [];
      return (
        <div style={{ border: '1px solid #21262d', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'flex', background: '#21262d' }}>
            {cols.length === 0
              ? <div style={{ padding: '8px 12px', fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>Sin catálogo tabla asignado</div>
              : cols.map(col => (
                  <div key={col.id} style={{ flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#3fb950', borderRight: '1px solid #30363d' }}>
                    {col.label || col.name}
                  </div>
                ))
            }
          </div>
          {/* 3 empty data rows */}
          {cols.length > 0 && [0, 1, 2].map(row => (
            <div key={row} style={{ display: 'flex', borderTop: '1px solid #21262d', background: row % 2 === 0 ? '#0d1117' : '#161b22' }}>
              {cols.map(col => (
                <div key={col.id} style={{ flex: 1, padding: '7px 12px', fontSize: 12, color: '#484f58', borderRight: '1px solid #21262d', fontStyle: 'italic' }}>—</div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    return <input readOnly value={mockValue(field.type, field.lookup)} style={inputStyle} />;
  })();

  const isTablaField = field.type === 'tabla';
  return (
    <div>
      {field.type !== 'button' && field.type !== 'url_link' && field.type !== 'label' && field.type !== 'checkbox' && field.type !== 'timeline' && field.type !== 'tabla' && (
        <label style={labelStyle}>
          {field.caption}{field.required && <span style={{ color: '#f85149', marginLeft: 3 }}>*</span>}
          {field.is_pk && <span style={{ marginLeft: 6, fontSize: 10, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace", background: '#fbbf2422', padding: '1px 5px', borderRadius: 3 }}>PK</span>}
        </label>
      )}
      {(field.type === 'timeline' || isTablaField) && (
        <label style={labelStyle}>{field.caption}</label>
      )}
      {control}
      {field.help_text && <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>ℹ️ {field.help_text}</div>}
    </div>
  );
}

function WizardPreview({ form }) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = form.wizard_config?.steps || ['Paso 1', 'Paso 2', 'Confirmación'];
  const stepFields = (form.fields || []).filter(f => (f.wizard_step ?? 0) === activeStep);
  return (
    <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#1c2128', borderBottom: '1px solid #21262d', padding: '16px 24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>{form.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                onClick={() => setActiveStep(i)}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  background: i === activeStep ? '#388bfd' : i < activeStep ? '#238636' : '#21262d',
                  color: i <= activeStep ? '#fff' : '#8b949e',
                  boxShadow: i === activeStep ? '0 0 0 3px rgba(56,139,253,0.2)' : 'none',
                }}>
                  {i < activeStep ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === activeStep ? '#388bfd' : '#8b949e', whiteSpace: 'nowrap' }}>{step}</span>
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < activeStep ? '#238636' : '#21262d', margin: '0 6px', marginBottom: 20 }} />}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 80 }}>
        {stepFields.length === 0
          ? <div style={{ textAlign: 'center', padding: '24px 0', color: '#8b949e', fontSize: 13 }}>Sin campos en este paso</div>
          : stepFields.map(f => <FieldPreviewItem key={f.id} field={f} />)}
      </div>
      <div style={{ borderTop: '1px solid #21262d', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', background: '#1c2128' }}>
        <button onClick={() => setActiveStep(s => Math.max(0, s - 1))}
          style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: activeStep === 0 ? '#30363d' : '#8b949e', padding: '7px 18px', fontSize: 13, cursor: activeStep === 0 ? 'default' : 'pointer' }}
          disabled={activeStep === 0}>← Anterior</button>
        <span style={{ fontSize: 12, color: '#8b949e', alignSelf: 'center' }}>Paso {activeStep + 1} de {steps.length}</span>
        <button onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))}
          style={{ background: activeStep === steps.length - 1 ? '#238636' : '#388bfd', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>
          {activeStep === steps.length - 1 ? 'Finalizar ✓' : 'Siguiente →'}
        </button>
      </div>
    </div>
  );
}

function TabsPreview({ form }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = form.tabs_config?.tabs || ['Pestaña 1', 'Pestaña 2'];
  const tabFields = (form.fields || []).filter(f => (f.tab_index ?? 0) === activeTab);
  return (
    <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ borderBottom: '2px solid #21262d', display: 'flex', background: '#1c2128', flexWrap: 'wrap' }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{
              padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: i === activeTab ? 600 : 400,
              color: i === activeTab ? '#e6edf3' : '#8b949e',
              borderBottom: i === activeTab ? '2px solid #388bfd' : '2px solid transparent', marginBottom: -2,
            }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 80 }}>
        {tabFields.length === 0
          ? <div style={{ textAlign: 'center', padding: '24px 0', color: '#8b949e', fontSize: 13 }}>Sin campos en esta pestaña</div>
          : tabFields.map(f => <FieldPreviewItem key={f.id} field={f} />)}
      </div>
      {form.operations?.allow_insert && (
        <div style={{ borderTop: '1px solid #21262d', padding: '12px 24px', display: 'flex', justifyContent: 'flex-end', background: '#1c2128', gap: 8 }}>
          <button style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: 'pointer' }}>Guardar</button>
        </div>
      )}
    </div>
  );
}

function TimelinePreview({ form }) {
  const [activeEvent, setActiveEvent] = useState(0);
  const events = form.timeline_config?.events || ['Inicio', 'Completado'];
  const isH = (form.timeline_config?.orientation || 'horizontal') === 'horizontal';
  const eventFields = (form.fields || []).filter(f => (f.timeline_event ?? 0) === activeEvent);

  const dot = (i) => (
    <div style={{
      width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: i === activeEvent ? '#bc8cff' : i < activeEvent ? '#3fb950' : '#21262d',
      border: `2px solid ${i === activeEvent ? '#bc8cff' : i < activeEvent ? '#3fb950' : '#30363d'}`,
      boxShadow: i === activeEvent ? '0 0 0 3px rgba(188,140,255,0.2)' : 'none',
      fontSize: 10, fontWeight: 700, color: i <= activeEvent ? '#fff' : '#8b949e', flexShrink: 0,
      cursor: 'pointer',
    }} onClick={() => setActiveEvent(i)}>
      {i < activeEvent ? '✓' : i + 1}
    </div>
  );

  return (
    <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: '#1c2128', borderBottom: '1px solid #21262d', padding: '16px 24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#e6edf3' }}>{form.title}</h3>
        {isH ? (
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 70 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  {dot(i)}
                  <span style={{ fontSize: 11, color: i === activeEvent ? '#bc8cff' : '#8b949e', whiteSpace: 'nowrap', textAlign: 'center' }}>{ev}</span>
                </div>
                {i < events.length - 1 && <div style={{ flex: 1, height: 2, background: i < activeEvent ? '#3fb950' : '#21262d', margin: '0 4px', marginBottom: 22 }} />}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {dot(i)}
                  {i < events.length - 1 && <div style={{ width: 2, height: 20, background: i < activeEvent ? '#3fb950' : '#21262d' }} />}
                </div>
                <span style={{ fontSize: 13, color: i === activeEvent ? '#bc8cff' : '#8b949e', paddingTop: 2, cursor: 'pointer' }} onClick={() => setActiveEvent(i)}>{ev}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#bc8cff' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#bc8cff' }}>{events[activeEvent]}</span>
        <span style={{ fontSize: 12, color: '#8b949e' }}>— {eventFields.length} campo(s)</span>
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 80 }}>
        {eventFields.length === 0
          ? <div style={{ textAlign: 'center', padding: '20px 0', color: '#8b949e', fontSize: 13 }}>Sin campos en este evento</div>
          : eventFields.map(f => <FieldPreviewItem key={f.id} field={f} />)}
      </div>
      <div style={{ borderTop: '1px solid #21262d', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', background: '#1c2128' }}>
        <button onClick={() => setActiveEvent(e => Math.max(0, e - 1))}
          style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: activeEvent === 0 ? '#30363d' : '#8b949e', padding: '7px 18px', fontSize: 13, cursor: activeEvent === 0 ? 'default' : 'pointer' }}
          disabled={activeEvent === 0}>← Anterior</button>
        <span style={{ fontSize: 12, color: '#8b949e', alignSelf: 'center' }}>{activeEvent + 1} / {events.length}</span>
        <button onClick={() => setActiveEvent(e => Math.min(events.length - 1, e + 1))}
          style={{ background: activeEvent === events.length - 1 ? '#238636' : '#bc8cff', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 18px', fontSize: 13, cursor: activeEvent === events.length - 1 ? 'default' : 'pointer' }}>
          {activeEvent === events.length - 1 ? 'Completado ✓' : 'Siguiente →'}
        </button>
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
  const { currentProject } = useProjectStore();
  const catalogs = currentProject?.catalogs || [];

  const widths = { desktop: '100%', tablet: 768, mobile: 375 };
  const w = widths[viewport];

  if (form.type === 'menu') {
    return (
      <div style={{ flex: 1, overflow: 'auto', background: '#0a0f16', padding: '24px 32px' }}>
        <MenuPreview form={form} />
      </div>
    );
  }

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

  if (form.type === 'wizard' || form.type === 'tabs' || form.type === 'timeline') {
    return (
      <CatalogsCtx.Provider value={catalogs}>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px', background: '#0a0f16' }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {form.type === 'wizard' && <WizardPreview form={form} />}
            {form.type === 'tabs' && <TabsPreview form={form} />}
            {form.type === 'timeline' && <TimelinePreview form={form} />}
          </div>
        </div>
      </CatalogsCtx.Provider>
    );
  }

  return (
    <CatalogsCtx.Provider value={catalogs}>
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
              <FieldPreviewItem key={field.id} field={field} />
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
                <FieldPreviewItem key={field.id} field={field} />
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
    </CatalogsCtx.Provider>
  );
}
