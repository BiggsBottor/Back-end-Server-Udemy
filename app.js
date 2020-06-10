/*jshint esversion: 6 */

// -- REQUIRES -- //
var express = require('express'); 
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Imported Routes
var appRoutes = require('./routes/app'); 
var usuarioRoutes = require('./routes/usuario'); 
var loginRoutes = require('./routes/login'); 
var hospitalRoutes = require('./routes/hospital'); 
var medicoRoutes = require('./routes/medico'); 
var busquedaRoutes = require('./routes/busqueda'); 
var uploadRoutes = require('./routes/upload'); 
var imagenesRoutes = require('./routes/imagenes'); 

// Inicializar variables
var app = express();


// -- CORS -- //
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


// -- Configuarión bodyParser -- //
// parse application/x-www-form-urlencoded & application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongoose config to avoid warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);


// conexión con la BBDD
// -- NEW connection method -- //
mongoose.connect('mongodb://localhost:27017/hospitalDB')
    .then(() => console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'))
    .catch(err => console.error('No se pudo conectar con MongoDB..', err));

// mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => { 
    
//     if ( err ) throw err;

//     console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');    

// });

// -- OPCIONAL -- //
// server-index config
    // var serveIndex = require('serve-index');
    // app.use(express.static(__dirname + '/'));
    // app.use('/uploads', serveIndex(__dirname + '/uploads', {'icons': true}));

// -- ROUTES -- // IMPORTANT:
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes);

// Escuchar peticiones (puerto 3000)
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
