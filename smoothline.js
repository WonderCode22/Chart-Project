var chartData = [];
var wchartData = [];
var mchartData = [];
generateChartData();

function generateChartData() {
    var firstDate = new Date(2016,7,20);
    for (var i = 0; i < 56; i++) {
        var newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i);

        var a = Math.round(Math.random() * (40 + i)) + 100 + i;

        chartData.push({
            year: newDate,
            value: a % 14 - 7
        });
    }
    var newDate;
    var value = 0;
    for (var i=0; i<56; i++) {
        value = value + chartData[i].value;
        if(chartData[i].year.getDay() == 1)
        {
            if(i>5)
            {
                newDate = chartData[i-6].year;
            }
            else
            {
                newDate = chartData[0].year;
            }
            wchartData.push({
                year: newDate,
                value: value
            });
            value = 0;
        }
        else
        {
            if(i == 55)
            {
                newDate = chartData[i-chartData[i].year.getDay()+1].year;
                wchartData.push({
                    year: newDate,
                    value: value
                });
            }
        }
    }
    newDate = chartData[0].year;
    value = 0;
    for (var i=0; i<56; i++) {
        
        var date = chartData[i].year;
        var y = date.getFullYear();
        var  m = date.getMonth();
        var lastDay = new Date(y, m+1, 0);
        value = value + chartData[i].value;
        if(chartData[i].year.getDate() == lastDay.getDate())
        {
            
            mchartData.push({
                year: newDate,
                value: value
            });
            value = 0;
            newDate = chartData[i+1].year;
        }
    }
}


var chart = AmCharts.makeChart("chartdiv", {
    "type": "serial",
    "theme": "light",
    "marginTop": 0,
    "marginRight": 80,
    "dataProvider": chartData,
    "valueAxes": [{
        "axisAlpha": 0,
        "position": "left",
        "includeAllValues": true,
    }],
    "graphs": [{
        "id": "g1",
        "balloonText": "[[category]]<br><b><span style='font-size:14px;'>[[value]]</span></b>",
        "bullet": "round",
        "bulletSize": 8,
        "lineColor": "#d1655d",
        "lineThickness": 2,
        "negativeLineColor": "#637bb6",
        "type": "smoothedLine",
        "valueField": "value"
    }],
    "valueScrollbar": {
        "autoGridCount": true,
        "color": "#000000",
        "scrollbarHeight": 50,

    },
    "chartScrollbar": {
        "graph": "g1",
        "gridAlpha": 0,
        "color": "#888888",
        "scrollbarHeight": 55,
        "backgroundAlpha": 0,
        "selectedBackgroundAlpha": 0.1,
        "selectedBackgroundColor": "#888888",
        "graphFillAlpha": 0,
        "autoGridCount": true,
        "selectedGraphFillAlpha": 0,
        "graphLineAlpha": 0.2,
        "graphLineColor": "#c2c2c2",
        "selectedGraphLineColor": "#888888",
        "selectedGraphLineAlpha": 1

    },
    "chartCursor": {
        "categoryBalloonDateFormat": "YYYY",
        "cursorAlpha": 0,
        "valueLineEnabled": true,
        "valueLineBalloonEnabled": true,
        "valueLineAlpha": 0.5,
        "fullWidth": true
    },
    "dataDateFormat": "YYYY-MM-DD",
    "categoryField": "year",
    "categoryAxis": {
        "minPeriod": "DD",
        "parseDates": true,
        "minorGridAlpha": 0.1,
        "minorGridEnabled": true
    },

    "panelSettings": {
        "mouseWheelZoomEnabled": true,
        "userPrefixes": true
    }
});

chart.addListener("rendered", zoomChart);
if (chart.zoomChart) {
    chart.zoomChart();
}

function zoomChart() {
    chart.zoomToIndexes(Math.round(chart.dataProvider.length * 0.4), Math.round(chart.dataProvider.length * 0.55));
}
function setDataSet(data_name) {
    var data;
    var min_value;
    switch (data_name){
        case 'daychart':
            data = chartData;
            min_value = "DD"
            break;
        case 'weekchart':
            data = wchartData;
            min_value = "WW"
            break;
        case 'monthchart':
            data = mchartData;
            min_value = "MM"
            break;
    }
    chart.dataProvider = data;
    chart.categoryAxis.minPeriod = min_value;
    chart.validateData();
}