/*jshint esversion: 6 */
/*jshint esversion: 8 */

// -- REQUIRES -- //
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// -- MODELS -- //
var Usuario = require('../models/usuario');

// -- CONFIG -- //
var SEED = require('../config/config').SEED;
var mdAutnticacion = require('../middlewares/autenticacion');

//-- Google -- //
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Inicializar variables
var app = express();

// -- ROUTES -- //

// =============
// Renueva Token
// =============
app.get('/renewtoken', mdAutnticacion.verificarToken, ( req, res ) => {

    var token = jwt.sign( { usuario: req.usuario }, SEED, { expiresIn: 14400 } ); // 4h

    res.status(200).json({
        ok: true,
        token: token
    });

});

// =================================
// Autenticación Google
// =================================
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
  }

app.post('/google', async (req, res) => {

    var token = req.body.token;

    var googleUser = await verify( token )
            .catch( e => {
                return res.status(403).json({
                    ok: false,
                    message: 'Token no válido'
                });
            });

    Usuario.findOne( {email: googleUser.email }, (err, usuarioDB ) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        if ( usuarioDB ) {

            if ( !usuarioDB.google ) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticación normal',
                    errors: err
                });
            } else {
                var token = jwt.sign( { usuario: usuarioDB }, SEED, { expiresIn: 14400 } ); // 4h

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: ObtenerMenu( usuarioDB.role )
                });
            }

        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google; // podría poner simplemente true, pero así pruebo
            usuario.password = ':)'; //para evitar que use las credenciales por la manera normal

            usuario.save( ( err, usuarioDB ) => {
                var token = jwt.sign( { usuario: usuarioDB }, SEED, { expiresIn: 14400 } ); // 4h

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id,
                    menu: ObtenerMenu( usuarioDB.role )
                });
            });
        }

    });

    // res.status(200).json({
    //     ok: true,
    //     message: "google login ok",
    //     googleUser: googleUser
    // });

});

// =================================
// Autenticación Normal
// =================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne( { email: body.email }, (err, usuarioDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            });
        }

        // FIXME: no incluir el [dev-error] en producción para no dar pistas de porqué no se ha autenticado
        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas' + ' [dev-error] = email',
                errors: err
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioDB.password ) ) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas' + ' [dev-error] = password',
                errors: err
            });
        }

        // Crea un token
        usuarioDB.password = ':)';
        var token = jwt.sign( { usuario: usuarioDB }, SEED, { expiresIn: 14400 } ); // 4h

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            menu: ObtenerMenu( usuarioDB.role )
        });

    });

});


// ======================================
// Menú dinámico según el rol del usuario
// ======================================
function ObtenerMenu( ROLE ){

    var menu = [
        {
          title: 'Principal',
          icon: 'mdi mdi-gauge',
          submenu: [
            { title: 'Dashboard', url: '/dashboard' },
            { title: 'Progress Bar', url: '/progress' },
            { title: 'Gráficas', url: '/charts1' },
            { title: 'Promesas', url: '/promises' },
            { title: 'RxJs', url: '/rxjs' }
          ]
        },
        {
          title: 'Mantenimento',
          icon: 'mdi mdi-folder-lock-open',
          submenu: [
            // { title: 'Usuarios', url: '/usuarios' },
            { title: 'Hospitales', url: '/hospitales' },
            { title: 'Médicos', url: '/medicos' }
          ]
        }
      ];

      if ( ROLE === 'ADMIN_ROLE' ) {
          menu[1].submenu.unshift( { title: 'Usuarios', url: '/usuarios' } );
      }

      return menu;

}


module.exports = app;