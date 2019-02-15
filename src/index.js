'use strict'
const config = require('./config');
const ora = require("ora");
const { Runebase } = require("runebasejs");
const RunebaseUtils = require('./runebase_utils');
const MongoClient = require('mongodb').MongoClient; 
const TelegramBot = require('telegram-bot-nova');
const bot = new TelegramBot(config.bot.token);
const repoData = require("./solar.json");
const runebase = new Runebase(config.rpc, repoData);
const timeout = ms => new Promise(res => setTimeout(res, ms))


async function delay () {
  await timeout(Math.floor(Math.random() * 1200) + 600 );
}

//async function dropdb() {
    //Drop DB
//    MongoClient.connect(config.db.host, { useNewUrlParser: true })
//		.then(client => {
//		  const db = client.db('airdrops');
//		  var collection = db.collection("pred");
//		  collection.drop().catch(error => console.error("error"));
//	}).catch(error => console.error(error));
//}

async function transfer(fromAddr, toAddr, amount, myToken, matchFound, from, chat) {
	const tx = await myToken.send("transfer", [toAddr, amount], {
    	senderAddress: fromAddr,
	})
  	MongoClient.connect(config.db.host, { useNewUrlParser: true })
	.then(client => {
	    const db = client.db('airdrops');
	    const collection = db.collection(matchFound["token"]);
		    var userId = matchFound["userId"];
		    collection.updateOne(
			    { "_id" : userId }, 
	    		{ $set: {"tx" : tx.txid } },
				{ upsert: true }
			);
			client.close();
	}).catch(error => console.error(error));	
	bot.sendText(chat.id, 'Thanks, ' + from.username + '.\nYour Transaction is being confirmed.');
  			  
	const confirmation = tx.confirm(1);
	ora.promise(confirmation, "confirm transfer");
	await confirmation;
	bot.sendText(chat.id, 'Thank you for participating in the ' + matchFound["token"] + ' airdrop, ' + from.username + '.\n You can see the transaction on the runebase blockexplorer at: https://explorer.runebase.io/tx/' + tx.txid +'\n Remember, you need runes to transact on the blockchain. \nGrab some free runes at : https://faucet.runebase.io');
  	MongoClient.connect(config.db.host, { useNewUrlParser: true })
	.then(client => {
		const db = client.db('airdrops');
		const collection = db.collection(matchFound["token"]);
		var userId = matchFound["userId"];
		collection.updateOne(
		    { "_id" : userId }, 
		    { $set: {"confirmed" : "true" } },
		    { upsert: true }
		);
		client.close();
	}).catch(error => console.error(error)); 
}
function trimTheString(match, from, key) {
	match[0] = match[0].replace(/\s/g, "");
	match[0] = match[0].replace(/(\W|^)(.+)\s\2/ig, " ");
	match  = match[0].split('[');
	match[1] = match[1].replace(']','');
	match[2] = match[2].replace(']','');

	// structure data
	var matchFound = new Object();
	matchFound["token"] = match[1];
	matchFound["receiveAddress"]= match[2];
	matchFound["userId"]= from.id;
	var obj = config.airdrop[key];    
	for (var prop in obj) {
		if(!obj.hasOwnProperty(prop)) continue;
			matchFound[prop] = obj[prop];
		}
	return matchFound;
}
async function main() {
	//await dropdb();
	bot.on('text', (chat, date, from, messageId, text) => {
		//console.log(chat);
		//console.log(from);
		(async () => {
			
			await delay();
			for (var key in config.airdrop) {
			    if (!config.airdrop.hasOwnProperty(key)) continue;
			    var regex = new RegExp("\\[[ \t]*" + key + "[ \t]*\\][ \t]*\\[[ \t]*.{34,34}[ \t]*\\]","g");
			    if (regex.test(text) && from.is_bot == false) {
			    	console.log(from);
			    	var matchFound = new Object();
			    	//Trim The String
			    	matchFound = trimTheString(text.match(regex), from, key);
				    //Validate the Address
				    await RunebaseUtils.validateAddress({ address: matchFound["receiveAddress"] })
					  .then((result) => {
					  	if (result.isvalid) {
					  		//Query mongoDB
							(async () => {
								await delay();
						  		await MongoClient.connect(config.db.host, { useNewUrlParser: true })
								.then(client => {
								  const db = client.db('airdrops');
								  const collection = db.collection(matchFound["token"]);
								  var userId = matchFound["userId"];
								  var receiveAddress = matchFound["receiveAddress"];
								   collection.find( { $or: [ { "_id": userId }, { "receiveAddress": receiveAddress } ] } ).toArray(async function(err, result) {
									await isEligible(result, matchFound, from, chat);
								   });
								}).catch(error => console.log(error));
							})().catch(err => {
							    console.log(err);
							});
					  	}
					  	else{
					  		bot.sendText(chat.id, 'Hey ' + from.username + ',\nsomething went wrong, please provide a correct format if you want to receive the airdrop.\n[token][<valid-runebase-address>]\nexample:\n[pred][RUaEQCUTauv7Aunb3Y6WFdqatuHRb9KMW2]');
					  	}
					  }, (err) => {
					  	console.log(err);
					  });		    
				} 
			}
		})().catch(err => {
		    console.log(err);
		});
	});
}

async function isEligible(result, matchFound, from, chat) {
	if (result[0] != null) {
		if ( result[0]._id == matchFound["userId"] || result[0].receiveAddress == matchFound["receiveAddress"]) {
	    	bot.sendText(chat.id, 'Hey ' + from.username + ',\n you already received this airdrop.');
		}

	}
	else{
    	MongoClient.connect(config.db.host, { useNewUrlParser: true })
			.then(client => {
				const db = client.db('airdrops');
				const collection = db.collection(matchFound["token"]);
			   	collection.insertOne({'_id': matchFound["userId"], 'receiveAddress': matchFound["receiveAddress"], 'amount' : matchFound["amount"], 'confirmed' : "false", 'tx' : '0'});
    			client.close();
			}).catch(error => console.error(error));

	    	//Create Transaction
	    	console.log('Create transaction');
	    	var myToken = runebase.contract("contracts/tokens/" + matchFound["contract"]);
			var hexaddress = await RunebaseUtils.getHexAddress({ address: matchFound["receiveAddress"] });
			RunebaseUtils.walletPassphrase({ passphrase: config.wallet.passphrase , timeout: 6000000 });
			await delay();
			transfer(matchFound["fromAddress"], hexaddress, matchFound["amount"], myToken, matchFound, from, chat);
		}
}

main().catch(err => {
  console.log("error", err)
})

