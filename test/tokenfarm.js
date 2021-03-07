const { assert } = require('chai');
const { tokens } = require('../utils/tokens')
const MetoToken = artifacts.require("MetoToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");
const truffleAssert = require('truffle-assertions')
const { advanceTimeAndBlock, takeSnapshot, revertToSnapShot } = require('./advanceBlockInTime')

//break down accounts to owner and investor
contract('TokenFarm', ([owner, investor]) => {
    let daiToken, metoToken, tokenFarm, snapShot, snapShotId;
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
        let result;
        it('...the investor should have 100 DAI tokens before staking', async () => {
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')
        })
        it('...should not be able to stake 0 tokens', async () => {
            //we must first approve the tokenfarm to stake the investor's tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor });
            await truffleAssert.reverts(tokenFarm.stakeTokens(0, { from: investor }));
        })
        it('...should have an empty staking balance if not staked', async () => {
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result, 0, 'the staking balance should be 100 tokens')
        })
        it('...should not have staked', async () => {
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, false, "investor should not have staked");
        })

        it('...should have an empty stakers array', async () => {
            result = await tokenFarm.getStakers();
            assert.equal(result.length, 0, 'should be empty');
        })

        it('...should stake successfully and emit an event', async () => {
            result = await tokenFarm.stakeTokens(tokens('100'), { from: investor });
            assert.equal(result.logs.length, 1, 'should trigger one event');
            assert.equal(result.logs[0].event, 'Staked', 'should be the "Staked" event');
            assert.equal(result.logs[0].args.by, investor, 'should log the caller of the function');
            assert.equal(result.logs[0].args.amount, tokens('100'), 'should log the number of staked tokens');
        })

        it('...should have an empty balance of the investor after having staked everything', async () => {
            result = await daiToken.balanceOf(investor);
            assert.equal(result, 0, 'balance should be 0');
        })

        it('...should a staking balance of 100', async () => {
            result = await tokenFarm.stakingBalance(investor);
            assert.equal(result, tokens('100'), 'the staking balance should be 100 tokens')
        })
        it('...should have staked', async () => {
            result = await tokenFarm.hasStaked(investor);
            assert.equal(result, true, "investor should have staked");
        })
        
        it('...should retrieve the time the investor has staked as the current time', async () => {
            result = await tokenFarm.timeOfStakingFor(investor);
            resultInt = parseInt(result.toString())
            const snapShotStaking = await takeSnapshot()
            const differenceAbs = Math.abs(resultInt - parseInt(snapShotStaking.id/1000))
            //there is a slight diff between the snapshot time and the current block time that was saved, so we take this into consideration
            const isNow = differenceAbs >= 0 && differenceAbs <= 3
            assert.equal(isNow, true, `the time should be ${resultInt}, instead it's ${parseInt(snapShotStaking.id / 1000)}`);
        })

        it('...should have a stakers array length of 1', async () => {
            result = await tokenFarm.getStakers();
            //console.log(`Stakers array: ${result}`)
            assert.equal(result.length, 1, 'should have 1 address');
        })

        snapShot = await takeSnapshot();
        snapShotId = snapShot['result'];
    })

    describe('Token farm withdrawing', async () => {
        before(async function () {
            await advanceTimeAndBlock(86400)
        });
        after(async () => {
            await revertToSnapShot(snapShotId);
        });

        it('...should fail for an account that has not staked', async () => {
        await truffleAssert.reverts(tokenFarm.withdrawTokens(tokens('100'), { from: owner }));
        })

        it('...should fail if an account tries to withdraw more than they\'ve staked', async () => {
        await truffleAssert.reverts(tokenFarm.withdrawTokens(tokens('101'), { from: investor }));
        })

        it('...should not be able to withdraw 0 tokens', async () => {
        await truffleAssert.reverts(tokenFarm.withdrawTokens(tokens('0'), { from: investor }));
        })

        it('...should emit an event after withdrawing 50 tokens', async () => {
        result = await tokenFarm.withdrawTokens(tokens('50'), { from: investor });
        assert.equal(result.logs.length, 1, 'should trigger one event');
        assert.equal(result.logs[0].event, 'Withdrawn', 'should be the "Withdrawn" event');
        assert.equal(result.logs[0].args.by, investor, 'should log the caller of the function');
        assert.equal(result.logs[0].args.amount, tokens('50'), 'should log the number of staked tokens');
        })

        it('...should have staked', async () => {
        result = await tokenFarm.hasStaked(investor);
        assert.equal(result, true, "investor should have staked");
        })

        it('...should have a reduced DAI balance by 50 tokens', async () => {
        result = await daiToken.balanceOf(investor);
        assert.equal(result, tokens('50'), 'balance should be 50 tokens now');
        })

        it('...should have a balance of (50*5/100) = 2.5 new Meto tokens', async () => {
            result = await metoToken.balanceOf(investor);
            assert.equal(result, tokens('2.5'), 'balance should be 2.5 Meto tokens now');
        })

        it('...should have a staking balance of 50 tokens', async () => {
        result = await tokenFarm.stakingBalance(investor);
        assert.equal(result, tokens('50'), 'the staking balance should be 50 tokens')
        })

        it('...should not be staking any more after withdrawing everything', async () => {
        result = await tokenFarm.withdrawTokens(tokens('50'), { from: investor });
        result = await tokenFarm.hasStaked(investor);
        assert.equal(result, false, "investor should not have staked");
        })

        it('...should have an empty balance after withdrawing everything', async () => {
        result = await tokenFarm.stakingBalance(investor);
        assert.equal(result, tokens('0'), 'the staking balance should be 0 tokens')
        })

        it('...should have a balance of (50*5/100) = 2.5*2 = 5 Meto tokens', async () => {
            result = await metoToken.balanceOf(investor);
            assert.equal(result, tokens('5'), 'balance should be 5 Meto tokens now');
        })

        it('...should not be in the stakers array', async () => {
        result = await tokenFarm.getStakers();
        assert.equal(result.length, 0, 'should have 0 addresses');
        })
    })
})