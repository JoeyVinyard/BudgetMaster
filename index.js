var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var request = require("request");
var baseUrl = "http://api.reimaginebanking.com/";
var keyUrl = "?key=335c078a708beb9fffbe11ee6a51364e";

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.on('reg', function(user){
		fs.open('db.txt', 'a', function(err, fd) {
		if (err) {
			return console.error(err);
		}
	   	fs.appendFile(fd,"\n"+user.name+":"+user.pass+":"+user.pin,function(err){
				if(err){
					socket.emit('regres',"Fail");
					console.log(err);
				}
				socket.emit('regres',"Success!");
				fs.close(fd,function(err){console.log(err);});
			});
		});
  	});
  	socket.on('log', function(user){
	  	fs.open('db.txt', 'r+', function(err, fd) {
			var buf = new Buffer(1024);
			if (err) {
				return console.error(err);
			}
			fs.read(fd, buf, 0, buf.length, 0, function(err, bytes){
				if (err){
					console.log(err);
				}
				if(bytes > 0){
					var out = (buf.slice(0, bytes).toString()).split("\n");
					for(var i=0;i<out.length;i++){
						out[i] = (out[i].replace(/\r/i,''));
						if(out[i].includes(user)&&out[i].includes(pass)){
							socket.emit('returnID',out[i].substring(out[i].indexOf(":",out[i].indexOf(pass))+1));
							fs.close(fd,function(err){console.log(err);});
							break;
						}
					}
					socket.emit('returnID',"no");
				}
			});
		});
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//--------------------------------------
//--------Capital One Functions---------
//--------------------------------------
createCustomer();
function createCustomer(firstName, lastName, streetNum, streetName, city, state, zip){
	if(firstName === undefined){
		firstName = "Katy";
	}
	if(lastName === undefined){
		lastName = "Voor";
	}
	if(streetNum === undefined){
		streetNum = "1234";
	}
	if(streetName === undefined){
		streetName = "Elm Street";
	}
	if(city === undefined){
		city = "West Lafayette";
	}
	if(state === undefined){
		state = "IN";
	}
	if(zip === undefined){
		zip = "12345";
	}
    request.post({
    	url: baseUrl + "customers" + keyUrl,
    	json:
			{
			  "first_name": firstName,
			  "last_name": lastName,
			  "address": {
			    "street_number": streetNum,
			    "street_name": streetName,
			    "city": city,
			    "state": state,
			    "zip": zip
			  }
			}
	}, function(error, response, body){
		createAccount(body.objectCreated._id);
		console.log("hello",body.objectCreated._id); //customer id
		//plug this into the database
		fs.open('db.txt', 'a', function(err, fd) {
			if (err) {
				return console.error(err);
			}
			fs.appendFile(fd,"\n"+"user.name"+":"+"user.pass"+":"+body.objectCreated._id,function(err){
				if(err){
					socket.emit('regres',"Fail");
					console.log(err);
				}
				//socket.emit('regres',"Success!");
				fs.close(fd,function(err){console.log(err);});
			});
		});
	});
}

function createAccount(customerID, accountType, accountNickname, rewards, balance){
	if (accountType === undefined) {
		accountType = "Credit Card";
	}
	if(accountNickname === undefined){
		accountNickname = "Account";
	}
	if(rewards === undefined){
		rewards = 0;
	}
	if(balance === undefined){
		balance = 0;
	}
	request.post({
        url: baseUrl + "customers/" + customerID + "/accounts" + keyUrl,
        json:
        	{
				"type": accountType,
				"nickname": accountNickname,
				"rewards": rewards,
				"balance": balance,
				"account_number": generateRandomNumber(16)
			}
	},function(error, response, body){
		makePurchase(body.objectCreated._id);
	});
}

function generateRandomNumber(length){
	var num = "";
	for(var i=0; i < length; i++){
		num += Math.floor(Math.random() * 10).toString();
	}
	return num;
}

function makePurchase(accountID, merchantID, medium, purchaseDate, amount, description){
	if(merchantID === undefined){
		merchantID = "57cf75cea73e494d8675ec49"; //Dunkin Donuts in NC
	}
	if(medium === undefined){
		medium = "balance";
	}
	if(purchaseDate === undefined){
		purchaseDate="2017-01-01";
	}
	if(amount === undefined){
		amount = 0.01;
	}
	if(description === undefined){
		description = "Description";
	}
	request.post({
        url:baseUrl + "accounts/" + accountID + "/purchases" + keyUrl,
        json:
        	{
				  "merchant_id": merchantID,
				  "medium": medium,
				  "purchase_date": purchaseDate,
				  "amount": amount,
				  "description": description
			}
	},function(error, response, body){
		getPurchases(accountID);
	});
}

function getPurchases(accountID){
	request(baseUrl + "accounts/" + accountID + "/purchases" + keyUrl,
		function(error, response, body){
			var data = JSON.parse(body);
			for(p in data){
				console.log(getMerchantInfo(data[p].merchant_id, data[p].purchase_date, data[p].amount, data[p].description));
			}
		});
}

function getMerchantInfo(merchantID, purchaseDate, amountSpent, description){
	//get lat, lng, category
	request(baseUrl + "enterprise/merchants/" + merchantID + keyUrl,
		function(error, response, body){
			body = JSON.parse(body); //for some reason it comes back as a string
			var forAndrew = {
				merchant_name: body.name,
				category: body.category[0],
				amount_spent: amountSpent,
				purchase_date: purchaseDate
			}
			var forCalvin = {
				lat: body.geocode.lat,
				lng: body.geocode.lng,
				category: body.category[0],
				merchant_name: body.name
			}
		});
}

//-----------------------
//---Google Places API---
//-----------------------

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
						createMap(place.geometry.location); //instead socket this to the client
					}
					if(originalPrice >= place.price_level && place.name != name){
						addMarker(place.geometry.location, place.name, place.price_level); //instead socket this to the client
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
