var TESTER = document.getElementById('tester');

var trace1 = {
    x: [1, 2],
    y: [new Date(), new Date(2016, 12,12,0,0,0,0)
    type: 'scatter',
    text: ["Week1"]
    
};
var data = [trace1];

Plotly.newPlot('TESTER', data);
