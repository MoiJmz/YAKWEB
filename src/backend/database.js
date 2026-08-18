const fs = require('fs');
const path = require('path');
const STORAGE_FILE = path.join(__dirname, 'storage_data.json');

function loadStorage() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch(e) { console.error('Error cargando storage_data.json', e); }
    return { usuarios: null, progresos: [], rachas: [], intentos: [] };
}

const savedData = loadStorage();

let usuarios = savedData.usuarios || [
    {
        id: 1,
        username: "admin",
        correo: "admin@yak.com",
        password: "admin",
        rol: "OWNER",
        fotoPerfil: null
    }
];

let progresos = savedData.progresos || [];
let rachas = savedData.rachas || [];
let intentos = savedData.intentos || [];
const { supabase } = require('./supabaseClient');

async function syncWithSupabase() {
    if (!supabase) return;
    try {
        if (usuarios && usuarios.length > 0) {
            for (const u of usuarios) {
                await supabase.from('usuarios').upsert({
                    id: u.id,
                    username: u.username,
                    correo: u.correo,
                    password: u.password,
                    rol: u.rol || 'USUARIO',
                    foto_perfil: u.fotoPerfil || null
                }, { onConflict: 'correo' });
            }
        }

        if (intentos && intentos.length > 0) {
            for (const i of intentos) {
                await supabase.from('intentos').upsert({
                    id: i.id,
                    usuario_id: i.usuarioId,
                    lengua: i.lengua,
                    titulo: i.titulo,
                    porcentaje: i.porcentaje,
                    aciertos: i.aciertos,
                    total: i.total,
                    fecha: i.fecha
                }, { onConflict: 'id' });
            }
        }

        if (ejercicios && ejercicios.length > 0) {
            const batchEjercicios = ejercicios.map(e => ({
                id: e.id,
                lengua: e.lengua,
                titulo: e.titulo,
                nivel: e.nivel,
                pregunta: e.pregunta,
                opcion1: e.opcion1,
                opcion2: e.opcion2,
                opcion3: e.opcion3,
                opcion4: e.opcion4,
                respuesta_correcta: e.respuestaCorrecta
            }));
            await supabase.from('ejercicios').upsert(batchEjercicios, { onConflict: 'id' });
        }
    } catch(e) {
        console.error('[SUPABASE SYNC ERROR]', e);
    }
}

function saveStorage() {
    try {
        const data = { usuarios, progresos, rachas, intentos, ejercicios };
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
        syncWithSupabase();
    } catch(e) { console.error('Error guardando storage_data.json', e); }
}

