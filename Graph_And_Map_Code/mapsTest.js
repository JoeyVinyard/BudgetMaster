var request = require('request');

let BASE_GOOGLE_URL = "https://maps.googleapis.com/maps/api/";
let GOOGLE_API_KEY = "AIzaSyARogmz0eZ6aOPftL8k0tpQUmIymww0lNU";
let DEFAULT_PRICE_LEVEL = 1.9;

var map; //google map element

function getPlacesData(name, latitude, longitude, type, radius){
	if(type === undefined){
		type = "food";
	}
	if(radius === undefined){
		radius = 1000;
	}
    var requestString = BASE_GOOGLE_URL +
    "place/nearbysearch/json?location=" + latitude + ", " + longitude +
	"&radius=" + radius + "&type=" + type + "&key=" + GOOGLE_API_KEY;
    
    request(requestString,
    	function(error, response, body){
    		var originalPrice;
			if (!error && response.statusCode == 200){
				var places = JSON.parse(body).results;
			    places.forEach(function(place){
					if(place.name == name){
						originalPrice = place.price_level;
					    return;
					}
				});
				places.forEach(function(place){
					if(place.price_level === undefined){
						place.price_level = DEFAULT_PRICE_LEVEL;
						createMap(place.geometry.location);
					}
					if(originalPrice >= place.price_level && place.name != name){
						addMarker(place.geometry.location, place.name, place.price_level);
					}
				});
			}
		});
}

function createMap(center){
	map = new google.maps.Map(document.getElementById("map"), {
		center
	});
}

function addMarker(location, name, priceLevel){
	var marker = new google.maps.Marker({
		position: location,
		map,
		title: name
	});
	marker.addListener("click", function(){
		new google.maps.InfoWindow({
			content: "<p>" + name + "</p><p>Price: " + Array(Math.ceil(priceLevel)+1).join("$") + "</p>"
		}).open(map, marker);
	});
}

getPlacesData("Dollar Tree", 42.429088, -76.51341959999999, "store");
