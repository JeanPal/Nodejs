const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, esAdminRole } = require('../middlewares');
const Reserva = require('../models/reserva');
const { CrearReservasAdmin, EliminarReservasAdmin } = require('../controllers/admin-reserva');

const router = Router();

router.post('/', [
    validarJWT,
    esAdminRole,
    check('fecha', 'La fecha es obligatoria').not().isEmpty(),
    check('hora', 'La hora es obligatoria').not().isEmpty(),
    check('descripcion', 'Se especifica dependiendo de tu tipo de negocio').not().isEmpty(),
    validarCampos
], CrearReservasAdmin);

router.delete('/delete-reserva/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], EliminarReservasAdmin);

module.exports = router;
