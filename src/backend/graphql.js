const { buildSchema } = require('graphql');
const db = require('./database');

// Esquema de GraphQL
const schema = buildSchema(`
  type Ejercicio {
    id: Int!
    lengua: String!
    titulo: String!
    nivel: String!
    pregunta: String!
    opcion1: String!
    opcion2: String!
    opcion3: String!
    opcion4: String!
    respuestaCorrecta: String!
    imagenUri: String
  }

  type Usuario {
    id: Int!
    username: String!
    correo: String!
    rol: String!
    fotoPerfil: String
  }

  type Progreso {
    id: Int!
    usuarioId: Int!
    ejercicioId: Int!
    completado: Boolean!
    fecha: String!
  }

  type Estadisticas {
    usuario: Usuario
    rachaDias: Int
    ejerciciosCompletados: Int
  }

  type Query {
    getEjercicios: [Ejercicio]
    getEjerciciosPorLengua(lengua: String!, titulo: String): [Ejercicio]
    getEstadisticasUsuario(usuarioId: Int!): Estadisticas
  }

  type Mutation {
    registrarProgreso(usuarioId: Int!, ejercicioId: Int!, completado: Boolean!): Progreso
    actualizarPerfil(usuarioId: Int!, correo: String, fotoPerfil: String): Usuario
  }
`);

// Resolvers
const rootValue = {
  getEjercicios: async () => {
    if (db.getEjerciciosAsync) {
      return await db.getEjerciciosAsync();
    }
    return db.ejercicios || [];
  },
  getEjerciciosPorLengua: async ({ lengua, titulo }) => {
    let list = db.ejercicios || [];
    if (db.getEjerciciosAsync) {
      list = await db.getEjerciciosAsync();
    }
    let result = list.filter(e => e.lengua.toLowerCase() === lengua.toLowerCase());
    if (titulo) {
      result = result.filter(e => e.titulo.toLowerCase().includes(titulo.toLowerCase()));
    }
    return result;
  },
  
  getEstadisticasUsuario: ({ usuarioId }) => {
    const usuario = db.usuarios.find(u => u.id === usuarioId);
    const racha = db.rachas.find(r => r.usuarioId === usuarioId);
    const progresos = db.progresos.filter(p => p.usuarioId === usuarioId && p.completado);
    
    return {
      usuario,
      rachaDias: racha ? racha.dias : 0,
      ejerciciosCompletados: progresos.length
    };
  },
  
  registrarProgreso: ({ usuarioId, ejercicioId, completado }) => {
    const fecha = new Date().toISOString().split('T')[0];
    const newProgress = {
      id: db.progresos.length + 1,
      usuarioId,
      ejercicioId,
      completado,
      fecha
    };
    db.progresos.push(newProgress);
    return newProgress;
  },
  
  actualizarPerfil: ({ usuarioId, correo, fotoPerfil }) => {
    let usuario = db.usuarios.find(u => u.id === usuarioId);
    if (!usuario) throw new Error("Usuario no encontrado");
    
    if (correo) usuario.correo = correo;
    if (fotoPerfil) usuario.fotoPerfil = fotoPerfil;
    
    return usuario;
  }
};

// Middleware para verificar API Key (Sesión 8)
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === 'yak_secret_key_2026') {
        next();
    } else {
        res.status(401).json({ error: 'No autorizado. Se requiere X-API-Key válida.' });
    }
};

module.exports = {
  schema,
  rootValue,
  checkApiKey
};
