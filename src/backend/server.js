require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { schema, rootValue, checkApiKey } = require('./graphql');
const db = require('./database');
const auth = require('./googleAuth');
const { enviarCodigoCorreo } = require('./mailer');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para exponer Google Client ID desde .env al frontend
app.get('/api/v1/config/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '920273571891-eic4tud2e6921r1lnfpsubhsfkro6d81.apps.googleusercontent.com' });
});

// --- SESIÓN 5 & 10: API REST ---
// Rutas de Usuarios y Autenticación Local
app.post('/api/v1/auth/login', (req, res) => {
    const { correo, password } = req.body;
    const inputClean = (correo || '').toLowerCase().trim();
    
    const user = db.usuarios.find(u => 
        ((u.correo && u.correo.toLowerCase() === inputClean) || 
         (u.username && u.username.toLowerCase() === inputClean)) && 
        u.password === password
    );
    
    if (user) {
        return res.json({ token: `dummy_token_${user.id}`, user });
    } else {
        return res.status(401).json({ error: 'El correo/usuario no está registrado o la contraseña es incorrecta.' });
    }
});

app.post('/api/v1/auth/register', (req, res) => {
    const { username, correo, password } = req.body;
    if (db.usuarios.some(u => u.correo === correo)) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    const newUser = {
        id: db.usuarios.length + 1,
        username,
        correo,
        password,
        rol: 'USUARIO',
        fotoPerfil: null
    };
    db.usuarios.push(newUser);
    db.saveStorage();
    res.status(201).json(newUser);
});

// Almacén en memoria de códigos de verificación de 6 dígitos
const codigosVerificacion = {};

// 1. Solicitar Código de Verificación de 6 dígitos
app.post(['/api/v1/auth/solicitar-codigo', '/api/v1/auth/recuperar-password'], async (req, res) => {
    const { correo } = req.body;
    const cleanEmail = (correo || '').toLowerCase().trim();

    const user = (db.usuarios || []).find(u => u.correo && u.correo.toLowerCase() === cleanEmail);
    if (!user) {
        return res.status(404).json({ error: 'El correo electrónico no se encuentra registrado en el sistema.' });
    }

    // Generar PIN de 6 dígitos aleatorio
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codigosVerificacion[cleanEmail] = {
        codigo,
        expira: Date.now() + 10 * 60 * 1000, // Validez por 10 minutos
        verificado: false
    };

    console.log(`[AUTH] Código de recuperación generado para ${cleanEmail}: ${codigo}`);

    let mailResult = {};
    try {
        mailResult = await enviarCodigoCorreo(cleanEmail, codigo);
    } catch (e) {
        console.error('Error enviando el correo:', e);
    }

    return res.json({ 
        success: true, 
        message: `Código de 6 dígitos enviado exitosamente a ${cleanEmail}.` 
    });
});

// 2. Validar Código de 6 dígitos
app.post('/api/v1/auth/validar-codigo', (req, res) => {
    const { correo, codigo } = req.body;
    const cleanEmail = (correo || '').toLowerCase().trim();

    const registro = codigosVerificacion[cleanEmail];
    if (!registro) {
        return res.status(400).json({ error: 'No se ha solicitado ningún código para este correo.' });
    }

    if (Date.now() > registro.expira) {
        delete codigosVerificacion[cleanEmail];
        return res.status(400).json({ error: 'El código de verificación ha expirado. Solicita uno nuevo.' });
    }

    if (registro.codigo !== codigo.trim()) {
        return res.status(400).json({ error: 'Código de verificación incorrecto. Revisa el PIN e intentalo de nuevo.' });
    }

    registro.verificado = true;
    return res.json({ success: true, message: 'Código verificado correctamente.' });
});

