
var TESTER = document.getElementById('tester');
var x;
var plotData = new Array(4);
for(x = 0; x < plotData.length; x ++){
    plotData[x] = new Array(12);
}
var date = new Date();

function plotLineGraph(data){


}

function plotBarGraph(data){
    var spending = data.map(function(o){
	return o.amount_spent;
    });
    var present_day = date.getDay();
    var sum = 0;
    var max = 0;
    var min = 10000000;
    var lastWeeklySum = 0;
    var weeklySum = 0;
    for(var i = 0; i < data.length; i ++){
	var transaction_day = purchase_date.substring(lastIndexOf("-"));
	if(present_day - transaction_day < 7){
	    weeklySum += data.amount_spent;
	}else if(present_day - transaction_day < 14){
	    lastWeeklySum  += data.amount_spent;
	}
	sum += data.amount_spent;
    }
    var total_weekly_average = sum/12;

    var data = [{
	type: 'bar',
	x: [weeklySum, lastWeeklySum, total_weekly_average],
	y: ['This Weeks Average', 'Last Week Average', 'Average of The Weekly Averages'],
	orientation: 'h'
    }];

    Plotly.newPlot('myDiv', data);

   


}/*
function plotHeatMap(data){

    data.foreach(function(p){
	var timeStamp = p.purchase_date;
	var time = timeStamp.split('-');
	plotData[Math.floor(time[2]/6)][time[1]] = p.amount_spent;
    });
nnnn*/
