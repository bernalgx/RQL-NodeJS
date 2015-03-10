var express = require('express');
var router = express.Router();
module.exports = router;

router.get('/', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {
        if (usu.get('identificado'))
        {
            var user_id;
            var misRutinas = false;
            if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                misRutinas = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                misRutinas = false;
            }

            if ((misRutinas) || (usu.permiso("rutinas_all")))
            {
                var db = req.db("monitor");
                console.log(user_id);
                var sql = "SELECT rutinas.id_rutina,rutinas.evento, dispositivos.id, eventos.nombre, rutinas.numero,rutinas.texto,rutinas.activo FROM rutinas,dispositivos,eventos where dispositivos.usuario = '" + user_id + "' and dispositivos.id = rutinas.dispositivo and eventos.id = rutinas.evento"
                db.query(sql, function (err, result) {
                    if (err){
                     manejo_errores(1,err, res);
                 }
                 else
                 {
                    var sql = ("SELECT nombre FROM usuarios WHERE id='" + user_id + "' LIMIT 1;");
                    var dbUsuario = req.db();
                    dbUsuario.query(sql, function (err, resultUsuario) {
                        if (err) {
                            manejo_errores(1,err, res);
                        }
                        else
                        {
                            res.render('rutinas/lista_rutinas', {
                                user: {loged: false},
                                pagina: {titulo: "Rutinas", navbar: true},
                                permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                nombreUsuario: !misRutinas ? "Rutinas de " + resultUsuario[0].nombre : "Mis Rutinas",
                                user_id: user_id,
                                misRutinas: misRutinas,
                                rutinas_delete: usu.permiso("rutinas_delete"),
                                lista_rutinas: result
                            });
                        }
                    });
dbUsuario.end();
}
});
db.end();
}
else
{
    manejo_errores(3,err="NO TIENE PERMISOS PARA VER RUTINAS DE OTROS USUARIOS", res);
}
}
else
{
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
            var misRutinas = false;
            if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                misRutinas = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                misRutinas = false;

            }

            if ((misRutinas) || (usu.permiso("rutinas_all")))
            {

                var db1 = req.db("monitor");
                var db2 = req.db("monitor");
                var db3 = req.db("monitor");
                var sql = "SELECT * FROM rutinas WHERE id_rutina = '" + req.query.id_rutina + "' LIMIT 1";
                var id_disp = req.query.id_disp
                var id_evento = req.query.id_evento

                db1.query(sql, function (err, result1) {
                    if (err) {
                        manejo_errores(1,err, res);
                    } else {
                        sql = "select id from dispositivos where usuario  = '" + user_id + "'";
                        db2.query(sql, function (err, result2) {
                            if (err) {
                                manejo_errores(1,err, res);
                            } else {
                                sql = "select id,nombre from eventos";
                                db3.query(sql, function (err, result3) {
                                    if (err)
                                    {
                                        manejo_errores(1,err, res);
                                    } else {
                                        if (err)
                                        {
                                            manejo_errores(1,err, res);
                                        } else {
                                            if (result1.length === 0) {
                                                manejo_errores(3,err = "La Rutina no existe", res);
                                            } else {
                                                res.render('rutinas/editarrutina', {
                                                    user: {loged: false},
                                                    pagina: {titulo: "Rutinas", navbar: true},
                                                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                                    user_id: user_id,
                                                    misRutinas: misRutinas,
                                                    rut: result1[0],
                                                    disp: result2,
                                                    eventos: result3,
                                                    id_disp: id_disp,
                                                    id_evento: id_evento
                                                });
                                            }
                                        }
                                    }
                                });
db3.end();
}
});
db2.end();
}
});
db1.end();
}
else
{
    manejo_errores(1,err="NO TIENE PERMISOS PARA EDITAR RUTINAS", res);
}
}
else
{
    res.location("/usuario/identificar");
    res.redirect("/usuario/identificar");
}
});
});

router.post('/editar', function (req, res, next) {
    var misRutinas = req.body.misRutinas;
    var user_id = req.body.user_id;
    var db = req.db("monitor");
    var id_rutina = req.body.id_rutina;
    var numero = req.body.numero;
    var texto = req.body.texto;
    var evento = req.body.evento;
    var dispositivo = req.body.dispositivo;
    sql = "UPDATE rutinas SET numero='" + numero + "' ,texto='" + texto + "' ,evento='" + evento + "' ,dispositivo='" + dispositivo + "' WHERE id_rutina='" + id_rutina + " '";
    db.query(sql, function (err, result) {
        if (err) {
            manejo_errores(1,err, res);
        }
        else
        {
            if (misRutinas == "true")
            {
                res.location("/rutinas");
                res.redirect("/rutinas");
            }
            else
            {
                res.location("/rutinas?idUsuario=" + user_id);
                res.redirect("/rutinas?idUsuario=" + user_id);
            }
        }
    });
});



