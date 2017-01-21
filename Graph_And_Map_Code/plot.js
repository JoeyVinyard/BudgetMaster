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

    data.foreach(function(p){
	var timeStamp = p.purchase_date;
	var time = timeStamp.split('-');
	plotData[Math.floor(time[2]/6)][time[1] = p.amount_spent;
    }

/*
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
    }*/
    var graph = [
      {
	  z: plotData,
	  x: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septermpber', 'October', 'November', 'December'],
	  y: ['Week One', 'Week Two', 'Week Three', 'Week Four'],
	  colorscale: [
	      ['0.0', 'rgb(240,240,240)'],
	      ['0.111111111111', 'rgb(150,255,150)'],
	      ['0.222222222222', 'rgb(0,255,0)'],
	      ['0.333333333333', 'rgb(140,255,0)'],
	      ['0.444444444444', 'rgb(200,255,0)'],
	      ['0.555555555556', 'rgb(255,255,0)'],
	      ['0.666666666667', 'rgb(255,200,0)'],
	      ['0.777777777778', 'rgb(255,150,0)'],
	      ['0.888888888889', 'rgb(255,75,0)'],
	      ['1.0', 'rgb(255,0,0)']
	        ],
	  type: 'heatmap',
	  xgap: 5,
	  ygap: 5
      }
    ];
    Plotly.plot(TESTER,graph);
}

plotHeatMap([1,.4,.6,.2,.9,0]);

/* Current Plotly.js version */
console.log( Plotly.BUILD );
