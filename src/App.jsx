import { useProjectStore } from './store/useProjectStore';
import HomeScreen from './components/HomeScreen';
import EditorLayout from './components/EditorLayout';

export default function App() {
  const { screen } = useProjectStore();
  return screen === 'editor' ? <EditorLayout /> : <HomeScreen />;
}
