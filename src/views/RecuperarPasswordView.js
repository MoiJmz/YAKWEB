import { authService } from '../services/authService.js';
import { Router } from '../main.js';

export const RecuperarPasswordView = {
    render(container) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-box glass-panel" style="max-width:440px;">
                    <div class="text-center mb-32">
                        <h1 style="color:var(--primary-green); font-size:34px; margin-bottom:8px;">Recuperar Contraseña</h1>
                        <p style="color:var(--text-muted); font-size:15px;" id="recovery-subtitle">Ingresa tu correo para recibir un código de verificación</p>
                    </div>

                    <!-- Banner de Notificación -->
                    <div id="code-banner" style="display:none; padding:14px; border-radius:12px; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); color:#10B981; font-size:14px; margin-bottom:20px; line-height:1.4; text-align:center;">
                        <span id="banner-code-text"></span>
                    </div>

                    <!-- PASO 1: Ingresar correo -->
                    <form id="form-step-1" style="display:flex; flex-direction:column; gap:16px;">
                        <div class="input-group">
                            <label>Correo Electrónico Registrado</label>
                            <input type="email" id="reset-email" placeholder="tu-correo@ejemplo.com" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-main); font-size:16px;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; background:#10B981; font-size:16px;">Enviar Código de Verificación</button>
                    </form>

                    <!-- PASO 2: Ingresar Código de 6 dígitos -->
                    <form id="form-step-2" style="display:none; flex-direction:column; gap:16px;">
                        <div class="input-group">
                            <label>Código de Verificación (6 dígitos)</label>
                            <input type="text" id="verification-code" placeholder="123456" maxlength="6" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-main); font-size:22px; text-align:center; letter-spacing:6px; font-weight:bold;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; background:#10B981; font-size:16px;">Validar Código</button>
                        <button type="button" id="btn-resend" style="background:none; border:none; color:var(--primary-green); font-size:13px; cursor:pointer;">¿No recibiste el código? Reenviar</button>
                    </form>

                    <!-- PASO 3: Ingresar nueva contraseña -->
                    <form id="form-step-3" style="display:none; flex-direction:column; gap:16px;">
                        <div style="padding:10px 14px; border-radius:10px; background:rgba(16,185,129,0.15); color:#10B981; font-weight:600; font-size:14px; text-align:center;">
                             Código verificado. Ingresa tu nueva contraseña.
                        </div>

                        <div class="input-group">
                            <label>Nueva Contraseña</label>
                            <input type="password" id="new-password" placeholder="••••••••" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-main); font-size:16px;">
                        </div>

                        <div class="input-group">
                            <label>Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirm-password" placeholder="••••••••" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-main); font-size:16px;">
                        </div>

                        <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; background:#10B981; font-size:16px;">Guardar Nueva Contraseña</button>
                    </form>

                    <div style="margin-top:24px; text-align:center;">
                        <button id="btn-back-login" class="btn" style="background:transparent; color:var(--text-muted); font-size:14px;">← Volver al inicio de sesión</button>
                    </div>
                </div>
            </div>
        `;

        let currentEmail = '';

        const formStep1 = document.getElementById('form-step-1');
        const formStep2 = document.getElementById('form-step-2');
        const formStep3 = document.getElementById('form-step-3');
        const codeBanner = document.getElementById('code-banner');
        const bannerCodeText = document.getElementById('banner-code-text');
        const subtitle = document.getElementById('recovery-subtitle');

        // Paso 1: Enviar Código
        formStep1.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value.trim();
            try {
                await authService.solicitarCodigo(email);
                currentEmail = email;

                bannerCodeText.innerHTML = `<strong style="font-size:15px;"> Código enviado a ${email}</strong><br><span style="font-size:13px; color:#94A3B8; display:inline-block; margin-top:4px;">Revisa tu bandeja de entrada o carpeta de spam.</span>`;
                codeBanner.style.display = 'block';

                formStep1.style.display = 'none';
                formStep2.style.display = 'flex';
                subtitle.textContent = `Ingresa el código de 6 dígitos enviado a ${email}`;
            } catch(err) {
                alert(err.message);
            }
        };

        // Reenviar Código
        document.getElementById('btn-resend').onclick = async () => {
            try {
                await authService.solicitarCodigo(currentEmail);
                alert(`Un nuevo código de verificación ha sido enviado a tu correo ${currentEmail}.`);
            } catch(err) {
                alert(err.message);
            }
        };

        // Paso 2: Validar Código
        formStep2.onsubmit = async (e) => {
            e.preventDefault();
            const code = document.getElementById('verification-code').value.trim();
            try {
                await authService.validarCodigo(currentEmail, code);
                codeBanner.style.display = 'none';
                formStep2.style.display = 'none';
                formStep3.style.display = 'flex';
                subtitle.textContent = 'Establece tu nueva contraseña segura';
            } catch(err) {
                alert(err.message);
            }
        };

        // Paso 3: Restablecer Contraseña
        formStep3.onsubmit = async (e) => {
            e.preventDefault();
            const pass1 = document.getElementById('new-password').value;
            const pass2 = document.getElementById('confirm-password').value;

            if (pass1.length < 3) {
                alert('La contraseña debe tener al menos 3 caracteres.');
                return;
            }

            if (pass1 !== pass2) {
                alert('Las contraseñas no coinciden. Verifícalas nuevamente.');
                return;
            }

            try {
                await authService.resetPassword(currentEmail, pass1);
                alert('¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva clave.');
                Router.navigate('/login');
            } catch(err) {
                alert(err.message);
            }
        };

        document.getElementById('btn-back-login').onclick = () => {
            Router.navigate('/login');
        };
    }
};
