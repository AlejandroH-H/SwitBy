document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: CARGAR COMENTARIOS (GET) ---
    // Detectamos cuando se abre un colapsable de Bootstrap
    const collapseElements = document.querySelectorAll('.collapse');
    
    collapseElements.forEach(collapseEl => {
        collapseEl.addEventListener('show.bs.collapse', async (event) => {
            // El ID del div es "collapse-comments-5", extraemos el número 5
            const postId = collapseEl.id.split('-')[2]; 
            const listContainer = document.getElementById(`comments-list-${postId}`);

            // Evitar recargar si ya tiene contenido (opcional)
            if (listContainer.getAttribute('data-loaded') === 'true') return;

            try {
                // LLAMADA TÉCNICA A TU BACKEND
                const response = await fetch(`/api/comments/${postId}`);
                const data = await response.json();

                listContainer.innerHTML = ''; // Limpiar spinner

                if (data.success && data.comments.length > 0) {
                    data.comments.forEach(comment => {
                        renderComment(listContainer, comment);
                    });
                } else {
                    listContainer.innerHTML = '<p class="text-muted small text-center fst-italic">Sé el primero en comentar.</p>';
                }
                
                // Marcamos como cargado para no saturar la API
                listContainer.setAttribute('data-loaded', 'true');

            } catch (error) {
                console.error(error);
                listContainer.innerHTML = '<p class="text-danger small">Error al cargar.</p>';
            }
        });
    });

    // --- PARTE 2: ENVIAR COMENTARIO (POST) ---
    const forms = document.querySelectorAll('.comment-form');

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // EVITA QUE LA PÁGINA SE RECARGUE

            const postId = form.getAttribute('data-post-id');
            const input = form.querySelector('input[name="content"]');
            const content = input.value.trim();

            if (!content) return;

            // UI Optimista: Deshabilitar input
            input.disabled = true;

            try {
                // LLAMADA TÉCNICA A TU BACKEND
                const response = await fetch('/api/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ postId, content })
                });

                const data = await response.json();

                if (data.success) {
                    // Limpiar input
                    input.value = '';
                    
                    // Renderizar el nuevo comentario inmediatamente
                    const listContainer = document.getElementById(`comments-list-${postId}`);
                    
                    // Si había mensaje de "Se el primero", bórralo
                    if(listContainer.querySelector('.fst-italic')) listContainer.innerHTML = '';

                    renderComment(listContainer, {
                        content: content,
                        username: data.user.username, // Viene del backend
                        avatar_url: data.user.avatar,
                        // Usamos la fecha actual para visualización inmediata
                        creationDate: 'Justo ahora' 
                    });
                    // Marcar como cargado para evitar que el evento de "show" recargue y duplique
                    if (listContainer) listContainer.setAttribute('data-loaded', 'true');

                } else {
                    alert('Error: ' + data.message);
                }

            } catch (error) {
                alert('Error de conexión');
            } finally {
                input.disabled = false;
                input.focus();
            }
        });
    });
});

// --- FUNCIÓN HELPER PARA DIBUJAR HTML ---
function renderComment(container, comment) {
    const html = `
        <div class="d-flex gap-2 align-items-start">
            <img src="${comment.avatar_url || '../../../imgs/Logo.png'}" 
                 class="rounded-circle mt-1" width="25" height="25" style="object-fit:cover;">
            
            <div class="bg-white border rounded p-2 w-100 shadow-sm">
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="small text-dark" style="font-size: 0.85rem;">${comment.username}</strong>
                    <small class="text-muted" style="font-size: 0.7rem;">${formatDate(comment.creationDate)}</small>
                </div>
                <p class="mb-0 small text-secondary">${escapeHtml(comment.content)}</p>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

function escapeHtml(text) {
    if(!text) return text;
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(dateString) {
    if (dateString === 'Justo ahora') return dateString;
    // Simple formateo, puedes usar librerías como moment.js si prefieres
    return new Date(dateString).toLocaleDateString(); 
}