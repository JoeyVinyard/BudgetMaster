//----------------
//Google Maps Junk
//----------------

var map;
var bounds;
var weeks = [];

for(var i=0;i<52;i++){
  var week = [];
  weeks.push(week);
}

function createMap(center){
	if(center === undefined){
		center = {			//Purdue University
			lat: 40.424,
    		lng: -86.929
		}
	}
    console.log($(".map"));
	map = new google.maps.Map($(".map").get(0), {
		center,
		zoom: 12,
		styles
	});
	bounds = new google.maps.LatLngBounds();
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
}

function sortDates(data){
  var index = Math.floor((new Date() - new Date(data.purchase_date))/604800000)
  weeks[index].push(data);
  weeks[index].sort(function(a,b){
    if(new Date(a.purchase_date)<new Date(b.purchase_date))
      return -1;
    else
      return 1;
  })
}

$(document).ready(function() {
    var socket = io("http://localhost:3000");

    socket.emit("loadData", { custId: localStorage.customerId });
    socket.on("receiveData", function(data) {
        console.log(data);
        sortDates(data)
    });
    
    socket.on("create-map", function(loc) {
        createMap(loc);
    });

//     socket.on("add-marker", function(marker) {
//         addMarker(marker.location, marker.name, marker.price);
//     });
});

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

var TESTER = document.getElementById('tester');
var x;
var plotData = new Array(4);
for(x = 0; x < plotData.length; x ++){
    plotData[x] = new Array(12);
}
var date = new Date();

function plotLineGraph(data){
    
    
}

/*
function plotHeatMap(data){

    data.foreach(function(p){
        var timeStamp = p.purchase_date;
        var time = timeStamp.split('-');
        //plotData[Math.floor(time[2]/6)][time[1] = p.amount_spent;
    }

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
    Plotly.plot(TESTER,graph);
}*/

//plotHeatMap([1,.4,.6,.2,.9,0]);
//console.log( Plotly.BUILD );
