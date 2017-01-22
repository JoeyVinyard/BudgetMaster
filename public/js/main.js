//----------------
//Google Maps Junk
//----------------

var d3 = Plotly.d3;

var map;
var bounds;
var weeks = [];

for(var i=0;i<52;i++){
  var week = [];
  weeks.push(week);
}
var centerPoint;

function createMap(center){
	if(center === undefined){
		center = {			//Purdue University
			lat: 40.424,
    		lng: -86.929
		}
	}
	map = new google.maps.Map($(".map").get(0), {
		center,
		zoom: 12,
		styles
	});
	bounds = new google.maps.LatLngBounds();
	centerPoint = center;
}

function addMarker(location, name, priceLevel){
	var marker = new google.maps.Marker({
		position: location,
		map,
		title: name
	});
	bounds.extend(marker.position); //auto zooms to include markers
	marker.addListener("click", function(){
		new google.maps.InfoWindow({
			content: "<p>" + name + "</p><p>Price: " + Array(Math.ceil(priceLevel)+1).join("$") + "</p>"
		}).open(map, marker);
	});
	var distance = Math.floor(100 * 0.000621371 * google.maps.geometry.spherical.computeDistanceBetween (centerPoint, location)) / 100; //in 1.00 miles
}

var purchases = [];
var days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function sortDates(data){
  var index = Math.floor((new Date() - new Date(data.purchase_date))/604800000)
  weeks[index].push(data);
  weeks[index].sort(function(a,b){
    if(new Date(a.purchase_date)<new Date(b.purchase_date))
      return 1;
    else
      return -1;
  });
  console.log("updating");
  $(".purchase-list").empty();
  weeks.forEach(function(week){
    week.forEach(function(p){
      var date = new Date(p.purchase_date);
      var out = "";
      out+=days[date.getDay()]+", "+months[date.getMonth()]+" ";
      var dayNum = date.getDate().toString();
      dayNum = dayNum.substring(dayNum.length-1);
      var suff;
      if(date.getDate()>10&&date.getDate()<15){
        suff = "th";
      }else if(dayNum == "1"){
        suff = "st";
      }else if(dayNum == "2"){
        suff = "nd";
      }else if(dayNum == "3"){
        suff = "rd";
      }else{
        suff = "th";
      }
      out+=date.getDate()+suff+" "+date.getFullYear();
      createPurchase(p.merchant_name,out,"$"+(Math.floor(p.amount_spent*100)/100));
    });
  });
}
var allData = [];
$(document).ready(function() {
    var socket = io("http://localhost:3000");

    socket.emit("loadData", { custId: localStorage.customerId });
    socket.on("receiveData", function(data) {
        allData.push(data);
    });
    
    socket.on("create-map", function(loc) {
        createMap(loc);
    });

//     socket.on("add-marker", function(marker) {
//         addMarker(marker.location, marker.name, marker.price);
//     });
	initializePlotlyElements();

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
	plotHeatMap(forAndrew);
});
var purchaseList = $("<div>").addClass("purchase-list");
function createPurchase(name, date, amountDollars) {
    var purchase = $("<div>").addClass("purchase");
    var metadata = $("<div>").addClass("meta-data").appendTo(purchase);
    var amount = $("<div>").addClass("amount").appendTo(purchase);

    $("<h1>").text(name).addClass("name").appendTo(metadata);
    $("<h2>").text(date).addClass("date").appendTo(metadata);

    $("<p>").text(amountDollars).appendTo(amount);

    $(".purchase-list").append(purchase);
}

//this is night mode for google maps

var styles = [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]

//----------------
//  Plotly Junk
//----------------

var HEATMAP;
var THISWEEK;
var LASTWEEK;
var AVGWEEK;

function initializePlotlyElements(){
	HEATMAP = $(".heatmap-container").get(0);
	console.log(HEATMAP);
	// THISWEEK = $("thisweek").get(0);
	// LASTWEEK = $("lastweek").get(0);
	// AVGWEEK = $("avgweek").get(0);
}


var x;
var plotData = new Array(4);
for(x = 0; x < plotData.length; x++){
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


    Plotly.newPlot(BARGRAPH, data);
    
    var scale = [0];
    for(var i = 0; i < 10; i ++){
	
    }	    
}

function plotHeatMap(data){

    data.forEach(function(p){
        var timeStamp = p.purchase_date;
        var time = timeStamp.split('-');
        plotData[Math.floor(time[2]/7)][time[1]-1] = p.amount_spent;
    });
    console.log(plotData);

    var graph = [
      {
	  z: plotData,
	  x: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
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
    Plotly.plot(HEATMAP,graph);
}

//console.log( Plotly.BUILD );
