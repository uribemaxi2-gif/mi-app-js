const express = require('express');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// 1. GET /api/users (Listar todos los usuarios - SOLO ADMIN)
router.get('/', protect, admin, async (req, res) => {
    try {
        // Muestra todos los usuarios, pero excluye la contraseña
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
});

// 2. PUT /api/users/:id/role (Cambiar Rol - SOLO ADMIN)
router.put('/:id/role', protect, admin, async (req, res) => {
    const { role } = req.body;
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Asegura que el rol sea válido
            if (role === 'admin' || role === 'usuario_normal') {
                user.role = role;
                const updatedUser = await user.save();
                res.json({ message: `Rol de ${updatedUser.username} actualizado a ${updatedUser.role}` });
            } else {
                res.status(400).json({ message: 'Rol inválido.' });
            }
        } else {
            res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar rol.' });
    }
});

// 3. DELETE /api/users/:id (Eliminar Usuario - SOLO ADMIN)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user) {
            res.json({ message: 'Usuario eliminado.' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
});

module.exports = router;