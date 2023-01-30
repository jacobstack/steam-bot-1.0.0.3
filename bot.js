const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');



const config = require('./config.json');
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager ({
    steam: client,
    community: community,
    language: 'en'
});


const cmdPrefix = "SERVER:---: ";

/* ***IMPORTANT FOR LOGIN***
    Ensure you have filled out ALL of the fields in 'config.json'.
    This includes the 'sharedSecret' and 'identitySecret' fields.
    You can find yours using Steam Desktop Authenticator.
    https://www.youtube.com/watch?v=JjdOJVSZ9Mo
*/
const creds = {
    accountName: config.accountName,
    password: config.password,
    twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

// ATTEMPT LOGIN
client.logOn(creds);
client.on('loggedOn',  () => {
    // VERIFY LOGIN INFO
    if (creds.accountName != "" && creds.accountName != undefined) {
        console.log(cmdPrefix+"Login as "+ creds.accountName+ " was successful!");
        // SET STATUS AND GAME
        client.setPersona(SteamUser.EPersonaState.LookingToTrade);
        //client.gamesPlayed(440); // ("text") (game) or (["text", game])
    }
    // IF LOGIN FAILS
    else {
        console.log(cmdPrefix+"Login failed.");
        console.log(cmdPrefix+"Please ensure you have filled out 'config.json'.");
    }
});

// ON MESSAGE FROM FRIEND > > >
client.on("friendMessage", function(steamID, message) {
    console.log(cmdPrefix+"Message from "+steamID+": '"+message+"'");
    if (message.includes("trade")) {
        client.chatMessage(steamID, "hey, want to trade?");
    }
});

// ON WEB SESSION OPENED > > >
client.on('websession', (sessionid, cookies) => {
    // Give information to trade manager and steam community
    manager.setCookies(cookies);
    community.setCookies(cookies);
    // Start checking for mobile confirmations every 20sec.
    community.startConfirmationChecker(20000, config.identitySecret);
});

client.setOptions("promptSteamGuardCode", false);

// ON NEW TRADE OFFER > > >
manager.on('newOffer', (offer) => {
    console.log(cmdPrefix+"New offer: "+offer)
    processOffer(offer);
});

//----FUNCTIONS-------------------------------------------------------------------------------------//

function acceptOffer(offer) {
    offer.accept((err) => {
        if (err) console.log(cmdPrefix+"There was a error accepting the offer.");
    });
}

function declineOffer(offer) {
    offer.decline((err) => {
        if (err) console.log(cmdPrefix+"There was a error declining the offer.");
    });
}

function processOffer(offer){
    // represent offer in console
    console.log(cmdPrefix+"New offer: ");

    // offer is broken decline it
    if (offer.isGlitched() || offer.state === 11){
        console.log(cmdPrefix+"Some items are glitched or unavailable. Declining offer.")
        declineOffer(offer);
    } 
    // if offer is from trusted user accept it
    else if (offer.partner.getSteamID64() === config.ownerID) {
        // console.log(cmdPrefix+"Accepting offer from trusted user.");
        acceptOffer(offer);
    }
    // process the offer as usual
    else {
        var ourItems = offer.itemsToGive;
        var theirItems = offer.itemsToReceive;
        var ourValue = 0;
        var theirValue = 0;

        // get total value of the items bot is offering
        for (var i in ourItems){
            var item = ourItems[i].market_name;
            if (Prices[item]){
                ourValue += Prices[items].sellPrice;
            } else {
            /* if the item is not on the price list (ie the bot messed up or someone
                is trying to scam the bot), we make them overpay a ridiculous amount */
                console.log(cmdPrefix+"Making customer overpay for invalid item: "+item+".");
                ourValue += 99999; // unsure of value to overpay by
            }
        }

        // get total value of trade partners offering
        for (var i in theirItems) {
            var item = theirItems[i].market_name;
            if (Prices[item]) {
                theirValue += Prices[item].buyPrice;
            } else {
                console.log(cmdPrefix+"Trade partner has offered invalid item: "+item);
            }
        }
    }

    // display total trade offer values
    console.log("Bot value: "+ourValue);
    console.log("Partner value: "+theirValue);

    // make a buying decision
    if (ourValue <= theirValue) {
        acceptOffer(offer);
    } else {
        declineOffer(offer);
    }
}

// 15 days continue here ***************************************************************************