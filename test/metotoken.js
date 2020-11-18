const MetoToken = artifacts.require("./MetoToken.sol");

contract("MetoToken", accounts => {
    let tokenInstance;

    it("...should assign name and symbol to token.", function () {
        return MetoToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name) {
            assert.equal(name, "Meto Token", "Not the right name.");
            return tokenInstance.symbol();
        }).then(function (symbol) {
            assert.equal(symbol, "MT", "Not the right symbol.");
            return tokenInstance.standard();
        }).then(function (standard) {
            assert.equal(standard, "Meto Token v1.0", "Wrong standard version, should be v1.0.");
        });
    });

    it("...should set the total supply to 10000000 and allocate the initial supply to admin balance.", function () {
        return MetoToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.toNumber(), 10000000, "The value 10.000.000 was not set as a total supply.");
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminBalance) {
            assert.equal(adminBalance.toNumber(), 10000000, "The initial supply wasn't allocated to the admin balance.");
        });
    });

    it("...should transfer token ownership.", function () {
        return MetoToken.deployed().then(function (instance) {
            tokenInstance = instance;
            //test the require function to see if msg.sender has enough tokens
            //call doesnt trigger a transaction whereas transfer does
            return tokenInstance.transfer.call(accounts[1], 999999999999);
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            //to inspect the return value we need to call the transfer function
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function(success) {
            assert.equal(success, true, 'should return true');
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function (receipt) {
            //receipt is for events
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'should log the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'should log the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'should log the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 250000, 'doesn\'t add the number to receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 9750000, 'deduction failed');
        })
    });
});