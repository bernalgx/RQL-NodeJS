var express = require('express');
//var chalk = require('chalk');
var router = express.Router();
var tipoDispositivo = ["Bomba", "Tanque"];
module.exports = router;
var caracteres = [
"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
"a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
"k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
"u", "v", "w", "x", "y", "z"];
var caracteres_lenght = 35;
function idSiguiente(id_actual) {
    var acabo = false;
    for (indice = 3; indice >= 0 && !acabo; indice--) {
        var cha = id_actual[indice];
        i = caracteres.indexOf(cha);
        if (i >= caracteres_lenght) {
            cha = caracteres[0];
        } else {
            cha = caracteres[i + 1];
            acabo = true;
        }
        id_actual = id_actual.substr(0, indice) + cha + id_actual.substr(indice + 1);
    }
    return id_actual;
}

router.get('/agregar', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) {
        if (usu.get('identificado'))
        { 
            if (usu.permiso("disp_create"))
            {
                var user_id;
                var miDispositivo = false;
                if ((req.query.idUsuario == req.usuario.id)|| (req.query.idUsuario == null))
                {
                    user_id = req.usuario.id;
                    miDispositivo = true;
                }
                else
                {
                    user_id = req.query.idUsuario;
                    miDispositivo = false;
                }

                var db = req.db();
                db.query("SELECT id,nombre FROM  usuarios", function (err, result) {
                    if (err) {
                        manejo_errores(1,err, res);
                    } else {
                        res.render('disp/agregar', {
                            pagina: {titulo: "Nuevo Dispositivo", navbar: true},
                            permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                            userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                            miDispositivo: miDispositivo,
                            lista: result,
                            idUsuario: req.query.idUsuario,
                            tipos: tipoDispositivo,
                            usuario: req.query.usuario ? req.query.usuario : false
                        });
                    }
                });
                db.end();
            }
            else {
                manejo_errores(3,err = "NO TIENE PERMISOS PARA AGREGAR DISPOSITIVOS", res);
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
    var miDispositivo = req.body.miDispositivo;
    var disp = req.body.dispositivo;
    var tipo = req.body.tipo;
    var notas = req.body.notas;
    var numero = req.body.numero;
    var usuario = req.body.usuario;
    var disp_id;
    var db = req.db();
    var db2 = req.db();


    sql = "select max(id) from bernal_monitor.dispositivos;";
    db.query(sql, function (err, result_max_id) {
        if (err) {
            manejo_errores(1,err, res);
        } else {

            disp_id = result_max_id[0] ["max(id)"];
            disp_id = idSiguiente(disp_id);
            sql = "insert into bernal_monitor.dispositivos (id,usuario,tipo,notas,numero) values ('" + disp_id + "','" + usuario + "',\n\
                '" + tipo + "','" + notas + "','" + numero + "');";
    db2.query(sql, function (err, result) {
        if (err)
        {
            manejo_errores(1,err, res);
        }
        else
        {
            if (miDispositivo == "true")
            {
                res.location("/usuario/disp");
                res.redirect("/usuario/disp");
            }
            else
            {
                res.location("/usuario/disp?idUsuario=" + usuario);
                res.redirect("/usuario/disp?idUsuario=" + usuario);
            }
        }
    });
}
});
});

router.get('/editar', function (req, res, next) { /////////////////////disp

    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("disp_create"))
            {
                var user_id;
                var miDispositivo = false;
                if ((req.query.idUsuario == req.usuario.id)|| (req.query.idUsuario == null))
                {
                    user_id = req.usuario.id;
                    miDispositivo = true;
                }
                else
                {
                    user_id = req.query.idUsuario;
                    miDispositivo = false;

                }

                var db = req.db("monitor");
                var sql = "SELECT id,usuario,tipo,notas,numero FROM dispositivos WHERE id= '" + req.query.id + "' LIMIT 1";
                db.query(sql, function (err, result_disp) {
                    if (err)
                    {                        manejo_errores(1,err,res);
                    } else {
                        if (result_disp.length === 0) {
                         manejo_errores(1,err, res);
                     } else {
                        var dbUsuarios = req.db();
                        dbUsuarios.query("SELECT id,nombre FROM usuarios  ", function (err, result_usuarios) {
                            if (err)
                            {

                            }
                            else {

                                res.render('disp/editar', {
                                    user: {loged: false},
                                    pagina: {titulo: "Dispositivos", navbar: true},
                                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                    userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                    miDispositivo: miDispositivo,
                                    dispositivos: result_disp[0],
                                    tipos: tipoDispositivo,
                                    idUsuario: req.query.idUsuario,
                                    lista: result_usuarios
                                });
                            }
                        });
dbUsuarios.end();
}
}
});
db.end();
}
else
{
    manejo_errores(3,err = "NO TIENE PERMISOS PARA EDITAR DISPOSITIVOS", res);
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
    var miDispositivo = req.body.miDispositivo;
    var id = req.body.dispositivoID;
    var usuario = req.body.usuario;
    var tipo = req.body.tipo;
    var notas = req.body.notas;
    var numero = req.body.numero;
    var sql = "UPDATE dispositivos SET usuario = '" + usuario + "', tipo= '" + tipo + "', notas= '" + notas + "', numero= '" + numero + "' WHERE id= '" + id + "' LIMIT 1; ";
    var db = req.db("monitor");
    db.query(sql, function (err, result) {
        if (err) {
            manejo_errores(1,err,res);
        } else {

            if (miDispositivo == "true")
            {
                res.location("/usuario/disp");
                res.redirect("/usuario/disp");
            }
            else
            {
                res.location("/usuario/disp?idUsuario=" + usuario);
                res.redirect("/usuario/disp?idUsuario=" + usuario);
            }
        }
    });
    db.end();
});


router.get('/remover', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
         if (usu.permiso("disp_delete"))
         {
            var user_id;
            var miDispositivo = false;
            if ((req.query.idUsuario == req.usuario.id)|| (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                miDispositivo = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                miDispositivo = false;
            }
            var db = req.db("monitor");
            db.query("SELECT id,usuario,tipo,notas FROM dispositivos WHERE id='" + req.query.id + "'", function (err, result) {
                if (err) {
                    manejo_errores(1,err, res);
                }
                else
                {
                    var dbUsuario = req.db();
                    dbUsuario.query("SELECT nombre FROM usuarios WHERE id='" + user_id + "'", function (err, resultUsuario) {
                        if (err) {
                            manejo_errores(1,err, res);
                        }
                        else
                        {
                            res.render('disp/remover', {
                                user: {loged: false},
                                pagina: {titulo: "Remover", navbar: true},
                                permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                nombreUsuario: resultUsuario[0].nombre,
                                miDispositivo: miDispositivo,
                                disp: result[0]
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
    manejo_errores(3,err = "NO TIENE PERMISOS PARA REMOVER DISPOSITIVOS", res);
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
    miDispositivo = req.body.miDispositivo;
    var id = req.body.id;
    var usuario = req.body.usuario;
    var retVal = 1;
    if (id.length > 0) {
        retVal = 2;
        var db = req.db("monitor");
        db.query("DELETE FROM dispositivos WHERE id='" + id + "' LIMIT 1;", function (err) {
            if (err) {
                manejo_errores(1,err, res);
            } else
            {
                if (miDispositivo == "true")
                {
                    res.location("/usuario/disp");
                    res.redirect("/usuario/disp");
                }
                else
                {
                    res.location("/usuario/disp?idUsuario=" + usuario);
                    res.redirect("/usuario/disp?idUsuario=" + usuario);
                }
            }
        });
        db.end();
    } else {
        res.send({id: id, retVal: retVal});
    }
});