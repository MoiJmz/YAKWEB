import { WebLayout } from '../components/WebLayout.js';
import { apiService } from '../services/apiService.js';
import { Router } from '../main.js';

export const ProgresoView = {
    async render(container, user) {
        let intentos = [];
        try {
            const localData = localStorage.getItem('yak_evaluaciones');
            if (localData) {
                intentos = JSON.parse(localData);
            }
            const uId = (user && user.id) ? user.id : 1;
            const serverIntentos = await apiService.getIntentos(uId);
            if (serverIntentos && serverIntentos.length > 0) {
                serverIntentos.forEach(sItem => {
                    const exists = intentos.some(i => i.lengua === sItem.lengua && i.titulo === sItem.titulo);
                    if (!exists) intentos.push(sItem);
                });
            }
        } catch(e) { console.error('Error cargando intentos:', e); }

        const contentHtml = `
            <div>
                <h1 style="font-size: 36px; margin-bottom: 8px;">Mis Estadísticas</h1>
                <p style="color: var(--text-muted); font-size: 18px; margin-bottom: 40px;">Resumen de cursos contestados y promedio de tu último intento.</p>

                <div class="card glass-panel" style="padding: 32px;">
                    <h2 style="margin-bottom: 24px; font-size: 22px; color: var(--text-main);">Cursos y Módulos Evaluados</h2>

                    ${(!intentos || intentos.length === 0) ? `
                        <div style="text-align: center; padding: 48px 20px;">
                            <p style="color: var(--text-muted); font-size: 18px; margin-bottom: 20px;">Aún no has completado evaluaciones ni exámenes.</p>
                            <button id="btn-go-courses" class="btn btn-primary">Ir a los Cursos</button>
                        </div>
                    ` : `
                        <table style="width:100%; border-collapse:collapse; text-align:left;">
                            <thead>
                                <tr style="border-bottom:2px solid var(--border-color); color:var(--text-muted); font-size:15px;">
                                    <th style="padding:16px;">Curso / Lengua</th>
                                    <th style="padding:16px;">Tema / Evaluación</th>
                                    <th style="padding:16px; text-align:center;">Último Promedio</th>
                                    <th style="padding:16px; text-align:center;">Aciertos</th>
                                    <th style="padding:16px; text-align:center;">Estado</th>
                                    <th style="padding:16px; text-align:right;">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${intentos.map(item => {
                                    const isPassed = item.porcentaje >= 60;
                                    const statusBg = isPassed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)';
                                    const statusColor = isPassed ? '#10B981' : '#EF4444';
                                    const statusText = isPassed ? 'Aprobado' : 'Por Mejorar';

                                    return `
                                        <tr style="border-bottom:1px solid var(--border-color); font-size:16px;">
                                            <td style="padding:16px; font-weight:700; color:var(--text-main);">${item.lengua}</td>
                                            <td style="padding:16px; color:var(--text-main);">${item.titulo}</td>
                                            <td style="padding:16px; text-align:center; font-weight:800; font-size:18px; color:${statusColor};">
                                                ${item.porcentaje}%
                                            </td>
                                            <td style="padding:16px; text-align:center; color:var(--text-muted);">
                                                ${item.aciertos} / ${item.total}
                                            </td>
                                            <td style="padding:16px; text-align:center;">
                                                <span style="background:${statusBg}; color:${statusColor}; padding:6px 14px; border-radius:20px; font-weight:700; font-size:14px;">
                                                    ${statusText}
                                                </span>
                                            </td>
                                            <td style="padding:16px; text-align:right; color:var(--text-muted); font-size:14px;">
                                                ${item.fecha}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = WebLayout.render(contentHtml, 'progreso', user);
        WebLayout.attachEvents();

        const btnGo = document.getElementById('btn-go-courses');
        if (btnGo) {
            btnGo.onclick = () => Router.navigate('/catalogo');
        }

        window.Router = Router;
    }
};
