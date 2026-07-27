import { authService } from './services/authService.js';
import { LandingView } from './views/LandingView.js';
import { LoginView } from './views/LoginView.js';
import { RegisterView } from './views/RegisterView.js';
import { DashboardView } from './views/DashboardView.js';
import { CatalogoView } from './views/CatalogoView.js';
import { LenguaDetailView } from './views/LenguaDetailView.js';
import { ProgresoView } from './views/ProgresoView.js';
import { LearningStudioView } from './views/LearningStudioView.js';
import { PerfilView } from './views/PerfilView.js';
import { RecuperarPasswordView } from './views/RecuperarPasswordView.js';

const app = document.getElementById('app');

export const Router = {
    navigate(path, params = {}) {
        app.innerHTML = '';
        const user = authService.getSession();

        // Si no hay usuario y no es una ruta pública, lo mandamos al index (landing)
        if (!user && !['/', '/login', '/register', '/recuperar-password'].includes(path)) {
            return this.navigate('/');
        }

        switch (path) {
            case '/':
                LandingView.render(app);
                break;
            case '/login':
                LoginView.render(app);
                break;
            case '/register':
                RegisterView.render(app);
                break;
            case '/recuperar-password':
                RecuperarPasswordView.render(app);
                break;
            case '/dashboard':
                DashboardView.render(app, user);
                break;
            case '/catalogo':
                CatalogoView.render(app, user);
                break;
            case '/detalle-lengua':
                LenguaDetailView.render(app, params, user);
                break;
            case '/progreso':
                ProgresoView.render(app, user);
                break;
            case '/studio':
                LearningStudioView.render(app, params, user);
                break;
            case '/perfil':
                PerfilView.render(app, user);
                break;
            default:
                if (user) {
                    this.navigate('/dashboard');
                } else {
                    this.navigate('/');
                }
        }
    }
};

// Check theme based on OS or saved pref
const isDark = localStorage.getItem('yak_dark_mode') === 'true';
if (isDark) document.body.classList.add('dark-mode');

// Start router
const session = authService.getSession();
if (session) {
    Router.navigate('/dashboard');
} else {
    Router.navigate('/');
}

// Global function for Google Auth callback
window.handleGoogleCredentialResponse = async (response) => {
    try {
        // Decodificar Base64URL de forma segura para JWT
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);

        const result = await authService.loginWithGoogle({
            credential: response.credential,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        });
        authService.saveSession(result.user);
        Router.navigate('/dashboard');
    } catch (err) {
        console.error("Google Auth error:", err);
        alert('Error con Google Auth: ' + err.message);
    }
};
