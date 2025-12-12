require('dotenv').config(); // Carga las variables de .env
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

// Importar las rutas (asumo que ya corregiste los nombres a projectRoutes.js)
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes'); 

const app = express();
// Usa el puerto del .env o el 5000 por defecto
const PORT = process.env.PORT || 5000; 

// --- 1. Middlewares Globales ---
// Middleware para aceptar JSON en el cuerpo de la petición
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o CURL)
        if (!origin) return callback(null, true); 
        // Permitir solo si el origen está en nuestra lista de permitidos
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'La política CORS para este sitio no permite el acceso desde el Origen especificado.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, // Importante si manejas cookies o tokens en encabezados
    allowedHeaders: ['Content-Type', 'Authorization'],
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