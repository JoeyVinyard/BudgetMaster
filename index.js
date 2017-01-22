var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var request = require("request");

//-----------------------
//---Capital One API-----
//-----------------------
var baseUrl = "http://api.reimaginebanking.com/";
var keyUrl = "?key=335c078a708beb9fffbe11ee6a51364e";

//-----------------------
//---Google Places API---
//-----------------------
let BASE_GOOGLE_URL = "https://maps.googleapis.com/maps/api/";
let GOOGLE_API_KEY = "AIzaSyARogmz0eZ6aOPftL8k0tpQUmIymww0lNU";
let DEFAULT_PRICE_LEVEL = 1.9;
var map; //google map element

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static("public"));

io.on('connection', function(socket){
	console.log("connected");
    socket.on('reg', function(user){
		if(user.firstName === undefined){
			user.firstName = "Katy";
		}
		if(user.lastName === undefined){
			user.lastName = "Voor";
		}
		if(user.streetNum === undefined){
			user.streetNum = "1234";
		}
		if(user.streetName === undefined){
			user.streetName = "Elm Street";
		}
		if(user.city === undefined){
			user.city = "West Lafayette";
		}
		if(user.state === undefined){
			user.state = "IN";
		}
		if(user.zip === undefined){
			user.zip = "12345";
		}
	    request.post({
	    	url: baseUrl + "customers" + keyUrl,
	    	json:
				{
				  "first_name": user.firstName,
				  "last_name": user.lastName,
				  "address": {
				    "street_number": user.streetNum,
				    "street_name": user.streetName,
				    "city": user.city,
				    "state": user.state,
				    "zip": user.zip
				  }
				}
		}, function(error, response, body){
			//plug this into the database
			fs.open('db.txt', 'a', function(err, fd) {
				if (err) {
					return console.error(err);
				}
				fs.appendFile(fd,"\n"+user.username+":"+user.password+":"+body.objectCreated._id,function(err){
					if(err){
						socket.emit('connStat',"Fail");
						console.log(err);
					}
					fs.close(fd,function(err){console.log(err);});
				});
				var emitted = false;

				for(var i=0;i<3;i++){
					var type = "Credit Card";
					var nick = "Credit";
					if(i == 1){
						type = "Savings";
						nick = "Savings";
					}else if(i == 2){
						type = "Checking";
						nick = "Checking";
					}
					request.post({
				        url: baseUrl + "customers/" + body.objectCreated._id + "/accounts" + keyUrl,
				        json:
				        	{
								"type": type,
								"nickname": nick,
								"rewards": Math.floor(Math.random()*25),
								"balance": Math.floor(Math.random()*10000),
								"account_number": generateRandomNumber(16)
							}
					},function(error, response, bdy){
						makeRandomPurchases(bdy.objectCreated._id, 4000);
						if(!emitted){
							emitted = true;
							console.log("Emitting");
							socket.emit('connStat',{use:user.username,custId:body.objectCreated._id});
						}
					});
				}
			});
		});
  	});
  	socket.on('log', function(user){
	  	fs.open('db.txt', 'r+', function(err, fd) {
			var buf = new Buffer(1024);
			var success = false;
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
						if(out[i].includes(user.username)&&out[i].includes(user.password)){
							socket.emit('connStat', {use: user,custId: out[i].split(":")[2]});
							success=true;
							fs.close(fd,function(err){console.log(err);});
							break;
						}
					}
					if(!success)
						socket.emit('connStat',{use:"no",custId: "no"});
				}
			});
		});
	});
	socket.on('loadData',function(user){
        console.log("loading data");
        var countComp = 0;
		request(baseUrl + "customers/" + user.custId + "/accounts" + keyUrl, function(error, response, bdy){
			request(baseUrl + "accounts/" + JSON.parse(bdy)[1]._id + "/purchases" + keyUrl, function(error, response, body){
				var data = JSON.parse(body);
				var forAndrew;
				Object.keys(data).forEach(function(d){
					request(baseUrl + "enterprise/merchants/" + data[d].merchant_id + keyUrl, function(error, response, body){
						body = JSON.parse(body); //for some reason it comes back as a string
						forAndrew = {
							merchant_name: body.name,
							category: body.category[0],
							amount_spent: data[d].amount,
							purchase_date: data[d].purchase_date,
							desc: data[d].description,
							lat: body.geocode.lat,
							lng: body.geocode.lng
						}
						//Send andrew info
						countComp++;
						if(countComp>=Object.keys(data).length-1){
							socket.emit("endData");
						}
                        socket.emit("receiveData", forAndrew);
					});
				});
				//console.log(forAndrew);
			});
		});
	});
	socket.on('getPlacesData',function(data){
        console.log("FUCK");

		if(data.type === undefined){
			type = "food";
		}
		if(data.radius === undefined){
			radius = 500;
		}
	    var requestString = BASE_GOOGLE_URL +
	    "place/nearbysearch/json?location=" + data.latitude + ", " + data.longitude +
		"&radius=" + data.radius + "&type=" + data.type + "&key=" + GOOGLE_API_KEY;
    
    	request(requestString,function(error, response, body){
    		var originalPrice = DEFAULT_PRICE_LEVEL;

			if (!error && response.statusCode == 200){
				var places = JSON.parse(body).results;
                console.log("Places = ", places);

			    places.forEach(function(place){
					if(place.name == data.name){
						originalPrice = place.price_level;
					    return;
					}
				});
				places.forEach(function(place){
					if(place.price_level === undefined){
						place.price_level = DEFAULT_PRICE_LEVEL;
					}

					if(originalPrice >= place.price_level && place.name != data.name){
                        socket.emit("addMarker", {
                            location: place.geometry.location,
                            name: place.name,
                            price: place.price_level,
                        });
					}
				});
			}
		});
	})
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//--------------------------------------
//--------Capital One Functions---------
//--------------------------------------

