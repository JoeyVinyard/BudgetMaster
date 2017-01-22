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
var count = 0;

function sortDates(data){
  count++;
  var index = Math.floor((new Date() - new Date(data.purchase_date))/604800000)
  weeks[index].push(data);
  weeks[index].sort(function(a,b){
    if(new Date(a.purchase_date)<new Date(b.purchase_date))
      return 1;
    else
      return -1;
  });
  if(!count%100)
    return;
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

$(document).ready(function() {
    var socket = io("http://localhost:3000");

    socket.emit("loadData", { custId: localStorage.customerId });
    socket.on("receiveData", function(data) {
        sortDates(data);
    });
    
    socket.on("create-map", function(loc) {
        createMap(loc);
    });

    socket.on("endData", function() {

    });

//     socket.on("add-marker", function(marker) {
//         addMarker(marker.location, marker.name, marker.price);
//     });
	initializePlotlyElements();
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

function plotHeatMap(data){

}

//console.log( Plotly.BUILD );
