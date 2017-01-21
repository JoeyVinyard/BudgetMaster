var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

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

var request = require("request");
var baseUrl = "http://api.reimaginebanking.com/";
var keyUrl = "?key=335c078a708beb9fffbe11ee6a51364e";

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
		console.log(response["_id"]); //account id
		//plug this into the database
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
		merchantID = generateRandomNumber(24);
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
        url: baseUrl + "accounts/" + accountID + "/purchases" + keyUrl,
        json:
        	{
				  "merchant_id": merchantID,
				  "medium": medium,
				  "purchase_date": purchaseDate,
				  "amount": amount,
				  "description": description
			}
	},function(error, response, body){
		console.log(response["_id"]); //purchase id
		//not sure if this needs to go into the database
	});
}

function getPurchases(customerID){
	request(baseUrl + "accounts/" + customerID + "/purchases" + keyUrl,
		function(error, response, body){
			console.log(response["_id"]); //purchase ID
			console.log(response["purchase_date"]);
			console.log(response["amount"]);
			console.log(response["description"]);
			console.log(response["merchant_id"]);
			//maybe just grab the whole object
		});
}

function getMerchant(merchantID){
	request(baseUrl + "enterprise/merchants/" + merchantID + keyUrl,
		function(error, response, body){
			console.log(response);
		});
}

createCustomer();