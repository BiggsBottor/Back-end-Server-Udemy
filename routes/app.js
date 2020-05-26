/*jshint esversion: 6 */

// -- REQUIRES -- //
var express = require('express'); 

// Inicializar variables
var app = express();

// -- ROUTES -- //
app.get( '/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });
} );

module.exports = app;