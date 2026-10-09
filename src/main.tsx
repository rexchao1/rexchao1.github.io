import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Site } from './Site';
import './site.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
);
