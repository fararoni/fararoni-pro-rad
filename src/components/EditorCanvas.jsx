import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useProjectStore } from '../store/useProjectStore';
import { fieldTypeColor, FIELD_TYPES } from '../utils/schema';
import { GripVertical, Plus, Star, Lock, Eye, EyeOff, List } from 'lucide-react';

const FieldTypeLabel = ({ type }) => {
  const t = FIELD_TYPES.find(f => f.value === type);
  return (
    <span className="badge" style={{ background: fieldTypeColor(type) + '22', color: fieldTypeColor(type) }}>
      {t?.label || type}
    </span>
  );
};

const FieldControl = ({ field }) => {
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
  if (form.type === 'hero') {
    return <HeroBanner form={form} page={page} />;
  }
  if (form.type === 'modal') {
    return <ModalCanvas form={form} page={page} />;
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
        {form.data_source?.table && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace" }}>
            📊 {form.data_source.table}
            {form.data_source.where && <span style={{ marginLeft: 8 }}>WHERE {form.data_source.where}</span>}
          </div>
        )}
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
                            {(field.lookup?.lov || field.lookup?.sql || field.lookup?.table) && (
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
