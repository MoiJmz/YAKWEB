const GRAPHQL_URL = 'http://localhost:3000/graphql';
const API_KEY = 'yak_secret_key_2026';

export const graphqlService = {
    async query(queryString, variables = {}) {
        const res = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': API_KEY 
            },
            body: JSON.stringify({ query: queryString, variables })
        });
        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        } catch(e) {
            throw new Error(`Error de servidor (${res.status})`);
        }
        if (json.errors) throw new Error(json.errors[0].message);
        return json.data;
    },

    async getEstadisticas(usuarioId) {
        const q = `
            query GetStats($uid: Int!) {
                getEstadisticasUsuario(usuarioId: $uid) {
                    rachaDias
                    ejerciciosCompletados
                    usuario {
                        username
                        fotoPerfil
                    }
                }
            }
        `;
        return this.query(q, { uid: usuarioId });
    }
};
