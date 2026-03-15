import Toolbar from './Toolbar';
import StructurePanel from './StructurePanel';
import WorkArea from './WorkArea';
import InspectorPanel from './InspectorPanel';
import { useAutoSave } from '../hooks/useAutoSave';

export default function EditorLayout() {
  useAutoSave();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <StructurePanel />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <WorkArea />
        </div>
        <InspectorPanel />
      </div>
    </div>
  );
}
