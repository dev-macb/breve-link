import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './estilos/global.css';
import './estilos/retro.css';

try {
    document.documentElement.dataset.theme = localStorage.getItem('breve:tema') || 'dark';
} catch {
    /* O tema padrão continua disponível sem acesso ao armazenamento. */
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <a className="skip-link" href="#conteudo">
            Pular para o conteúdo
        </a>
        <App />
    </StrictMode>
);
