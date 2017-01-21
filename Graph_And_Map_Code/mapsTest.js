var request = require('request');

var GOOGLE_API_KEY = "AIzaSyAzPCeLTP2ESnKs5CtOpunZacxPVE3UhfI";

function getPlacesData(lattitude, longitude, type, name){
    var requestString = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + lattitude + ", " + longitude +
	"&radius=1000&type=" + type + "&key=" + GOOGLE_API_KEY;
    console.log(requestString);
    request(requestString, function(error, response, body){
	
	if (!error && response.statusCode == 200) {
	    bodyJson = JSON.parse(body);
	    console.log(bodyJson);
	    var places = bodyJson.results;
	    places.forEach(function(p){
		if(p.name == name){
		    return;
		}
		console.log(p.name);
		console.log(p.vicinity);
		console.log(p.price_level);
	    });
	    //console.log(body); // Show the HTML for the Modulus homepage.
	}
    });
    
}

getPlacesData(35.907,-79.046, "food", "Dunkin' Donuts");
