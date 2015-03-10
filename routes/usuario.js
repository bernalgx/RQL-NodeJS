var express = require('express');
var router = express.Router();
var identificar = false;

router.get('/identificar', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {
        if (!usu.get('identificado'))
        {
            res.render('usuario/identificar', {
                pagina: {
                    titulo: "Identificacion",
                    navbar: false
                },
                usuario: req.query.usuario ? req.query.usuario : false
            });
        }
        else
        {
            var nombre = usu.get("nombre");
            manejo_errores(1, err = nombre + ' ya esta identificado', res);
        }
    });
});

router.post('/identificar', function (req, res, next) {

    var usuario = req.body.usuario;
    var pass = req.body.pass;
    var ip = req.ip;
    var id = req.usuario.id;

    if (usuario.length > 0 && pass.length > 0) {
        var db = req.db();
        db.query("SELECT id,nombre FROM usuarios WHERE nombre='" + usuario + "' AND pass=SHA1('" + pass + "') LIMIT 1;", function (err, result) {
            if (err) {
                manejo_errores(err, res);
                console.log("ERROR de identificacion.");
                console.log(err);
            } else {
                console.log(result);
                if (result.length > 0) {

                    if (req.body.recordar) {
                        console.log("lleguè hasta aca");

                        var timeInMs = (Date.now() / 1000) - 21600;
                        var tres_dias = 259200;
                        var expira_en_3_dias = timeInMs + tres_dias;
                        var sql = "INSERT INTO sesiones (ip,usuario,expira) VALUES ('" + ip + "','" + id + "',FROM_UNIXTIME(" + expira_en_3_dias + "))";
                        var dbSesiones = req.db();
                        dbSesiones.query(sql, function (err, result)
                        {
                            if (err)
                            {
                                manejo_errores(1, err, res);
                            }
                            else
                            {
                                console.log("RECORDAR")
                            }
                        });
                        dbSesiones.end();
                    }
                    identificar = true;
                    user_nombre = result[0] ["nombre"];
                    user_id = result[0] ["id"];
                    req.usuario = {id: result[0].id};
                    res.location("/");
                    res.redirect("/");

                } else {
                    res.location("/usuario/identificar?usuario=" + usuario);
                    res.redirect("/usuario/identificar?usuario=" + usuario);
                }
            }
        });
        db.end();
    }
    else {
        res.location("/usuario");
        res.redirect("/usuario");
    }
});

