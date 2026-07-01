// updater.js — Inyectado en la app para mostrar notificaciones de actualización
// Solo funciona cuando corre dentro de Electron (no en navegador)

(function () {
    if (!window.electronAPI) return; // No estamos en Electron, salir

    // Crear el banner de actualización (oculto por defecto)
    const banner = document.createElement('div');
    banner.id = '_update_banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        background: #111111;
        border: 1px solid rgba(245,166,35,0.4);
        border-radius: 6px;
        padding: 12px 16px;
        font-family: 'Inter', sans-serif;
        font-size: 11.5px;
        color: #f5a623;
        z-index: 99999;
        display: none;
        max-width: 300px;
        line-height: 1.5;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    `;
    document.body.appendChild(banner);

    // Mostrar versión actual en el header si existe
    window.electronAPI.getVersion().then(version => {
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            const vBadge = document.createElement('span');
            vBadge.style.cssText = 'font-size:9px;color:#444;letter-spacing:0.5px;margin-left:8px;font-weight:400;';
            vBadge.textContent = `v${version}`;
            headerTitle.appendChild(vBadge);
        }
    });

    // Escuchar eventos de actualización desde el proceso principal
    window.electronAPI.onUpdateStatus((data) => {
        banner.style.display = 'block';

        if (data.type === 'available') {
            banner.innerHTML = `
                <div style="font-weight:800;margin-bottom:4px;">📥 Actualización disponible</div>
                <div style="color:#888;">${data.message}</div>
            `;
        } else if (data.type === 'progress') {
            banner.innerHTML = `
                <div style="font-weight:800;margin-bottom:6px;">⬇ Descargando v${data.version || ''}...</div>
                <div style="background:#222;border-radius:3px;height:4px;overflow:hidden;">
                    <div style="background:#f5a623;height:100%;width:${data.percent}%;transition:width 0.3s;border-radius:3px;"></div>
                </div>
                <div style="color:#666;margin-top:4px;font-size:10px;">${data.percent}%</div>
            `;
        } else if (data.type === 'downloaded') {
            banner.innerHTML = `
                <div style="font-weight:800;margin-bottom:4px;">✓ Lista para instalar</div>
                <div style="color:#888;">Se instalará al cerrar la app.</div>
            `;
            setTimeout(() => { banner.style.display = 'none'; }, 8000);
        }
    });
})();
