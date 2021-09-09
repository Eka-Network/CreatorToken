const { spawn, exec } = require("child_process");
const fs = require('fs');

var createToken = (name, symbol, amount) => {
    fs.readFile('./ContractTemplate.sol', 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }
        data = data.replace("#*$AMOUNT$*#", amount);
        data = data.replace("#*$SYMBOL$*#", symbol);
        data = data.replace("#*$NAME$*#", name);
        fs.writeFile("./contracts/SimpleToken.sol", data, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    });
    exec("npx truffle migrate --reset --network rinkeby", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            //return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            //return;
        }
        let index = stdout.indexOf("@#$%");
        let address = stdout.substr(index + 4, 42);
        console.log(`stdout: ${address}`);
    });
}
createToken("filTest2", "FI2", 345);