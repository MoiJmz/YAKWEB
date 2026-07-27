import { WebLayout } from '../components/WebLayout.js';
import { graphqlService } from '../services/graphqlService.js';
import { apiService } from '../services/apiService.js';
import { Router } from '../main.js';

export const LearningStudioView = {
    // Almacena respuestas del usuario y lista de preguntas barajadas
    userAnswers: {},
    activeQuizKey: null,
    shuffledEjercicios: [],

    // Algoritmo Fisher-Yates para barajar preguntas aleatoriamente
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },

    saveCurrentProgress(lengua, tituloEvaluacion, totalEjercicios, user) {
        const answeredIds = Object.keys(this.userAnswers);
        if (answeredIds.length === 0) return;

        let correctCount = 0;
        answeredIds.forEach(id => {
            if (this.userAnswers[id] === true) correctCount++;
        });

        const porcentaje = Math.round((correctCount / totalEjercicios) * 100);
        const fecha = new Date().toLocaleDateString();

        const itemRecord = {
            lengua,
            titulo: tituloEvaluacion,
            porcentaje,
            aciertos: correctCount,
            total: totalEjercicios,
            fecha
        };

        try {
            const currentLocal = JSON.parse(localStorage.getItem('yak_evaluaciones') || '[]');
            const idx = currentLocal.findIndex(i => i.lengua === lengua && i.titulo === tituloEvaluacion);
            if (idx >= 0) {
                currentLocal[idx] = itemRecord;
            } else {
                currentLocal.unshift(itemRecord);
            }
            localStorage.setItem('yak_evaluaciones', JSON.stringify(currentLocal));
        } catch(e) { console.error('Error guardando en localStorage', e); }

        try {
            const uId = (user && user.id) ? user.id : 1;
            apiService.guardarIntento(uId, lengua, tituloEvaluacion, porcentaje, correctCount, totalEjercicios);
        } catch(e) { console.error('Error guardando en API', e); }
    },

    async render(container, params, user) {
        const { lengua } = params;
        const titulo = params.titulo ? decodeURIComponent(params.titulo) : null;
        const isFullExam = params.isFullExam === 'true';
        const showResults = params.showResults === 'true';
        const restart = params.restart === 'true';
        let currentIndex = parseInt(params.index || 0);

        const currentQuizKey = `${lengua}_${titulo || (isFullExam ? 'EXAM_25' : 'ALL')}`;

        container.innerHTML = WebLayout.render(`
            <div class="studio-container" style="padding-top:40px; text-align:center;">
                <h2 style="font-size:32px; color:var(--primary-green)">Cargando Módulo...</h2>
            </div>
        `, 'catalogo', user);
        WebLayout.attachEvents();

        try {
            // Solo reseteamos si cambió de tema/lengua o si presionó "Reiniciar Quiz" (restart=true)
            if (this.activeQuizKey !== currentQuizKey || restart || !this.shuffledEjercicios.length) {
                this.activeQuizKey = currentQuizKey;
                this.userAnswers = {};

                const query = `
                    query GetEjercicios($len: String!) {
                        getEjerciciosPorLengua(lengua: $len) {
                            id
                            titulo
                            pregunta
                            opcion1
                            opcion2
                            opcion3
                            opcion4
                            respuestaCorrecta
                            nivel
                        }
                    }
                `;

                const data = await graphqlService.query(query, { len: lengua });
                let rawEjercicios = data.getEjerciciosPorLengua || [];
                
                if (isFullExam) {
                    // Examen Completo de 25 preguntas más difíciles (priorizando Intermedio/Avanzado)
                    const dificiles = rawEjercicios.filter(e => e.nivel && e.nivel.toLowerCase() !== 'básico');
                    const faciles = rawEjercicios.filter(e => !e.nivel || e.nivel.toLowerCase() === 'básico');
                    
                    const pool = [...this.shuffleArray(dificiles), ...this.shuffleArray(faciles)];
                    rawEjercicios = pool.slice(0, 25);
                } else if (titulo) {
                    const cleanTitulo = titulo.toLowerCase().trim();
                    rawEjercicios = rawEjercicios.filter(e => {
                        const t = e.titulo.toLowerCase().trim();
                        return t.includes(cleanTitulo) || cleanTitulo.includes(t);
                    });
                }

                // BARAJAMOS ALEATORIAMENTE LAS PREGUNTAS
                this.shuffledEjercicios = this.shuffleArray(rawEjercicios);
            }

            const ejercicios = this.shuffledEjercicios;

            if (ejercicios.length === 0) {
                document.querySelector('.content-container').innerHTML = `
                    <div class="text-center mt-48">
                        <h2>No hay ejercicios disponibles para ${lengua}.</h2>
                        <button class="btn btn-primary mt-24" onclick="window.Router.navigate('/catalogo')">Volver</button>
                    </div>
                `;
                return;
            }

            const totalEjercicios = ejercicios.length;
            const answeredCount = Object.keys(this.userAnswers).length;
            const allAnswered = answeredCount >= totalEjercicios;
            const tituloEvaluacion = isFullExam ? 'Examen Completo' : (titulo || 'General');

            const navParams = { lengua };
            if (titulo) navParams.titulo = encodeURIComponent(titulo);
            if (isFullExam) navParams.isFullExam = 'true';

            // --- VISTA DE PÁGINA DE RESULTADOS (RESUMEN NETACAD STYLE) ---
            if (showResults) {
                if (!allAnswered) {
                    alert(`Debes responder todas las preguntas (${answeredCount}/${totalEjercicios} respondidas) antes de ver la página de resultados.`);
                    const firstUnanswered = ejercicios.findIndex(ej => this.userAnswers[ej.id] === undefined);
                    const targetIndex = firstUnanswered >= 0 ? firstUnanswered : 0;
                    Router.navigate('/studio', { ...navParams, index: targetIndex });
                    return;
                }

                let correctCount = 0;
                ejercicios.forEach(ej => {
                    if (this.userAnswers[ej.id] === true) correctCount++;
                });

                const percentage = Math.round((correctCount / totalEjercicios) * 100);
                const isPassed = percentage >= 60;

                // Guardar resultado final en localStorage y servidor
                this.saveCurrentProgress(lengua, tituloEvaluacion, totalEjercicios, user);

                const resultsHtml = `
                    <div class="studio-container">
                        <!-- Top Navigation Bar -->
                        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:32px; justify-content:center;">
                            ${ejercicios.map((_, i) => `
                                <button class="btn btn-outline nav-q-btn" data-index="${i}" style="padding:6px 14px; font-size:14px;">
                                    Q${i + 1}
                                </button>
                            `).join('')}
                            <button class="btn btn-primary" style="padding:6px 16px; font-size:14px; background:var(--primary-green);">
                                Página de resultados
                            </button>
                        </div>

                        <!-- Results Card Gauge -->
                        <div class="card glass-panel" style="text-align:center; padding:48px; max-width:600px; margin:0 auto;">
                            <div style="position:relative; width:180px; height:180px; margin:0 auto 24px auto; display:flex; align-items:center; justify-content:center;">
                                <svg width="180" height="180" viewBox="0 0 36 36" style="transform: rotate(-90deg);">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border-color)" stroke-width="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${isPassed ? '#10B981' : '#EF4444'}" stroke-width="3.5" stroke-dasharray="${percentage}, 100" />
                                </svg>
                                <span style="position:absolute; font-size:42px; font-weight:800; font-family:var(--font-heading); color:var(--text-main);">
                                    ${percentage}%
                                </span>
                            </div>

                            <h2 style="font-size:28px; margin-bottom:12px;">
                                ${isPassed ? '¡Enhorabuena, has aprobado el examen!' : 'Continúa practicando para mejorar tu puntaje'}
                            </h2>
                            <p style="color:var(--text-muted); font-size:18px; margin-bottom:32px;">
                                Has obtenido una puntuación de <strong>${percentage}%</strong> (${correctCount} de ${totalEjercicios} correctas).
                            </p>

                            <div style="display:flex; gap:16px; justify-content:center;">
                                <button id="btn-restart-quiz" class="btn btn-primary" style="background:#10B981;">
                                    Reiniciar Quiz
                                </button>
                                <button id="btn-back-course" class="btn btn-outline">
                                    Volver al Curso
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                document.querySelector('.content-container').innerHTML = resultsHtml;

                document.querySelectorAll('.nav-q-btn').forEach(btn => {
                    btn.onclick = () => {
                        const idx = btn.getAttribute('data-index');
                        Router.navigate('/studio', { ...navParams, index: parseInt(idx) });
                    };
                });

                document.getElementById('btn-restart-quiz').onclick = () => Router.navigate('/studio', { ...navParams, index: 0, restart: 'true' });
                document.getElementById('btn-back-course').onclick = () => Router.navigate('/detalle-lengua', { lengua });

                return;
            }

            // --- VISTA DE PREGUNTA / EJERCICIO ---
            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex >= totalEjercicios) currentIndex = totalEjercicios - 1;

            const ej = ejercicios[currentIndex];

            const studioHtml = `
                <div class="studio-container">
                    <!-- Top Navigation Bar -->
                    <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:24px; justify-content:center;">
                        ${ejercicios.map((_, i) => `
                            <button class="btn ${i === currentIndex ? 'btn-primary' : 'btn-outline'} nav-q-btn" data-index="${i}" style="padding:6px 14px; font-size:14px; ${i === currentIndex ? 'background:var(--primary-green);' : ''}">
                                Q${i + 1}
                            </button>
                        `).join('')}
                        <button id="btn-top-results" class="btn btn-outline" style="padding:6px 16px; font-size:14px; border-color:#10B981; color:#10B981; ${allAnswered ? '' : 'opacity:0.4; cursor:not-allowed;'}">
                            Página de resultados
                        </button>
                    </div>

                    <!-- Header de Pregunta -->
                    <div class="card glass-panel" style="margin-bottom:24px; padding:32px;">
                        <span style="color:var(--primary-green); font-weight:700; text-transform:uppercase; letter-spacing:1px; font-size:14px;">
                            PREGUNTA ${currentIndex + 1} DE ${totalEjercicios} ${isFullExam ? '— EXAMEN COMPLETO (25 Qs)' : ''}
                        </span>
                        <h2 style="font-size:28px; margin-top:8px; line-height:1.4;">${ej.pregunta}</h2>
                    </div>

                    <!-- Opciones de Respuesta -->
                    <div class="options-grid">
                        <button class="option-btn">${ej.opcion1}</button>
                        <button class="option-btn">${ej.opcion2}</button>
                        <button class="option-btn">${ej.opcion3}</button>
                        <button class="option-btn">${ej.opcion4}</button>
                    </div>

                    <div id="studio-feedback" style="margin-top:24px; padding:20px; border-radius:16px; display:none; text-align:center; font-size:20px; font-weight:bold;">
                    </div>

                    <!-- Bottom Nav Controls -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:32px;">
                        <button id="btn-prev-ej" class="btn btn-outline" ${currentIndex === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                            Anterior
                        </button>
                        
                        ${currentIndex === totalEjercicios - 1 ? `
                            <button id="btn-finish-quiz" class="btn btn-primary" style="background:#10B981;">
                                Finalizar y Ver Resultados
                            </button>
                        ` : `
                            <button id="btn-next-ej" class="btn btn-primary">
                                Siguiente
                            </button>
                        `}
                    </div>

                    <!-- Botón Salir posicionado más abajo a la derecha de Siguiente -->
                    <div style="display:flex; justify-content:flex-end; margin-top:56px; padding-top:24px; border-top:1px solid var(--border-color);">
                        <button id="btn-exit-exam" class="btn btn-outline" style="border-color:#EF4444; color:#EF4444; padding:10px 28px; font-weight:600;">
                            Salir
                        </button>
                    </div>
                </div>
            `;

            document.querySelector('.content-container').innerHTML = studioHtml;

            // Eventos de los botones de navegación por pregunta Q1..QN
            document.querySelectorAll('.nav-q-btn').forEach(btn => {
                btn.onclick = () => {
                    const idx = btn.getAttribute('data-index');
                    Router.navigate('/studio', { ...navParams, index: parseInt(idx) });
                };
            });

            // Botón Salir (Con confirmación)
            document.getElementById('btn-exit-exam').onclick = () => {
                if (confirm('¿Estás seguro de que quieres salir del quiz?')) {
                    Router.navigate('/detalle-lengua', { lengua });
                }
            };

            // Botón Superior Página de Resultados
            document.getElementById('btn-top-results').onclick = () => {
                const currentAnswered = Object.keys(this.userAnswers).length;
                if (currentAnswered < totalEjercicios) {
                    alert(`Debes responder las ${totalEjercicios} preguntas (${currentAnswered}/${totalEjercicios} respondidas) antes de ver la página de resultados.`);
                } else {
                    Router.navigate('/studio', { ...navParams, showResults: 'true' });
                }
            };

            const btnPrev = document.getElementById('btn-prev-ej');
            const btnNext = document.getElementById('btn-next-ej');
            const btnFinish = document.getElementById('btn-finish-quiz');

            if (btnPrev) btnPrev.onclick = () => Router.navigate('/studio', { ...navParams, index: currentIndex - 1 });
            if (btnNext) btnNext.onclick = () => Router.navigate('/studio', { ...navParams, index: currentIndex + 1 });
            if (btnFinish) {
                btnFinish.onclick = () => {
                    const currentAnswered = Object.keys(this.userAnswers).length;
                    if (currentAnswered < totalEjercicios) {
                        alert(`Por favor responde todas las preguntas del examen antes de finalizar (${currentAnswered}/${totalEjercicios} respondidas).`);
                    } else {
                        Router.navigate('/studio', { ...navParams, showResults: 'true' });
                    }
                };
            }

            // Validación de respuestas
            const btns = document.querySelectorAll('.option-btn');
            btns.forEach(btn => {
                btn.onclick = async () => {
                    btns.forEach(b => {
                        b.disabled = true;
                        b.style.opacity = '0.5';
                    });
                    btn.style.opacity = '1';

                    const isCorrect = btn.innerText.trim() === ej.respuestaCorrecta.trim();
                    this.userAnswers[ej.id] = isCorrect;

                    const feedback = document.getElementById('studio-feedback');
                    feedback.style.display = 'block';

                    if (isCorrect) {
                        btn.classList.add('option-correct');
                        feedback.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                        feedback.style.color = '#10B981';
                        feedback.innerText = '¡Excelente! Respuesta correcta';
                    } else {
                        btn.classList.add('option-incorrect');
                        feedback.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        feedback.style.color = '#EF4444';
                        feedback.innerText = 'Incorrecto. La respuesta era: ' + ej.respuestaCorrecta;
                        
                        btns.forEach(b => {
                            if (b.innerText.trim() === ej.respuestaCorrecta.trim()) {
                                b.classList.add('option-correct');
                                b.style.opacity = '1';
                            }
                        });
                    }

                    // Guardar progreso individual e intento actualizado
                    this.saveCurrentProgress(lengua, tituloEvaluacion, totalEjercicios, user);
                };
            });

        } catch(err) {
            document.querySelector('.content-container').innerHTML = `
                <div class="text-center mt-48">
                    <h2 style="color:#EF4444">Error al cargar el Estudio</h2>
                    <p style="color:var(--text-muted)">${err.message}</p>
                    <button class="btn btn-primary mt-24" onclick="window.Router.navigate('/catalogo')">Volver</button>
                </div>
            `;
        }

        window.Router = Router;
    }
};