router.get('/agregar', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {

        if (usu.get('identificado'))
        {
            var user_id;
            var misRutinas = false;
            if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                misRutinas = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                misRutinas = false;

            }

            if ((misRutinas) || (usu.permiso("rutinas_all")))
            {
                var db2 = req.db("monitor");
                var db3 = req.db("monitor");

                sql = "select id from dispositivos where usuario  = '" + user_id + "'";
                
                db2.query(sql, function (err, result2) {
                    if (err) {
                    } else {
                        sql = "select id,nombre from eventos";
                        db3.query(sql, function (err, result3) {
                            if (err)
                            {
                            } else {
                                res.render('rutinas/agregarrutina', {
                                    user: {loged: false},
                                    pagina: {titulo: "Rutinas", navbar: true},
                                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                    misRutinas: misRutinas,
                                    user_id: user_id,
                                    disp: result2,
                                    eventos: result3
                                });
                            }
                        });
                        db3.end();
                    }
                });
db2.end();
}
else
{
    manejo_errores(1,err="NO TIENE PERMISOS PARA AGREGAR RUTINAS DE OTROS USUARIOS", res);
}
}
else
{
    res.location("/usuario/identificar");
    res.redirect("/usuario/identificar");
}
});
});

router.post('/agregar', function (req, res, next) {
    var user_id = req.body.user_id;
    var misRutinas = req.body.misRutinas;
    var numero = req.body.numeros;
    var texto = req.body.texto;
    var evento = req.body.eventos;
    var dispositivo = req.body.dispositivos;

    var activerutine = 0;
    if (req.body.rutina_activa) {
        activerutine = 1;
    }
    var db = req.db("monitor");
    sql = "INSERT INTO rutinas (numero,texto,evento,dispositivo,activo) VALUES ('" + numero + "','" + texto + "','" + evento + "','" + dispositivo + "','" + activerutine + "')";
    db.query(sql, function (err, result3) {
        if (err)
        {
            manejo_errores(1,err, res);
        }
        else
        {
         if (misRutinas == "true")
         {
            res.location("/rutinas");
            res.redirect("/rutinas");

        }
        else
        {
            res.location("/rutinas?idUsuario=" + user_id);
            res.redirect("/rutinas?idUsuario=" + user_id);
        }
    }
});
    db.end();
});

router.get('/remover', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {

        if (usu.get('identificado'))
        {
            if ((usu.permiso("rutinas_delete")))
            {
                var user_id;
                var misRutinas = false;
                if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
                {
                    user_id = req.usuario.id;
                    misRutinas = true;
                }
                else
                {
                    user_id = req.query.idUsuario;
                    misRutinas = false;
                }
                    var db = req.db("monitor");
                    var sql = "SELECT id_rutina,eventos.nombre,dispositivo FROM rutinas,eventos where eventos.id= rutinas.evento and rutinas.id_rutina = '" + req.query.id_rutina + "'";

                    db.query(sql, function (err, result) {
                        if (err) {
                            manejo_errores(1,err, res);
                        } else {
                            res.render('rutinas/remover_rutina', {
                                user: {loged: false},
                                pagina: {titulo: "Remover", navbar: true},
                                permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                misRutinas: misRutinas,
                                user_id: user_id,
                                rutina: result[0]
                            });
                        }
                    });
                    db.end();
                }
                else
                {
                    manejo_errores(3,err ="NO TIENE PERMISOS PARA REMOVER RUTINAS", res);
                }
            }
            else
            {
                res.location("/usuario/identificar");
                res.redirect("/usuario/identificar");
            }
        });
});

router.post('/remover', function (req, res, next) {

    var user_id = req.body.user_id;
    var misRutinas = req.body.misRutinas;
    var numero = req.body.numeros;
    var texto = req.body.texto;
    var evento = req.body.eventos;
    var dispositivo = req.body.dispositivos;

    var activerutine = 0;
    if (req.body.rutina_activa) {
        activerutine = 1;
    }

    var db = req.db("monitor");
    var id = req.body.id;
    var sql = "DELETE FROM rutinas WHERE id_rutina='" + id + "' LIMIT 1;";
    console.log(sql);
    db.query(sql, function (err)

    {
        if (err)
        {
            manejo_errores(1,err, res);
        }
        else
        {
            console.log("USERID");
            console.log(user_id);

            if (misRutinas == "true")
            {
                res.location("/rutinas");
                res.redirect("/rutinas");

            }
            else
            {
                res.location("/rutinas?idUsuario=" + user_id);
                res.redirect("/rutinas?idUsuario=" + user_id);
            }
        }
    });
    db.end();
});

router.get('/activar', function (req, res, next) {

    res.usuario(req.usuario.id, function (usu)
    {
        var user_id;
        var misRutinas = false;
        if ((req.query.idUsuario == req.usuario.id) || (req.query.idUsuario == null))
        {
            user_id = req.usuario.id;
            misRutinas = true;
        }
        else
        {
            user_id = req.query.idUsuario;
            misRutinas = false;
        }

        if ((misRutinas) || (usu.permiso("rutinas_edit")))
        {
            var sql;
            var db = req.db("monitor");
            var id = req.body.id;
            if (req.query.activar == 0)
            {
                sql = "UPDATE rutinas SET activo = 1 WHERE id_rutina= '" + req.query.id_rutina + "' LIMIT 1;";
            } else {
                sql = "UPDATE rutinas SET activo = 0 WHERE id_rutina= '" + req.query.id_rutina + "' LIMIT 1;";
            }
            db.query(sql, function (err) {

                if (err) {
                    manejo_errores(err, res);
                } else
                {
                    if (misRutinas == true)
                    {
                        res.location("/rutinas");
                        res.redirect("/rutinas");

                    }
                    else
                    {
                        res.location("/rutinas?idUsuario=" + user_id);
                        res.redirect("/rutinas?idUsuario=" + user_id);
                    }
                }
            });
            db.end();
        }
    });
});
