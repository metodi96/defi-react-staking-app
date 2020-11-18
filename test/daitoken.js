const DaiToken = artifacts.require("./DaiToken.sol");

contract("DaiToken", accounts => {
    let tokenInstance;

    it("...should assign name and symbol to token.", function () {
        return DaiToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function (name) {
            assert.equal(name, "Mock Dai Token", "Not the right name.");
            return tokenInstance.symbol();
        }).then(function (symbol) {
            assert.equal(symbol, "mDAI", "Not the right symbol.");
            return tokenInstance.standard();
        }).then(function (standard) {
            assert.equal(standard, "Mock Dai Token v1.0", "Wrong standard version, should be v1.0.");
        });
    });

    it("...should set the total supply to 10000000 and allocate the initial supply to admin balance.", function () {
        return DaiToken.deployed().then(function (instance) {
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
        return DaiToken.deployed().then(function (instance) {
            tokenInstance = instance;
            //test the require function to see if msg.sender has enough tokens
            //call doesnt trigger a transaction whereas transfer does
            return tokenInstance.transfer.call(accounts[1], 999999999999);
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            //to inspect the return value we need to call the transfer function
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function (success) {
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

    it("...should approve tokens for delegated transfer.", function () {
        return DaiToken.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function (success) {
            assert.equal(success, true, 'should return true');
            return tokenInstance.approve(accounts[1], 100, { from: accounts[0] })
        }).then(function (receipt) {
            //receipt is for events
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'should log the owner account who initiates the approval');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'should log the spender account');
            assert.equal(receipt.logs[0].args._value, 100, 'should log the approval amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 100, 'should store the allowance for a delegated transfer');
        })
    })
    //side note - if some assertion fails, even if the last one is right, it shows that the last one is wrong in the console.........
    it("...should handle delegated token transfers.", function () {
        return DaiToken.deployed().then(function (instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            //initial setup by transfering to fromAccount
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
        }).then(function (receipt) {
            //approve spendingAccount to spend 10 tokens from fromAccount
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function (receipt) {
            //try transfering something larger than the sender's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount })
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            //try transfering something larger than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 11, { from: spendingAccount });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
            //we call only for the return value
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function (success) {
            assert.equal(success, true, 'should return true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function (receipt) {
            //receipt is for events
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'should log the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'should log the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 10, 'should log the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 90, 'should deduct 10 from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 10, 'should add 10 to the receiving account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 0, 'should deduct 10 from 10 allowance');
        });
    });
});
