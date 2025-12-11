const express = require('express');
const Project = require('../models/Project'); // Importamos el modelo Project
const { protect, admin } = require('../middleware/authMiddleware'); // Importamos los middlewares de seguridad
const router = express.Router();

// --- RUTAS DE LECTURA (ACCESIBLES PARA USUARIO NORMAL Y ADMIN) ---

// 1. GET /api/projects
// Obtener todos los proyectos visibles para el público.
router.get('/', async (req, res) => {
    try {
        // Un usuario normal solo puede ver los proyectos marcados como isVisible: true
        const projects = await Project.find({ isVisible: true }); 
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener proyectos.', error: error.message });
    }
});

// 2. GET /api/projects/:id
// Obtener un proyecto específico (debe ser visible).
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ 
            _id: req.params.id, 
            isVisible: true // Solo si está marcado como visible
        });

        if (project) {
            res.json(project);
        } else {
            res.status(404).json({ message: 'Proyecto no encontrado o no visible' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar proyecto.', error: error.message });
    }
});

// --- RUTAS DE GESTIÓN (RESTRINGIDAS SOLO PARA ADMINISTRADOR) ---
// Usamos protect (autenticación) y admin (autorización de rol)

// 3. POST /api/projects (Crear Nuevo Proyecto)
router.post('/', protect, admin, async (req, res) => {
    const { title, description, isVisible } = req.body;
    try {
        const project = new Project({ title, description, isVisible });
        const createdProject = await project.save();
        res.status(201).json(createdProject);
    } catch (error) {
        res.status(400).json({ message: 'Datos de proyecto inválidos.', error: error.message });
    }
});

// 4. PUT /api/projects/:id (Actualizar Proyecto Existente)
router.put('/:id', protect, admin, async (req, res) => {
    const { title, description, isVisible } = req.body;
    
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            project.title = title !== undefined ? title : project.title;
            project.description = description !== undefined ? description : project.description;
            project.isVisible = isVisible !== undefined ? isVisible : project.isVisible;

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Proyecto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar proyecto.', error: error.message });
    }
});

// 5. DELETE /api/projects/:id (Eliminar Proyecto)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (project) {
            res.json({ message: 'Proyecto eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Proyecto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar proyecto.', error: error.message });
    }
});

module.exports = router;