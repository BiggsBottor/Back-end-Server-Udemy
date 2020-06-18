/*jshint esversion: 6 */

// -- REQUIRES -- //
var jwt = require('jsonwebtoken');

// -- Variables -- //
var SEED = require('../config/config').SEED;

// ===============
// Verificar Token
// ===============
exports.verificarToken = function( req, res, next ) {

    var token = req.query.token;

    jwt.verify( token, SEED, ( err, decoded ) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

};

// ====================
// Verificar ADMIN_ROLE
// ====================
exports.verificarADMIN_ROLE = function( req, res, next ) {

    var usuario = req.usuario;

    if ( usuario.role === 'ADMIN_ROLE' ) { next(); return; }
    else {
        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto',
            errors: { message: 'Acceso denegado. Contacte con un Administrador' }
        });
    }

};

// ====================================
// Verificar ADMIN_ROLE o Mismo Usuario
// ====================================
exports.verificarADMINoSiMismo = function( req, res, next ) {

    var usuario = req.usuario;
    var id = req.params.id;

    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) { next(); return; }
    else {
        return res.status(401).json({
            ok: false,
            message: 'Token incorrecto - No es Administrador o el mismo Usuario',
            errors: { message: 'Acceso denegado. Contacte con un Administrador' }
        });
    }

};
