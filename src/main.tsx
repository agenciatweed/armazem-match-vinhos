import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { CONFIG } from './data/config.js';
import './styles/tokens.css';
import './styles/global.css';

const isAdmin = window.location.pathname.replace(/\/+$/, '') === CONFIG.adminPath;
const App = lazy(() => import('./App.js'));
const AdminPage = lazy(() => import('./admin/AdminPage.js'));

if (isAdmin) {
  document.title = 'Matches registrados · Armazém dos Importados';
  document.documentElement.dataset.surface = 'admin';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>{isAdmin ? <AdminPage /> : <App />}</Suspense>
  </StrictMode>,
);
