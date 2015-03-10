var express = require('express');
//var chalk = require('chalk');
var router = express.Router();

router.get('/', function (req, res, next) {

    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("permisos"))
            {
                var db = req.db();
                db.query("SELECT id,sys_nombre,nombre,notas FROM permisos", function (err, result) {
                    if (err) {
                        manejo_errores(1, err, res);
                    } else {
                        res.render('permisos/lista', {
                            user: {loged: false},
                            pagina: {titulo: "Permisos", navbar: true},
                            permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                            userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                            lista: result
                        });
                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(1, err = "NO ESTA AUTORIZADO PARA ACCEDER A PERMISOS", res);
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

    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("permisos"))
            {
                var db = req.db();
                db.query("SELECT id,sys_nombre,nombre,notas FROM permisos WHERE id='" + req.query.id + "' LIMIT 1", function (err, result) {
                    if (err) {
                        manejo_errores(1, err, res);
                    } else {
                        if (result.length === 0) {
                            manejo_errores(err, res);
                        } else {
                            res.render('permisos/form', {
                                user: {loged: false},
                                pagina: {titulo: "Permisos", navbar: true},
                                permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                permiso: result[0]
                            });
                        }
                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(1, err = "NO ESTA AUTORIZADO PARA EDITAR PERMISOS", res);
            }
        }
        else
        {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });

});

router.get('/agregar', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("permisos"))
            {
                {
                    res.render('permisos/form', {
                        user: {loged: false},
                        pagina: {titulo: "Permisos", navbar: true},
                        permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                        userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                        permiso: {id: "null", nombre: '', notas: '', sys_nombre: ''}
                    });
                }
            }
            else
            {
                manejo_errores(3, err = "NO ESTA AUTORIZADO PARA AGREGAR PERMISOS", res);
            }
        }
        else
        {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

router.get('/remover', function (req, res, next) {

    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("disp_create"))
            {
                var db = req.db();
                db.query("SELECT id,nombre,notas FROM permisos WHERE id='" + req.query.id + "' LIMIT 1", function (err, result) {
                    if (err) {
                        manejo_errores(err, res);
                    } else {
                        if (result.length === 0) {
                            manejo_errores(err, res);
                        } else {
                            res.render('permisos/remover', {
                                user: {loged: false},
                                pagina: {titulo: "Permisos", navbar: true},
                                permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                userBase: {id: req.usuario.id, nombre: usu.get('nombre')},
                                permiso: result[0]
                            });
                        }
                    }
                });
                db.end();
            }
            else
            {
                manejo_errores(3, err = "NO ESTA AUTORIZADO PARA REMOVER PERMISOS", res);
            }
        }
        else
        {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });
});

router.post('/guardar', function (req, res, next) {
    var id = req.body.id;
    var sys_nombre = req.body.sys_nombre;
    var nombre = req.body.nombre;
    var notas = req.body.notas;
    var retVal = 1;
    if (nombre.length > 0) {
        retVal = 2;
        var sql;
        if (id === "null") {
            sql = "INSERT INTO permisos (sys_nombre,nombre,notas) VALUES ('" + sys_nombre + "','" + nombre + "','" + notas + "');";
        } else {
            sql = "UPDATE permisos SET sys_nombre = '" + sys_nombre + "', nombre = '" + nombre + "', notas='" + notas + "' WHERE id='" + id + "' LIMIT 1;";
        }
        var db = req.db();
        db.query(sql, function (err) {
            if (err) {
                manejo_errores(err, res);
            } else {
                retVal = 0;
            }
            res.location("/permisos");
            res.redirect("/permisos");
        });
        db.end();
    } else {
        manejo_errores(1, err, res);
    }
});

router.post('/remover', function (req, res, next) {
    var id = req.body.id;
    var retVal = 1;
    if (id.length > 0) {
        retVal = 2;
        var db = req.db();
        db.query("DELETE FROM permisos WHERE id='" + id + "' LIMIT 1;", function (err) {
            if (err)
            {
                manejo_errores(1, err, res);
            }
            else
            {
                res.location("/permisos");
                res.redirect("/permisos");
                retVal = 0;
            }
        });
        db.end();
    } else {
        manejo_errores(1, err, res);
    }
});

module.exports = router;