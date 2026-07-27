import { authService } from '../services/authService.js';
import { Router } from '../main.js';

export const LoginView = {
    render(container) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-box glass-panel">
                    <div class="text-center mb-32">
                        <h1 style="color:var(--primary-green); font-size:40px; margin-bottom:8px;">YAK </h1>
                        <p style="color:var(--text-muted); font-size:18px;">Iniciar sesión en tu cuenta</p>
                    </div>

                    <form id="login-form">
                        <div class="input-group">
                            <label>Correo Electrónico o Usuario</label>
                            <input type="text" id="correo" placeholder="ejemplo@yak.com o tu usuario" required>
                        </div>
                        <div class="input-group">
                            <label>Contraseña</label>
                            <input type="password" id="password" placeholder="••••••••" required>
                            <div style="text-align:right; margin-top:6px;">
                                <button type="button" id="btn-forgot-pass" style="background:none; border:none; color:var(--primary-green); font-size:13px; cursor:pointer; font-weight:600;">¿Olvidaste tu contraseña?</button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:16px;">Iniciar Sesión</button>
                    </form>
                    
                    <div style="margin:24px 0; text-align:center; color:var(--text-muted); font-size:14px; position:relative;">
                        <span style="background:var(--bg-surface-glass); padding:0 12px; position:relative; z-index:2;">O continúa con</span>
                        <div style="position:absolute; top:50%; left:0; right:0; border-top:1px solid var(--border-color); z-index:1;"></div>
                    </div>

                    <!-- Botón Personalizado de Google Login -->
                    <button id="google-login-btn" class="btn btn-outline" style="width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#fff; color:#374151; border:1px solid #D1D5DB;">
                        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                        <span>Acceder con Google</span>
                    </button>
                    
                    <div style="margin-top:24px; text-align:center;">
                        <button id="btn-go-register" class="btn" style="background:transparent; color:var(--primary-green); font-size:14px;">¿No tienes cuenta? Regístrate aquí</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;
            try {
                const res = await authService.login(correo, password);
                authService.saveSession(res.user);
                Router.navigate('/dashboard');
            } catch (err) {
                alert(err.message);
            }
        };

        let CLIENT_ID = "920273571891-eic4tud2e6921r1lnfpsubhsfkro6d81.apps.googleusercontent.com";

        const initGoogleAuth = (cid) => {
            if (window.google && window.google.accounts) {
                window.google.accounts.id.initialize({
                    client_id: cid,
                    callback: window.handleGoogleCredentialResponse
                });
            }
        };

        // Inicializar inmediatamente con el ID base
        initGoogleAuth(CLIENT_ID);

        // Actualizar dinámicamente desde la API en segundo plano
        fetch('http://localhost:3000/api/v1/config/google-client-id')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.clientId) {
                    CLIENT_ID = data.clientId;
                    initGoogleAuth(CLIENT_ID);
                }
            })
            .catch(() => {});

        document.getElementById('google-login-btn').onclick = async () => {
            if (window.google && window.google.accounts) {
                // Disparar el prompt/popup de inicio de sesión real de Google
                window.google.accounts.id.prompt();
            } else {
                alert('El script de Google no se ha cargado. Verifica tu conexión a internet.');
            }
        };

        const btnForgot = document.getElementById('btn-forgot-pass');
        if (btnForgot) {
            btnForgot.onclick = () => Router.navigate('/recuperar-password');
        }

        document.getElementById('btn-go-register').onclick = () => {
            Router.navigate('/register');
        };
    }
};
