//----------------
//Google Maps Junk
//----------------

var d3 = Plotly.d3;

var map;
var bounds;
var weeks = [];

var canvas;
var ctx;

for(var i=0;i<=52;i++){
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
  data.forEach(function(d){
    var index = Math.floor((new Date() - new Date(d.purchase_date))/604800000)
    weeks[index].push(d);
    weeks[index].sort(function(a,b){
      if(new Date(a.purchase_date)<new Date(b.purchase_date))
        return 1;
      else
        return -1;
    });
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

    canvas = document.getElementById("canv");
    $("#canv").attr("width",$(".heatmap-container").width());
    $("#canv").attr("height",$("#heatmapcont").height()-100);
    ctx = canvas.getContext("2d");

    var done = false;
    socket.on("endData", function() {
      if(done)
        return;
      done=true;
      console.log("blah");
      sortDates(allData);
      drawHeatMap();
    });
    var offset = $("#canv").parent().offset();
    $("#canv").mousemove(function(event){
      var index=(Math.floor((event.pageX-offset.left)/120)+13*(Math.floor((event.pageY-offset.top+20)/60)-1));
      if(index<0)
        index=0;
      else if(index>52)
        index=52;
      ctx.fillStyle="black";
      var d = new Date(new Date()-index*7*24*60*60*1000);
      $("#heatmapLabel").text("Week of: " + months[d.getMonth()] + " " + d.getDate() + " | " + getWeekTot(weeks[index]),10,420);
    });

//     socket.on("add-marker", function(marker) {
//         addMarker(marker.location, marker.name, marker.price);
//     });

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
	//plotLineGraph(forAndrew, $(".heatmap-container").get(0));
});
function getWeekTot(week){
  var tot = 0;
  week.forEach(function(d){tot+=d.amount_spent});
  return Math.floor(tot*100)/100;
}
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

function drawHeatMap(){
  var min = 1000000000;
  var max = 0;
  var avg = 0;
  var count = 0;
  weeks.forEach(function(w){
    var weekAm = 0;
    w.forEach(function(d){
      var am = d.amount_spent;
      weekAm+=am;
      avg+=am;
      count++;
    });
    if(weekAm<min)
        min=weekAm;
    else if(weekAm>max)
      max=weekAm;
  });
  avg/=(count/weeks.length);
    weeks.forEach(function(w,c){
      var red = (getWeekTot(w)/max)*255;
      var green = 255-red;
      var rgb = "rgb("+Math.floor(red)+","+Math.floor(green)+",0)"
      ctx.fillStyle = rgb;
      if(c<52)
        ctx.fillRect((c%13)*120,40+(Math.floor((c)/13))*60,105,50);
  });
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
function plotLineGraph(data, container){
    var amountsSpent = data.map(function(datum){
		return parseInt(datum.amount_spent);
    });
    var dates = data.map(function(datum){
    	return new Date(datum.purchase_date);
    });

    var purchasesTrace = [{
    	x: dates,
    	y: amountsSpent,
    	type: "scatter"
    }];

    Plotly.newPlot(container, purchasesTrace);
}