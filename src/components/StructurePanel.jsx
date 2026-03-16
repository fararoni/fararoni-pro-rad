import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronRight, ChevronDown, Plus, Trash2, Search, GripVertical } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { fieldTypeColor } from '../utils/schema';

const FormTypeIcon = ({ type }) => {
  const icons = { record: '📄', grid: '📊', menu: '☰', search: '🔍', report: '📈', header: '🔝', footer: '🔚', hero: '🌟', modal: '🪟' };
  return <span style={{ fontSize: 12 }}>{icons[type] || '📄'}</span>;
};

const FieldDot = ({ type }) => (
  <span style={{ width: 7, height: 7, borderRadius: '50%', background: fieldTypeColor(type), display: 'inline-block', flexShrink: 0 }} />
);

export default function StructurePanel() {
  const {
    currentProject, selectedNode, selectNode,
    expandedNodes, toggleNode, expandNode,
    addPage, deletePage, addForm, deleteForm, addField, deleteField,
    addModule, deleteModule, moveForm, reorderForms, movePage, reorderFields,
  } = useProjectStore();

  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  if (!currentProject) return null;

  const { pages = [], modules = [] } = currentProject;
  const projId = currentProject.meta?.spec_id;

  const isSelected = (type, id) => selectedNode?.type === type && selectedNode?.id === id;

  const handleAddPage = () => {
    addPage();
    expandNode(projId);
  };

  const handleAddModule = () => {
    const mod = addModule();
    expandNode(projId);
  };

  const handleAddPageInModule = (e, moduleId) => {
    e.stopPropagation();
    addPage(moduleId);
    expandNode(moduleId);
  };

  const handleAddForm = (e, pageId) => {
    e.stopPropagation();
    addForm(pageId);
    expandNode(pageId);
  };

  const handleAddField = (e, pageId, formId) => {
    e.stopPropagation();
    addField(pageId, formId);
    expandNode(formId);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { droppableId: srcDropId, index: srcIndex } = result.source;
    const { droppableId: dstDropId, index: dstIndex } = result.destination;

    if (result.type === 'field') {
      const [pageId, formId] = srcDropId.replace('fields-', '').split('|');
      if (srcIndex === dstIndex) return;
      const srcPage = currentProject.pages?.find(p => p.id === pageId)
        || (() => { for (const m of modules) { const pm = m.pages?.find(p => p.id === pageId); if (pm) return pm; } return null; })();
      const form = srcPage?.forms?.find(f => f.id === formId);
      if (!form) return;
      const fields = Array.from(form.fields || []);
      const [moved] = fields.splice(srcIndex, 1);
      fields.splice(dstIndex, 0, moved);
      reorderFields(pageId, formId, fields);
      return;
    }

    if (result.type === 'page') {
      const pageId = result.draggableId.replace('page-', '');
      const srcModuleId = srcDropId === 'pages-root' ? null : srcDropId.replace('pages-module-', '');
      const dstModuleId = dstDropId === 'pages-root' ? null : dstDropId.replace('pages-module-', '');
      if (srcModuleId === dstModuleId && srcIndex === dstIndex) return;
      movePage(pageId, srcModuleId, dstModuleId, dstIndex);
      return;
    }

    // type === 'form'
    const srcPageId = srcDropId.replace('forms-', '');
    const dstPageId = dstDropId.replace('forms-', '');
    if (srcPageId === dstPageId) {
      const srcPage = currentProject.pages?.find(p => p.id === srcPageId)
        || (() => { for (const m of modules) { const pm = m.pages?.find(p => p.id === srcPageId); if (pm) return pm; } return null; })();
      if (!srcPage) return;
      const forms = Array.from(srcPage.forms || []);
      const [moved] = forms.splice(srcIndex, 1);
      forms.splice(dstIndex, 0, moved);
      reorderForms(srcPageId, forms);
    } else {
      const formId = result.draggableId;
      moveForm(formId, srcPageId, dstPageId, dstIndex);
    }
  };

  const NodeBtn = ({ onClick, icon: Icon, title }) => (
    <button title={title} onClick={onClick}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center' }}
      onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
      onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
      <Icon size={12} />
    </button>
  );

  const renderPage = (page, moduleId, indent, index) => {
    const pageExpanded = expandedNodes.has(page.id);
    const pageSelected = isSelected('page', page.id);

    return (
      <Draggable key={page.id} draggableId={`page-${page.id}`} index={index}>
        {(dragProvided, dragSnapshot) => (
      <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} style={{ ...dragProvided.draggableProps.style }}>
        {/* Page row */}
        <div
          style={{
            paddingLeft: indent, padding: `4px 6px 4px ${indent}px`, borderRadius: 6, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1,
            background: dragSnapshot.isDragging ? '#1c2128' : pageSelected ? '#1c2128' : 'transparent',
            borderLeft: pageSelected ? '2px solid #388bfd' : '2px solid transparent',
          }}
          onMouseEnter={() => setHovered(`page_${page.id}`)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => { selectNode({ type: 'page', id: page.id, moduleId: moduleId || undefined }); toggleNode(page.id); }}>
          {/* Drag handle */}
          <span {...dragProvided.dragHandleProps}
            style={{ color: '#484f58', display: 'flex', alignItems: 'center', cursor: 'grab', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}>
            <GripVertical size={11} />
          </span>
          <button onClick={e => { e.stopPropagation(); toggleNode(page.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 0, display: 'flex' }}>
            {pageExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          <span style={{ fontSize: 13 }}>📄</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#e6edf3', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {page.title}
          </span>
          {hovered === `page_${page.id}` && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NodeBtn icon={Plus} title="Agregar formulario" onClick={e => handleAddForm(e, page.id)} />
              <NodeBtn icon={Trash2} title="Eliminar página" onClick={e => { e.stopPropagation(); deletePage(page.id, moduleId || undefined); }} />
            </div>
          )}
        </div>

        {/* Forms - Droppable */}
        {pageExpanded && (
          <Droppable droppableId={`forms-${page.id}`} type="form">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  paddingLeft: indent + 16,
                  background: snapshot.isDraggingOver ? 'rgba(56,139,253,0.04)' : 'transparent',
                  borderRadius: 6,
                  minHeight: 4,
                }}>
                {page.forms?.map((form, formIndex) => {
                  const formExpanded = expandedNodes.has(form.id);
                  const formSelected = isSelected('form', form.id);

                  return (
                    <Draggable key={form.id} draggableId={form.id} index={formIndex}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={{ ...dragProvided.draggableProps.style }}>
                          <div
                            style={{
                              padding: '3px 6px', borderRadius: 6, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1,
                              background: dragSnapshot.isDragging ? '#1c2128' : formSelected ? '#1c2128' : 'transparent',
                              borderLeft: formSelected ? '2px solid #d97706' : '2px solid transparent',
                            }}
                            onMouseEnter={() => setHovered(`form_${form.id}`)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => { selectNode({ type: 'form', id: form.id, pageId: page.id, moduleId: moduleId || undefined }); toggleNode(form.id); }}>
                            {/* Drag handle */}
                            <span {...dragProvided.dragHandleProps}
                              style={{ color: '#8b949e', display: 'flex', alignItems: 'center', cursor: 'grab', flexShrink: 0 }}
                              onClick={e => e.stopPropagation()}>
                              <GripVertical size={11} />
                            </span>
                            <button onClick={e => { e.stopPropagation(); toggleNode(form.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 0, display: 'flex' }}>
                              {formExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>
                            <FormTypeIcon type={form.type} />
                            <span style={{ fontSize: 11, fontWeight: 500, color: '#c9d1d9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {form.title}
                            </span>
                            <span style={{ fontSize: 9, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", background: '#21262d', padding: '1px 5px', borderRadius: 3 }}>
                              {form.type}
                            </span>
                            {hovered === `form_${form.id}` && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 4 }}>
                                <NodeBtn icon={Plus} title="Agregar campo" onClick={e => handleAddField(e, page.id, form.id)} />
                                <NodeBtn icon={Trash2} title="Eliminar formulario" onClick={e => { e.stopPropagation(); deleteForm(page.id, form.id); }} />
                              </div>
                            )}
                          </div>

                          {/* Fields */}
                          {formExpanded && (
                            <Droppable droppableId={`fields-${page.id}|${form.id}`} type="field">
                              {(fProvided, fSnapshot) => (
                                <div ref={fProvided.innerRef} {...fProvided.droppableProps}
                                  style={{ minHeight: 4, borderRadius: 6, background: fSnapshot.isDraggingOver ? 'rgba(56,139,253,0.04)' : 'transparent' }}>
                                  {form.fields?.map((field, fieldIndex) => {
                                    const fieldSelected = isSelected('field', field.id);
                                    return (
                                      <Draggable key={field.id} draggableId={`field-${field.id}`} index={fieldIndex}>
                                        {(fDrag, fDragSnap) => (
                                          <div ref={fDrag.innerRef} {...fDrag.draggableProps}
                                            style={{
                                              ...fDrag.draggableProps.style,
                                              padding: '2px 6px 2px 6px', borderRadius: 6, cursor: 'pointer',
                                              display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1,
                                              background: fDragSnap.isDragging ? '#1c2128' : fieldSelected ? '#1c2128' : 'transparent',
                                              borderLeft: fieldSelected ? '2px solid ' + fieldTypeColor(field.type) : '2px solid transparent',
                                            }}
                                            onMouseEnter={() => setHovered(`field_${field.id}`)}
                                            onMouseLeave={() => setHovered(null)}
                                            onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id, moduleId: moduleId || undefined })}>
                                            <span {...fDrag.dragHandleProps}
                                              style={{ color: '#484f58', display: 'flex', alignItems: 'center', cursor: 'grab', flexShrink: 0 }}
                                              onClick={e => e.stopPropagation()}>
                                              <GripVertical size={10} />
                                            </span>
                                            <FieldDot type={field.type} />
                                            <span style={{ fontSize: 11, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              {field.name}
                                            </span>
                                            {field.is_pk && <span style={{ fontSize: 9, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>PK</span>}
                                            {field.required && <span style={{ fontSize: 9, color: '#f85149' }}>*</span>}
                                            {hovered === `field_${field.id}` && (
                                              <NodeBtn icon={Trash2} title="Eliminar campo"
                                                onClick={e => { e.stopPropagation(); deleteField(page.id, form.id, field.id); }} />
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {fProvided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}

                          {/* Add field button */}
                          {formExpanded && (
                            <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '3px 6px 3px 20px', borderRadius: 6, width: '100%' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                              onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                              onClick={() => { addField(page.id, form.id); if (!expandedNodes.has(form.id)) toggleNode(form.id); }}>
                              <Plus size={10} /> campo
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                {/* Add form button */}
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '3px 6px', borderRadius: 6, width: '100%' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                  onClick={() => addForm(page.id)}>
                  <Plus size={10} /> formulario
                </button>
              </div>
            )}
          </Droppable>
        )}
      </div>
        )}
      </Draggable>
    );
  };

  return (
    <div style={{ width: 272, background: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="section-label">Estructura</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="rad-btn rad-btn-ghost" style={{ padding: '2px 8px', fontSize: 11, gap: 4 }} onClick={handleAddModule}>
              <Plus size={11} /> Módulo
            </button>
            <button className="rad-btn rad-btn-ghost" style={{ padding: '2px 8px', fontSize: 11, gap: 4 }} onClick={handleAddPage}>
              <Plus size={11} /> Página
            </button>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
          <input className="rad-input" style={{ paddingLeft: 26, fontSize: 12, padding: '5px 8px 5px 26px' }}
            placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tree */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 6px' }}>
          {/* Project root */}
          <div
            style={{
              padding: '5px 8px', marginBottom: 2, borderRadius: 6, cursor: 'pointer',
              background: selectedNode?.type === 'project' ? '#1c2128' : 'transparent',
              borderLeft: selectedNode?.type === 'project' ? '2px solid #388bfd' : '2px solid transparent',
            }}
            onClick={() => selectNode({ type: 'project' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚙️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentProject.meta?.name}
              </span>
            </div>
          </div>

          {/* Modules */}
          {modules.map(mod => {
            const modExpanded = expandedNodes.has(mod.id);
            const modSelected = isSelected('module', mod.id);

            return (
              <div key={mod.id}>
                {/* Module row */}
                <div
                  style={{
                    padding: '4px 6px', borderRadius: 6, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1,
                    background: modSelected ? '#1c2128' : 'transparent',
                    borderLeft: modSelected ? '2px solid #bc8cff' : '2px solid transparent',
                  }}
                  onMouseEnter={() => setHovered(`mod_${mod.id}`)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => { selectNode({ type: 'module', id: mod.id }); toggleNode(mod.id); }}>
                  <button onClick={e => { e.stopPropagation(); toggleNode(mod.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bc8cff', padding: 0, display: 'flex' }}>
                    {modExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                  <span style={{ fontSize: 13 }}>📦</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#bc8cff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mod.title}
                  </span>
                  {(mod.roles_allowed || []).length > 0 && (
                    <span style={{ fontSize: 9, color: '#bc8cff', background: 'rgba(188,140,255,0.15)', padding: '1px 5px', borderRadius: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                      {mod.roles_allowed.length}r
                    </span>
                  )}
                  {hovered === `mod_${mod.id}` && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NodeBtn icon={Plus} title="Agregar página al módulo" onClick={e => handleAddPageInModule(e, mod.id)} />
                      <NodeBtn icon={Trash2} title="Eliminar módulo" onClick={e => { e.stopPropagation(); deleteModule(mod.id); }} />
                    </div>
                  )}
                </div>

                {/* Module pages */}
                {modExpanded && (
                  <Droppable droppableId={`pages-module-${mod.id}`} type="page">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        style={{ minHeight: 4, borderRadius: 6, background: snapshot.isDraggingOver ? 'rgba(56,139,253,0.06)' : 'transparent' }}>
                        {(mod.pages || []).map((page, pageIndex) => renderPage(page, mod.id, 16, pageIndex))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}

          {/* Separator when both modules and top-level pages exist */}
          {modules.length > 0 && pages.length > 0 && (
            <div style={{ padding: '6px 8px 2px', fontSize: 9, color: '#8b949e', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              SIN MÓDULO
            </div>
          )}

          {/* Top-level pages */}
          <Droppable droppableId="pages-root" type="page">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                style={{ minHeight: 4, borderRadius: 6, background: snapshot.isDraggingOver ? 'rgba(56,139,253,0.06)' : 'transparent' }}>
                {pages.map((page, pageIndex) => renderPage(page, null, 4, pageIndex))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {pages.length === 0 && modules.length === 0 && (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: '#8b949e', fontSize: 12 }}>
              <div style={{ marginBottom: 10 }}>Sin páginas todavía</div>
              <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11 }} onClick={handleAddPage}>
                <Plus size={11} /> Agregar página
              </button>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
