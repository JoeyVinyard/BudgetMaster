var TESTER = document.getElementById('tester');
var x;
var plotData = new Array(4);
for(x = 0; x < plotData.length; x ++){
    plotData[x] = new Array(12);
}
var date = new Date();

function plotLineGraph(data){
    
    
}
function plotHeatMap(data){
    console.log(data);
    var week = Math.floor(date.getDay() / 7) + 1;
    var month = date.getMonth();
    for(var i = data.length; i > 0; i --){
	plotData[week-1][month-1] = data[i];
	week --;
	if(week <= 0){
	    week = 4;
	    month --;
	    if(month <= 0){
		month = 12;
	    }
	}
    }
    var graph = [
      {
	  z: plotData,
	  x: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septermpber', 'October', 'November', 'December'],
	  y: ['Week One', 'Week Two', 'Week Three', 'Week Four'],
	  type: 'heatmap'
      }
    ];
    Plotly.plot(TESTER,graph);
}

plot([1,.4,.6,.2,.9,0]);

/* Current Plotly.js version */
console.log( Plotly.BUILD );
