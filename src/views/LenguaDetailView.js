import { WebLayout } from '../components/WebLayout.js';
import { graphqlService } from '../services/graphqlService.js';
import { Router } from '../main.js';

const LENGUA_INFO = {
    Chol: {
        nombre: "Chol (Lakty'añ)",
        region: "Chiapas, Tabasco y Campeche",
        hablantes: "Más de 250,000 hablantes",
        descripcion: "El Chol pertenece a la familia de las lenguas mayas. Es una lengua viva hablada principalmente en la región noroeste del estado de Chiapas. Tiene una rica tradición oral ligada a la cosmovisión de la selva y la agricultura del maíz.",
        color: "#10B981",
        temas: ["Saludos básicos y cortesía", "Números del 1 al 5", "Animales del entorno", "Colores tradicionales"]
    },
    Maya: {
        nombre: "Maya Tabasqueño (Yokot'an)",
        region: "Región de la Chontalpa, Tabasco (Nacajuca, Centla, Jalpa de Méndez, Centro y Macuspana)",
        hablantes: "Cerca de 60,000 hablantes",
        descripcion: "El yokot'an, o \"la lengua verdadera\" como la llaman sus propios hablantes, se habla en la región de la Chontalpa, en Tabasco —principalmente en Nacajuca, Centla, Jalpa de Méndez, Centro y Macuspana—. Sus hablantes descienden de los putunes, un pueblo maya de navegantes y comerciantes que dominó las rutas acuáticas del Golfo de México, conectando el Yucatán con el altiplano central en la época prehispánica. Por eso a los yokot'anob se les ha llamado \"los mayas del agua\": su territorio está atravesado por ríos, lagunas y pantanos, y esa relación con el agua sigue marcando su forma de vida, su gastronomía y su identidad. Hoy la lengua tiene cerca de 60,000 hablantes y se considera en riesgo de desaparición, lo que hace especialmente valioso cualquier esfuerzo por enseñarla y difundirla.",
        color: "#3B82F6",
        temas: ["Saludos y presentaciones", "La familia y la naturaleza", "Comida y fauna tradicional", "Números y frases cotidianas"]
    },
    LSM: {
        nombre: "Lengua de Señas Mexicana (LSM)",
        region: "Todo el territorio nacional de México",
        hablantes: "Comunidad Sorda e incluyente de México",
        descripcion: "La LSM es la lengua oficial articulada por la comunidad sorda en las regiones urbanas y rurales de México. Consiste en una gramática propia expresada mediante signos gestuales, manos y expresiones faciales.",
        color: "#8B5CF6",
        temas: ["Abecedario dactilológico", "Saludos comunes", "Números del 1 al 5", "Cosas de la casa"]
    }
};

export const LenguaDetailView = {
    async render(container, params, user) {
        const lenguaKey = params.lengua || 'Chol';
        const info = LENGUA_INFO[lenguaKey] || LENGUA_INFO['Chol'];

        let ejercicios = [];
        try {
            const query = `
                query GetEjercicios($len: String!) {
                    getEjerciciosPorLengua(lengua: $len) {
                        id
                        titulo
                        nivel
                    }
                }
            `;
            const data = await graphqlService.query(query, { len: lenguaKey });
            ejercicios = data.getEjerciciosPorLengua || [];
        } catch(e) { console.error(e); }

        const contentHtml = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px;">
                    <button class="btn btn-outline" onclick="window.Router.navigate('/catalogo')">Volver</button>
                    <span style="background:${info.color}22; color:${info.color}; font-weight:700; padding:6px 16px; border-radius:20px;">
                        Módulo Oficial
                    </span>
                </div>

                <!-- Hero Info Header -->
                <div class="card glass-panel" style="border-left: 8px solid ${info.color}; padding: 44px 40px; margin-bottom: 48px;">
                    <h1 style="font-size: 40px; color: ${info.color}; margin-bottom: 24px; font-weight: 800;">${info.nombre}</h1>
                    <p style="font-size: 16px; line-height: 1.85; color: var(--text-main); margin-bottom: 32px; letter-spacing: 0.15px;">${info.descripcion}</p>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 28px;">
                        <div style="background: rgba(255,255,255,0.03); padding: 14px 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                            📍 <strong style="color:var(--text-main); font-size:15px;">Región:</strong> 
                            <div style="color:var(--text-muted); font-size:14px; margin-top:4px;">${info.region}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 14px 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                            🗣️ <strong style="color:var(--text-main); font-size:15px;">Comunidad:</strong> 
                            <div style="color:var(--text-muted); font-size:14px; margin-top:4px;">${info.hablantes}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 14px 20px; border-radius: 12px; border: 1px solid var(--border-color);">
                            📖 <strong style="color:var(--text-main); font-size:15px;">Ejercicios:</strong> 
                            <div style="color:var(--text-muted); font-size:14px; margin-top:4px;">${ejercicios.length} lecciones en total</div>
                        </div>
                    </div>
                </div>

                <!-- Course Outline & Actions -->
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 48px;">
                    <div>
                        <h2 style="margin-bottom: 28px; font-size:26px; font-weight:700;">Contenido del Curso (Elige un Tema)</h2>
                        <div style="display:flex; flex-direction:column; gap:24px;">
                            ${info.temas.map((tema, idx) => `
                                <div class="card glass-panel" style="display:flex; align-items:center; justify-content:space-between; padding:28px 32px; cursor:pointer; margin-bottom:0; transition:all 0.2s ease; border-left: 6px solid ${info.color};" onclick="window.Router.navigate('/studio', { lengua: '${lenguaKey}', titulo: '${encodeURIComponent(tema)}', index: 0 })">
                                    <div style="display:flex; align-items:center; gap:24px;">
                                        <span style="background:${info.color}; color:white; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:22px;">${idx + 1}</span>
                                        <div>
                                            <h3 style="font-size:20px; color:var(--text-main); margin-bottom:6px;">${tema}</h3>
                                            <span style="color:var(--text-muted); font-size:14px; font-weight:600;">10 ejercicios interactivos</span>
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" style="background:${info.color}; font-size:15px; padding:12px 24px; pointer-events:none;">
                                        Iniciar Tema
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div>
                        <div class="card glass-panel" style="text-align:center; padding:40px 32px; position:sticky; top:32px;">
                            <h3 style="font-size:24px; margin-bottom:14px; font-weight:700;">Examen Global</h3>
                            <p style="color:var(--text-muted); margin-bottom:28px; line-height:1.6; font-size:15px;">Evaluación completa de 25 preguntas aleatorias de todos los temas.</p>
                            <button class="btn btn-primary" style="width:100%; font-size:17px; padding:14px; background:${info.color};" onclick="window.Router.navigate('/studio', { lengua: '${lenguaKey}', isFullExam: 'true', index: 0 })">
                                Examen Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = WebLayout.render(contentHtml, 'catalogo', user);
        WebLayout.attachEvents();
        window.Router = Router;
    }
};
