// Executado antes dos estilos, tanto na aplicação quanto nas páginas públicas.
(() => {
    let tema = 'dark';
    try {
        const salvo = localStorage.getItem('breve:tema');
        if (salvo === 'light' || salvo === 'dark') {
            tema = salvo;
        } else if (salvo === 'system') {
            tema = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
    } catch {
        // Sem armazenamento, mantém o mesmo padrão em todas as páginas.
    }
    document.documentElement.dataset.theme = tema;
})();
