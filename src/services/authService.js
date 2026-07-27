const API_URL = 'http://localhost:3000/api/v1/auth';

export const authService = {
    restoreSavedProfile(user) {
        if (!user) return user;
        try {
            const savedProfiles = JSON.parse(localStorage.getItem('yak_saved_profiles') || '{}');
            const key = user.correo ? user.correo.toLowerCase() : null;
            if (key && savedProfiles[key]) {
                const saved = savedProfiles[key];
                return {
                    ...user,
                    username: saved.username || user.username,
                    fotoPerfil: saved.fotoPerfil || user.fotoPerfil
                };
            }
        } catch(e) {}
        return user;
    },

    async login(correo, password) {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });
        if (!res.ok) throw new Error('Credenciales inválidas');
        const data = await res.json();
        if (data.user) data.user = this.restoreSavedProfile(data.user);
        return data;
    },

    async register(username, correo, password) {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, correo, password })
        });
        if (!res.ok) throw new Error('Error al registrar');
        const data = await res.json();
        if (data.user) data.user = this.restoreSavedProfile(data.user);
        return data;
    },

    async loginWithGoogle(credentialData) {
        const res = await fetch(`${API_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentialData)
        });
        if (!res.ok) throw new Error('Error en login social');
        const data = await res.json();
        if (data.user) data.user = this.restoreSavedProfile(data.user);
        return data;
    },

    async solicitarCodigo(correo) {
        const res = await fetch(`${API_URL}/solicitar-codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al solicitar el código');
        return data;
    },

    async validarCodigo(correo, codigo) {
        const res = await fetch(`${API_URL}/validar-codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, codigo })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Código incorrecto');
        return data;
    },

    async resetPassword(correo, nuevaPassword) {
        const res = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, nuevaPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al restablecer la contraseña');
        return data;
    },

    async actualizarPerfil(userData) {
        try {
            const res = await fetch(`${API_URL}/perfil`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                const data = await res.json();
                if (data.user) userData = { ...userData, ...data.user };
            }
        } catch(e) { console.error('Error enviando perfil al servidor', e); }

        try {
            const savedProfiles = JSON.parse(localStorage.getItem('yak_saved_profiles') || '{}');
            if (userData.correo) {
                savedProfiles[userData.correo.toLowerCase()] = userData;
                localStorage.setItem('yak_saved_profiles', JSON.stringify(savedProfiles));
            }
        } catch(e) {}

        this.saveSession(userData);
        return userData;
    },

    saveSession(user) {
        localStorage.setItem('yak_user', JSON.stringify(user));
    },

    getSession() {
        const data = localStorage.getItem('yak_user');
        if (!data) return null;
        let u = JSON.parse(data);
        return this.restoreSavedProfile(u);
    },

    logout() {
        localStorage.removeItem('yak_user');
    }
};
