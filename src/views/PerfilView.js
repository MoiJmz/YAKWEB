import { WebLayout } from '../components/WebLayout.js';
import { authService } from '../services/authService.js';
import { Router } from '../main.js';

export const PerfilView = {
    compressImage(base64Str, maxWidth, maxHeight, callback) {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            callback(compressedBase64);
        };
        img.onerror = () => callback(base64Str);
    },

    async render(container, user) {
        const isDarkMode = document.body.classList.contains('dark-mode');
        let selectedAvatarData = user.fotoPerfil || null;

        const contentHtml = `
            <div style="max-width: 700px; margin: 0 auto; padding-bottom: 48px;">
                <h1 style="font-size: 36px; margin-bottom: 8px;">Mi Perfil</h1>
                <p style="color: var(--text-muted); font-size: 18px; margin-bottom: 36px;">Actualiza tus datos de usuario.</p>

                <div class="card glass-panel" style="padding: 40px;">
                    <!-- Foto de Perfil Preview y Selección de Archivo -->
                    <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:32px;">
                        <img id="profile-avatar-preview" src="${user.fotoPerfil || '/src/assets/default_avatar.png'}" 
                             style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-green); margin-bottom: 16px; box-shadow: var(--shadow-md);">
                        
                        <input type="file" id="input-foto-file" accept="image/*" style="display:none;">
                        <button type="button" id="btn-select-file" class="btn btn-outline" style="padding:10px 20px; font-size:14px; border-color:var(--primary-green); color:var(--primary-green); font-weight:600;">
                            Seleccionar imagen desde tu equipo
                        </button>
                        <span id="file-name-display" style="font-size:13px; color:var(--text-muted); margin-top:8px;"></span>
                    </div>

                    <form id="form-profile" style="display:flex; flex-direction:column; gap:24px;">
                        <!-- Nombre de Usuario -->
                        <div>
                            <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">Nombre de usuario</label>
                            <input type="text" id="input-username" class="input-field" value="${user.username || ''}" placeholder="Tu nombre o apodo (con espacios)" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-main); font-size:16px;">
                        </div>

                        <!-- Correo Electrónico -->
                        <div>
                            <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">Correo electrónico</label>
                            <input type="email" id="input-correo" class="input-field" value="${user.correo || ''}" placeholder="correo@ejemplo.com" required style="width:100%; padding:12px 16px; border-radius:12px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-main); font-size:16px;">
                        </div>

                        <!-- Opción de Modo Noche / Claro -->
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-radius:16px; border:1px solid var(--border-color); background:rgba(0,0,0,0.02); margin-top:8px;">
                            <div>
                                <h4 style="margin:0 0 4px 0; font-size:16px; color:var(--text-main);">Modo Noche (Oscuro)</h4>
                                <span style="font-size:14px; color:var(--text-muted);">Activa o desactiva la apariencia oscura del sitio</span>
                            </div>
                            <label style="position:relative; display:inline-block; width:52px; height:28px;">
                                <input type="checkbox" id="toggle-dark-mode" ${isDarkMode ? 'checked' : ''} style="opacity:0; width:0; height:0;">
                                <span id="switch-slider" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:${isDarkMode ? '#10B981' : '#ccc'}; transition:.3s; border-radius:34px;"></span>
                                <span id="switch-knob" style="position:absolute; content:''; height:22px; width:22px; left:${isDarkMode ? '26px' : '3px'}; bottom:3px; background-color:white; transition:.3s; border-radius:50%;"></span>
                            </label>
                        </div>

                        <!-- Mensaje de confirmación -->
                        <div id="profile-success-msg" style="display:none; padding:14px; border-radius:12px; background:rgba(16,185,129,0.1); color:#10B981; font-weight:600; text-align:center; font-size:15px;">
                            ¡Perfil actualizado con éxito!
                        </div>

                        <!-- Botones de Acción -->
                        <div style="display:flex; gap:16px; justify-content:flex-end; margin-top:16px;">
                            <button type="button" id="btn-cancel-profile" class="btn btn-outline">Cancelar</button>
                            <button type="submit" id="btn-save-profile" class="btn btn-primary" style="background:#10B981; padding:12px 32px; font-weight:700;">Guardar Cambios</button>
                        </div>
                    </form>

                    <!-- Separador y Botón de Cerrar Sesión al Final de la Pantalla -->
                    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-color); display:flex; justify-content:center;">
                        <button type="button" id="btn-logout-profile" class="btn btn-outline" style="border-color: #EF4444; color: #EF4444; width: 100%; max-width: 320px; font-weight: 600; padding: 12px 24px;">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = WebLayout.render(contentHtml, 'perfil', user);
        WebLayout.attachEvents();

        // Manejador del Explorador de Archivos para la Imagen de Perfil
        const btnSelectFile = document.getElementById('btn-select-file');
        const inputFile = document.getElementById('input-foto-file');
        const imgPreview = document.getElementById('profile-avatar-preview');
        const fileNameDisplay = document.getElementById('file-name-display');

        if (btnSelectFile && inputFile) {
            btnSelectFile.onclick = () => inputFile.click();

            inputFile.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (fileNameDisplay) fileNameDisplay.innerText = `Optimizando: ${file.name}...`;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.compressImage(event.target.result, 200, 200, (compressed) => {
                            selectedAvatarData = compressed;
                            if (imgPreview) imgPreview.src = compressed;
                            if (fileNameDisplay) fileNameDisplay.innerText = `Foto lista: ${file.name}`;
                        });
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        // Evento de Toggle Modo Noche
        const toggleDark = document.getElementById('toggle-dark-mode');
        const slider = document.getElementById('switch-slider');
        const knob = document.getElementById('switch-knob');

        if (toggleDark) {
            toggleDark.onchange = () => {
                const checked = toggleDark.checked;
                if (checked) {
                    document.body.classList.add('dark-mode');
                    localStorage.setItem('yak_dark_mode', 'true');
                    if (slider) slider.style.backgroundColor = '#10B981';
                    if (knob) knob.style.left = '26px';
                } else {
                    document.body.classList.remove('dark-mode');
                    localStorage.setItem('yak_dark_mode', 'false');
                    if (slider) slider.style.backgroundColor = '#ccc';
                    if (knob) knob.style.left = '3px';
                }
            };
        }

        // Form Submit handler
        const form = document.getElementById('form-profile');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const newUsername = document.getElementById('input-username').value.trim();
                const newCorreo = document.getElementById('input-correo').value.trim();

                const updatedUser = {
                    ...user,
                    username: newUsername || user.username,
                    correo: newCorreo || user.correo,
                    fotoPerfil: selectedAvatarData
                };

                try {
                    await authService.actualizarPerfil(updatedUser);
                    const msg = document.getElementById('profile-success-msg');
                    if (msg) msg.style.display = 'block';

                    setTimeout(() => {
                        Router.navigate('/perfil');
                    }, 500);
                } catch(err) {
                    alert("Error al guardar el perfil: " + err.message);
                }
            };
        }

        const btnCancel = document.getElementById('btn-cancel-profile');
        if (btnCancel) {
            btnCancel.onclick = () => Router.navigate('/dashboard');
        }

        // Botón de Cerrar Sesión ubicado al final del perfil
        const btnLogoutProfile = document.getElementById('btn-logout-profile');
        if (btnLogoutProfile) {
            btnLogoutProfile.onclick = () => {
                authService.logout();
                Router.navigate('/login');
            };
        }

        window.Router = Router;
    }
};
