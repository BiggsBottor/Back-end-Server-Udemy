/*jshint esversion: 6 */

// -- REQUIRES -- //
var express = require('express'); 
var path = require('path');
var fs = require('fs');

// Inicializar variables
var app = express();

// -- ROUTES -- //
app.get( '/:tipo/:img', (req, res) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImg = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );
    var pathNoImg = path.resolve( __dirname, '../assets/no-img.jpg' );

    if ( fs.existsSync( pathImg ) ) {
        res.sendFile( pathImg );
    } else {
        res.sendFile( pathNoImg );
    }

} );

module.exports = app;