let ejercicios = (savedData.ejercicios && savedData.ejercicios.length > 0) ? savedData.ejercicios : [
    // =========================================================================
    // CHOL (lakty'añ) - 40 Preguntas oficiales del documento PDF
    // =========================================================================

    // CHOL - Tema 1: Saludos básicos y cortesía
    { id: 101, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "¿Cómo se dice \"gracias\" en chol?", opcion1: "Koñix", opcion2: "Wokolix awälä", opcion3: "Weñ kiñ", opcion4: "Ojcheñ", respuestaCorrecta: "Wokolix awälä" },
    { id: 102, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "¿Qué significa la palabra \"Koñix\"?", opcion1: "Buenos días", opcion2: "Gracias", opcion3: "Adiós", opcion4: "Bienvenido", respuestaCorrecta: "Adiós" },
    { id: 103, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "Si alguien te pregunta \"Bajche' a wilaj\", te está preguntando:", opcion1: "¿Cómo te llamas?", opcion2: "¿Cómo estás?", opcion3: "¿A dónde vas?", opcion4: "¿De dónde eres?", respuestaCorrecta: "¿Cómo estás?" },
    { id: 104, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "\"Weñ kiñ\" se usa para saludar...", opcion1: "en la noche", opcion2: "al comenzar el día", opcion3: "al despedirse", opcion4: "al agradecer", respuestaCorrecta: "al comenzar el día" },
    { id: 105, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "La frase \"Jiñäch k'abaj\" significa:", opcion1: "¿Cómo te llamas?", opcion2: "Mi nombre es...", opcion3: "Con permiso", opcion4: "Buenas noches", respuestaCorrecta: "Mi nombre es..." },
    { id: 106, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "¿Cuál de estas palabras se usa para decir \"bienvenido/a\"?", opcion1: "Koñix", opcion2: "Weñäch", opcion3: "Wokolix awälä", opcion4: "Bajche' a wilaj", respuestaCorrecta: "Weñäch" },
    { id: 107, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "\"Ojcheñ\" es una expresión de cortesía que significa:", opcion1: "Gracias", opcion2: "Pase usted / adelante", opcion3: "Perdón", opcion4: "Hasta luego", respuestaCorrecta: "Pase usted / adelante" },
    { id: 108, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "Para despedirte de alguien en chol dirías:", opcion1: "Weñ kiñ", opcion2: "Wokolix awälä", opcion3: "Koñix", opcion4: "Jiñäch k'abaj", respuestaCorrecta: "Koñix" },
    { id: 109, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "¿Cuál de las siguientes NO es una forma de saludo o cortesía en chol?", opcion1: "Koltyañetyi", opcion2: "Weñäch", opcion3: "Ty'ul", opcion4: "Ojcheñ", respuestaCorrecta: "Ty'ul" },
    { id: 110, lengua: "Chol", titulo: "Saludos básicos y cortesía", nivel: "Básico", pregunta: "Si quieres presentarte con tu nombre en chol, usarías la palabra:", opcion1: "Koñix", opcion2: "Jiñäch k'abaj", opcion3: "Ojcheñ", opcion4: "Bajche' a wilaj", respuestaCorrecta: "Jiñäch k'abaj" },

    // CHOL - Tema 2: Números del 1 al 5
    { id: 111, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "¿Cómo se dice \"uno\" en chol?", opcion1: "Cha'p'ej", opcion2: "Jump'ej", opcion3: "Uxp'ej", opcion4: "Jo'p'ej", respuestaCorrecta: "Jump'ej" },
    { id: 112, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "El número \"cha'p'ej\" corresponde a:", opcion1: "1", opcion2: "2", opcion3: "3", opcion4: "5", respuestaCorrecta: "2" },
    { id: 113, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "¿Cuál es la palabra chol para el número 5?", opcion1: "Chänp'ej", opcion2: "Uxp'ej", opcion3: "Jo'p'ej", opcion4: "Jump'ej", respuestaCorrecta: "Jo'p'ej" },
    { id: 114, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "\"Uxp'ej\" significa:", opcion1: "2", opcion2: "3", opcion3: "4", opcion4: "5", respuestaCorrecta: "3" },
    { id: 115, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "¿Cómo se dice \"cuatro\" en chol?", opcion1: "Jo'p'ej", opcion2: "Uxp'ej", opcion3: "Chänp'ej", opcion4: "Cha'p'ej", respuestaCorrecta: "Chänp'ej" },
    { id: 116, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "Ordena mentalmente: ¿cuál de estas palabras representa el número más pequeño?", opcion1: "Jo'p'ej", opcion2: "Jump'ej", opcion3: "Chänp'ej", opcion4: "Uxp'ej", respuestaCorrecta: "Jump'ej" },
    { id: 117, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "Si cuentas \"jump'ej, cha'p'ej, uxp'ej...\" ¿qué número sigue?", opcion1: "Jo'p'ej", opcion2: "Chänp'ej", opcion3: "Jump'ej", opcion4: "Cha'p'ej", respuestaCorrecta: "Chänp'ej" },
    { id: 118, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "El sistema numérico del chol (y de las lenguas mayenses en general) se basa en múltiplos de:", opcion1: "10", opcion2: "5", opcion3: "20", opcion4: "12", respuestaCorrecta: "20" },
    { id: 119, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "¿Cuál de estas opciones NO es un número del 1 al 5 en chol?", opcion1: "Jump'ej", opcion2: "Bajlum", opcion3: "Jo'p'ej", opcion4: "Uxp'ej", respuestaCorrecta: "Bajlum" },
    { id: 120, lengua: "Chol", titulo: "Números del 1 al 5", nivel: "Básico", pregunta: "Si alguien dice \"jo'p'ej ty'ul\", está diciendo:", opcion1: "un conejo", opcion2: "tres conejos", opcion3: "cinco conejos", opcion4: "dos conejos", respuestaCorrecta: "cinco conejos" },

    // CHOL - Tema 3: Animales del entorno
    { id: 121, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "¿Cómo se dice \"conejo\" en chol?", opcion1: "Uch", opcion2: "Ty'ul", opcion3: "Chuch", opcion4: "Ib", respuestaCorrecta: "Ty'ul" },
    { id: 122, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "La palabra \"tz'i'\" significa:", opcion1: "Gato", opcion2: "Perro", opcion3: "Ratón", opcion4: "Serpiente", respuestaCorrecta: "Perro" },
    { id: 123, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "¿Qué animal es el \"bajlum\"?", opcion1: "Conejo", opcion2: "Armadillo", opcion3: "Jaguar", opcion4: "Ardilla", respuestaCorrecta: "Jaguar" },
    { id: 124, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "\"Chuch\" se refiere a:", opcion1: "Ardilla", opcion2: "Tlacuache", opcion3: "Gallina", opcion4: "Serpiente", respuestaCorrecta: "Ardilla" },
    { id: 125, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "¿Cómo se dice \"gato\" en chol?", opcion1: "Chan", opcion2: "Mis", opcion3: "Mut", opcion4: "Tsuk", respuestaCorrecta: "Mis" },
    { id: 126, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "La palabra \"uch\" nombra a este animal:", opcion1: "Ratón", opcion2: "Tlacuache", opcion3: "Armadillo", opcion4: "Perro", respuestaCorrecta: "Tlacuache" },
    { id: 127, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "\"Mut\" es la palabra chol para:", opcion1: "Serpiente", opcion2: "Gallina / ave de corral", opcion3: "Jaguar", opcion4: "Gato", respuestaCorrecta: "Gallina / ave de corral" },
    { id: 128, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "¿Qué animal es el \"ib\"?", opcion1: "Armadillo", opcion2: "Conejo", opcion3: "Ardilla", opcion4: "Ratón", respuestaCorrecta: "Armadillo" },
    { id: 129, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "Si alguien dice \"tsuk\", se refiere a:", opcion1: "Jaguar", opcion2: "Perro", opcion3: "Ratón", opcion4: "Tlacuache", respuestaCorrecta: "Ratón" },
    { id: 130, lengua: "Chol", titulo: "Animales del entorno", nivel: "Intermedio", pregunta: "La palabra \"chan\" en chol significa:", opcion1: "Gato", opcion2: "Armadillo", opcion3: "Serpiente / culebra", opcion4: "Gallina", respuestaCorrecta: "Serpiente / culebra" },

    // CHOL - Tema 4: Colores tradicionales
    { id: 131, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "¿Cómo se dice \"blanco\" en chol?", opcion1: "Ik'", opcion2: "Sak", opcion3: "Chäk", opcion4: "K'añ", respuestaCorrecta: "Sak" },
    { id: 132, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "La palabra \"chäk\" significa:", opcion1: "Negro", opcion2: "Amarillo", opcion3: "Rojo", opcion4: "Blanco", respuestaCorrecta: "Rojo" },
    { id: 133, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "¿Cuál es la palabra para \"negro\"?", opcion1: "Ik'", opcion2: "Yäx", opcion3: "Sak", opcion4: "K'añ", respuestaCorrecta: "Ik'" },
    { id: 134, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "\"K'añ\" corresponde al color:", opcion1: "Verde", opcion2: "Amarillo", opcion3: "Rojo", opcion4: "Blanco", respuestaCorrecta: "Amarillo" },
    { id: 135, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "El color \"yäx\" puede traducirse como:", opcion1: "Rojo", opcion2: "Amarillo", opcion3: "Verde / azul", opcion4: "Negro", respuestaCorrecta: "Verde / azul" },
    { id: 136, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "¿Cómo dirías \"amarillo\" en chol?", opcion1: "Chäk", opcion2: "Sak", opcion3: "K'añ", opcion4: "Ik'", respuestaCorrecta: "K'añ" },
    { id: 137, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "Si algo es \"sak\", su color es:", opcion1: "Negro", opcion2: "Blanco", opcion3: "Rojo", opcion4: "Verde", respuestaCorrecta: "Blanco" },
    { id: 138, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "La raíz \"chäk\" (rojo) es un término compartido con otras lenguas mayas, como el maya yucateco, donde se dice:", opcion1: "K'an", opcion2: "Ek'", opcion3: "Chak", opcion4: "Sak", respuestaCorrecta: "Chak" },
    { id: 139, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "¿Cuál de estas palabras significa \"verde/azul\"?", opcion1: "Ik'", opcion2: "Yäx", opcion3: "K'añ", opcion4: "Chäk", respuestaCorrecta: "Yäx" },
    { id: 140, lengua: "Chol", titulo: "Colores tradicionales", nivel: "Intermedio", pregunta: "Relaciona: \"ik'\" es a negro como \"sak\" es a...", opcion1: "Rojo", opcion2: "Amarillo", opcion3: "Blanco", opcion4: "Verde", respuestaCorrecta: "Blanco" },

    // =========================================================================
    // MAYA TABASQUEÑO (Yokot'an - Chontal de Tabasco) - 40 Preguntas Oficiales
    // =========================================================================

    // YOKOT'AN - Tema 1: Saludos y presentaciones
    { id: 201, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "¿Cómo se dice \"hola\" en yokot'an (maya tabasqueño)?", opcion1: "Dayto", opcion2: "Kachida", opcion3: "Tsʼak", opcion4: "Uts ajuletla", respuestaCorrecta: "Kachida" },
    { id: 202, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "La palabra \"Dayto\" significa:", opcion1: "Bienvenidos", opcion2: "Gracias", opcion3: "Adiós", opcion4: "Hola", respuestaCorrecta: "Adiós" },
    { id: 203, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "¿Cómo se dice \"bienvenidos\" en yokot'an?", opcion1: "Kachida", opcion2: "Uts ajuletla", opcion3: "Dayto", opcion4: "Bin a bel", respuestaCorrecta: "Uts ajuletla" },
    { id: 204, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "La expresión \"bin a bel\" se usa para:", opcion1: "Despedirse", opcion2: "Agradecer", opcion3: "Saludar / preguntar cómo está la persona", opcion4: "Presentarse", respuestaCorrecta: "Saludar / preguntar cómo está la persona" },
    { id: 205, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "¿Cómo se dice \"gracias\" en yokot'an?", opcion1: "Tsʼak", opcion2: "Dayto", opcion3: "Dios bo'tik", opcion4: "Kachida", respuestaCorrecta: "Dios bo'tik" },
    { id: 206, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "La palabra \"tsʼak\" significa:", opcion1: "Adiós", opcion2: "Bueno / está bien", opcion3: "Hola", opcion4: "Gracias", respuestaCorrecta: "Bueno / está bien" },
    { id: 207, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "Si alguien te recibe en yokot'an diciendo \"Kachida, uts ajuletla\", te está diciendo:", opcion1: "Adiós, hasta luego", opcion2: "Hola, bienvenido(s)", opcion3: "Gracias por venir", opcion4: "¿Cómo te llamas?", respuestaCorrecta: "Hola, bienvenido(s)" },
    { id: 208, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "¿Cuál de estas palabras NO es un saludo o forma de cortesía en yokot'an?", opcion1: "Kachida", opcion2: "Dayto", opcion3: "Otot (casa)", opcion4: "Uts ajuletla", respuestaCorrecta: "Otot (casa)" },
    { id: 209, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "La expresión yokot'an \"dios bo'tik\" (gracias) comparte una raíz reconocible con el español porque:", opcion1: "Es una palabra completamente distinta al español", opcion2: "Incorpora la palabra \"dios\", tomada del español, como en otras lenguas mayas de la región", opcion3: "No tiene relación alguna", opcion4: "Viene del inglés", respuestaCorrecta: "Incorpora la palabra \"dios\", tomada del español, como en otras lenguas mayas de la región" },
    { id: 210, lengua: "Maya", titulo: "Saludos y presentaciones", nivel: "Básico", pregunta: "Para despedirte de alguien en yokot'an dirías:", opcion1: "Kachida", opcion2: "Dayto", opcion3: "Uts ajuletla", opcion4: "Dios bo'tik", respuestaCorrecta: "Dayto" },

    // YOKOT'AN - Tema 2: La familia y la naturaleza
    { id: 211, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "¿Cómo se dice \"madre\" en yokot'an?", opcion1: "Tat", opcion2: "Naʼ", opcion3: "Otot", opcion4: "Teʼ", respuestaCorrecta: "Naʼ" },
    { id: 212, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "La palabra \"tat\" significa:", opcion1: "Madre", opcion2: "Padre", opcion3: "Casa", opcion4: "Sol", respuestaCorrecta: "Padre" },
    { id: 213, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "¿Cuál es la palabra yokot'an para \"casa\"?", opcion1: "Teʼ", opcion2: "Kʼin", opcion3: "Otot", opcion4: "Jaʼ", respuestaCorrecta: "Otot" },
    { id: 214, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "\"Teʼ\" se refiere a:", opcion1: "Agua", opcion2: "Árbol", opcion3: "Fuego", opcion4: "Corazón", respuestaCorrecta: "Árbol" },
    { id: 215, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "¿Cómo se dice \"sol\" en yokot'an?", opcion1: "Jaʼ", opcion2: "Kʼin", opcion3: "Kʼakʼ", opcion4: "Naʼ", respuestaCorrecta: "Kʼin" },
    { id: 216, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "La palabra \"jaʼ\" significa:", opcion1: "Fuego", opcion2: "Sol", opcion3: "Agua", opcion4: "Árbol", respuestaCorrecta: "Agua" },
    { id: 217, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "¿Cuál es la palabra para \"fuego\"?", opcion1: "Kʼakʼ", opcion2: "Kʼin", opcion3: "Teʼ", opcion4: "Pixan", respuestaCorrecta: "Kʼakʼ" },
    { id: 218, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "\"Pixan\" puede traducirse como:", opcion1: "Casa", opcion2: "Árbol", opcion3: "Corazón / alma", opcion4: "Agua", respuestaCorrecta: "Corazón / alma" },
    { id: 219, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "La palabra \"kʼin\" (sol) es un cognado —es decir, tiene la misma raíz— que la palabra maya yucateca para \"sol/día\", que es:", opcion1: "Kʼáakʼ", opcion2: "Kʼiin", opcion3: "Uj", opcion4: "Chak", respuestaCorrecta: "Kʼiin" },
    { id: 220, lengua: "Maya", titulo: "La familia y la naturaleza", nivel: "Básico", pregunta: "Si alguien dice \"u naʼ yicʼot u tat\", probablemente se refiere a:", opcion1: "El árbol y la casa", opcion2: "Su madre y su padre", opcion3: "El sol y el fuego", opcion4: "El agua y el corazón", respuestaCorrecta: "Su madre y su padre" },

    // YOKOT'AN - Tema 3: Comida y fauna tradicional
    { id: 221, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "¿Cómo se dice \"comer\" en yokot'an?", opcion1: "Ukʼe", opcion2: "Weʼ", opcion3: "Jaʼ", opcion4: "Much", respuestaCorrecta: "Weʼ" },
    { id: 222, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "La palabra \"ukʼe\" significa:", opcion1: "Comer", opcion2: "Beber", opcion3: "Cocinar", opcion4: "Agua", respuestaCorrecta: "Beber" },
    { id: 223, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "¿Cuál es la palabra yokot'an para \"pavo\"?", opcion1: "Juj", opcion2: "Pukú", opcion3: "Much", opcion4: "Utsí", respuestaCorrecta: "Much" },
    { id: 224, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "\"Juj\" es la palabra yokot'an para:", opcion1: "Sapo", opcion2: "Iguana", opcion3: "Zopilote", opcion4: "Zorro", respuestaCorrecta: "Iguana" },
    { id: 225, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "¿Cómo se dice \"sapo\" en yokot'an?", opcion1: "Pukú", opcion2: "Much", opcion3: "Uch", opcion4: "Mis", respuestaCorrecta: "Pukú" },
    { id: 226, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "La palabra \"utsí\" se refiere a:", opcion1: "Gato", opcion2: "Perro", opcion3: "Zopilote", opcion4: "Iguana", respuestaCorrecta: "Zopilote" },
    { id: 227, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "¿Cuál es la palabra para \"zorro\"?", opcion1: "Pekʼ", opcion2: "Mis", opcion3: "Uch", opcion4: "Much", respuestaCorrecta: "Uch" },
    { id: 228, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "La palabra \"jaʼ\" (agua), además de bebida esencial, es también un elemento clave del entorno donde viven los chontales, conocidos como:", opcion1: "Gente del desierto", opcion2: "\"Los verdaderos hombres\" de las tierras acuáticas del Golfo", opcion3: "Gente de las montañas", opcion4: "Gente del bosque seco", respuestaCorrecta: "\"Los verdaderos hombres\" de las tierras acuáticas del Golfo" },
    { id: 229, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "¿Cómo se dice \"gato\" en yokot'an? (misma palabra que en chol, por ser lenguas cercanas)", opcion1: "Pekʼ", opcion2: "Mis", opcion3: "Uch", opcion4: "Juj", respuestaCorrecta: "Mis" },
    { id: 230, lengua: "Maya", titulo: "Comida y fauna tradicional", nivel: "Intermedio", pregunta: "¿Cómo se dice \"perro\" en yokot'an?", opcion1: "Pekʼ", opcion2: "Mis", opcion3: "Uch", opcion4: "Pukú", respuestaCorrecta: "Pekʼ" },

    // YOKOT'AN - Tema 4: Números y frases cotidianas
    { id: 231, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "¿Cómo se dice \"uno\" en yokot'an?", opcion1: "Chaʼ", opcion2: "Un", opcion3: "Ux", opcion4: "Jo'", respuestaCorrecta: "Un" },
    { id: 232, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "La palabra \"chaʼ\" corresponde al número:", opcion1: "1", opcion2: "2", opcion3: "3", opcion4: "4", respuestaCorrecta: "2" },
    { id: 233, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "¿Cuál es la palabra para el número 5?", opcion1: "Chɨn", opcion2: "Ux", opcion3: "Jo'", opcion4: "Chaʼ", respuestaCorrecta: "Jo'" },
    { id: 234, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "\"Ux\" significa:", opcion1: "2", opcion2: "3", opcion3: "4", opcion4: "5", respuestaCorrecta: "3" },
    { id: 235, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "¿Cómo se dice \"cuatro\" en yokot'an?", opcion1: "Ux", opcion2: "Chɨn", opcion3: "Jo'", opcion4: "Un", respuestaCorrecta: "Chɨn" },
    { id: 236, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "En yokot'an, los números base se combinan con \"clasificadores numerales\" que cambian según:", opcion1: "El día de la semana", opcion2: "El tipo, tamaño y forma del objeto que se cuenta", opcion3: "El género de quien habla", opcion4: "La hora del día", respuestaCorrecta: "El tipo, tamaño y forma del objeto que se cuenta" },
    { id: 237, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "¿Cómo se dice \"mano\" en yokot'an?", opcion1: "Wich", opcion2: "Kʼä", opcion3: "Kʼuxbe", opcion4: "Tsʼak", respuestaCorrecta: "Kʼä" },
    { id: 238, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "La palabra \"wich\" significa:", opcion1: "Mano", opcion2: "Ojo", opcion3: "Corazón", opcion4: "Amor", respuestaCorrecta: "Ojo" },
    { id: 239, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "¿Cuál es la palabra para \"amor\"?", opcion1: "Kʼä", opcion2: "Wich", opcion3: "Kʼuxbe", opcion4: "Tsʼak", respuestaCorrecta: "Kʼuxbe" },
    { id: 240, lengua: "Maya", titulo: "Números y frases cotidianas", nivel: "Intermedio", pregunta: "Si cuentas \"un, chaʼ, ux...\" ¿qué número base sigue?", opcion1: "Jo'", opcion2: "Chɨn", opcion3: "Un", opcion4: "Chaʼ", respuestaCorrecta: "Chɨn" },

    // =========================================================================
    // LENGUA DE SEÑAS MEXICANA (LSM) - 40 Preguntas oficiales del documento PDF
    // =========================================================================

    // LSM - Tema 1: Abecedario dactilológico
    { id: 301, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "¿Con qué seña se representa la letra A?", opcion1: "Mano abierta con los cinco dedos extendidos", opcion2: "Puño cerrado con el pulgar apoyado al costado, hacia el frente", opcion3: "Dedo meñique levantado", opcion4: "Mano en forma de garra", respuestaCorrecta: "Puño cerrado con el pulgar apoyado al costado, hacia el frente" },
    { id: 302, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "¿Cómo se hace la seña de la letra B?", opcion1: "Puño cerrado", opcion2: "Mano abierta hacia el frente, los cuatro dedos juntos y extendidos hacia arriba, y el pulgar doblado cruzando la palma", opcion3: "Solo el índice extendido", opcion4: "Los dedos formando un círculo", respuestaCorrecta: "Mano abierta hacia el frente, los cuatro dedos juntos y extendidos hacia arriba, y el pulgar doblado cruzando la palma" },
    { id: 303, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "La letra C se representa:", opcion1: "Con el puño cerrado", opcion2: "Curvando los dedos y el pulgar para formar la forma de una \"C\"", opcion3: "Con la mano totalmente extendida", opcion4: "Con el meñique levantado", respuestaCorrecta: "Curvando los dedos y el pulgar para formar la forma de una \"C\"" },
    { id: 304, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "¿Con qué seña se dice la letra I?", opcion1: "Con el índice levantado y los demás dedos hacia abajo", opcion2: "Con el dedo meñique hacia arriba y los demás dedos doblados hacia abajo (puño con el meñique extendido)", opcion3: "Con la mano formando una \"O\"", opcion4: "Con los cinco dedos extendidos", respuestaCorrecta: "Con el dedo meñique hacia arriba y los demás dedos doblados hacia abajo (puño con el meñique extendido)" },
    { id: 305, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "La letra L se forma:", opcion1: "Cerrando todos los dedos", opcion2: "Extendiendo el dedo índice hacia arriba y el pulgar hacia un lado, formando una \"L\"", opcion3: "Cruzando el índice y el medio", opcion4: "Con la palma hacia abajo y los dedos curvados", respuestaCorrecta: "Extendiendo el dedo índice hacia arriba y el pulgar hacia un lado, formando una \"L\"" },
    { id: 306, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "¿Cómo se representa la letra O?", opcion1: "Con el puño cerrado y el pulgar afuera", opcion2: "Curvando todos los dedos y el pulgar hasta que se toquen las puntas, formando un círculo", opcion3: "Con el meñique extendido", opcion4: "Con la mano completamente plana", respuestaCorrecta: "Curvando todos los dedos y el pulgar hasta que se toquen las puntas, formando un círculo" },
    { id: 307, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "La letra S se hace:", opcion1: "Con la mano abierta", opcion2: "Con un puño cerrado y el pulgar cruzado por delante de los dedos", opcion3: "Con el índice y el pulgar formando una pinza", opcion4: "Con dos dedos extendidos en \"V\"", respuestaCorrecta: "Con un puño cerrado y el pulgar cruzado por delante de los dedos" },
    { id: 308, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "¿Cómo se forma la letra V?", opcion1: "Con el puño cerrado", opcion2: "Extendiendo el índice y el dedo medio separados, formando una \"V\", los demás dedos doblados", opcion3: "Con los cinco dedos extendidos", opcion4: "Con el meñique solo", respuestaCorrecta: "Extendiendo el índice y el dedo medio separados, formando una \"V\", los demás dedos doblados" },
    { id: 309, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "La letra Y se representa:", opcion1: "Con el índice extendido", opcion2: "Extendiendo el pulgar y el meñique, y doblando los demás dedos", opcion3: "Con la mano en forma de puño", opcion4: "Con los dedos formando un círculo", respuestaCorrecta: "Extendiendo el pulgar y el meñique, y doblando los demás dedos" },
    { id: 310, lengua: "LSM", titulo: "Abecedario dactilológico", nivel: "Básico", pregunta: "¿Por qué es importante el alfabeto dactilológico en LSM?", opcion1: "Porque reemplaza a todas las palabras", opcion2: "Porque sirve para deletrear nombres propios y palabras que no tienen una seña específica", opcion3: "Porque solo se usa en la escuela", opcion4: "Porque no forma parte de la lengua", respuestaCorrecta: "Porque sirve para deletrear nombres propios y palabras que no tienen una seña específica" },

    // LSM - Tema 2: Saludos comunes
    { id: 311, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "¿Con qué seña se dice \"hola\"?", opcion1: "Puño cerrado tocando el pecho", opcion2: "Mano abierta cerca de la sien, moviéndose ligeramente de lado a lado, como un saludo con la mano", opcion3: "Dedos cruzados", opcion4: "Palma hacia abajo golpeando la otra mano", respuestaCorrecta: "Mano abierta cerca de la sien, moviéndose ligeramente de lado a lado, como un saludo con la mano" },
    { id: 312, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "¿Cómo se hace la seña de \"gracias\"?", opcion1: "Cerrando el puño frente al pecho", opcion2: "Con la mano abierta, se tocan los labios o el mentón con las puntas de los dedos y se mueve la mano hacia adelante, hacia la persona", opcion3: "Levantando el pulgar", opcion4: "Con las dos manos aplaudiendo", respuestaCorrecta: "Con la mano abierta, se tocan los labios o el mentón con las puntas de los dedos y se mueve la mano hacia adelante, hacia la persona" },
    { id: 313, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "La seña de \"por favor\" se hace:", opcion1: "Con el puño golpeando la mesa", opcion2: "Con la mano abierta sobre el pecho, haciendo un pequeño movimiento circular", opcion3: "Señalando hacia la puerta", opcion4: "Con los dedos cruzados", respuestaCorrecta: "Con la mano abierta sobre el pecho, haciendo un pequeño movimiento circular" },
    { id: 314, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "¿Con qué seña se dice \"adiós\"?", opcion1: "Cerrando el puño", opcion2: "Moviendo la mano abierta de lado a lado, como despedida, similar a un saludo de mano", opcion3: "Tocando el pecho dos veces", opcion4: "Formando un círculo con los dedos", respuestaCorrecta: "Moviendo la mano abierta de lado a lado, como despedida, similar a un saludo de mano" },
    { id: 315, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "La seña de \"buenos días\" combina:", opcion1: "El signo de noche más el de gracias", opcion2: "El signo de \"bueno\" (mano tocando el mentón y bajando hacia la otra palma) con el signo de \"sol/día\"", opcion3: "Solo el alfabeto dactilológico", opcion4: "Un aplauso", respuestaCorrecta: "El signo de \"bueno\" (mano tocando el mentón y bajando hacia la otra palma) con el signo de \"sol/día\"" },
    { id: 316, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "¿Cómo se representa \"mucho gusto\"?", opcion1: "Con las manos cruzadas sobre el pecho", opcion2: "Con una expresión facial de alegría acompañando el signo de \"gusto\" o \"contento\", generalmente llevando la mano al pecho", opcion3: "Con el puño cerrado", opcion4: "Señalando a la otra persona", respuestaCorrecta: "Con una expresión facial de alegría acompañando el signo de \"gusto\" o \"contento\", generalmente llevando la mano al pecho" },
    { id: 317, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "La seña de \"¿cómo estás?\" incluye:", opcion1: "Solo mover la cabeza", opcion2: "Un signo de pregunta (cejas levantadas) junto con el signo de \"estar/sentir\", y a menudo se apunta a la persona", opcion3: "Cerrar los ojos", opcion4: "Aplaudir", respuestaCorrecta: "Un signo de pregunta (cejas levantadas) junto con el signo de \"estar/sentir\", y a menudo se apunta a la persona" },
    { id: 318, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "¿Cómo se hace la seña de \"de nada\"?", opcion1: "Con el puño golpeando la palma", opcion2: "Con un movimiento de la mano abierta hacia los lados, restándole importancia, similar a \"no es nada\"", opcion3: "Tocando la cabeza", opcion4: "Cruzando los brazos", respuestaCorrecta: "Con un movimiento de la mano abierta hacia los lados, restándole importancia, similar a \"no es nada\"" },
    { id: 319, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "La seña de \"perdón\" o \"disculpa\" se realiza:", opcion1: "Aplaudiendo", opcion2: "Con el puño haciendo un pequeño círculo sobre el pecho, en el área del corazón", opcion3: "Señalando la puerta", opcion4: "Con los dedos en forma de \"O\"", respuestaCorrecta: "Con el puño haciendo un pequeño círculo sobre el pecho, en el área del corazón" },
    { id: 320, lengua: "LSM", titulo: "Saludos comunes", nivel: "Básico", pregunta: "En LSM, además de las manos, ¿qué elemento es fundamental para expresar correctamente un saludo?", opcion1: "El tono de voz", opcion2: "La expresión facial y corporal", opcion3: "La velocidad al caminar", opcion4: "El uso exclusivo del alfabeto dactilológico", respuestaCorrecta: "La expresión facial y corporal" },

    // LSM - Tema 3: Números del 1 al 5
    { id: 321, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "¿Con qué seña se dice el número 1?", opcion1: "Mano abierta completa", opcion2: "Solo el dedo índice extendido hacia arriba, los demás dedos cerrados en puño", opcion3: "Índice y medio extendidos", opcion4: "Pulgar extendido", respuestaCorrecta: "Solo el dedo índice extendido hacia arriba, los demás dedos cerrados en puño" },
    { id: 322, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "¿Cómo se representa el número 2?", opcion1: "Puño cerrado", opcion2: "Índice y medio extendidos juntos, formando una especie de \"V\" o par de dedos, los demás doblados", opcion3: "Cinco dedos extendidos", opcion4: "Solo el meñique", respuestaCorrecta: "Índice y medio extendidos juntos, formando una especie de \"V\" o par de dedos, los demás doblados" },
    { id: 323, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "El número 3 se hace:", opcion1: "Con el puño cerrado", opcion2: "Extendiendo el pulgar, índice y medio, los demás dedos doblados", opcion3: "Con solo el índice", opcion4: "Con la mano completamente abierta", respuestaCorrecta: "Extendiendo el pulgar, índice y medio, los demás dedos doblados" },
    { id: 324, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "¿Con qué seña se dice el número 4?", opcion1: "Un puño cerrado", opcion2: "Extendiendo los cuatro dedos (índice, medio, anular y meñique) y manteniendo el pulgar doblado hacia la palma", opcion3: "Solo dos dedos", opcion4: "La mano formando una \"O\"", respuestaCorrecta: "Extendiendo los cuatro dedos (índice, medio, anular y meñique) y manteniendo el pulgar doblado hacia la palma" },
    { id: 325, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "El número 5 se representa:", opcion1: "Con el puño cerrado", opcion2: "Con la mano completamente abierta, los cinco dedos extendidos y separados", opcion3: "Con solo el pulgar", opcion4: "Con índice y meñique", respuestaCorrecta: "Con la mano completamente abierta, los cinco dedos extendidos y separados" },
    { id: 326, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "¿Cuál es la diferencia principal entre la seña del número 4 y la del número 5?", opcion1: "No hay diferencia", opcion2: "En el 4 el pulgar permanece doblado; en el 5 el pulgar también se extiende", opcion3: "El 4 usa el puño cerrado", opcion4: "El 5 usa solo dos dedos", respuestaCorrecta: "En el 4 el pulgar permanece doblado; en el 5 el pulgar también se extiende" },
    { id: 327, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "Al mostrar los números en LSM, la palma de la mano generalmente se orienta:", opcion1: "Hacia el propio cuerpo", opcion2: "Hacia la persona con la que se está hablando", opcion3: "Hacia el suelo", opcion4: "Hacia arriba, en posición horizontal", respuestaCorrecta: "Hacia la persona con la que se está hablando" },
    { id: 328, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "¿Qué número se representa extendiendo únicamente el pulgar, índice y medio?", opcion1: "1", opcion2: "2", opcion3: "3", opcion4: "5", respuestaCorrecta: "3" },
    { id: 329, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "Si alguien te muestra la mano completamente abierta con los cinco dedos separados, te está indicando el número:", opcion1: "3", opcion2: "4", opcion3: "5", opcion4: "2", respuestaCorrecta: "5" },
    { id: 330, lengua: "LSM", titulo: "Números del 1 al 5", nivel: "Intermedio", pregunta: "¿Qué número corresponde a la seña de índice y medio extendidos en forma de \"V\"?", opcion1: "1", opcion2: "2", opcion3: "4", opcion4: "5", respuestaCorrecta: "2" },

    // LSM - Tema 4: Cosas del hogar
    { id: 331, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "¿Con qué seña se representa \"mesa\"?", opcion1: "Con el puño golpeando el aire", opcion2: "Con los antebrazos cruzados en forma de \"X\" y las palmas hacia abajo, representando la superficie plana, o con una mano plana horizontal", opcion3: "Con los dedos formando un círculo", opcion4: "Señalando hacia el suelo", respuestaCorrecta: "Con los antebrazos cruzados en forma de \"X\" y las palmas hacia abajo, representando la superficie plana, o con una mano plana horizontal" },
    { id: 332, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "La seña de \"silla\" se hace:", opcion1: "Con la mano abierta girando", opcion2: "Con los dedos índice y medio de una mano \"sentándose\" sobre el índice y medio de la otra mano, imitando a una persona sentada", opcion3: "Con el puño cerrado golpeando la palma", opcion4: "Con los brazos cruzados", respuestaCorrecta: "Con los dedos índice y medio de una mano \"sentándose\" sobre el índice y medio de la otra mano, imitando a una persona sentada" },
    { id: 333, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "¿Cómo se representa \"cama\"?", opcion1: "Con las manos aplaudiendo", opcion2: "Inclinando la cabeza y colocando la mano (o las manos juntas) bajo la mejilla, como el gesto de dormir", opcion3: "Señalando hacia arriba", opcion4: "Con el puño girando", respuestaCorrecta: "Inclinando la cabeza y colocando la mano (o las manos juntas) bajo la mejilla, como el gesto de dormir" },
    { id: 334, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "La seña de \"puerta\" se hace:", opcion1: "Con el puño cerrado inmóvil", opcion2: "Con las dos manos verticales, una de ellas girando sobre la otra, como si se abriera una puerta con bisagra", opcion3: "Con los dedos formando una \"O\"", opcion4: "Golpeando el pecho", respuestaCorrecta: "Con las dos manos verticales, una de ellas girando sobre la otra, como si se abriera una puerta con bisagra" },
    { id: 335, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "¿Cómo se representa \"ventana\"?", opcion1: "Con el puño cerrado", opcion2: "Con las manos simulando abrir o deslizar un marco o cortina hacia los lados", opcion3: "Señalando al suelo", opcion4: "Con un solo dedo girando", respuestaCorrecta: "Con las manos simulando abrir o deslizar un marco o cortina hacia los lados" },
    { id: 336, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "La seña de \"libro\" se forma:", opcion1: "Con el puño cerrado", opcion2: "Juntando las palmas de las manos y luego abriéndolas como las páginas de un libro", opcion3: "Con un dedo apuntando hacia arriba", opcion4: "Con las manos detrás de la espalda", respuestaCorrecta: "Juntando las palmas de las manos y luego abriéndolas como las páginas de un libro" },
    { id: 337, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "¿Cómo se representa \"casa\"?", opcion1: "Con el puño girando", opcion2: "Con las dos manos formando un techo en punta (como una \"A\") sobre la cabeza y luego bajando en forma de paredes", opcion3: "Con un solo dedo extendido", opcion4: "Aplaudiendo", respuestaCorrecta: "Con las dos manos formando un techo en punta (como una \"A\") sobre la cabeza y luego bajando en forma de paredes" },
    { id: 338, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "La seña de \"cuchara\" se hace:", opcion1: "Con el puño cerrado inmóvil", opcion2: "Imitando con los dedos el movimiento de llevar una cuchara curva hacia la boca", opcion3: "Señalando el plato", opcion4: "Con las manos cruzadas", respuestaCorrecta: "Imitando con los dedos el movimiento de llevar una cuchara curva hacia la boca" },
    { id: 339, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "¿Cómo se representa \"plato\"?", opcion1: "Con el puño", opcion2: "Formando un círculo con los dedos de ambas manos, indicando la forma redonda y plana del plato", opcion3: "Con un dedo apuntando al techo", opcion4: "Con las manos detrás del cuerpo", respuestaCorrecta: "Formando un círculo con los dedos de ambas manos, indicando la forma redonda y plana del plato" },
    { id: 340, lengua: "LSM", titulo: "Cosas del hogar", nivel: "Intermedio", pregunta: "La seña de \"vaso\" se hace:", opcion1: "Con el puño cerrado sin movimiento", opcion2: "Con una mano en forma de \"C\" (como si sostuviera un vaso) llevándola hacia la boca", opcion3: "Señalando hacia la mesa", opcion4: "Con los brazos cruzados", respuestaCorrecta: "Con una mano en forma de \"C\" (como si sostuviera un vaso) llevándola hacia la boca" }
];

async function getEjerciciosAsync() {
    if (supabase) {
        try {
            const { data, error } = await supabase.from('ejercicios').select('*');
            if (data && data.length > 0) {
                return data.map(e => ({
                    id: e.id,
                    lengua: e.lengua,
                    titulo: e.titulo,
                    nivel: e.nivel,
                    pregunta: e.pregunta,
                    opcion1: e.opcion1,
                    opcion2: e.opcion2,
                    opcion3: e.opcion3,
                    opcion4: e.opcion4,
                    respuestaCorrecta: e.respuesta_correcta
                }));
            }
        } catch(e) {
            console.error('Error fetching ejercicios from Supabase:', e);
        }
    }
    return ejercicios;
}

module.exports = {
    usuarios,
    ejercicios,
    progresos,
    rachas,
    intentos,
    saveStorage,
    getEjerciciosAsync
};