function generateRandomNumber(length){
	var num = "";
	for(var i=0; i < length; i++){
		num += Math.floor(Math.random() * 10).toString();
	}
	return num;
}

// Pizza Hut, Walmart, Dick's Sporting Goods, Mcdonald's, Arby's, Starbucks, Cosi, Target, Meijer, Texas Roadhouse

var stores = ["5827c658360f81f10454a40d", "57cf75cfa73e494d8675f92c", "57cf75cea73e494d8675eed2", "57cf75cea73e494d8675f3e7",
	      "57cf75cfa73e494d8675fa21", "57e69f8edbd83557146123ee", "57cf75cea73e494d8675f04c", "57cf75cea73e494d8675ed21",
	      "57cf75cea73e494d8675ed3f", "57cf75cfa73e494d8675f866","57cf75cea73e494d8675ec49", "57cf75cfa73e494d8675fa21",
	      "57cf75cfa73e494d8675fa29","57cf75cfa73e494d8675fa2a" ];


function getRandomDate(start, end) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().substring(0, 10);
}

function makeRandomPurchases(accountID, numPurchases){
	let monthOffset = 12; //how many months we look back
	let end = new Date();
	let start = new Date();
	start.setMonth(start.getMonth() - monthOffset);
	console.log(numPurchases);
	for(var i = 0; i < numPurchases; i++){
		makePurchase(accountID, stores[getRandomInt(0, 11)], undefined,
			getRandomDate(start, end), Math.floor(getRandomDouble(5, 107.4)*100)/100, "description");
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomDouble(min, max) {
    return Math.random() * (max - min) + min;
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
		if(body==undefined){
			makePurchase(accountID,merchantID,medium,purchaseDate,amount,description);
		}
		else if(body.code==undefined){
			makePurchase(accountID,merchantID,medium,purchaseDate,amount,description);
		}
	});
}
