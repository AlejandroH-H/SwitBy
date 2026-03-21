async function toggleLike(btn) {
    // Efecto visual instantáneo (UI Optimista)
    // Esto hace que se sienta rápido antes de que responda el servidor
    const icon = btn.querySelector('.icon-heart');
    const countSpan = btn.querySelector('.like-count');
    const isLiked = btn.getAttribute('data-liked') === 'true';
    let currentCount = parseInt(countSpan.innerText);

    // Animación visual temporal
    btn.style.transform = "scale(1.2)";
    setTimeout(() => btn.style.transform = "scale(1)", 200);

    try {
        const postId = btn.getAttribute('data-post-id');

        // Llamada al Backend
        const response = await fetch('/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId })
        });

        const data = await response.json();

        if (data.success) {
            // Actualizar con datos REALES del servidor
            updateLikeButton(btn, data.liked, data.newCount);
        } else {
            // Si falló (ej: no logueado), redirigir o alertar
            const msg = data.message || '';
            if (msg.includes('No autorizado') || msg.includes('Debes iniciar sesión')) {
                // Ruta de inicio de sesión del proyecto
                window.location.href = '/session';
            } else {
                alert('Error: ' + msg);
            }
        }

    } catch (error) {
        console.error('Error:', error);
        // Revertir cambios si hubo error de red (opcional)
    }
}

function updateLikeButton(btn, isLiked, newCount) {
    const icon = btn.querySelector('.icon-heart');
    const countSpan = btn.querySelector('.like-count');

    // Actualizar atributo de estado
    btn.setAttribute('data-liked', isLiked);

    // Actualizar Contador
    countSpan.innerText = newCount;

    // Cambiar clases (Color y Relleno)
    if (isLiked) {
        icon.classList.remove('bi-heart');
        icon.classList.add('bi-heart-fill', 'text-danger');
        countSpan.classList.add('text-danger');
        countSpan.classList.remove('text-secondary');
    } else {
        icon.classList.remove('bi-heart-fill', 'text-danger');
        icon.classList.add('bi-heart');
        countSpan.classList.remove('text-danger');
        countSpan.classList.add('text-secondary');
    }
}