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
			createAccount(body.objectCreated._id);
			console.log("hello",body.objectCreated._id); //customer id
			//plug this into the database
			fs.open('db.txt', 'a', function(err, fd) {
				if (err) {
					return console.error(err);
				}
				fs.appendFile(fd,"\n"+user.username+":"+user.password+":"+body.objectCreated._id,function(err){
					if(err){
						socket.emit('regres',"Fail");
						console.log(err);
					}
					socket.emit('regres',"Success!");
					fs.close(fd,function(err){console.log(err);});
				});
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

//getMerchantInfo("57cf75cea73e494d8675ec49");

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