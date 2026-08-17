import { WebLayout } from '../components/WebLayout.js';
import { apiService } from '../services/apiService.js';
import { authService } from '../services/authService.js';
import { Router } from '../main.js';

export const AdminView = {
    selectedLengua: 'Chol',
    ejercicios: [],
    editingExercise: null,

    async render(container, user) {
        // Validación de Seguridad adicional en la vista
        const isAdmin = user && (user.rol === 'ADMIN' || user.rol === 'OWNER');
        if (!isAdmin) {
            alert('Acceso denegado: Se requieren permisos de Administrador.');
            Router.navigate('/dashboard');
            return;
        }

        container.innerHTML = WebLayout.render(`
            <div style="text-align:center; padding: 60px 0;">
                <h2 style="font-size:28px; color:var(--text-main);">Cargando Panel Administrativo de Lenguas...</h2>
            </div>
        `, 'admin', user);
        WebLayout.attachEvents();

        await this.loadEjercicios();
        this.renderAdminPanel(container, user);
    },

    async loadEjercicios() {
        try {
            this.ejercicios = await apiService.getEjercicios(this.selectedLengua);
        } catch (e) {
            console.error('Error cargando ejercicios en AdminView', e);
            this.ejercicios = [];
        }
    },

    renderAdminPanel(container, user) {
        const lenguasDisponibles = ['Chol', 'Maya', 'LSM'];

        const contentHtml = `
            <div style="max-width: 1100px; margin: 0 auto; padding-bottom: 60px;">
                <!-- Header del Panel Admin -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom: 32px;">
                    <div>
                        <h1 style="font-size: 32px; font-weight: 800; color: var(--text-main); margin-bottom: 6px; display:flex; align-items:center; gap:12px;">
                             Gestor de Mensajes y Contenido
                        </h1>
                        <p style="color: var(--text-muted); font-size: 16px;">
                            Administra, edita y agrega expresiones, frases y ejercicios dentro de las lenguas indígenas y LSM.
                        </p>
                    </div>
                    <div>
                        <button id="btn-nuevo-ejercicio" class="btn btn-primary" style="background: linear-gradient(135deg, #10B981, #059669); font-weight: 700; padding: 12px 24px; font-size: 15px; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
                             Agregar Nuevo Mensaje / Ejercicio
                        </button>
                    </div>
                </div>

                <!-- Selector de Lengua Tabs -->
                <div style="display:flex; gap:12px; margin-bottom: 28px; border-bottom: 2px solid var(--border-color); padding-bottom: 12px;">
                    ${lenguasDisponibles.map(len => `
                        <button class="tab-lengua btn ${this.selectedLengua === len ? 'btn-primary' : 'btn-outline'}" 
                                data-lengua="${len}"
                                style="font-weight:700; padding:10px 24px; border-radius:12px; font-size:15px; ${this.selectedLengua === len ? 'background: linear-gradient(135deg, #F59E0B, #D97706); border:none; color:white;' : ''}">
                            ${len === 'Chol' ? 'Chol (Lakty\'añ)' : len === 'Maya' ? 'Maya (Yokot\'an)' : 'LSM (Señas)'}
                        </button>
                    `).join('')}
                </div>

                <!-- Resumen de Estadísticas de la Lengua -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px;">
                    <div class="card glass-panel" style="padding: 20px; text-align: center; border-left: 4px solid #F59E0B;">
                        <span style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Total de Mensajes/Ejercicios</span>
                        <h3 style="font-size: 32px; font-weight: 800; color: #F59E0B; margin-top: 4px;">${this.ejercicios.length}</h3>
                    </div>
                    <div class="card glass-panel" style="padding: 20px; text-align: center; border-left: 4px solid #10B981;">
                        <span style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Nivel Básico</span>
                        <h3 style="font-size: 32px; font-weight: 800; color: #10B981; margin-top: 4px;">${this.ejercicios.filter(e => (e.nivel || '').toLowerCase() === 'básico').length}</h3>
                    </div>
                    <div class="card glass-panel" style="padding: 20px; text-align: center; border-left: 4px solid #3B82F6;">
                        <span style="font-size: 13px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Nivel Intermedio</span>
                        <h3 style="font-size: 32px; font-weight: 800; color: #3B82F6; margin-top: 4px;">${this.ejercicios.filter(e => (e.nivel || '').toLowerCase() === 'intermedio').length}</h3>
                    </div>
                </div>

                <!-- Listado de Ejercicios y Mensajes -->
                <div class="card glass-panel" style="padding: 28px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 20px; color: var(--text-main);">
                        Catálogo de Mensajes e Interacciones (${this.selectedLengua})
                    </h3>

                    ${this.ejercicios.length === 0 ? `
                        <div style="text-align:center; padding:40px; color:var(--text-muted);">
                            No hay mensajes o ejercicios registrados para esta lengua aún.
                        </div>
                    ` : `
                        <div style="display:flex; flex-direction:column; gap: 16px;">
                            ${this.ejercicios.map((ej, index) => `
                                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 14px; padding: 20px 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                                    <div style="flex:1; min-width:280px;">
                                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                                            <span style="background:rgba(245,158,11,0.15); color:#F59E0B; font-weight:800; font-size:12px; padding:3px 10px; border-radius:12px;">#${ej.id}</span>
                                            <span style="background:rgba(59,130,246,0.15); color:#3B82F6; font-size:12px; font-weight:700; padding:3px 10px; border-radius:12px;">${ej.nivel || 'Básico'}</span>
                                            <span style="color:var(--text-muted); font-size:13px; font-weight:600;"> ${ej.titulo || 'General'}</span>
                                        </div>
                                        <h4 style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:8px; line-height:1.5;">
                                            ${ej.pregunta}
                                        </h4>
                                        <div style="font-size:13px; color:var(--text-muted); display:flex; flex-wrap:wrap; gap:12px;">
                                            <span> Correcta: <strong style="color:#10B981;">${ej.respuestaCorrecta}</strong></span>
                                        </div>
                                    </div>

                                    <div style="display:flex; gap:10px;">
                                        <button class="btn btn-outline btn-edit-ej" data-id="${ej.id}" style="border-color:#F59E0B; color:#F59E0B; font-size:14px; padding:8px 16px; font-weight:700;">
                                            Editar
                                        </button>
                                        <button class="btn btn-outline btn-delete-ej" data-id="${ej.id}" style="border-color:#EF4444; color:#EF4444; font-size:14px; padding:8px 14px; font-weight:700;">
                                             Eliminar
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>

            <!-- Modal para Editar / Crear Ejercicio -->
            <div id="admin-exercise-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); z-index:9999; justify-content:center; align-items:center; padding:20px;">
                <div class="card glass-panel" style="max-width:650px; width:100%; max-height:90vh; overflow-y:auto; padding:36px; position:relative; border-top:6px solid #F59E0B;">
                    <button id="btn-close-modal" style="position:absolute; top:20px; right:20px; background:none; border:none; color:var(--text-muted); font-size:24px; cursor:pointer;">&times;</button>
                    
                    <h2 id="modal-title" style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:20px;">
                        Editar Mensaje / Ejercicio
                    </h2>

                    <form id="form-exercise" style="display:flex; flex-direction:column; gap:16px;">
                        <input type="hidden" id="modal-ej-id" value="">
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                            <div>
                                <label style="display:block; font-weight:600; font-size:14px; margin-bottom:6px; color:var(--text-main);">Lengua</label>
                                <select id="modal-lengua" class="input-field" style="width:100%; padding:10px 14px; border-radius:10px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                                    <option value="Chol">Chol</option>
                                    <option value="Maya">Maya Yokot'an</option>
                                    <option value="LSM">LSM</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; font-size:14px; margin-bottom:6px; color:var(--text-main);">Nivel</label>
                                <select id="modal-nivel" class="input-field" style="width:100%; padding:10px 14px; border-radius:10px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                                    <option value="Básico">Básico</option>
                                    <option value="Intermedio">Intermedio</option>
                                    <option value="Avanzado">Avanzado</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style="display:block; font-weight:600; font-size:14px; margin-bottom:6px; color:var(--text-main);">Título / Tema del Módulo</label>
                            <input type="text" id="modal-titulo" class="input-field" required placeholder="Ej: Saludos básicos y cortesía" style="width:100%; padding:10px 14px; border-radius:10px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                        </div>

                        <div>
                            <label style="display:block; font-weight:600; font-size:14px; margin-bottom:6px; color:var(--text-main);">Pregunta / Texto del Mensaje en la Lengua</label>
                            <textarea id="modal-pregunta" class="input-field" required rows="3" placeholder="Ej: ¿Cómo se dice &quot;gracias&quot; en chol?" style="width:100%; padding:10px 14px; border-radius:10px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main); font-family:inherit;"></textarea>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                            <div>
                                <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px; color:var(--text-main);">Opción 1</label>
                                <input type="text" id="modal-opcion1" class="input-field" required style="width:100%; padding:8px 12px; border-radius:8px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px; color:var(--text-main);">Opción 2</label>
                                <input type="text" id="modal-opcion2" class="input-field" required style="width:100%; padding:8px 12px; border-radius:8px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px; color:var(--text-main);">Opción 3</label>
                                <input type="text" id="modal-opcion3" class="input-field" required style="width:100%; padding:8px 12px; border-radius:8px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; font-size:13px; margin-bottom:4px; color:var(--text-main);">Opción 4</label>
                                <input type="text" id="modal-opcion4" class="input-field" required style="width:100%; padding:8px 12px; border-radius:8px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                            </div>
                        </div>

                        <div>
                            <label style="display:block; font-weight:700; font-size:14px; margin-bottom:6px; color:#10B981;">Respuesta Correcta (debe coincidir exactamente con una opción)</label>
                            <input type="text" id="modal-respuesta" class="input-field" required placeholder="Copia aquí el texto exacto de la respuesta correcta" style="width:100%; padding:10px 14px; border-radius:10px; background:var(--bg-input); border:1px solid #10B981; color:var(--text-main); font-weight:600;">
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:16px;">
                            <button type="button" id="btn-cancel-modal" class="btn btn-outline">Cancelar</button>
                            <button type="submit" class="btn btn-primary" style="background:#F59E0B; padding:10px 24px; font-weight:700; border:none; color:white;">
                                Guardar Mensaje
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        container.innerHTML = WebLayout.render(contentHtml, 'admin', user);
        WebLayout.attachEvents();

        this.attachPanelEvents(container, user);
    },

    attachPanelEvents(container, user) {
        // Eventos de selección de pestañas de lengua
        container.querySelectorAll('.tab-lengua').forEach(btn => {
            btn.onclick = async () => {
                this.selectedLengua = btn.getAttribute('data-lengua');
                await this.loadEjercicios();
                this.renderAdminPanel(container, user);
            };
        });

        // Referencias al Modal
        const modal = document.getElementById('admin-exercise-modal');
        const modalTitle = document.getElementById('modal-title');
        const formExercise = document.getElementById('form-exercise');
        const btnCloseModal = document.getElementById('btn-close-modal');
        const btnCancelModal = document.getElementById('btn-cancel-modal');
        const btnNuevoEjercicio = document.getElementById('btn-nuevo-ejercicio');

        const openModal = (ejercicio = null) => {
            this.editingExercise = ejercicio;
            if (modalTitle) modalTitle.innerText = ejercicio ? `Editar Mensaje #${ejercicio.id}` : 'Nuevo Mensaje / Ejercicio';
            
            document.getElementById('modal-ej-id').value = ejercicio ? ejercicio.id : '';
            document.getElementById('modal-lengua').value = ejercicio ? ejercicio.lengua : this.selectedLengua;
            document.getElementById('modal-nivel').value = ejercicio ? (ejercicio.nivel || 'Básico') : 'Básico';
            document.getElementById('modal-titulo').value = ejercicio ? (ejercicio.titulo || '') : '';
            document.getElementById('modal-pregunta').value = ejercicio ? (ejercicio.pregunta || '') : '';
            document.getElementById('modal-opcion1').value = ejercicio ? (ejercicio.opcion1 || '') : '';
            document.getElementById('modal-opcion2').value = ejercicio ? (ejercicio.opcion2 || '') : '';
            document.getElementById('modal-opcion3').value = ejercicio ? (ejercicio.opcion3 || '') : '';
            document.getElementById('modal-opcion4').value = ejercicio ? (ejercicio.opcion4 || '') : '';
            document.getElementById('modal-respuesta').value = ejercicio ? (ejercicio.respuestaCorrecta || '') : '';

            if (modal) modal.style.display = 'flex';
        };

        const closeModal = () => {
            if (modal) modal.style.display = 'none';
        };

        if (btnNuevoEjercicio) btnNuevoEjercicio.onclick = () => openModal(null);
        if (btnCloseModal) btnCloseModal.onclick = closeModal;
        if (btnCancelModal) btnCancelModal.onclick = closeModal;

        // Editar ejercicio existente desde la lista
        container.querySelectorAll('.btn-edit-ej').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'));
                const targetEj = this.ejercicios.find(e => e.id === id);
                if (targetEj) openModal(targetEj);
            };
        });

        // Eliminar ejercicio
        container.querySelectorAll('.btn-delete-ej').forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.getAttribute('data-id'));
                if (confirm(`¿Estás seguro de eliminar el ejercicio #${id}?`)) {
                    try {
                        await apiService.eliminarEjercicio(id, user.rol);
                        alert('Ejercicio eliminado con éxito.');
                        await this.loadEjercicios();
                        this.renderAdminPanel(container, user);
                    } catch (e) {
                        alert(e.message);
                    }
                }
            };
        });

        // Form Submit
        if (formExercise) {
            formExercise.onsubmit = async (e) => {
                e.preventDefault();
                const id = document.getElementById('modal-ej-id').value;
                const payload = {
                    lengua: document.getElementById('modal-lengua').value,
                    nivel: document.getElementById('modal-nivel').value,
                    titulo: document.getElementById('modal-titulo').value,
                    pregunta: document.getElementById('modal-pregunta').value,
                    opcion1: document.getElementById('modal-opcion1').value,
                    opcion2: document.getElementById('modal-opcion2').value,
                    opcion3: document.getElementById('modal-opcion3').value,
                    opcion4: document.getElementById('modal-opcion4').value,
                    respuestaCorrecta: document.getElementById('modal-respuesta').value
                };

                try {
                    if (id) {
                        await apiService.actualizarEjercicio(id, payload, user.rol);
                        alert('Mensaje / Ejercicio actualizado correctamente.');
                    } else {
                        await apiService.crearEjercicio(payload, user.rol);
                        alert('Nuevo mensaje creado con éxito.');
                    }
                    closeModal();
                    await this.loadEjercicios();
                    this.renderAdminPanel(container, user);
                } catch (err) {
                    alert('Error: ' + err.message);
                }
            };
        }
    }
};
