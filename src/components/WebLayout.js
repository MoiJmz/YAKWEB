import { Router } from '../main.js';
import { authService } from '../services/authService.js';

export const WebLayout = {
    render(contentHtml, activeRoute, user) {
        const isAdmin = user && (user.rol === 'ADMIN' || user.rol === 'OWNER');
        return `
            <div class="web-layout">
                <!-- Sidebar -->
                <aside class="sidebar">
                    <div class="sidebar-logo">
                        <span>YAK </span>
                    </div>
                    <nav class="nav-menu">
                        <a class="nav-link ${activeRoute === 'dashboard' ? 'active' : ''}" id="link-dashboard">
                            <span></span> Inicio
                        </a>
                        <a class="nav-link ${activeRoute === 'catalogo' ? 'active' : ''}" id="link-catalogo">
                            <span></span> Cursos
                        </a>
                        <a class="nav-link ${activeRoute === 'progreso' ? 'active' : ''}" id="link-progreso">
                            <span></span> Estadísticas
                        </a>
                        ${isAdmin ? `
                        <a class="nav-link ${activeRoute === 'admin' ? 'active' : ''}" id="link-admin">
                            <span>⚙️</span> Admin
                        </a>
                        ` : ''}
                    </nav>
                </aside>

                <!-- Main Content -->
                <main class="main-wrapper">
                    <header class="top-header">
                        <div>
                            <h2 style="font-size: 20px; color: var(--text-muted)">Panel de Aprendizaje</h2>
                        </div>
                        <div id="btn-user-profile" class="user-profile-menu" style="cursor: pointer; transition: transform 0.2s;" title="Editar Perfil">
                            <span style="font-weight: 600">${user.username}</span>
                            <img src="${user.fotoPerfil || '/src/assets/default_avatar.png'}" class="avatar" alt="Avatar" style="cursor: pointer; border: 2px solid var(--primary-green);">
                        </div>
                    </header>
                    
                    <div class="content-container">
                        ${contentHtml}
                    </div>
                </main>
            </div>
        `;
    },

    attachEvents() {
        const linkDash = document.getElementById('link-dashboard');
        const linkCat = document.getElementById('link-catalogo');
        const linkProg = document.getElementById('link-progreso');
        const linkAdmin = document.getElementById('link-admin');
        const btnProfile = document.getElementById('btn-user-profile');

        if (linkDash) linkDash.onclick = () => Router.navigate('/dashboard');
        if (linkCat) linkCat.onclick = () => Router.navigate('/catalogo');
        if (linkProg) linkProg.onclick = () => Router.navigate('/progreso');
        if (linkAdmin) linkAdmin.onclick = () => Router.navigate('/admin');
        if (btnProfile) btnProfile.onclick = () => Router.navigate('/perfil');
    }
};
