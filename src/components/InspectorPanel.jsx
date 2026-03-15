import { useProjectStore } from '../store/useProjectStore';
import ProjectInspector from './inspectors/ProjectInspector';
import PageInspector from './inspectors/PageInspector';
import FormInspector from './inspectors/FormInspector';
import FieldInspector from './inspectors/FieldInspector';
import { Settings } from 'lucide-react';

export default function InspectorPanel() {
  const { selectedNode, currentProject } = useProjectStore();

  const getContent = () => {
    if (!selectedNode || !currentProject) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: '#8b949e' }}>
          <Settings size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <div style={{ fontSize: 13 }}>Selecciona un elemento en el árbol para ver sus propiedades</div>
        </div>
      );
    }
    switch (selectedNode.type) {
      case 'project': return <ProjectInspector />;
      case 'page':    return <PageInspector pageId={selectedNode.id} />;
      case 'form':    return <FormInspector pageId={selectedNode.pageId} formId={selectedNode.id} />;
      case 'field':   return <FieldInspector pageId={selectedNode.pageId} formId={selectedNode.formId} fieldId={selectedNode.id} />;
      default:        return null;
    }
  };

  return (
    <div style={{ width: 320, background: '#0d1117', borderLeft: '1px solid #21262d', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        <span className="section-label">Inspector</span>
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        {getContent()}
      </div>
    </div>
  );
}
