const { assert } = require('chai');

const MetoTokenV2Farm = artifacts.require("MetoTokenV2Farm");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should()

const tokens = (n) => {
    return web3.utils.toWei(n, 'ether');
}

//break down accounts to owner and investor
contract('TokenFarm', ([owner, investor]) => {
    let daiToken, metoToken, tokenFarm;
    before(async () => {
        daiToken = await DaiToken.new()
        metoToken = await MetoTokenV2Farm.new()
        tokenFarm = await TokenFarm.new(daiToken.address, metoToken.address)

        //transfer all meto tokens to the token farm
        await metoToken.transfer(tokenFarm.address, tokens('1000000'))

        //transfer to investor - from accounts[0] because thats the person who deployed the daiToken and we assigned all tokens to him
        await daiToken.transfer(investor, tokens('100'), { from: owner })
    });

    describe('Mock Dai Token', async () => {
        it('has a name', async () => {
            const name = await daiToken.name();
            assert.equal(name, 'Mock Dai Token')
        })
    })

    describe('Meto Token', async () => {
        it('has a name', async () => {
            const name = await metoToken.name();
            assert.equal(name, 'Meto Token Farm')
        })
    })

    describe('Token farm', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Token Farm')
        })

        it('has a balance of 1 million meto tokens', async () => {
            const balance = await metoToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'))
        })


    })
})