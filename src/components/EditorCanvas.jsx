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
    default:
      return <div style={{ ...baseStyle }}>{field.placeholder || '...'}</div>;
  }
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
