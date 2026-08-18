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
    },

    async crearEjercicio(ejercicioData, rol = 'USER') {
        const res = await fetch(`${API_URL}/ejercicios`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-user-role': rol
            },
            body: JSON.stringify(ejercicioData)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Error al crear el ejercicio.');
        }
        return res.json();
    },

    async createEjercicio(ejercicioData, rol = 'USER') {
        return this.crearEjercicio(ejercicioData, rol);
    },

    async actualizarEjercicio(id, ejercicioData, rol = 'USER') {
        const res = await fetch(`${API_URL}/ejercicios/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'x-user-role': rol
            },
            body: JSON.stringify(ejercicioData)
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Error al actualizar el ejercicio.');
        }
        return res.json();
    },

    async eliminarEjercicio(id, rol = 'USER') {
        const res = await fetch(`${API_URL}/ejercicios/${id}`, {
            method: 'DELETE',
            headers: { 
                'x-user-role': rol
            }
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Error al eliminar el ejercicio.');
        }
        return res.json();
    }
};
