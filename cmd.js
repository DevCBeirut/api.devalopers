#!/usr/bin/env node

/**
 * Module dependencies.
 */
//   node cmd -p
let program = require('commander');

global.__basepath = process.cwd();

global.app = new require("express")();
require("./lib/helpers");
/* Configurations */
app.loadConfig();
app.loadModels();


let LocationManager = require("./app/helpers/LocationManager");
let PushNotification = require("./app/services/PushNotification");


program
    .version('0.1.0')
    .option('-p, --push', 'send push')
    .option('-b, --bbq-sauce', 'Add bbq sauce')
    .option('-c, --clean ', 'clean db')
    .option('-t, --twilio ', 'twilio db')
    .parse(process.argv);

    logger.info('we got your command :');
if (program.bbqSauce) logger.info('  - bbq');
if (program.push) {
    const token = program.args[0];
    logger.info('  you want to send push',token);
}
if (program.clean) {

    logger.info(' cleaning...');
   // MongooseHelper.dropDB();

    //logger.info(' saving...',ss.save());
}

if (program.twilio) {

    logger.info(' cleaning...');

    LocationManager.formattedAddress();

    /*
     * Build a transaction object
    * Sign the transaction
    * Broadcast the transaction to the network
     */
    // https://faucet.ropsten.be/   and send me 1 either
   // Web3Helper.getBalance("0x1Ec3157b190f50698f2ea8b8eDC7410d4E50e41C");
    // you can view on ether https://ropsten.etherscan.io/address/0x1ec3157b190f50698f2ea8b8edc7410d4e50e41c
   // Web3Helper.sendSignedTransaction("0x1Ec3157b190f50698f2ea8b8eDC7410d4E50e41C","0x17E46b3FA4E429DE157Ec9bb577A3f31f2D336B3","F2F0EA0FED71CC7B31A3E75D0E9E758B3C2B9DEEB94F0F62D845C60703B35F5B");

    //let ddd = hex2utf8("0x6677656677666572720a6665726665726665657266657266");


    //Web3Helper.getTransaction("0xd54400883f0abe5b418da5952b96b4cfa39be75368f4e0181537ec6c51c50e7f",);

    //Web3Helper.sendRowTransaction("0x1Ec3157b190f50698f2ea8b8eDC7410d4E50e41C","0x17E46b3FA4E429DE157Ec9bb577A3f31f2D336B3","F2F0EA0FED71CC7B31A3E75D0E9E758B3C2B9DEEB94F0F62D845C60703B35F5B");

    //const token = "edytJiDEFik:APA91bEKUOOFF9zwH17yZtG_GaXYcbu8yXetwXOvHktWStUf63lUoY1fmu8_dPkpgqyLUOJ32jcGJSByJjiRC7MTvwUhgBN19DKO5xfOUbvlL0AN3cjRR1kU-YphSWpwBLfjvK0XF6ii";
    //PushNotification.sendandroid(token,"title","msg")


   // MongoManager.cleanall()

}


// ethereumjs-tx
// , I came across this article, it explains well how to listen to events from smart contracts
// https://coursetro.com/posts/code/100/Solidity-Events-Tutorial---Using-Web3.js-to-Listen-for-Smart-Contract-Events
// https://trello.com/b/RXMxpuh0/blocrecs-features

logger.info('commander done');