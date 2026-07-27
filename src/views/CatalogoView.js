import { WebLayout } from '../components/WebLayout.js';
import { graphqlService } from '../services/graphqlService.js';
import { Router } from '../main.js';

export const CatalogoView = {
    async render(container, user) {
        let ejercicios = [];
        try {
            const query = `
                query {
                    getEjercicios {
                        id
                        lengua
                        titulo
                        nivel
                        pregunta
                    }
                }
            `;
            const data = await graphqlService.query(query);
            ejercicios = data.getEjercicios;
        } catch(e) { console.error(e); }

        // Agrupar por lengua
        const chol = ejercicios.filter(e => e.lengua === 'Chol');
        const maya = ejercicios.filter(e => e.lengua === 'Maya');
        const lsm = ejercicios.filter(e => e.lengua === 'LSM');

        const contentHtml = `
            <div>
                <h1 style="font-size: 36px; margin-bottom: 12px;">Cursos</h1>
                <p style="color: var(--text-muted); font-size: 18px; margin-bottom: 48px;">Explora todos los ejercicios y módulos disponibles.</p>

                <!-- Chol Section -->
                <div class="card glass-panel" style="border-left: 6px solid #10B981; margin-bottom: 32px; padding: 36px 40px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="color:#10B981; font-size:28px; margin-bottom:6px;">Lengua Chol</h2>
                            <p style="color:var(--text-muted); font-size:16px;">${chol.length} ejercicios disponibles</p>
                        </div>
                        <button class="btn btn-primary" style="background:#10B981;" onclick="window.Router.navigate('/detalle-lengua', { lengua: 'Chol' })">Ver Información del Curso</button>
                    </div>
                </div>

                <!-- Maya Section -->
                <div class="card glass-panel" style="border-left: 6px solid #3B82F6; margin-bottom: 32px; padding: 36px 40px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="color:#3B82F6; font-size:28px; margin-bottom:6px;">Lengua Maya Tabasqueña (Yokot'an)</h2>
                            <p style="color:var(--text-muted); font-size:16px;">${maya.length} ejercicios disponibles</p>
                        </div>
                        <button class="btn btn-primary" style="background:#3B82F6;" onclick="window.Router.navigate('/detalle-lengua', { lengua: 'Maya' })">Ver Información del Curso</button>
                    </div>
                </div>

                <!-- LSM Section -->
                <div class="card glass-panel" style="border-left: 6px solid #8B5CF6; margin-bottom: 32px; padding: 36px 40px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h2 style="color:#8B5CF6; font-size:28px; margin-bottom:6px;">Lengua de Señas Mexicana (LSM)</h2>
                            <p style="color:var(--text-muted); font-size:16px;">${lsm.length} ejercicios disponibles</p>
                        </div>
                        <button class="btn btn-primary" style="background:#8B5CF6;" onclick="window.Router.navigate('/detalle-lengua', { lengua: 'LSM' })">Ver Información del Curso</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = WebLayout.render(contentHtml, 'catalogo', user);
        WebLayout.attachEvents();
        window.Router = Router;
    }
};
