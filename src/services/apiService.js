const API_URL = 'http://localhost:3000/api/v1';

export const apiService = {
    async getEjercicios(lengua = '') {
        const url = lengua ? `${API_URL}/ejercicios?lengua=${lengua}` : `${API_URL}/ejercicios`;
        const res = await fetch(url);
        return res.json();
    },

    async getProgreso(usuarioId) {
        const res = await fetch(`${API_URL}/progreso/${usuarioId}`);
        return res.json();
    },

    async guardarProgreso(usuarioId, ejercicioId, completado) {
        const res = await fetch(`${API_URL}/progreso`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId, ejercicioId, completado })
        });
        return res.json();
    },

    async getRacha(usuarioId) {
        const res = await fetch(`${API_URL}/racha/${usuarioId}`);
        return res.json();
    },

    async getIntentos(usuarioId) {
        const res = await fetch(`${API_URL}/intentos/${usuarioId}`);
        return res.json();
    },

    async guardarIntento(usuarioId, lengua, titulo, porcentaje, aciertos, total) {
        const res = await fetch(`${API_URL}/intentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId, lengua, titulo, porcentaje, aciertos, total })
        });
        return res.json();
    }
};
