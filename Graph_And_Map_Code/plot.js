var TESTER = document.getElementById('tester');
function plotLineGraph(data, container){
    var hover_text = [];
    for(var i = 0; i < data.length; i ++){
	hover_text[i] = "$" + data[i].amount_spent;
	
    }
    var amountsSpent = data.map(function(datum){
		return parseInt(datum.amount_spent);
    });
    var dates = data.map(function(datum){
    	return new Date(datum.purchase_date);
    });
    console.log(hover_text);
    
    var purchasesTrace = [{
    	x: dates,
    	y: amountsSpent,
	text: hover_text,
	hoverinfo: "text",
	//showticklabels: false,
    	type: "scatter"
    }];
    var layout = {
	title: "THIS GRAPH SHOWS YOU'RE SPENDING TOO MUCH MONEY",
	xaxis: {
	    title: 'x Axis',
	    titlefont: {
		family:'Courier New, monospace',
		size: 18,
		color: '#7f7f7f',
	    }
	},
	yaxis: {
	    title: 'y Axis',
	    titlefont: {
		family: 'Courier New, monospace',
		size: 18,
		color: '#7f7f7f'
	    }
	}
    };

    Plotly.newPlot('TESTER', purchasesTrace);
}
var forAndrew = [{
    amount_spent: "1.02",
    purchase_date: "2016-12-12",
},
		 {
		     amount_spent: "102",
		     purchase_date: "2016-12-16",
		 },
		 {
		     amount_spent: "13.85",
		     purchase_date: "2017-01-12",
		 },
		];
plotLineGraph(forAndrew, "").get(0);
