var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu) 
    {
        if (usu.get('identificado'))
        {
            if (usu.permiso("user_list"))
            {
                res.location("/usuario");
                res.redirect("/usuario");
            }
            else
            {
                var db = req.db("monitor");
                db.query("SELECT id,tipo,notas,numero FROM dispositivos WHERE usuario='" + req.usuario.id + "';", function (err, result) {
                    if (err) {
                        manejo_errores(err, res);
                    }
                    else
                    {
                        res.location("/usuario/disp");
                        res.redirect("/usuario/disp");
                    }
                });
                db.end();
            }
        }
        else 
        {
            res.location("/usuario/identificar");
            res.redirect("/usuario/identificar");
        }
    });   
});

router.get('/dispositivo', function (req, res, next) {
    res.usuario(req.usuario.id, function (usu)
    {
        if (usu.get('identificado'))
        {
            var user_id;
            var misDispositivos = false;
            if ((req.query.idUsuario == req.usuario.id)|| (req.query.idUsuario == null))
            {
                user_id = req.usuario.id;
                misDispositivos = true;
            }
            else
            {
                user_id = req.query.idUsuario;
                misDispositivos = false;

            }
            var db = req.db("monitor");
            db.query("SELECT id,tipo,notas,usuario FROM dispositivos WHERE id='" + req.query.id + "'", function (err, result) {
                if (err) {
                    console.log(err);
                        manejo_errores(1,err, res);
                    } else {
                        if (result.length === 0) {
                            manejo_errores(1,err, res);
                        } else {

                            if ((user_id == result[0].usuario)&(misDispositivos) || (usu.permiso("disp_list")))
                            {
                                console.log("user_id");
                                console.log(user_id);
                                console.log("result[0].usuario");
                                console.log(result[0]);
                                
                                res.render("sitio/dispositivo", {
                                    pagina: {titulo: "Dispositivo", navbar: true},
                                    permisosBase: {user_list: usu.permiso("user_list"), permiso: usu.permiso("permisos")},
                                    userBase: {id: req.query.idUsuario, nombre: usu.get('nombre')},
                                    dispositivo: result[0]
                                });
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
                                    //identificar: identificar,
                                    error: {texto: 'NO TIENE PERMISOS PARA VER OTROS DISPOSITIVOS'}
                                });
                            }
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

module.exports = router;
