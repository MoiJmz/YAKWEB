import { WebLayout } from '../components/WebLayout.js';
import { graphqlService } from '../services/graphqlService.js';
import { Router } from '../main.js';

export const DashboardView = {
    async render(container, user) {
        // Obtenemos racha real desde API
        let rachaData = { dias: 0, rachaActiva: false, rachaPerdida: false };
        try {
            const resRacha = await fetch(`http://localhost:3000/api/v1/racha/${user.id}`);
            if (resRacha.ok) {
                rachaData = await resRacha.json();
            }
        } catch(e) { console.error('Error cargando racha:', e); }

        const rachaDias = rachaData.dias || 0;

        let rachaHeroHtml = '';
        if (rachaData.rachaActiva && rachaDias > 0) {
            rachaHeroHtml = `
                <div class="card streak-card" style="padding: 32px 36px; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.25)); border:1px solid rgba(16,185,129,0.4);">
                    <div>
                        <h2 style="font-size: 38px; margin-bottom: 6px; color:#10B981;">🔥 ${rachaDias} ${rachaDias === 1 ? 'día' : 'días'} de racha</h2>
                        <p style="font-size: 16px; opacity:0.9;">¡Excelente trabajo! Has completado tus actividades diarias.</p>
                    </div>
                    <div style="font-size: 64px;">🔥</div>
                </div>
            `;
        } else if (rachaData.rachaPerdida) {
            rachaHeroHtml = `
                <div class="card glass-panel" style="padding: 24px 32px; border-left: 6px solid #EF4444; display:flex; align-items:center; justify-content:space-between; background:rgba(239,68,68,0.08);">
                    <div>
                        <h3 style="font-size: 22px; margin-bottom: 4px; color: #EF4444;"> Racha Perdida por Inactividad</h3>
                        <p style="color: var(--text-muted); font-size: 15px;">No completaste un quiz con al menos 60% ayer. ¡Completa un quiz hoy con +60% para volver a conseguirla!</p>
                    </div>
                    <button class="btn btn-primary" style="background:#EF4444;" onclick="window.Router.navigate('/catalogo')">Recuperar Racha</button>
                </div>
            `;
        } else {
            rachaHeroHtml = `
                <div class="card glass-panel" style="padding: 24px 32px; border-left: 6px solid var(--primary-green); display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <h3 style="font-size: 22px; margin-bottom: 4px; color: var(--primary-green);">¡Comienza tu primera racha! 🔥</h3>
                        <p style="color: var(--text-muted); font-size: 15px;">Completa un quiz de los cursos con al menos 60% de aciertos para activar tu racha.</p>
                    </div>
                    <button class="btn btn-primary" onclick="window.Router.navigate('/catalogo')">Explorar Cursos</button>
                </div>
            `;
        }

        const contentHtml = `
            <div>
                <h1 style="font-size: 36px; margin-bottom: 8px;">¡Bienvenido de vuelta, ${user.username}! 👋</h1>
                <p style="color: var(--text-muted); font-size: 18px; margin-bottom: 32px;">Continúa tu aprendizaje de lenguas originarias.</p>

                <!-- Hero Section: Racha condicionada a >=60% -->
                <div style="margin-bottom: 40px;">
                    ${rachaHeroHtml}
                </div>

                <h2 style="margin-bottom: 24px; font-size: 24px;">Explorar Catálogo de Cursos</h2>
                
                <div class="dashboard-grid">
                    <div class="card course-card card-chol" onclick="window.startStudio('Chol')">
                        <h3 style="font-size: 28px; margin-bottom: 12px; color: #10B981;">Chol</h3>
                        <p style="color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">Descubre el idioma y cultura de la selva chiapaneca.</p>
                        <button class="btn btn-outline" style="width: 100%; border-color: #10B981; color: #10B981;">Estudiar Ahora</button>
                    </div>
                    
                    <div class="card course-card card-maya" onclick="window.startStudio('Maya')">
                        <h3 style="font-size: 28px; margin-bottom: 12px; color: #3B82F6;">Maya</h3>
                        <p style="color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">Sumérgete en la rica herencia de la península de Yucatán.</p>
                        <button class="btn btn-outline" style="width: 100%; border-color: #3B82F6; color: #3B82F6;">Estudiar Ahora</button>
                    </div>
                    
                    <div class="card course-card card-lsm" onclick="window.startStudio('LSM')">
                        <h3 style="font-size: 28px; margin-bottom: 12px; color: #8B5CF6;">LSM</h3>
                        <p style="color: var(--text-muted); line-height: 1.5; margin-bottom: 24px;">Aprende Lengua de Señas Mexicana de forma interactiva.</p>
                        <button class="btn btn-outline" style="width: 100%; border-color: #8B5CF6; color: #8B5CF6;">Estudiar Ahora</button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = WebLayout.render(contentHtml, 'dashboard', user);
        WebLayout.attachEvents();

        window.startStudio = (lengua) => {
            Router.navigate('/detalle-lengua', { lengua });
        };
    }
};