router.get('/agregar', function (req, res, next) {

    res.usuario(req.usuario.id, function (usu) {
        if (usu.get('identificado'))
        {
            if (usu.permiso("user_create"))
            {
                var db = req.db();
                db.query("SELECT id,nombre FROM  roles", function (err, result) {
                    if (err) {
                    }
                    else {
                        res.render('usuario/agregar', {
                            pagina: {
                                titulo: "Nuevo Usuario",
                                navbar: true
                            },
                            permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                            userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                            lista: result,
                            usuario: req.query.usuario ? req.query.usuario : false
                        });
                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(1, err = 'NO TIENE PERMISOS PARA AGREGAR USUARIOS', res);
            }
        }
        else {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

router.post('/agregar', function (req, res, next) {

    var usuario = req.body.usuario;
    var pass = req.body.pass;
    var pass2 = req.body.pass2;
    var role = req.body.role;
    if (usuario.length > 0 && pass.length >= 4)
    {
        var activeuser = 0;
        if (req.body.usuario_activo) {
            activeuser = 1;
        }
        res.usuario(req.usuario.id, function (usu)
        {
            if (pass === pass2)
            {
                var db = req.db();
                db.query("INSERT INTO usuarios (nombre,pass,role,Activo) VALUES ('" + usuario + "',SHA1('" + pass + "'),'" + role + "','" + activeuser + "')", function (err, result) {
                    if (err) {
                        manejo_errores(1, err, res);
                    } else {
                        res.location("/usuario");
                        res.redirect("/usuario");
                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(2, err = "LA CONTRASEÑA NO COINCIDE, REGRESE Y VUELVA A DIGITARLA", res);
            }
        });
    }
    else
    {
        manejo_errores(2, err = "Ingrese datos correctos, verifique que la contraseña tenga 4 caracteres o más.", res);
    }
});


router.get('/salir', function (req, res, next) {
    req.usuario.reset();
    res.location("/");
    res.redirect("/");
});


router.get('/', function (req, res, next) {

    res.usuario(req.usuario.id, function (usu) {
        if (usu.get('identificado'))
        {
            console.log("esta identificado");
            if (usu.permiso("user_list"))
            {
                console.log(usu.get("nombre"));
                console.log(usu.permiso("permisos"));
                var db = req.db();
                db.query("SELECT * FROM  usuarios", function (err, result) {
                    if (err)
                    {
                        manejo_errores(1, err, res);
                    }
                    else
                    {
                        res.render('usuario/lista_usuarios',
                                {
                                    user: {loged: false},
                                    pagina: {titulo: "Usuarios", navbar: true},
                                    lista_usuarios: result,
                                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                    usuario: result.id
                                });
                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(1, err = 'NO TIENE PERMISOS PARA VER OTROS USUARIOS', res);
            }
        }
        else {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});


router.get('/editar', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {
        if (usu.get('identificado'))
        {
            var user_id;
            var miUsuario = false;
            if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                miUsuario = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                miUsuario = false;

            }
            var db = req.db();
            db.query("SELECT id,nombre,role FROM usuarios WHERE id='" + user_id + "' LIMIT 1", function (err, result_usuarios) {
                if (err) {
                    manejo_errores(1, err, res);
                } else {
                    if (result_usuarios.length === 0) {
                        manejo_errores(3, err = "El usuario no existe", res);
                    } else {
                        var dbRoles = req.db();
                        dbRoles.query("SELECT id,nombre FROM roles ", function (err, result_roles) {
                            if (err) {
                                manejo_errores(1, err, res);
                            } else {
                                if ((miUsuario) || (usu.permiso("user_edit"))) {
                                    res.render('usuario/editar', {
                                        user: {loged: false},
                                        pagina: {titulo: "Usuario", navbar: true},
                                        usuario: result_usuarios[0],
                                        nombreUsuario: !miUsuario ? "Editando Usuario de " + result_usuarios[0].nombre : "Editando mi Usuario",
                                        miUsuario: miUsuario,
                                        roles: result_roles,
                                        role: result_usuarios[0].role,
                                        permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos"), user_edit: usu.permiso("user_edit")},
                                        userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                        id: req.query.idUsuario
                                    });
                                }
                                else
                                {
                                    manejo_errores(3, err = 'NO TIENE PERMISOS PARA EDITAR OTROS USUARIOS', res);
                                }
                            }
                        });
                        dbRoles.end();
                    }
                }
            });
            db.end();
        }
        else
        {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

router.post('/editar', function (req, res, next) {

    var miUsuario = req.body.miUsuario;
    var usuario_id = req.body.id;
    var nombre = req.body.nombre;
    var pass = req.body.pass;
    var pass2 = req.body.pass2;
    var role = req.body.role;

    console.log("miUsuarioPOST");
    console.log(miUsuario);

    res.usuario(req.usuario.id, function (usu)
    {
        if (nombre.length > 0)
        {
            var db = req.db();
            if (pass === pass2) {
                db.query("UPDATE usuarios SET nombre='" + nombre + "' ,pass=sha1('" + pass + "'),role='" + role + "' WHERE id='" + usuario_id + " '", function (err, result) {
                    if (err) {
                        manejo_errores(1, err, res);
                    } else
                    {
                        if (miUsuario == "true")
                        {
                            res.location("/usuario/disp");
                            res.redirect("/usuario/disp");

                        }
                        else
                        {
                            res.location("/usuario");
                            res.redirect("/usuario");
                        }


                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(3, err = 'LA CONTRASEÑA NO COINCIDE, REGRESE Y VUELVA A DIGITARLA', res);
            }
        }
        else
        {
            res.send("error");
        }
    });
});

router.get('/remover', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {
        if (usu.get('identificado'))
        {
            if (usu.permiso("user_delete"))
            {
                console.log(usu.permiso("user_delete"));
                var db = req.db();
                db.query("SELECT id,nombre FROM usuarios WHERE id=  '" + req.query.idUsuario + "' LIMIT 1", function (err, result_usuarios) {
                    if (err) {
                        manejo_errores(1, err, res);
                    } else {
                        res.render('usuario/remover', {
                            user: {loged: false},
                            pagina: {titulo: "Remover", navbar: true},
                            permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                            userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                            usuario: result_usuarios[0]
                        });
                    }
                });
                db.end();
            }
            else {
                manejo_errores(3, err = 'NO TIENE PERMISOS PARA REMOVER USUARIOS', res);
            }
        }
        else
        {
            console.log("no esta identificado");
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

router.post('/remover', function (req, res, next) {
    var id = req.body.id;
    var retVal = 1;
    if (id.length > 0) {
        retVal = 2;
        var db = req.db();
        db.query("DELETE FROM usuarios WHERE id='" + id + "' LIMIT 1;", function (err) {
            if (err) {
                manejo_errores(err, res);
            } else {
                res.location("/usuario");
                res.redirect("/usuario");
            }
        });
        db.end();
    } else {
        manejo_errores(1, err, res);
    }
});

router.get('/disp', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            var user_id;
            var misDispositivos = false;
            if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                misDispositivos = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                misDispositivos = false;

            }

            console.log("user_id");
            console.log(user_id);

            if ((misDispositivos) || (usu.permiso("disp_list")))
            {
                var sql = ("SELECT id,tipo,notas,numero FROM dispositivos WHERE usuario='" + user_id + "';");

                var db = req.db("monitor");
                db.query(sql, function (err, result) {
                    if (err) {
                        manejo_errores(err, res);
                        console.log(err);
                    }
                    else
                    {

                        var sql = ("SELECT nombre FROM usuarios WHERE id='" + user_id + "' LIMIT 1;");
                        var dbUsuario = req.db();
                        dbUsuario.query(sql, function (err, resultUsuario) {
                            if (err)
                            {
                                manejo_errores(1, err, res);
                            }
                            else
                            {
                                res.render("sitio/escritorio", {
                                    pagina: {titulo: "Escritorio", navbar: true},
                                    dispositivos: result,
                                    nombreUsuario: !misDispositivos ? "Dispositivos de " + resultUsuario[0].nombre : "Mis Dispositivos",
                                    misDispositivos: misDispositivos,
                                    user_id: user_id,
                                    disp_delete: usu.permiso("disp_delete"),
                                    identificar: identificar,
                                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')}
                                });
                                identificar = false;
                            }
                        });
                        dbUsuario.end();
                    }
                });
                db.end();
            }
            else
            {
                res.render('errores/info', {
                    pagina: {
                        navbar: true
                    },
                    titulo: "Errores",
                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                    identificar: identificar,
                    error: {texto: 'NO TIENE PERMISOS PARA VER OTROS DISPOSITIVOS'}
                });
            }
        }
        else
        {
            console.log("no esta identificado");
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

router.get('/activar', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("user_activate"))
            {
                var sql;
                var db = req.db();
                var id = req.body.id;
                if (req.query.activar == 0)
                {
                    sql = "UPDATE usuarios SET Activo = 1 WHERE id= '" + req.query.id_usuario + "' LIMIT 1;";
                } else {
                    sql = "UPDATE usuarios SET Activo = 0 WHERE id= '" + req.query.id_usuario + "' LIMIT 1;";
                }
                db.query(sql, function (err) {

                    if (err) {
                        manejo_errores(err, res);
                    } else
                        res.location("/usuario");
                    res.redirect("/usuario");
                });
                db.end();
            }
            else
            {
                res.render('errores/info', {
                    pagina: {
                        navbar: true
                    },
                    titulo: "Errores",
                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                    identificar: identificar,
                    error: {texto: 'NO TIENE PERMISOS PARA ACTIVAR - DESACTIVAR USUARIOS'}
                });
            }
        }
        else
        {
            console.log("no esta identificado");
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

module.exports = router;