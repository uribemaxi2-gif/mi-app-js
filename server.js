require('dotenv').config(); // Carga las variables de .env
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors'); // <--- ¡CRÍTICO! Añade esta línea

// Importar las rutas (asumo que ya corregiste los nombres a projectRoutes.js)
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes'); 

const app = express();
// Usa el puerto del .env o el 5000 por defecto
const PORT = process.env.PORT || 5000; 

// --- 1. Middlewares Globales ---
// Middleware para aceptar JSON en el cuerpo de la petición
app.use(cors({
    origin: 'http://localhost:5173', // Solo tu frontend de desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Esto es importante para el manejo de cookies/sesiones
}));

app.use(express.json());

// --- 2. Conexión a la Base de Datos y Arranque del Servidor ---
const connectDB = async () => {
    try {
        // La conexión usa la URL definida en .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB conectado exitosamente!');
        
        // Iniciar el servidor SOLO si la conexión a la DB fue exitosa
        app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

    } catch (err) {
        console.error(`❌ Error de conexión a MongoDB: ${err.message}`);
        // Salir del proceso con un código de fallo
        process.exit(1);
    }
};

// Iniciar la conexión a la DB y luego el servidor
connectDB();

// --- 3. Definición de Rutas (Endpoints) ---

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Mi App JS corriendo...');
});

// Rutas de Autenticación (Login y Registro)
app.use('/api/auth', authRoutes);

// Rutas del CRUD de Proyectos/Experimentos
// Aquí residen las rutas protegidas por 'admin' (POST, PUT, DELETE) y la pública (GET
app.use('/api/projects', projectRoutes); 

// Rutas de Gestión de Usuarios (Requieren protección y rol de Admin)
app.use('/api/users', userRoutes);