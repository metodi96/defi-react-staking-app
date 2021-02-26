const { assert } = require('chai');
const { tokens } = require('../utils/tokens')
const MetoToken = artifacts.require("MetoToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");
const truffleAssert = require('truffle-assertions')

require('chai')
    .use(require('chai-as-promised'))
    .should()

//break down accounts to owner and investor
contract('TokenFarm', ([owner, investor]) => {
    let daiToken, metoToken, tokenFarm;
    before(async () => {
        daiToken = await DaiToken.new()
        metoToken = await MetoToken.new()
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
            assert.equal(name, 'Meto Token')
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
            //console.log(`Stakers array: ${result}`)
            assert.equal(result.length, 1, 'should have 1 address');
        })
    })

    describe('Token Farm issuing', async () => {
        it('should issue the same amount of tokens that the investor has staked', async () => {
            let result;
            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct before issuing since hes staked them already')

            result = await metoToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Meto Token wallet balance correct before being issued the new tokens')

            //only the owner can issue so this must fail
            await truffleAssert.reverts(tokenFarm.issueTokens({ from: investor }));

            //test event
            result = await tokenFarm.issueTokens({ from: owner });
            assert.equal(result.logs.length, 1, 'should trigger one event');
            assert.equal(result.logs[0].event, 'Issued', 'should be the "Issued" event');
            assert.equal(result.logs[0].args.to, investor, 'should log the addressee of the issuing');
            assert.equal(result.logs[0].args.amount, tokens('100'), 'should log the number of staked tokens');

            result = await metoToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor should possess Meto Tokens now')

            result = await metoToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('999900'), 'owner should be short of 100 tokens')
        })
    })

    describe('Token farm withdrawing', async () => {
        it('should withdraw an arbitrary amount of tokens fewer than the staking balance', async () => {
            let result;
            // Check investor balance before staking
            result = await metoToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor should be in possession of the metoTokens')

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor should have 0 dai tokens')

            //test if owner aka an account that hasnt staked can withdraw
            await truffleAssert.reverts(tokenFarm.withdrawTokens(tokens('100'), { from: owner }));

            //test if investor can withdraw more than he or she has
            await truffleAssert.reverts(tokenFarm.withdrawTokens(tokens('101'), { from: investor }));

            //test if investor can withdraw 0 tokens
            await truffleAssert.reverts(tokenFarm.withdrawTokens(tokens('0'), { from: investor }));

            //check isStaking and hasStaked
            result = await tokenFarm.isStaking(investor);
            assert.equal(result, true, "investor should be staking");
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, true, "investor should have staked");

            //check stakers array - make sure you call the array and not just access it via .stakers because it will return a function
            //also full arrays can be accessed only via getter, not via the state variable which sux
            result = await tokenFarm.getStakers();
            assert.equal(result.length, 1, 'should not be empty');

            //test event
            result = await tokenFarm.withdrawTokens(tokens('50'), { from: investor });
            assert.equal(result.logs.length, 1, 'should trigger one event');
            assert.equal(result.logs[0].event, 'Withdrawn', 'should be the "Withdrawn" event');
            assert.equal(result.logs[0].args.by, investor, 'should log the caller of the function');
            assert.equal(result.logs[0].args.amount, tokens('50'), 'should log the number of staked tokens');

            result = await tokenFarm.isStaking(investor);
            assert.equal(result, true, "investor should be staking");
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, true, "investor should have staked");

            //check balance of investor
            result = await daiToken.balanceOf(investor);
            assert.equal(result, tokens('50'), 'balance should be 50 tokens now');

            //check staking balance of investor
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result, tokens('50'), 'the staking balance should be 50 tokens')


            result = await tokenFarm.withdrawTokens(tokens('50'), { from: investor });

            //check isStaking and hasStaked
            result = await tokenFarm.isStaking(investor);
            assert.equal(result, false, "investor should not be staking");
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, false, "investor should not have staked");

            //check staking balance of investor
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result, tokens('0'), 'the staking balance should be 0 tokens')

            //check stakers array
            result = await tokenFarm.getStakers();
            //console.log(`Stakers array: ${result}`)
            assert.equal(result.length, 0, 'should have 0 addresses');
        })
    })
})