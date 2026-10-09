import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { useSettingsStore } from '@/state/settingsStore';
import { Stage } from './Stage';

useSettingsStore.getState().update({ graphics: { quality: 'medium', showFps: false } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Stage />
  </StrictMode>,
);
