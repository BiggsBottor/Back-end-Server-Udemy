/*jshint esversion: 6 */


// -- REQUIRES -- //
var express = require('express'); 
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Imported Routes
var appRoutes = require('./routes/app'); 
var usuarioRoutes = require('./routes/usuario'); 
var loginRoutes = require('./routes/login'); 

// Inicializar variables
var app = express();

// -- Configuarión bodyParser -- //
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


// conexión con la BBDD
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => { 

    if ( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');    

});

// -- ROUTES -- // IMPORTANT:
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones (puerto 3000)
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
