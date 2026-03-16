import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useProjectStore } from '../store/useProjectStore';
import { fieldTypeColor, FIELD_TYPES } from '../utils/schema';
import { GripVertical, Plus, Star, Eye, EyeOff, List } from 'lucide-react';

const FieldTypeLabel = ({ type }) => {
  const t = FIELD_TYPES.find(f => f.value === type);
  return (
    <span className="badge" style={{ background: fieldTypeColor(type) + '22', color: fieldTypeColor(type) }}>
      {t?.label || type}
    </span>
  );
};

const FieldControl = ({ field }) => {
  const catalogs = useProjectStore(s => s.currentProject?.catalogs || []);
  const baseStyle = { background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#8b949e', width: '100%' };
  switch (field.type) {
    case 'textarea':
      return <div style={{ ...baseStyle, minHeight: 50, fontStyle: 'italic' }}>{field.placeholder || 'Área de texto...'}</div>;
    case 'listbox': case 'multiselect':
      return (
        <div style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{field.placeholder || 'Seleccionar...'}</span>
          <List size={11} />
        </div>
      );
    case 'radio':
      return (
        <div style={{ display: 'flex', gap: 12 }}>
          {['Opción 1', 'Opción 2'].map(o => (
            <label key={o} style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12, color: '#8b949e' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #21262d' }} /> {o}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#8b949e' }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, border: '2px solid #21262d' }} />
          {field.caption}
        </label>
      );
    case 'hidden':
      return <div style={{ ...baseStyle, background: '#161b22', color: '#8b949e', fontStyle: 'italic', fontSize: 11 }}>🔒 campo oculto</div>;
    case 'label':
      return <div style={{ fontSize: 13, color: '#e6edf3', fontStyle: 'italic' }}>{field.caption}</div>;
    case 'date': case 'datetime':
      return <div style={{ ...baseStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>DD/MM/AAAA</span><span>📅</span></div>;
    case 'password':
      return <div style={{ ...baseStyle, letterSpacing: 4 }}>••••••</div>;
    case 'number': case 'currency': case 'percentage':
      return <div style={{ ...baseStyle }}>{field.type === 'currency' ? '$ 0.00' : field.type === 'percentage' ? '0%' : '0'}</div>;
    case 'url_link':
      return <div style={{ fontSize: 12, color: '#388bfd', textDecoration: 'underline' }}>{field.caption || '→ Enlace'}</div>;
    case 'button':
      return <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '5px 14px', fontSize: 12, cursor: 'default' }}>{field.caption || 'Botón'}</button>;
    case 'file':
      return <div style={{ ...baseStyle, display: 'flex', gap: 8, alignItems: 'center' }}><span>📎</span><span>Seleccionar archivo...</span></div>;
    case 'nav_menu':
      return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {['Inicio', 'Módulo 1', 'Módulo 2', 'Perfil'].map(item => (
            <span key={item} style={{ fontSize: 12, color: '#388bfd', cursor: 'default', padding: '3px 6px', borderRadius: 4, background: 'rgba(56,139,253,0.08)' }}>{item}</span>
          ))}
          <span style={{ fontSize: 10, color: '#8b949e', marginLeft: 4 }}>▸ según lookup / BD</span>
        </div>
      );
    case 'copyright':
      return <div style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>{field.caption || '© 2024 - Todos los derechos reservados'}</div>;
    case 'timeline': {
      const isH = (field.timeline_config?.orientation || 'horizontal') === 'horizontal';
      const items = ['Evento 1', 'Evento 2', 'Evento 3'];
      if (isH) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: i === 0 ? '#bc8cff' : '#21262d', border: '2px solid #bc8cff', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: i === 0 ? '#bc8cff' : '#8b949e', whiteSpace: 'nowrap' }}>{item}</span>
                </div>
                {i < items.length - 1 && <div style={{ flex: 1, height: 2, background: '#21262d', margin: '0 4px', marginBottom: 16 }} />}
              </div>
            ))}
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#bc8cff' : '#21262d', border: '2px solid #bc8cff', flexShrink: 0 }} />
                {i < items.length - 1 && <div style={{ width: 2, height: 20, background: '#21262d' }} />}
              </div>
              <span style={{ fontSize: 11, color: i === 0 ? '#bc8cff' : '#8b949e', paddingTop: 0 }}>{item}</span>
            </div>
          ))}
        </div>
      );
    }
    case 'tabla': {
      const cat = catalogs.find(c => c.id === field.tabla_config?.catalog_id);
      const cols = cat?.columns || [];
      return (
        <div style={{ border: '1px solid #21262d', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', background: '#21262d' }}>
            {cols.length === 0
              ? <div style={{ padding: '5px 10px', fontSize: 11, color: '#8b949e', fontStyle: 'italic' }}>Sin catálogo tabla seleccionado</div>
              : cols.map(col => (
                  <div key={col.id} style={{ flex: 1, padding: '4px 8px', fontSize: 11, color: '#3fb950', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", borderRight: '1px solid #30363d' }}>
                    {col.label || col.name}
                    <span style={{ color: '#8b949e', fontWeight: 400 }}> :{col.type}</span>
                  </div>
                ))
            }
          </div>
          {cols.length > 0 && (
            <div style={{ display: 'flex', opacity: 0.35 }}>
              {cols.map(col => (
                <div key={col.id} style={{ flex: 1, padding: '4px 8px', fontSize: 11, color: '#8b949e', borderRight: '1px solid #21262d', fontStyle: 'italic' }}>—</div>
              ))}
            </div>
          )}
        </div>
      );
    }
    default:
      return <div style={{ ...baseStyle }}>{field.placeholder || '...'}</div>;
  }
};

const HeaderFooterBanner = ({ form, page }) => {
  const { selectedNode, selectNode, addField } = useProjectStore();
  const isHeader = form.type === 'header';

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span className="badge" style={{ background: (isHeader ? '#388bfd' : '#8b949e') + '22', color: isHeader ? '#388bfd' : '#8b949e' }}>{form.type}</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        </div>
        {form.description && <p style={{ fontSize: 13, color: '#8b949e', margin: 0 }}>{form.description}</p>}
      </div>

      {/* Visual bar preview */}
      <div style={{
        background: isHeader ? '#161b22' : '#0d1117',
        border: '1px solid #21262d',
        borderRadius: 10,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        maxWidth: 700,
        flexWrap: isHeader ? 'nowrap' : 'wrap',
        justifyContent: isHeader ? 'flex-start' : 'center',
        minHeight: isHeader ? 52 : 44,
      }}>
        {form.fields?.length === 0 ? (
          <span style={{ fontSize: 12, color: '#8b949e', fontStyle: 'italic' }}>Sin componentes — agrega campos abajo</span>
        ) : form.fields.map(field => (
          <div key={field.id}
            onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id })}
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
              background: selectedNode?.id === field.id ? 'rgba(56,139,253,0.12)' : 'transparent',
              border: selectedNode?.id === field.id ? '1px solid #388bfd44' : '1px solid transparent',
            }}>
            <FieldControl field={field} />
          </div>
        ))}
      </div>

      {/* Fields list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 700 }}>
        {form.fields?.map(field => {
          const isSelected = selectedNode?.type === 'field' && selectedNode?.id === field.id;
          return (
            <div key={field.id}
              className={`field-block${isSelected ? ' selected' : ''}`}
              onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id })}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{field.caption}</span>
                  <span className="badge" style={{ background: fieldTypeColor(field.type) + '22', color: fieldTypeColor(field.type) }}>
                    {FIELD_TYPES.find(f => f.value === field.type)?.label || field.type}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{field.name}</div>
            </div>
          );
        })}
      </div>

      <button
        className="rad-btn rad-btn-secondary"
        style={{ marginTop: 16, maxWidth: 700, width: '100%', justifyContent: 'center', gap: 8 }}
        onClick={() => addField(page.id, form.id)}
      >
        <Plus size={14} /> Agregar Campo
      </button>
    </div>
  );
};

const MenuCanvas = ({ form }) => {
  const cfg = form.menu_config || { direction: 'horizontal', items: [] };
  const isH = cfg.direction !== 'vertical';
  const items = cfg.items || [];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: '#3fb95022', color: '#3fb950' }}>menu</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        <span className="badge" style={{ background: '#21262d', color: '#8b949e' }}>
          {isH ? '↔ horizontal' : '↕ vertical'}
        </span>
      </div>

      {/* Visual menu preview */}
      <div style={{ maxWidth: 700, background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: isH ? '0 8px' : '8px 0', display: 'flex', flexDirection: isH ? 'row' : 'column', alignItems: isH ? 'center' : 'stretch', gap: 0, marginBottom: 24, overflow: 'hidden', minHeight: isH ? 52 : undefined }}>
        {items.length === 0 ? (
          <div style={{ padding: '14px 20px', fontSize: 13, color: '#8b949e', fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
            Sin opciones — agrega items desde el inspector →
          </div>
        ) : items.map((item, i) => (
          <div key={item.id} style={{
            padding: isH ? '14px 16px' : '11px 20px',
            fontSize: 13, color: '#c9d1d9', cursor: 'default',
            borderRight: isH && i < items.length - 1 ? '1px solid #21262d' : 'none',
            borderBottom: !isH && i < items.length - 1 ? '1px solid #21262d' : 'none',
            display: 'flex', alignItems: 'center', gap: 8,
            background: i === 0 ? 'rgba(56,139,253,0.08)' : 'transparent',
          }}>
            {item.icon && <span style={{ fontSize: 15 }}>{item.icon}</span>}
            <span style={{ fontWeight: i === 0 ? 600 : 400, color: i === 0 ? '#388bfd' : '#c9d1d9' }}>{item.label}</span>
            {item.url && item.url !== '#' && (
              <span style={{ fontSize: 10, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", marginLeft: 'auto' }}>{item.url}</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: '#8b949e', maxWidth: 700 }}>
        💡 Edita las opciones y dirección desde el inspector de propiedades →
      </div>
    </div>
  );
};

const HeroBanner = ({ form, page }) => {
  const { selectedNode, selectNode, addField } = useProjectStore();

  const titleField    = form.fields?.find(f => f.name === 'HERO_TITULO')    || form.fields?.[0];
  const subtitleField = form.fields?.find(f => f.name === 'HERO_SUBTITULO') || form.fields?.[1];
  const ctaFields     = form.fields?.filter(f => f.type === 'button') || [];
  const otherFields   = form.fields?.filter(f => !['HERO_TITULO','HERO_SUBTITULO'].includes(f.name) && f.type !== 'button') || [];

  const isSelected = (field) => selectedNode?.type === 'field' && selectedNode?.id === field?.id;
  const selectField = (field) => field && selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id });

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: '#bc8cff22', color: '#bc8cff' }}>hero</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        {form.description && <span style={{ fontSize: 13, color: '#8b949e' }}>{form.description}</span>}
      </div>

      {/* Hero visual */}
      <div style={{ background: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)', border: '1px solid #21262d', borderRadius: 12, padding: '48px 40px', textAlign: 'center', marginBottom: 24, maxWidth: 700, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(188,140,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Title */}
        {titleField && (
          <div onClick={() => selectField(titleField)}
            style={{ cursor: 'pointer', marginBottom: 16, padding: '4px 8px', borderRadius: 6, border: isSelected(titleField) ? '1px dashed #bc8cff' : '1px dashed transparent' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#e6edf3', lineHeight: 1.2 }}>
              {titleField.caption}
            </div>
            <div style={{ fontSize: 10, color: '#8b949e', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{titleField.name}</div>
          </div>
        )}

        {/* Subtitle */}
        {subtitleField && (
          <div onClick={() => selectField(subtitleField)}
            style={{ cursor: 'pointer', marginBottom: 28, padding: '4px 8px', borderRadius: 6, border: isSelected(subtitleField) ? '1px dashed #bc8cff' : '1px dashed transparent' }}>
            <div style={{ fontSize: 15, color: '#8b949e', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              {subtitleField.caption}
            </div>
            <div style={{ fontSize: 10, color: '#8b949e', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>{subtitleField.name}</div>
          </div>
        )}

        {/* CTA buttons */}
        {ctaFields.length > 0 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {ctaFields.map((f, i) => (
              <div key={f.id} onClick={() => selectField(f)}
                style={{ cursor: 'pointer', padding: '2px', borderRadius: 8, border: isSelected(f) ? '1px dashed #bc8cff' : '1px dashed transparent' }}>
                <button style={{ background: i === 0 ? '#238636' : 'transparent', border: i === 0 ? 'none' : '1px solid #30363d', borderRadius: 6, color: i === 0 ? '#fff' : '#c9d1d9', padding: '9px 22px', fontSize: 13, cursor: 'default', fontWeight: 500 }}>
                  {f.caption}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Other free fields */}
        {otherFields.map(f => (
          <div key={f.id} onClick={() => selectField(f)}
            style={{ marginTop: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, border: isSelected(f) ? '1px dashed #bc8cff' : '1px dashed transparent' }}>
            <FieldControl field={f} />
            <div style={{ fontSize: 10, color: '#8b949e', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{f.name}</div>
          </div>
        ))}

        {form.fields?.length === 0 && (
          <div style={{ color: '#8b949e', fontSize: 13, fontStyle: 'italic' }}>Sin campos — agrega campos abajo</div>
        )}
      </div>

      {/* Fields list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 700 }}>
        {form.fields?.map(field => {
          const sel = isSelected(field);
          return (
            <div key={field.id} className={`field-block${sel ? ' selected' : ''}`} onClick={() => selectField(field)}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{field.caption}</span>
                  <span className="badge" style={{ background: fieldTypeColor(field.type) + '22', color: fieldTypeColor(field.type) }}>
                    {FIELD_TYPES.find(f => f.value === field.type)?.label || field.type}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{field.name}</div>
            </div>
          );
        })}
      </div>

      <button className="rad-btn rad-btn-secondary"
        style={{ marginTop: 16, maxWidth: 700, width: '100%', justifyContent: 'center', gap: 8 }}
        onClick={() => addField(page.id, form.id)}>
        <Plus size={14} /> Agregar Campo
      </button>
    </div>
  );
};

const ModalCanvas = ({ form, page }) => {
  const { selectedNode, selectNode, reorderFields, addField } = useProjectStore();

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const fields = Array.from(form.fields);
    const [moved] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, moved);
    reorderFields(page.id, form.id, fields);
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: '#fbbf2422', color: '#fbbf24' }}>modal</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        {form.description && <span style={{ fontSize: 13, color: '#8b949e' }}>{form.description}</span>}
      </div>

      {/* Modal frame */}
      <div style={{ maxWidth: 560, background: '#0d1117', borderRadius: 4, border: '1px solid #30363d', overflow: 'hidden', boxShadow: '0 0 0 1px #21262d, 0 8px 32px rgba(0,0,0,0.6)', marginBottom: 24 }}>
        {/* Modal title bar */}
        <div style={{ background: '#161b22', borderBottom: '1px solid #21262d', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#e6edf3' }}>{form.title}</span>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#21262d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#8b949e', cursor: 'default' }}>✕</div>
        </div>

        {/* Fields inside modal */}
        <div style={{ padding: '20px' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="modal-fields">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.fields?.length === 0 && (
                    <div style={{ border: '2px dashed #21262d', borderRadius: 8, padding: '32px 16px', textAlign: 'center', color: '#8b949e', fontSize: 13 }}>
                      Usa el botón + para agregar campos al modal
                    </div>
                  )}
                  {form.fields?.map((field, index) => {
                    const isSelected = selectedNode?.type === 'field' && selectedNode?.id === field.id;
                    return (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(prov, snapshot) => (
                          <div ref={prov.innerRef} {...prov.draggableProps}
                            className={`field-block${isSelected ? ' selected' : ''}`}
                            style={{ ...prov.draggableProps.style, opacity: snapshot.isDragging ? 0.7 : 1, alignItems: 'flex-start' }}
                            onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id })}>
                            <div {...prov.dragHandleProps} style={{ paddingTop: 2, color: '#8b949e', cursor: 'grab', flexShrink: 0 }}>
                              <GripVertical size={14} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{field.caption}</span>
                                {field.required && <span style={{ color: '#f85149', fontSize: 13 }}>*</span>}
                                <FieldTypeLabel type={field.type} />
                              </div>
                              <FieldControl field={field} />
                            </div>
                            <div style={{ fontSize: 10, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, paddingTop: 2 }}>{field.name}</div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Modal footer buttons */}
        <div style={{ borderTop: '1px solid #21262d', padding: '12px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end', background: '#161b22' }}>
          <button style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: '#8b949e', padding: '6px 16px', fontSize: 12, cursor: 'default' }}>Cancelar</button>
          <button style={{ background: '#238636', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 16px', fontSize: 12, cursor: 'default' }}>Aceptar</button>
        </div>
      </div>

      <button className="rad-btn rad-btn-secondary"
        style={{ maxWidth: 560, width: '100%', justifyContent: 'center', gap: 8 }}
        onClick={() => addField(page.id, form.id)}>
        <Plus size={14} /> Agregar Campo
      </button>
    </div>
  );
};

/* ─── Shared: DnD field list for wizard / tabs / timeline ─── */
const SlottedFieldList = ({ form, page, slotKey, slotIndex, droppableId, emptyLabel }) => {
  const { selectedNode, selectNode, reorderFields } = useProjectStore();
  const slotFields = (form.fields || []).filter(f => (f[slotKey] ?? 0) === slotIndex);

  const onDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const srcField = slotFields[result.source.index];
    const dstField = slotFields[result.destination.index];
    const allFields = [...form.fields];
    const srcIdx = allFields.indexOf(srcField);
    const dstIdx = allFields.indexOf(dstField);
    allFields.splice(srcIdx, 1);
    allFields.splice(dstIdx, 0, srcField);
    reorderFields(page.id, form.id, allFields);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 700, minHeight: 40 }}>
            {slotFields.length === 0 && (
              <div style={{ border: '2px dashed #21262d', borderRadius: 10, padding: '28px 24px', textAlign: 'center', color: '#8b949e', fontSize: 13 }}>
                {emptyLabel}
              </div>
            )}
            {slotFields.map((field, index) => {
              const isSelected = selectedNode?.type === 'field' && selectedNode?.id === field.id;
              return (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(prov, snapshot) => (
                    <div ref={prov.innerRef} {...prov.draggableProps}
                      className={`field-block${isSelected ? ' selected' : ''}`}
                      style={{ ...prov.draggableProps.style, opacity: snapshot.isDragging ? 0.7 : 1, alignItems: 'flex-start' }}
                      onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id })}>
                      <div {...prov.dragHandleProps} style={{ paddingTop: 2, color: '#8b949e', cursor: 'grab', flexShrink: 0 }}>
                        <GripVertical size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{field.caption}</span>
                          {field.required && <span style={{ color: '#f85149', fontSize: 13 }}>*</span>}
                          <FieldTypeLabel type={field.type} />
                        </div>
                        <FieldControl field={field} />
                      </div>
                      <div style={{ fontSize: 10, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, paddingTop: 2 }}>{field.name}</div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const WizardCanvas = ({ form, page }) => {
  const { addField } = useProjectStore();
  const steps = form.wizard_config?.steps || ['Paso 1', 'Paso 2', 'Confirmación'];
  const [activeStep, setActiveStep] = useState(0);

  const stepFieldCount = (i) => (form.fields || []).filter(f => (f.wizard_step ?? 0) === i).length;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: '#388bfd22', color: '#388bfd' }}>wizard</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        <span style={{ fontSize: 12, color: '#8b949e' }}>Paso {activeStep + 1} de {steps.length}</span>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', maxWidth: 700, marginBottom: 24 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              onClick={() => setActiveStep(i)}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, position: 'relative',
                background: i === activeStep ? '#388bfd' : '#21262d',
                color: i === activeStep ? '#fff' : '#8b949e',
                border: i === activeStep ? '2px solid #388bfd' : '2px solid transparent',
                boxShadow: i === activeStep ? '0 0 0 3px rgba(56,139,253,0.2)' : 'none',
              }}>
                {i + 1}
                {stepFieldCount(i) > 0 && (
                  <div style={{ position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', background: '#238636', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {stepFieldCount(i)}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 11, color: i === activeStep ? '#388bfd' : '#8b949e', whiteSpace: 'nowrap', textAlign: 'center' }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: '#21262d', margin: '0 8px', marginBottom: 22 }} />
            )}
          </div>
        ))}
      </div>

      {/* Fields for active step */}
      <SlottedFieldList
        form={form} page={page}
        slotKey="wizard_step" slotIndex={activeStep}
        droppableId={`wizard-step-${activeStep}`}
        emptyLabel={`Sin campos en "${steps[activeStep]}" — usa el botón + para agregar`}
      />

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', maxWidth: 700, marginTop: 16 }}>
        <button onClick={() => setActiveStep(s => Math.max(0, s - 1))}
          style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: 6, color: activeStep === 0 ? '#30363d' : '#8b949e', padding: '6px 16px', fontSize: 12, cursor: activeStep === 0 ? 'default' : 'pointer', opacity: activeStep === 0 ? 0.4 : 1 }}>
          ← Anterior
        </button>
        <button className="rad-btn rad-btn-secondary" style={{ fontSize: 12 }}
          onClick={() => addField(page.id, form.id, { wizard_step: activeStep })}>
          <Plus size={12} /> Agregar a "{steps[activeStep]}"
        </button>
        <button onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))}
          style={{ background: activeStep === steps.length - 1 ? '#238636' : '#388bfd', border: 'none', borderRadius: 6, color: '#fff', padding: '6px 16px', fontSize: 12, cursor: activeStep === steps.length - 1 ? 'default' : 'pointer' }}>
          {activeStep === steps.length - 1 ? 'Finalizar ✓' : 'Siguiente →'}
        </button>
      </div>
    </div>
  );
};

const TabsCanvas = ({ form, page }) => {
  const { addField } = useProjectStore();
  const tabs = form.tabs_config?.tabs || ['Pestaña 1', 'Pestaña 2'];
  const [activeTab, setActiveTab] = useState(0);

  const tabFieldCount = (i) => (form.fields || []).filter(f => (f.tab_index ?? 0) === i).length;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: '#d9770622', color: '#d97706' }}>tabs</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid #21262d', maxWidth: 700, marginBottom: 20, gap: 0, flexWrap: 'wrap' }}>
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: i === activeTab ? 600 : 400,
              color: i === activeTab ? '#e6edf3' : '#8b949e',
              borderBottom: i === activeTab ? '2px solid #388bfd' : '2px solid transparent',
              marginBottom: -2, position: 'relative',
            }}>
            {tab}
            {tabFieldCount(i) > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, background: i === activeTab ? '#388bfd33' : '#21262d', color: i === activeTab ? '#388bfd' : '#8b949e', borderRadius: 8, padding: '1px 5px' }}>
                {tabFieldCount(i)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Fields for active tab */}
      <SlottedFieldList
        form={form} page={page}
        slotKey="tab_index" slotIndex={activeTab}
        droppableId={`tab-${activeTab}`}
        emptyLabel={`Sin campos en "${tabs[activeTab]}" — usa el botón + para agregar`}
      />

      <button className="rad-btn rad-btn-secondary" style={{ marginTop: 16, maxWidth: 700, width: '100%', justifyContent: 'center', gap: 8 }}
        onClick={() => addField(page.id, form.id, { tab_index: activeTab })}>
        <Plus size={14} /> Agregar a "{tabs[activeTab]}"
      </button>
    </div>
  );
};

const TimelineCanvas = ({ form, page }) => {
  const { addField } = useProjectStore();
  const events = form.timeline_config?.events || ['Inicio', 'Completado'];
  const isH = (form.timeline_config?.orientation || 'horizontal') === 'horizontal';
  const [activeEvent, setActiveEvent] = useState(0);

  const eventFieldCount = (i) => (form.fields || []).filter(f => (f.timeline_event ?? 0) === i).length;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="badge" style={{ background: '#bc8cff22', color: '#bc8cff' }}>timeline</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        <span className="badge" style={{ background: '#21262d', color: '#8b949e' }}>{isH ? '↔ horizontal' : '↕ vertical'}</span>
      </div>

      {/* Timeline indicator */}
      {isH ? (
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 700, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 80 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                onClick={() => setActiveEvent(i)}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === activeEvent ? '#bc8cff' : '#21262d',
                  border: `2px solid ${i === activeEvent ? '#bc8cff' : '#30363d'}`,
                  boxShadow: i === activeEvent ? '0 0 0 3px rgba(188,140,255,0.2)' : 'none',
                  position: 'relative', flexShrink: 0, fontSize: 11, fontWeight: 700,
                  color: i === activeEvent ? '#fff' : '#8b949e',
                }}>
                  {i + 1}
                  {eventFieldCount(i) > 0 && (
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 14, height: 14, borderRadius: '50%', background: '#238636', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {eventFieldCount(i)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: i === activeEvent ? '#bc8cff' : '#8b949e', whiteSpace: 'nowrap', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev}</span>
              </div>
              {i < events.length - 1 && (
                <div style={{ flex: 1, height: 2, background: '#21262d', margin: '0 6px', marginBottom: 22 }} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, maxWidth: 700, marginBottom: 28 }}>
          {/* Vertical timeline sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flexShrink: 0, paddingTop: 4 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}
                onClick={() => setActiveEvent(i)}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === activeEvent ? '#bc8cff' : '#21262d',
                    border: `2px solid ${i === activeEvent ? '#bc8cff' : '#30363d'}`,
                    boxShadow: i === activeEvent ? '0 0 0 3px rgba(188,140,255,0.2)' : 'none',
                    fontSize: 11, fontWeight: 700, color: i === activeEvent ? '#fff' : '#8b949e', flexShrink: 0, position: 'relative',
                  }}>
                    {i + 1}
                    {eventFieldCount(i) > 0 && (
                      <div style={{ position: 'absolute', top: -5, right: -5, width: 13, height: 13, borderRadius: '50%', background: '#238636', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {eventFieldCount(i)}
                      </div>
                    )}
                  </div>
                  {i < events.length - 1 && <div style={{ width: 2, height: 36, background: '#21262d' }} />}
                </div>
                <span style={{ fontSize: 12, color: i === activeEvent ? '#bc8cff' : '#8b949e', marginLeft: 10, paddingTop: 4, whiteSpace: 'nowrap' }}>{ev}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#8b949e', alignSelf: 'flex-start', paddingTop: 8 }}>
            ← Selecciona un evento para ver / editar sus campos
          </div>
        </div>
      )}

      {/* Active event label */}
      <div style={{ maxWidth: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#bc8cff' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#bc8cff' }}>{events[activeEvent]}</span>
        <span style={{ fontSize: 12, color: '#8b949e' }}>— {eventFieldCount(activeEvent)} campo(s)</span>
      </div>

      {/* Fields for active event */}
      <SlottedFieldList
        form={form} page={page}
        slotKey="timeline_event" slotIndex={activeEvent}
        droppableId={`timeline-event-${activeEvent}`}
        emptyLabel={`Sin campos en "${events[activeEvent]}" — usa el botón + para agregar`}
      />

      <button className="rad-btn rad-btn-secondary" style={{ marginTop: 16, maxWidth: 700, width: '100%', justifyContent: 'center', gap: 8 }}
        onClick={() => addField(page.id, form.id, { timeline_event: activeEvent })}>
        <Plus size={14} /> Agregar a "{events[activeEvent]}"
      </button>
    </div>
  );
};

export default function EditorCanvas({ page, form }) {
  const { selectedNode, selectNode, reorderFields } = useProjectStore();

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const fields = Array.from(form.fields);
    const [moved] = fields.splice(result.source.index, 1);
    fields.splice(result.destination.index, 0, moved);
    reorderFields(page.id, form.id, fields);
  };

  const { addField } = useProjectStore();

  if (form.type === 'header' || form.type === 'footer') {
    return <HeaderFooterBanner form={form} page={page} />;
  }
  if (form.type === 'menu') {
    return <MenuCanvas form={form} />;
  }
  if (form.type === 'hero') {
    return <HeroBanner form={form} page={page} />;
  }
  if (form.type === 'modal') {
    return <ModalCanvas form={form} page={page} />;
  }
  if (form.type === 'wizard') {
    return <WizardCanvas form={form} page={page} />;
  }
  if (form.type === 'tabs') {
    return <TabsCanvas form={form} page={page} />;
  }
  if (form.type === 'timeline') {
    return <TimelineCanvas form={form} page={page} />;
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
      {/* Form header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span className="badge" style={{ background: '#d97706' + '22', color: '#d97706' }}>{form.type}</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e6edf3', margin: 0 }}>{form.title}</h2>
        </div>
        {form.description && <p style={{ fontSize: 13, color: '#8b949e', margin: 0 }}>{form.description}</p>}
      </div>

      {/* Fields */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 700 }}>
              {form.fields?.length === 0 && (
                <div style={{ border: '2px dashed #21262d', borderRadius: 10, padding: '40px 24px', textAlign: 'center', color: '#8b949e', fontSize: 13 }}>
                  Arrastra tipos de campo o usa el botón + para agregar campos
                </div>
              )}
              {form.fields?.map((field, index) => {
                const isSelected = selectedNode?.type === 'field' && selectedNode?.id === field.id;
                return (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`field-block${isSelected ? ' selected' : ''}`}
                        style={{ ...prov.draggableProps.style, opacity: snapshot.isDragging ? 0.7 : 1, alignItems: 'flex-start' }}
                        onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id })}
                      >
                        {/* Drag handle */}
                        <div {...prov.dragHandleProps} style={{ paddingTop: 2, color: '#8b949e', cursor: 'grab', flexShrink: 0 }}>
                          <GripVertical size={14} />
                        </div>

                        {/* Field content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{field.caption}</span>
                            {field.required && <span style={{ color: '#f85149', fontSize: 13 }}>*</span>}
                            {field.is_pk && <Star size={11} color="#fbbf24" fill="#fbbf24" />}
                            <FieldTypeLabel type={field.type} />
                            {field.type === 'hidden' && <EyeOff size={11} color="#8b949e" />}
                          </div>
                          <FieldControl field={field} />
                          {field.help_text && (
                            <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>{field.help_text}</div>
                          )}
                          {/* Badges row */}
                          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                            {field.data_source && (
                              <span className="badge" style={{ background: '#21262d', color: '#8b949e' }}>{field.data_source}</span>
                            )}
                            {field.lookup?.catalog_id && (
                              <span className="badge" style={{ background: '#21262d', color: '#d97706' }}>catálogo</span>
                            )}
                            {!field.lookup?.catalog_id && (field.lookup?.lov || field.lookup?.sql || field.lookup?.table) && (
                              <span className="badge" style={{ background: '#21262d', color: '#d97706' }}>lookup</span>
                            )}
                            {field.validations?.length > 0 && (
                              <span className="badge" style={{ background: '#21262d', color: '#bc8cff' }}>{field.validations.length} validación{field.validations.length > 1 ? 'es' : ''}</span>
                            )}
                            {field.display_rules?.length > 0 && (
                              <span className="badge" style={{ background: '#21262d', color: '#3fb950' }}>{field.display_rules.length} regla display</span>
                            )}
                          </div>
                        </div>

                        {/* Field name */}
                        <div style={{ fontSize: 10, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, paddingTop: 2 }}>
                          {field.name}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add field button */}
      <button
        className="rad-btn rad-btn-secondary"
        style={{ marginTop: 16, maxWidth: 700, width: '100%', justifyContent: 'center', gap: 8 }}
        onClick={() => addField(page.id, form.id)}
      >
        <Plus size={14} /> Agregar Campo
      </button>
    </div>
  );
}
