import { authService } from '../services/authService.js';
import { Router } from '../main.js';

export const RegisterView = {
    render(container) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-box glass-panel">
                    <div class="text-center mb-32">
                        <h1 style="color:var(--primary-green); font-size:40px; margin-bottom:8px;">Únete a YAK</h1>
                        <p style="color:var(--text-muted); font-size:18px;">Crea tu cuenta gratis!</p>
                    </div>

                    <form id="register-form">
                        <div class="input-group">
                            <label>Nombre de Usuario</label>
                            <input type="text" id="reg-username" placeholder="Tu nombre" required>
                        </div>
                        <div class="input-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="reg-correo" placeholder="ejemplo@yak.com" required>
                        </div>
                        <div class="input-group">
                            <label>Contraseña</label>
                            <input type="password" id="reg-password" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%; margin-top:16px;">Crear Cuenta</button>
                    </form>
                    
                    <div style="margin-top:24px; text-align:center;">
                        <button id="btn-back-login" class="btn" style="background:transparent; color:var(--text-muted); font-size:14px;">Ya tengo una cuenta, iniciar sesión</button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('register-form').onsubmit = async (e) => {
            e.preventDefault();
            const user = document.getElementById('reg-username').value;
            const correo = document.getElementById('reg-correo').value;
            const password = document.getElementById('reg-password').value;
            try {
                const res = await authService.register(user, correo, password);
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                Router.navigate('/login');
            } catch (err) {
                alert(err.message);
            }
        };

        document.getElementById('btn-back-login').onclick = () => {
            Router.navigate('/login');
        };
    }
};
