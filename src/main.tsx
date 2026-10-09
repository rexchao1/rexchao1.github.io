import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Page } from './Page';
import './page.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