// 3. Restablecer Contraseña (Sólo si el código fue verificado previamente)
app.post('/api/v1/auth/reset-password', (req, res) => {
    const { correo, nuevaPassword } = req.body;
    const cleanEmail = (correo || '').toLowerCase().trim();

    const registro = codigosVerificacion[cleanEmail];
    if (!registro || !registro.verificado) {
        return res.status(403).json({ error: 'Debes verificar tu código de 6 dígitos antes de cambiar la contraseña.' });
    }

    const user = (db.usuarios || []).find(u => u.correo && u.correo.toLowerCase() === cleanEmail);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    user.password = nuevaPassword;
    db.saveStorage();
    
    // Limpiar el código usado
    delete codigosVerificacion[cleanEmail];

    return res.json({ success: true, message: '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva clave.' });
});

// Ruta para actualizar perfil de usuario
app.put('/api/v1/auth/perfil', (req, res) => {
    const { id, username, correo, fotoPerfil } = req.body;
    let u = (db.usuarios || []).find(user => user.id === id || (user.correo && correo && user.correo.toLowerCase() === correo.toLowerCase()));
    
    if (u) {
        if (username) u.username = username;
        if (correo) u.correo = correo;
        if (fotoPerfil !== undefined) u.fotoPerfil = fotoPerfil;
        db.saveStorage();
        return res.json({ success: true, user: u });
    }

    const newUser = {
        id: id || ((db.usuarios || []).length + 1),
        username: username || 'Usuario',
        correo: correo || 'usuario@yak.com',
        fotoPerfil: fotoPerfil || null
    };
    if (!db.usuarios) db.usuarios = [];
    db.usuarios.push(newUser);
    db.saveStorage();
    res.json({ success: true, user: newUser });
});

// Rutas de Ejercicios
app.get('/api/v1/ejercicios', (req, res) => {
    const { lengua, nivel } = req.query;
    let result = db.ejercicios;
    if (lengua) result = result.filter(e => e.lengua.toLowerCase() === lengua.toLowerCase());
    if (nivel) result = result.filter(e => e.nivel.toLowerCase() === nivel.toLowerCase());
    res.json(result);
});

// Rutas de Progreso
app.get('/api/v1/progreso/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const userProgress = db.progresos.filter(p => p.usuarioId === parseInt(usuarioId));
    res.json(userProgress);
});

app.post('/api/v1/progreso', (req, res) => {
    const { usuarioId, ejercicioId, completado } = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    const newProgress = {
        id: db.progresos.length + 1,
        usuarioId: parseInt(usuarioId),
        ejercicioId: parseInt(ejercicioId),
        completado,
        fecha
    };
    db.progresos.push(newProgress);
    if (db.saveStorage) db.saveStorage();
    res.status(201).json(newProgress);
});

// Rutas de Intentos de Cursos (Garantía de retorno universal)
app.get('/api/v1/intentos/:usuarioId', (req, res) => {
    let result = [];
    if (db.intentos && db.intentos.length > 0) {
        result = [...db.intentos];
    }
    
    // Si no hay intentos formales, calculamos desde progresos
    if (result.length === 0 && db.progresos && db.progresos.length > 0) {
        const map = {};
        db.progresos.forEach(p => {
            const ej = db.ejercicios.find(e => e.id === p.ejercicioId);
            if (ej) {
                const key = `${ej.lengua}_${ej.titulo}`;
                if (!map[key]) {
                    map[key] = { lengua: ej.lengua, titulo: ej.titulo, aciertos: 0, total: 0, fecha: p.fecha };
                }
                map[key].total++;
                if (p.completado) map[key].aciertos++;
            }
        });
        result = Object.values(map).map((item, idx) => ({
            id: idx + 1,
            lengua: item.lengua,
            titulo: item.titulo,
            porcentaje: Math.round((item.aciertos / item.total) * 100),
            aciertos: item.aciertos,
            total: item.total,
            fecha: item.fecha
        }));
    }

    res.json(result);
});

