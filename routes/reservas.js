const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT } = require('../middlewares');
const { disponibilidad, ReclamarReservas, ModificarReservas, EliminarReservas, MisReservas } = require('../controllers/reservas');

const router = Router();

router.get('/disponibilidad', [
 //No necesita validaciones es algo que cualquier pueda ver sin logearse
], disponibilidad);

router.post('/reclamar-reserva/:idReservaD', [
    validarJWT,
    check('numeroPersonas', 'El número de personas es obligatorio').isInt({ min: 1 }), 
], ReclamarReservas);

router.put('/modificar-reserva/:id', [
    validarJWT,
    check('numeroPersonas', 'El número de personas es obligatorio').optional().isInt({ min: 1 }),
    check('datosAdicionales').optional().isString(),
    check('nuevaIdReserva').optional().isMongoId(),
    validarCampos
], ModificarReservas);

router.get('/mis-reservas', [
    validarJWT,
], MisReservas);

router.delete('/eliminar-reserva/:id', [
    validarJWT,
], EliminarReservas);



module.exports = router;
