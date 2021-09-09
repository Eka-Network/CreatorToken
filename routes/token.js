const { exec } = require("child_process");
var express = require('express');
var router = express.Router();
var User = require('../Models/User');
const fs = require('fs');
const Mail = require('../Utils/Mailer');

var CommandQueue = [];
var available = true;

var ExecuteCommand = async(email, name, symbol, accAddress, amount) => {
    available = false;
    console.log("##########Creating Token " + email + " " + name + ' ' + symbol + ' ' + amount);
    exec("npx truffle migrate --reset --network rinkeby " + name + " " + symbol + " " + amount + " " + accAddress, async(error, stdout, stderr) => {
        if (error) {
            const user = await User.findOneAndUpdate({ email: email }, { creatorToken: null });
            Mail.SendEmail(email, "Token Creation Request Update", 'Hello User,\n\nGreetings!\n\nWe regret to convey that unfortunately, the request for creating the Token - ' + name + ' could not be completed successfully.\n\nWe are currentlyworking with limited resources and though rare, such failures can occur. \n\nWe are striving hard to make continuous enhancements in our services and resources. You can choose to retry creating the Token once as per time of your convenience and it should get completed.\n\nThank you for your understanding and cooperation. \n\nHave an awesome day ahead!');
            console.log(`error: ${error.message}`);
            console.log(email + ' ' + name + "**************************************************************");
            console.log(`error: ${stdout}`);
            console.log("**************************************************************");
            if (CommandQueue.length == 0) {
                available = true;
            } else {
                var data = CommandQueue.shift();
                ExecuteCommand(data.email, data.name, data.symbol, data.address, data.amount);
            }
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            //return;
        }
        let index = stdout.indexOf("@#$%");
        let address = stdout.substr(index + 4, 42);
        console.log(`stdout: ${address}`);
        var user = await User.findOne({ email: email });
        user.creatorToken = address;
        await user.save();
        console.log("#######Created Token " + email);
        Mail.SendEmail(email, "Token Created",
            'Hello User, \n\nGreetings!\n\nWe are glad to convey that your Token -  ' + name + 'has been created successfully! \n\nYou can check your balance in profile page or in your wallet.\n\nToken Address: ' + address + '\n\nMany thanks for showing interest in the EKA Network platform!\n\nHave an awesome day ahead!');
        if (CommandQueue.length == 0) {
            available = true;
        } else {
            var data = CommandQueue.shift();
            ExecuteCommand(data.email, data.name, data.symbol, data.address, data.amount);
        }
    });
}

//var { sendVerificationEmail } = require('../API/EmailSystem/SendVerificationEmail');
/* GET home page. */
router.get('/', function(req, res, next) {
    var data = {
        name: "testroute",
        age: 34
    }
    res.send(data);
});
router.get('/tokencreator/progress', async function(req, res, next) {
    var user = await User.findOne({ email: req.headers.authUser.email });
    res.send({
        creatorToken: user.creatorToken,
        isNFTInProgress: user.isNFTInProgress
    });
});
router.post('/tokencreator/', async function(req, res) {
    console.log('Creating Token request from ' + req.headers.authUser.email + ' Available:' + available + ' ' + JSON.stringify(CommandQueue));
    const userCheck = await User.findOne({ email: req.headers.authUser.email });
    if (userCheck.creatorToken === null) {
        await User.findOneAndUpdate({ email: req.headers.authUser.email }, { creatorToken: 1 });
        res.status(200).send();
        if (available) {
            ExecuteCommand(req.headers.authUser.email, req.body.name, req.body.symbol, req.body.address, req.body.amount)
        } else {
            CommandQueue.push({
                email: req.headers.authUser.email,
                name: req.body.name,
                symbol: req.body.symbol,
                address: req.body.address,
                amount: req.body.amount,
            })
        }
    } else {
        res.status(201).send();
    }

});
module.exports = router;