const { Schema, model } = require('mongoose');

const ReservaListaSchema = Schema({
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
        required: [true, 'Se especifica dependiendo de tu tipo de negocio']
    },
    IdReservaD: {
        type: Schema.Types.ObjectId,
        ref: 'Reserva',
        required: true
    }
});

module.exports = model('ReservaLista', ReservaListaSchema);
