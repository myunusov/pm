"use strict";

function ChartBuilder(qnm) {

    var pointsNumber = calcPointsNumber();

    this.buildMaxXChart = function () {
        var result = chartTempate();
        result.title.text = 'Maximum Throughput';
        result.subtitle.text = 'X(N)';
        result.yAxis.title.text = 'X (tps)';
        result.tooltip.valueSuffix = 'tps';
        result.series = calcChartSeries("calcMaxX");
        return result;
    };

    this.buildMinRChart = function () {
        var result = chartTempate();
        result.title.text = 'Minimum Response Time';
        result.subtitle.text = 'R(N)';
        result.yAxis.title.text = 'R (sec)';
        result.tooltip.valueSuffix = 'sec';
        result.series = calcChartSeries("calcMinR");
        return result;
    };

    function chartTempate() {
        return {
            title: {
                x: -20 //center
            },
            subtitle: {
                x: -20
            },
            xAxis: {
                categories: calcCategories()
            },
            yAxis: {
                title: {},
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {},
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            }
        };
    }

    function calcPointsNumber() {
        var sum = 0;
        for (var i = 0; i < qnm.nodes.length; i++) {
            var n = qnm.nodes[i];
            sum += parseFloat(n.nodeNumber.value);
        }
        return sum > 8 ? sum + 2 : 10;
    }

    function calcCategories() {
        var result = [];
        for (var i = 0; i < pointsNumber; i++) {
            result.push(i + 1);
        }
        return result;
    }

    function calcChartSeries(method) {
        var result = [];
        var classes = qnm.classes;
        for (var i = 0; i < classes.length; i++) {
            result.push({
                name: classes[i].title(),
                data: calcDataFor(classes[i], method)
            });
        }
        return result;
    }

    function calcDataFor (clazz, method) {
        var result = [];
        var visits = qnm.getVisitsByClass(clazz);
        var calculator = new BoundsCalculator(visits);
        if (calculator.isValid) {
            for (var i = 0; i < pointsNumber; i++) {
                var item = calculator[method](i + 1);
                result.push(parseFloat(item.toPrecision(5)));
            }
        }
        return result;
    }

}

function BoundsCalculator(visits) {

    var demands = collectDemands();
    var maxDemand = maxServiceDemand();
    var sumDemand = sumServiceDemand();

    this.isValid = maxDemand && sumDemand;

    this.calcMaxX = function(tn) {
        var result1 = 1 / maxDemand;
        var result2 = tn / sumDemand;
        return result1 < result2 ? result1 : result2;
    };

    this.calcMinR = function(tn) {
        var result1 = tn * maxDemand;
        var result2 = sumDemand;
        return result1 > result2 ? result1 : result2;
    };

    function collectDemands() {
        var result = [];
        for (var i = 0; i < visits.length; i++) {
            var d = visits[i].totalServiceDemands();
            if (d && number(d)) {
                result.push(d);
            }
        }
        return result;
    }

    function sumServiceDemand() {
        var result = 0;
        for (var i = 0; i < demands.length; i++) {
            result += demands[i];
        }
        return result;
    }

    function maxServiceDemand() {
        var result = 0;
        for (var i = 0; i < demands.length; i++) {
            if (demands[i] > result) {
                result = demands[i];
            }
        }
        return result;
    }

}