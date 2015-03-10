module.exports = function (sio) {
    var express = require('express');
    var path = require('path');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var app = express();
    var clientSessions = require("client-sessions");
    var mysql = require('mysql');
    var NodeCache = require("node-cache");
    var cache = new NodeCache({stdTTL: 600, checkperiod: 60});
    var cacheRegistro = new NodeCache({stdTTL: 600, checkperiod: 60});

    // batabase settings conections
    var db = function (database) {
        if (!database)
            database = 'usuarios';
        database = 'henry_' + database;
        var link = mysql.createConnection({
            host: '127.0.0.1',
            user: 'henry',
            password: '@h3nR!1',
            database: database,
            port: 3306
        });
        link.connect();
        return link;
    };
    var TODO = new Array();

    var W = new Array();
    function dispositivo(id) {
        if (W.indexOf(id) === -1) {
            W.push(id);
            var bd = db("monitor");
            bd.query("SELECT evento,hora FROM registro WHERE dispositivo = '" + id + "' ORDER BY hora ASC;", function (err, result) {
                if (err) {
                    // TODO manejo de errores
                    console.log(err);
                } else {
                    console.log(result);
                    var horaInicio = 0;
                    var fecha;
                    var data = {estado: 1};
                    for (var i = 0; i < result.length; ++i) {
                        fecha = result[i].hora;

                        if (!data[fecha.getFullYear()]) {
                            data[fecha.getFullYear()] = {};
                        }
                        if (!data[fecha.getFullYear()]["fallas"]) {
                            data[fecha.getFullYear()]["fallas"] = {};
                        }
                        if (!data[fecha.getFullYear()]["trabajo"]) {
                            data[fecha.getFullYear()]["trabajo"] = {};
                        }
                        if (!data[fecha.getFullYear()]["fallas"][fecha.getMonth()]) {
                            data[fecha.getFullYear()]["fallas"][fecha.getMonth()] = [0, 0, 0, 0];
                        }
                        if (!data[fecha.getFullYear()]["trabajo"][fecha.getMonth()]) {
                            data[fecha.getFullYear()]["trabajo"][fecha.getMonth()] = [];
                        }
                        if (!data[fecha.getFullYear()]["trabajo"][fecha.getMonth()][fecha.getDate()]) {
                            data[fecha.getFullYear()]["trabajo"][fecha.getMonth()][fecha.getDate()] = 0;
                        }
                        switch (result[i].evento) {
                            case 1:
                            case 2:
                            case 5:
                            case 6:
                                var j = (result[i].evento < 3) ? result[i].evento - 1 : result[i].evento - 3;
                                data[fecha.getFullYear()]["fallas"][fecha.getMonth()][j]++;
                                break;
                            case 3:
                                horaInicio = fecha;
                                break;
                            case 4:
                                if (horaInicio !== 0) {
                                    data[fecha.getFullYear()]["trabajo"][fecha.getMonth()][horaInicio.getDate()] += (fecha.getTime() - horaInicio.getTime()) / 1000 / 60 / 60;
                                    horaInicio = 0;
                                }
                                break;
                        }
                    }
                    cacheRegistro.set(id, data);
                }
                var index = W.indexOf(id);
                if (index > -1) {
                    W.splice(index, 1);
                }
            });
            bd.end();
        }
    }

    var usuario = function (id, callback) {
        var makeResultado = function (id) {
            var datos = {id: id, identificado: false};

            this.get = function (entrada) {
                return datos[entrada];
            };

            this.set = function (entrada, valor) {
                datos[entrada] = valor;
            };

            this.permiso = function (entrada) {

                if (datos.permisos && (datos.permisos.length > 0))
                {
                    if (datos.permisos[0] === "*")
                    {
                        return true;
                    }
                    else
                    {
                        for (var i = 0; i < datos.permisos.length; ++i)
                        {
                            if (entrada === datos.permisos[i])
                            {
                                return true;
                                break;
                            }
                            else
                            {
                                return false;
                            }
                        }
                    }
                }
                else
                {
                    return false;
                }
            };
            return this;
        };

        var resu = makeResultado(id);
        var bd = db();

        if (typeof (resu.get('id')) !== "undefined") {
            bd.query("SELECT nombre,role FROM usuarios WHERE id='" + resu.get('id') + "' LIMIT 1",
                    function (err, resultado) {
                        if (err) {
                            console.log(err);
                            // TODO Manejo errores
                        } else {

                            if (resultado.length > 0) {
                                resu.set('identificado', true);
                                resu.set('role', resultado[0].role);
                                resu.set('nombre', resultado[0].nombre);
                                var dbRole = db();
                                dbRole.query("SELECT r.permisos FROM usuarios u, roles r WHERE r.id=u.role AND u.id='" + resu.get('id') + "' LIMIT 1",
                                        function (err, resultado) {
                                            if (err) {
                                                console.log(err);
                                                // TODO manejo errores
                                            }
                                            else {
                                                if (resultado.length > 0) {
                                                    if (resultado[0].permisos === "*") {
                                                        var flag = false;
                                                        resu.set('permisos', "*");
                                                    } else {
                                                        resu.set('permisos', resultado[0].permisos.split(","));
                                                        var sql = "SELECT sys_nombre FROM permisos WHERE ";
                                                        var permisos = resu.get("permisos");
                                                        //console.log(permisos);
                                                        for (var i = 0; i < permisos.length; ++i) {
                                                            sql += "id='" + permisos[i] + "'";
                                                            if (i < (permisos.length - 1)) {
                                                                sql += " OR ";
                                                            }
                                                        }
                                                        var dbPermisos = db();
                                                        dbPermisos.query(sql,
                                                                function (err, resultado) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        // TODO manejo errores
                                                                    }
                                                                    else {

                                                                        if (resultado.length > 0) {
                                                                            //var array=new Array();
                                                                            for (var i = 0; i < permisos.length; ++i)
                                                                            {
                                                                                permisos[i] = resultado[i].sys_nombre;
                                                                            }
                                                                        }

                                                                        callback(resu);
                                                                        flag = true;
                                                                    }
                                                                });

                                                        dbPermisos.end();
                                                    }
                                                }
                                                if (flag === false)
                                                {
                                                    callback(resu);
                                                }
                                            }
                                        }
                                );
                                dbRole.end();
                            }
                        }
                    });
            bd.end();
        }
        else {
            callback(resu);
        }
    };


    sio.on('connection', function (socket) {
        socket.on('dispositivo', function (id) {
            var data = cacheRegistro.get(id);
            if (!data[id]) {
                dispositivo(id);
                data = {estado: 0};
            } else {
                data = data[id];
            }
            console.log(data);
            socket.emit('data', data);
        });
    });

    var routerIndex = require('./routes/index');
    var routerPermisos = require('./routes/permisos');
    var routerRoles = require('./routes/roles');
    var routerUsuario = require('./routes/usuario');
    var routersms = require('./routes/sms');
    var routerdisp = require('./routes/disp');
    var routerrutinas = require('./routes/rutinas');

    app.use(clientSessions({
        cookieName: 'usuario', // cookie name 
        secret: 'bla332adf234gfasdt4whuil73g', // should be a large unguessable string
        duration: 60 * 60 * 1000 // 1h
    }));

