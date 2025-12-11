const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa el modelo de usuario
const router = express.Router();

/**
 * Función auxiliar para generar el Token de Autenticación (JWT)
 * Este token contiene el ID del usuario y su ROL.
 * @param {string} id - ID del usuario de MongoDB
 * @param {string} role - Rol del usuario ('admin' o 'usuario_normal')
 * @returns {string} Token JWT firmado
 */
const generateToken = (id, role) => {
    // Firma el token usando el secreto definido en el archivo .env
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d', // El token expira en 30 días
    });
};

// =========================================================
// RUTAS DE AUTENTICACIÓN
// =========================================================

// POST /api/auth/register
// Crea un nuevo usuario. El rol por defecto es 'usuario_normal'.
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    // 1. Verificar si el usuario ya existe
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'El usuario ya existe' });
    }

    try {
        // 2. Crear el usuario. La contraseña se encripta automáticamente
        // gracias al hook pre('save') en models/User.js.
        const user = await User.create({ username, password });

        // 3. Responder con el token y los datos del usuario
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error('Error durante el registro (Verificar bcryptjs):', error);
        // Responde con un error 500 si hay un fallo de escritura o encriptación
        res.status(500).json({ message: 'Error interno en el registro', error: error.message });
    }
});

// POST /api/auth/login
// Autentica al usuario y devuelve el token.
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Buscar el usuario por nombre
    const user = await User.findOne({ username });

    // 2. Verificar el usuario y la contraseña (usando el método matchPassword del modelo)
    if (user && (await user.matchPassword(password))) {
        // Login exitoso: Devolver token y datos
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        // Fallo de autenticación
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
});

module.exports = router;