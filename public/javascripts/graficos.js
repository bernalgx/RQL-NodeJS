function graficoBarras(id, titulo, entradas, data) {
    $(id).highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: titulo
        },
        xAxis: {
            categories: entradas
        },
        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: 'Notificaciones'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:1f} </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: data
    });
}

function graficoLinear(id, titulo, tipo, entradas, data) {
    $(id).highcharts({
        title: {
            text: titulo,
            x: -20 //center
        },
        xAxis: {
            categories: entradas
        },
        yAxis: {
            title: {
                text: tipo
            },
            plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }],
            min: 0
        },
        tooltip: {
            valueSuffix: 'h'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: data
    });
}
