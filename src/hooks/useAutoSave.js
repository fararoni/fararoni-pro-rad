import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export const useAutoSave = () => {
  const { currentProject, saveStatus, saveProject } = useProjectStore();
  const timerRef = useRef(null);

  useEffect(() => {
    if (saveStatus !== 'unsaved') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveProject();
    }, 2500);
    return () => clearTimeout(timerRef.current);
  }, [currentProject, saveStatus]);
};
