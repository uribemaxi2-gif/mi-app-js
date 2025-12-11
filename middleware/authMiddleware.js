const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger las rutas (requiere un token JWT válido)
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener el token del encabezado: "Bearer TOKEN"
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token y obtener el payload (incluye id y role)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Adjuntar el usuario (sin la contraseña) a la petición
            req.user = await User.findById(decoded.id).select('-password');
            req.userRole = decoded.role; // Adjuntamos el rol

            next(); // Continuar con la función de ruta
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

// Middleware para restringir el acceso solo a administradores
const admin = (req, res, next) => {
    if (req.userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado, requiere rol de Administrador' });
    }
};

module.exports = { protect, admin };