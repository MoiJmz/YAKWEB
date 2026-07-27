import { Router } from '../main.js';

export const LandingView = {
    render(container) {
        container.innerHTML = `
            <div style="min-height: 100vh; display: flex; flex-direction: column;">
                <header style="padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); border-bottom: 1px solid var(--border-color);">
                    <h1 style="color: var(--primary-green); font-size: 28px;">YAK </h1>
                    <div>
                        <button id="btn-nav-login" class="btn btn-outline" style="margin-right: 16px;">Iniciar Sesión</button>
                        <button id="btn-nav-register" class="btn btn-primary">Registrarse Gratis</button>
                    </div>
                </header>

                <main style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; background: radial-gradient(circle at center, rgba(76,175,80,0.1), transparent);">
                    <h1 style="font-size: 64px; margin-bottom: 24px; background: linear-gradient(135deg, var(--primary-green), #10B981); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        Domina las Lenguas Originarias de Tabasco
                    </h1>
                    <p style="font-size: 24px; color: var(--text-muted); max-width: 800px; margin-bottom: 48px; line-height: 1.5;">
                        Aprende Chol, Yokot'an y Lengua de Señas Mexicana (LSM) en nuestra plataforma.
                    </p>
                    <div style="display: flex; gap: 24px;">
                        <button id="btn-hero-start" class="btn btn-primary" style="font-size: 20px; padding: 16px 32px;">Comenzar Ahora</button>
                    </div>
                </main>
            </div>
        `;

        document.getElementById('btn-nav-login').onclick = () => Router.navigate('/login');
        document.getElementById('btn-nav-register').onclick = () => Router.navigate('/register');
        document.getElementById('btn-hero-start').onclick = () => Router.navigate('/login');
    }
};
