const express = require('express');
const router = express.Router();
const db = require('./database');

// Mock de validación de Token de Google OAuth (Sesión 11)
// En un entorno real se usaría: const { OAuth2Client } = require('google-auth-library');
// y se verificaría el req.body.credential contra oauth2.googleapis.com

router.post('/', async (req, res) => {
    const { credential, email, name, picture } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Faltan datos de Google' });
    }

    // Buscar si el usuario ya existe
    let user = db.usuarios.find(u => u.correo === email);
    
    if (!user) {
        // Crear usuario social si no existe
        user = {
            id: db.usuarios.length + 1,
            username: name || email.split('@')[0],
            correo: email,
            password: 'OAUTH_GOOGLE', // No usa password local
            rol: 'USUARIO',
            fotoPerfil: picture
        };
        db.usuarios.push(user);
        db.saveStorage();
    } else {
        // Preservar username y fotoPerfil si ya fueron personalizados por el usuario
        if (!user.username) user.username = name || email.split('@')[0];
        if (!user.fotoPerfil) user.fotoPerfil = picture;
        db.saveStorage();
    }

    // Retornar JWT / Token simulado y los datos del usuario
    res.json({
        token: `social_token_${user.id}_${Date.now()}`,
        user
    });
});

module.exports = { router };
