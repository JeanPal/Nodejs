const { Schema, model } = require('mongoose');

const ReservaSchema = Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true,
        default: 'Se especifica dependiendo de tu tipo de negocio'
    },
    reservadoD: {
        type: Boolean,
        default: false
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario', 
        required: false
    },
    numeroPersonas: {
        type: Number,
        required: false, 
    },
    datosAdicionales: {
        type: String,
        required: false, 
        default: ''
    }
});

ReservaSchema.methods.toJSON = function() {
    const { __v, cliente, ...reserva } = this.toObject();
    reserva.IdReservaD = reserva._id; // 
    delete reserva._id; // 
    return reserva;
}

module.exports = model('Reserva', ReservaSchema);
