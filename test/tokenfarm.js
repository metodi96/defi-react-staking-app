const { assert } = require('chai');

const MetoTokenV2Farm = artifacts.require("MetoTokenV2Farm");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");
const truffleAssert = require('truffle-assertions');

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
        tokenFarm = await TokenFarm.new(metoToken.address, daiToken.address)

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

    describe('Token farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name();
            assert.equal(name, 'Token Farm')
        })

        it('has a balance of 1 million meto tokens', async () => {
            const balance = await metoToken.balanceOf(tokenFarm.address);
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Token farm staking', async () => {
        it('stakes tokens', async () => {
            let result;
            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
            // Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor });

            //test if investor can invest 0 tokens
            await truffleAssert.reverts(tokenFarm.stakeTokens(0, { from: investor }));

            //check staking balance of investor
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result, 0, 'the staking balance should be 100 tokens')

            //check isStaking and hasStaked
            result = await tokenFarm.isStaking(investor);
            assert.equal(result, false, "investor should not be staking");
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, false, "investor should not have staked");

            //check stakers array - make sure you call the array and not just access it via .stakers because it will return a function
            //also full arrays can be accessed only via getter, not via the state variable which sux
            result = await tokenFarm.getStakers();
            assert.equal(result.length, 0, 'should be empty');

            //test event
            result = await tokenFarm.stakeTokens(tokens('100'), { from: investor });
            assert.equal(result.logs.length, 1, 'should trigger one event');
            assert.equal(result.logs[0].event, 'Staked', 'should be the "Staked" event');
            assert.equal(result.logs[0].args.by, investor, 'should log the caller of the function');
            assert.equal(result.logs[0].args.amount, tokens('100'), 'should log the number of staked tokens');

            //check balance of investor
            result = await daiToken.balanceOf(investor);
            assert.equal(result, 0, 'balance should be 0');

            //check staking balance of investor
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result, tokens('100'), 'the staking balance should be 100 tokens')

            //check isStaking and hasStaked
            result = await tokenFarm.isStaking(investor);
            assert.equal(result, true, "investor should be staking");
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, true, "investor should have staked");

            //check stakers array
            result = await tokenFarm.getStakers();
            console.log(`Stakers array: ${result}`)
            assert.equal(result.length, 1, 'should have 1 address');
        })
    })
})