// view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    //app.use(session({secret: 'fgf'}));
    app.use(express.static(path.join(__dirname, 'public')));


// Make our db accessible to our router
    app.use(function (req, res, next) {
        req.db = db;
        next();
    });
// Make accesible cache
    app.use(function (req, res, next) {
        res.cache = cache;
        next();
    });
//Make accesible TODO
    app.use(function (req, res, next) {
        res.TODO = TODO;
        next();
    });

//Make accesible usuario
    app.use(function (req, res, next) {
        res.usuario = usuario;
        next();
    });

    app.use('/', routerIndex);
    app.use('/permisos', routerPermisos);
    app.use('/roles', routerRoles);
    app.use('/usuario', routerUsuario);
    app.use('/sms', routersms);
    app.use('/disp', routerdisp);
    app.use('/rutinas', routerrutinas);


// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    global.manejo_errores = function (tipo, err, res) {
        switch (tipo) {
            case 1:
                var fs = require('fs');

                fs.exists('errores.txt', function (exists) {
                    if (exists) {
                        fs.appendFile('errores.txt', new Date().toString() + "     " + err + "\r\n", function (err) {
                        });
                    } else {
                        fs.writeFile("errores.txt", new Date().toString() + "     " + err + "\r\n");
                    }
                });
                res.render('errores/danger', {
                    pagina: {
                        titulo: "Peligro",
                        navbar: false
                    },
                    error: {texto: "Ha ocurrido un error, por favor contactar al administrador"}
                });
                break;

            case 2:
                res.render('errores/info', {
                    pagina: {
                        navbar: false
                    },
                    titulo: "Info",
                    error: {texto: err}
                });
                break;

            case 3:
                res.render('errores/info', {
                    pagina: {
                        navbar: false
                    },
                    titulo: "Info",
                    error: {texto: err}
                });
                break;
        }
    };

// production error handler
// no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    return app;
};
