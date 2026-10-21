import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './estilos/global.css';
import './estilos/retro.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
        </a>
        <App />
    </StrictMode>
);
