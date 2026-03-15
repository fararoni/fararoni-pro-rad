import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, FileText, Layout, AlignLeft, Search } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { fieldTypeColor } from '../utils/schema';

const FormTypeIcon = ({ type }) => {
  const icons = { record: '📄', grid: '📊', menu: '☰', search: '🔍', report: '📈' };
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
  } = useProjectStore();

  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);

  if (!currentProject) return null;

  const { pages = [] } = currentProject;
  const projId = currentProject.meta?.spec_id;

  const isSelected = (type, id) => selectedNode?.type === type && selectedNode?.id === id;

  const filteredPages = search
    ? pages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.forms?.some(f => f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.fields?.some(fld => fld.name.toLowerCase().includes(search.toLowerCase()))
        )
      )
    : pages;

  const handleAddPage = () => {
    addPage();
    expandNode(projId);
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

  const NodeBtn = ({ onClick, icon: Icon, title }) => (
    <button title={title} onClick={onClick}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8b949e', padding: '2px 4px', borderRadius: 4, display: 'flex', alignItems: 'center' }}
      onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
      onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}>
      <Icon size={12} />
    </button>
  );

  return (
    <div style={{ width: 272, background: '#0d1117', borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="section-label">Estructura</span>
          <button className="rad-btn rad-btn-ghost" style={{ padding: '2px 8px', fontSize: 11, gap: 4 }} onClick={handleAddPage}>
            <Plus size={11} /> Página
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }} />
          <input className="rad-input" style={{ paddingLeft: 26, fontSize: 12, padding: '5px 8px 5px 26px' }}
            placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tree */}
      <div style={{ overflow: 'auto', flex: 1, padding: '8px 6px' }}>
        {/* Project root */}
        <div className="tree-item" style={{ padding: '5px 8px', marginBottom: 2 }}
          onClick={() => selectNode({ type: 'project' })}
          style={{ padding: '5px 8px', marginBottom: 2, borderRadius: 6, cursor: 'pointer',
            background: selectedNode?.type === 'project' ? '#1c2128' : 'transparent',
            borderLeft: selectedNode?.type === 'project' ? '2px solid #388bfd' : '2px solid transparent',
          }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14 }}>⚙️</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentProject.meta?.name}
            </span>
          </div>
        </div>

        {/* Pages */}
        {filteredPages.map(page => {
          const pageExpanded = expandedNodes.has(page.id);
          const pageSelected = isSelected('page', page.id);

          return (
            <div key={page.id}>
              {/* Page row */}
              <div
                style={{
                  padding: '4px 6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: 4, marginBottom: 1,
                  background: pageSelected ? '#1c2128' : 'transparent',
                  borderLeft: pageSelected ? '2px solid #388bfd' : '2px solid transparent',
                }}
                onMouseEnter={() => setHovered(`page_${page.id}`)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { selectNode({ type: 'page', id: page.id }); toggleNode(page.id); }}>
                <button onClick={e => { e.stopPropagation(); toggleNode(page.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', padding: 0, display: 'flex' }}>
                  {pageExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                <span style={{ fontSize: 13 }}>📄</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#e6edf3', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {page.title}
                </span>
                {hovered === `page_${page.id}` && (
                  <div className="flex items-center gap-1">
                    <NodeBtn icon={Plus} title="Agregar formulario" onClick={e => handleAddForm(e, page.id)} />
                    <NodeBtn icon={Trash2} title="Eliminar página" onClick={e => { e.stopPropagation(); deletePage(page.id); }} />
                  </div>
                )}
              </div>

              {/* Forms */}
              {pageExpanded && page.forms?.map(form => {
                const formExpanded = expandedNodes.has(form.id);
                const formSelected = isSelected('form', form.id);

                return (
                  <div key={form.id} style={{ paddingLeft: 16 }}>
                    <div
                      style={{
                        padding: '3px 6px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
                        gap: 4, marginBottom: 1,
                        background: formSelected ? '#1c2128' : 'transparent',
                        borderLeft: formSelected ? '2px solid #d97706' : '2px solid transparent',
                      }}
                      onMouseEnter={() => setHovered(`form_${form.id}`)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => { selectNode({ type: 'form', id: form.id, pageId: page.id }); toggleNode(form.id); }}>
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
                        <div className="flex items-center gap-1" style={{ marginLeft: 4 }}>
                          <NodeBtn icon={Plus} title="Agregar campo" onClick={e => handleAddField(e, page.id, form.id)} />
                          <NodeBtn icon={Trash2} title="Eliminar formulario" onClick={e => { e.stopPropagation(); deleteForm(page.id, form.id); }} />
                        </div>
                      )}
                    </div>

                    {/* Fields */}
                    {formExpanded && form.fields?.map(field => {
                      const fieldSelected = isSelected('field', field.id);
                      return (
                        <div key={field.id}
                          style={{
                            paddingLeft: 20, padding: '2px 6px 2px 20px', borderRadius: 6, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1,
                            background: fieldSelected ? '#1c2128' : 'transparent',
                            borderLeft: fieldSelected ? '2px solid ' + fieldTypeColor(field.type) : '2px solid transparent',
                          }}
                          onMouseEnter={() => setHovered(`field_${field.id}`)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => selectNode({ type: 'field', id: field.id, pageId: page.id, formId: form.id })}>
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
                      );
                    })}

                    {/* Add field button */}
                    {formExpanded && (
                      <button style={{ paddingLeft: 20, display: 'flex', alignItems: 'center', gap: 5, color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '3px 6px 3px 20px', borderRadius: 6, width: '100%' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                        onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                        onClick={() => { addField(page.id, form.id); expandedNodes.has(form.id) || toggleNode(form.id); }}>
                        <Plus size={10} /> campo
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add form button */}
              {pageExpanded && (
                <button style={{ paddingLeft: 16, display: 'flex', alignItems: 'center', gap: 5, color: '#8b949e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '3px 6px 3px 16px', borderRadius: 6, width: '100%' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
                  onClick={() => addForm(page.id)}>
                  <Plus size={10} /> formulario
                </button>
              )}
            </div>
          );
        })}

        {pages.length === 0 && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: '#8b949e', fontSize: 12 }}>
            <div style={{ marginBottom: 10 }}>Sin páginas todavía</div>
            <button className="rad-btn rad-btn-secondary" style={{ fontSize: 11 }} onClick={handleAddPage}>
              <Plus size={11} /> Agregar página
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
