let request = require("request");
let baseUrl = "http://api.reimaginebanking.com/";
let keyUrl = "?key=335c078a708beb9fffbe11ee6a51364e";

function createCustomer(firstName, lastName, streetNum, streetName, city, state, zip){
	if(firstName === null){
		firstName = "Katy";
	}
	if(lastName === null){
		lastName = "Voor";
	}
	if(streetNum === null){
		streetNum = "1234";
	}
	if(streetName === null){
		streetName = "Elm Street";
	}
	if(city === null){
		city = "West Lafayette";
	}
	if(state === null){
		state = "IN";
	}
	if(zip === null){
		zip = "12345";
	}
    request.post({
    	url: baseUrl + "customers" + keyUrl,
    	body: JSON.stringify(
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
    		)
	}, function(error, response, body){
		console.log(response["_id"]); //customer id
		//plug this into the database
	});
}

function createAccount(customerID, accountType, accountNickname, rewards, balance){
	if (accountType === null) {
		accountType = "Credit Card";
	}
	if(accountNickname === null){
		accountNickname = "Account";
	}
	if(rewards === null){
		rewards = 0;
	}
	if(balance === null){
		balance = 0;
	}
	request.post({
        url: baseUrl + "customers/" + customerID + "/accounts" + keyUrl,
        body: JSON.stringify(
        	{
				"type": accountType,
				"nickname": accountNickname,
				"rewards": rewards,
				"balance": balance,
				"account_number": generateRandomNumber(16)
			})
	},function(error, response, body){
		console.log(response["_id"]); //account id
		//plug this into the database
	});
}

function generateRandomNumber(length){
	var num = "";
	for(int i=0; i < length; i++){
		num += Math.floor(Math.random() * 10).toString();
	}
	return num;
}

function makePurchase(accountID, merchantID, medium, purchaseDate, amount, description){
	if(merchantID === null){
		merchantID = generateRandomNumber(24);
	}
	if(medium === null){
		medium = "balance";
	}
	if(purchaseDate === null){
		purchaseDate="2017-01-01";
	}
	if(amount === null){
		amount = 0.01;
	}
	if(description === null){
		description = "Description";
	}
	request.post({
        url: baseUrl + "accounts/" + accountID + "/purchases" + keyUrl,
        body: JSON.stringify(
        	{
				  "merchant_id": merchantID,
				  "medium": medium,
				  "purchase_date": purchaseDate,
				  "amount": amount,
				  "description": description
			});
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
			//maybe just grab the whole object
		});
}