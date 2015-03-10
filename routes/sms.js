var express = require('express');
var router = express.Router();

router.get('/NOP', function (req, res, next) {
    res.send("OK");
});
router.get('/NEW', function (req, res, next) {
    var db = req.db("monitor");
    db.query("INSERT INTO sms (hora,texto) VALUES(NOW(),'" + req.query.data + "');", function (err, result) {
        if (err) {
            manejo_errores(1,err, res);
        } else {
            res.send("OK");
        }
    });
    db.end();
  
    var partes = req.query.data.split('-');
    if (partes.length === 4) {
        var dbRegistro = req.db("monitor");
        dbRegistro.query("INSERT INTO registro (dispositivo,evento,hora) VALUES ('" + partes[0] + "','" + partes[1] + "',FROM_UNIXTIME('" + partes[2] + "'));", function (err, result) {
            if (err) {
                manejo_errores(1,err, res);
            } else {
                var dbRutinas = req.db("monitor");
		var date = new Date((parseInt(partes[2])+21600)*1000);
                var diaHora = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
                dbRutinas.query("SELECT numero,texto FROM rutinas WHERE dispositivo='" + partes[0] + "' AND evento='" + partes[1] + "'", function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        for (var i = 0; i < result.length; ++i) {
                            var numeros = result[i].numero.split(",");
			    var mensaje = result[i].texto.replace("%d",partes[0]).replace("%h",diaHora);
                            for (var j = 0; j < numeros.length; ++j) {
                                res.TODO.push(numeros[j]+"-" + mensaje);
                            }
                        }
                    }
                });
                dbRutinas.end();
            }
        });
        dbRegistro.end();
    }
});
router.get("/ADD", function (req, res, next) {
    res.TODO.push(req.query.data);
    res.send("OK");
});
router.get('/TODO', function (req, res, next) {
    var doing = "OK";
    if (res.TODO.length > 0) {
        doing = res.TODO[0];
    }
    res.send(doing);
});
router.get('/TODO/OK', function (req, res, next) {
    if (res.TODO.length > 0) {
        res.TODO.shift();
    }
    res.send("OK");
});

module.exports = router;
