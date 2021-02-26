const MetoToken = artifacts.require("./MetoToken.sol");
const truffleAssert = require('truffle-assertions')
const { tokens } = require('../utils/tokens')


contract("MetoToken", ([owner, user, exchange]) => {
    let metoToken;
    before(async () => {
        metoToken = await MetoToken.new()
    });

    describe('Initialization', async () => {
        it('...should have a name - Meto Token', async () => {
            const name = await metoToken.name();
            assert.equal(name, 'Meto Token', 'Not the right name.')
        })

        it('...should have a symbol - MT', async () => {
            const symbol = await metoToken.symbol();
            assert.equal(symbol, "MT", "Not the right symbol.")
        })

        it('...should have a standard - Meto Token v1.0', async () => {
            const standard = await metoToken.standard();
            assert.equal(standard, "Meto Token v1.0", "Wrong standard version.")
        })

        it('...should have a total supply of 1000000 tokens', async () => {
            const totalSupply = await metoToken.totalSupply();
            assert.equal(totalSupply, tokens('1000000'), "Wrong total supply.")
        })
    })

    describe('Transfer tokens normally', async () => {
        it('...should have a balance of 0 for the owner', async () => {
            const balanceOfSC = await metoToken.balanceOf(owner);
            assert.equal(balanceOfSC, tokens('1000000'), "Wrong balance.")
        })

        it('...should check the balance of the investor\'s account', async () => {
            const balanceOfUser = await metoToken.balanceOf(user);
            assert.equal(balanceOfUser, tokens('0'), "Wrong balance.")
        })

        it("...should fail to transfer a bigger amount than the balance of the owner to the user", async () => {
            await truffleAssert.reverts(metoToken.transfer.call(user, tokens('1000001')));
        })

        it("...should be able to transfer a normal amount to the user", async () => {
            const result = await metoToken.transfer.call(user, tokens('500000'), { from: owner })
            assert.equal(result, true, "Was not able to transfer a normal amount to the user")
        })

        it("...should transfer a normal amount to the user and emit an event", async () => {
           const receipt = await metoToken.transfer(user, tokens('500000'), { from: owner })
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, owner, 'should log the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, user, 'should log the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, tokens('500000'), 'should log the transfer amount');
        })

        it("...should obtain the remaining balance of owner correctly", async () => {
            const balanceOfOwner = await metoToken.balanceOf(owner);
            assert.equal(balanceOfOwner, tokens('500000'), "Wrong balance.")
        })

        it("...should obtain the new balance of user correctly", async () => {
            const balanceOfUser = await metoToken.balanceOf(user);
            assert.equal(balanceOfUser, tokens('500000'), "Wrong balance.")
        })
    })

    describe('Give an allowance for a delegated transfer', async () => {
        it("...should show an empty allowance of the exchange.", async () => {
            const allowanceOfExchangeGivenByOwner = await metoToken.allowance(owner, exchange);
            assert.equal(allowanceOfExchangeGivenByOwner, tokens('0'), 'Should be 0 at the beginning');
        })

        it("...should be able to approve tokens for delegated transfer.", async () => {
            const result = await metoToken.approve.call(exchange, tokens('250000'))
            assert.equal(result, true, 'Not able to transfer a normal amount to the user')
        })

        it("...should approve tokens for delegated transfer.", async () => {
            const receipt = await metoToken.approve(exchange, tokens('250000'), { from: owner })
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, owner, 'should log the owner account who initiates the approval');
            assert.equal(receipt.logs[0].args._spender, exchange, 'should log the spender account');
            assert.equal(receipt.logs[0].args._value, tokens('250000'), 'should log the approval amount');
        })

        it("...should update the allowance of the exchange.", async () => {
            const allowanceOfExchangeGivenByOwner = await metoToken.allowance(owner, exchange);
            assert.equal(allowanceOfExchangeGivenByOwner, tokens('250000'), 'should be 250000 tokens at the end');
        })
    })

    describe('Handle a delegated transfer', async () => {
        it("...should fail to transfer a bigger amount than the allowed by the owner to the user", async () => {
            await truffleAssert.reverts(metoToken.transferFrom(owner, user, tokens('250001'), { from: exchange }));
        })

        it("...should be able to transfer an amount allowed by the owner to the user", async () => {
            const result = await metoToken.transferFrom.call(owner, user, tokens('250000'), { from: exchange })
            assert.equal(result, true, "Was not able to transfer a normal amount to the user")
        })

        it("...should be able to transfer the amount allowed by the owner to the user", async () => {
            const receipt = await metoToken.transferFrom(owner, user, tokens('250000'), { from: exchange })
            assert.equal(receipt.logs.length, 1, 'should trigger one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, owner, 'should log the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, user, 'should log the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, tokens('250000'), 'should log the transfer amount');
        })

        it("...should check the balance of the user correctly", async () => {
            const balanceOfUser = await metoToken.balanceOf(user);
            assert.equal(balanceOfUser, tokens('750000'), "Wrong balance.")
        })

        it("...should update the allowance of the exchange.", async () => {
            const allowanceOfExchangeGivenByOwner = await metoToken.allowance(owner, exchange);
            assert.equal(allowanceOfExchangeGivenByOwner, tokens('0'), 'should be 0 tokens');
        })

        it("...should obtain the remaining balance of owner correctly", async () => {
            const balanceOfOwner = await metoToken.balanceOf(owner);
            assert.equal(balanceOfOwner, tokens('250000'), "Wrong balance.")
        })
    })
});
