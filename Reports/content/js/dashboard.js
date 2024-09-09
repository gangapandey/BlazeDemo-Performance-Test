/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 75.0, "KoPercent": 25.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5961538461538461, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8, 500, 1500, "https://blazedemo.com/purchase.php"], "isController": false}, {"data": [0.95, 500, 1500, "https://blazedemo.com/"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.95, 500, 1500, "https://blazedemo.com/confirmation.php"], "isController": false}, {"data": [0.0, 500, 1500, "https://blazedemo.com/reserve.php"], "isController": false}, {"data": [0.75, 500, 1500, "https://blazedemo.com/index.php"], "isController": false}, {"data": [0.55, 500, 1500, "https://blazedemo.com/register"], "isController": false}, {"data": [0.6625, 500, 1500, "https://blazedemo.com/login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 120, 30, 25.0, 579.2166666666668, 410, 1784, 482.5, 846.2000000000002, 1380.0499999999986, 1782.74, 1.1238901584685124, 5.838594739257483, 1.4208503282695837], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://blazedemo.com/purchase.php", 10, 0, 0.0, 489.09999999999997, 464, 518, 484.5, 517.4, 518.0, 518.0, 18.975332068311193, 124.46261266603415, 18.64178130929791], "isController": false}, {"data": ["https://blazedemo.com/", 10, 0, 0.0, 441.2, 410, 524, 425.5, 517.6, 524.0, 524.0, 4.657661853749418, 21.640843327899397, 7.061997845831393], "isController": false}, {"data": ["Test", 10, 10, 100.0, 6950.6, 6560, 7537, 7004.5, 7507.3, 7537.0, 7537.0, 1.2559658377292138, 78.29671407937704, 19.053884859331827], "isController": true}, {"data": ["https://blazedemo.com/confirmation.php", 10, 0, 0.0, 457.9, 420, 575, 450.0, 563.9000000000001, 575.0, 575.0, 5.934718100890208, 33.50797477744807, 6.45052856083086], "isController": false}, {"data": ["https://blazedemo.com/reserve.php", 10, 10, 100.0, 1426.2, 993, 1784, 1431.0, 1783.4, 1784.0, 1784.0, 5.537098560354375, 39.703808485603545, 5.174807931893688], "isController": false}, {"data": ["https://blazedemo.com/index.php", 10, 0, 0.0, 485.6, 429, 616, 479.0, 606.5, 616.0, 616.0, 6.064281382656155, 28.17403540024257, 5.06936021831413], "isController": false}, {"data": ["https://blazedemo.com/register", 30, 10, 33.333333333333336, 579.5000000000001, 439, 1060, 509.5, 818.9000000000001, 943.9499999999998, 1060.0, 1.0918619886446352, 5.321263329815111, 1.6436930184524676], "isController": false}, {"data": ["https://blazedemo.com/login", 40, 10, 25.0, 478.025, 412, 609, 466.5, 541.9, 580.4999999999999, 609.0, 0.6691536878732622, 3.1870404796159058, 0.886367248272747], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,784 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,267 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,386 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["419/Internal Server Error", 20, 66.66666666666667, 16.666666666666668], "isController": false}, {"data": ["The operation lasted too long: It took 1,476 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,195 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,588 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,778 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,670 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 993 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}, {"data": ["The operation lasted too long: It took 1,125 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, 3.3333333333333335, 0.8333333333333334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 120, 30, "419/Internal Server Error", 20, "The operation lasted too long: It took 1,784 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,267 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,386 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,476 milliseconds, but should not have lasted longer than 900 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://blazedemo.com/reserve.php", 10, 10, "The operation lasted too long: It took 1,784 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,267 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,386 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,476 milliseconds, but should not have lasted longer than 900 milliseconds.", 1, "The operation lasted too long: It took 1,195 milliseconds, but should not have lasted longer than 900 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["https://blazedemo.com/register", 30, 10, "419/Internal Server Error", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["https://blazedemo.com/login", 40, 10, "419/Internal Server Error", 10, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
