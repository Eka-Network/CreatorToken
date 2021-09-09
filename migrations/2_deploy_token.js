const SimpleToken = artifacts.require("SimpleToken");
var myArgs = process.argv.slice(6);

module.exports = async function(deployer) {
    await deployer.deploy(SimpleToken, myArgs[0], myArgs[1], myArgs[2]);
    let info = await SimpleToken.deployed();
    await info.transfer(myArgs[3], ((myArgs[2] - 1) * Math.pow(10, 18)).toString());
    console.log('@#$%' + info['address']);
};