app.post('/api/v1/intentos', (req, res) => {
    const { usuarioId, lengua, titulo, porcentaje, aciertos, total } = req.body;
    const fecha = new Date().toISOString().split('T')[0];
    const newIntento = {
        id: (db.intentos || []).length + 1,
        usuarioId: parseInt(usuarioId),
        lengua,
        titulo: titulo || 'Examen Completo',
        porcentaje,
        aciertos,
        total,
        fecha
    };
    if (!db.intentos) db.intentos = [];
    const existingIdx = db.intentos.findIndex(i => i.usuarioId === parseInt(usuarioId) && i.lengua === lengua && i.titulo === newIntento.titulo);
    if (existingIdx >= 0) {
        db.intentos[existingIdx] = newIntento;
    } else {
        db.intentos.push(newIntento);
    }
    if (db.saveStorage) db.saveStorage();

    const racha = calcularRachaUsuario(usuarioId);
    res.status(201).json({ intento: newIntento, racha });
});

// Función de cálculo dinámico de Racha (Regla: >= 60% de aciertos en días consecutivos)
function calcularRachaUsuario(usuarioId) {
    const uId = parseInt(usuarioId);
    
    // Filtrar sólo intentos con porcentaje >= 60%
    const intentosValidos = (db.intentos || [])
        .filter(i => i.usuarioId === uId && (i.porcentaje >= 60));

    if (intentosValidos.length === 0) {
        return { 
            usuarioId: uId, 
            dias: 0, 
            rachaActiva: false, 
            rachaPerdida: false, 
            mensaje: "Completa tu primer quiz con al menos 60% de aciertos para activar tu racha." 
        };
    }

    // Fechas únicas ordenadas de la más reciente a la más antigua
    const fechasUnicas = [...new Set(intentosValidos.map(i => i.fecha))].sort().reverse();
    
    const hoyStr = new Date().toISOString().split('T')[0];
    const ayerDate = new Date();
    ayerDate.setDate(ayerDate.getDate() - 1);
    const ayerStr = ayerDate.toISOString().split('T')[0];

    const ultimaFecha = fechasUnicas[0];

    // Si la última fecha aprobada con >=60% no fue ni hoy ni ayer, la racha expiró por inactividad
    if (ultimaFecha !== hoyStr && ultimaFecha !== ayerStr) {
        return { 
            usuarioId: uId, 
            dias: 0, 
            rachaActiva: false, 
            rachaPerdida: true, 
            ultimaFecha: ultimaFecha,
            mensaje: "¡Perdiste tu racha anterior por inactividad! Completa un quiz hoy con +60% para iniciar una nueva." 
        };
    }

    // Contar días consecutivos contiguos hacia atrás a partir de la última fecha válida
    let diasConsecutivos = 1;
    let fechaCheck = new Date(ultimaFecha + 'T00:00:00');

    while (true) {
        fechaCheck.setDate(fechaCheck.getDate() - 1);
        const fechaAnteriorStr = fechaCheck.toISOString().split('T')[0];
        if (fechasUnicas.includes(fechaAnteriorStr)) {
            diasConsecutivos++;
        } else {
            break;
        }
    }

    return {
        usuarioId: uId,
        dias: diasConsecutivos,
        rachaActiva: true,
        rachaPerdida: false,
        ultimaFecha: ultimaFecha
    };
}

// Rutas de Racha dinámicas
app.get('/api/v1/racha/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const racha = calcularRachaUsuario(usuarioId);
    res.json(racha);
});

// --- SESIÓN 7, 8, 9: GRAPHQL CON API KEY ---
app.use('/graphql', checkApiKey, graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));

// --- SESIÓN 11: AUTENTICACIÓN CON APIs SOCIALES (GOOGLE) ---
app.use('/api/v1/auth/google', auth.router);

const path = require('path');
// Sirviendo archivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, '../../')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor YAK WEB corriendo en http://localhost:${PORT}`);
    console.log(`📚 API REST: http://localhost:${PORT}/api/v1/`);
    console.log(`🌐 GraphQL: http://localhost:${PORT}/graphql`);
});
