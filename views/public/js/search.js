document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    // before we were targeting a child element but the template doesn't
    // always include one; it's easier to fill the container directly
    
    let debounceTimer; // Variable para controlar el retraso

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // 1. Limpiar el temporizador anterior
        clearTimeout(debounceTimer);

        // 2. Si el input está vacío, ocultar resultados
        if (query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        // 3. Configurar un nuevo temporizador (Debounce de 300ms)
        // Esto significa: "Solo busca si el usuario dejó de teclear por 0.3 segundos"
        debounceTimer = setTimeout(async () => {
            
            // Mostramos estado de carga
            searchResults.style.display = 'block';
            searchResults.innerHTML = `
                <div class="text-center p-3 text-muted small">
                    <div class="spinner-border spinner-border-sm" role="status"></div> Buscando...
                </div>
            `;

            try {
                // Equivalente moderno de $.ajax
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (data && data.success) {
                    // aseguramos que siempre trabajamos con arrays
                    data.users = Array.isArray(data.users) ? data.users : [];
                    data.posts = Array.isArray(data.posts) ? data.posts : [];
                    renderResults(data);
                } else {
                    searchResults.innerHTML = '<div class="p-3 text-danger">Error al buscar</div>';
                }
            } catch (error) {
                console.error(error);
                searchResults.innerHTML = '<div class="p-3 text-danger">Error de conexión</div>';
            }

        }, 300); 
    });

    // Cerrar el buscador si el usuario hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // Función para pintar el HTML (equivalente a lo que devolvía tu PHP)
    function renderResults(data) {
        let html = '';

        // Si no hay resultados de nada
        if (data.users.length === 0 && data.posts.length === 0) {
            searchResults.innerHTML = '<div class="p-3 text-muted text-center small">No se encontraron resultados.</div>';
            return;
        }

        // --- SECCIÓN: USUARIOS ---
        if (data.users.length > 0) {
            html += '<div class="px-3 py-2 bg-light fw-bold text-muted small border-bottom">Cuentas</div>';
            data.users.forEach(user => {
                html += `
                    <a href="/profile/${user.user_id}" class="text-decoration-none text-dark">
                        <div class="d-flex align-items-center p-2 border-bottom hover-bg-light">
                            <img src="${user.avatar_url || 'imgs/Logo.png'}" 
                                 class="rounded-circle me-2" width="30" height="30" style="object-fit: cover;">
                            <span class="fw-bold">@${user.username}</span>
                        </div>
                    </a>
                `;
            });
        }

        // --- SECCIÓN: PUBLICACIONES ---
        if (data.posts.length > 0) {
            html += '<div class="px-3 py-2 bg-light fw-bold text-muted small border-bottom">Publicaciones</div>';
            data.posts.forEach(post => {
                html += `
                    <a href="/post/${post.id}" class="text-decoration-none text-dark">
                        <div class="d-flex align-items-center p-2 border-bottom hover-bg-light">
                            <div class="bg-secondary bg-opacity-10 rounded d-flex align-items-center justify-content-center me-2" style="width: 30px; height: 30px;">
                                <i class="bi bi-hash text-secondary"></i>
                            </div>
                            <span class="text-truncate">${post.title}</span>
                        </div>
                    </a>
                `;
            });
        }

        searchResults.innerHTML = html;
    }
});