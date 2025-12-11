const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    isVisible: { // Para mostrar solo al admin o a todos
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Project', ProjectSchema);