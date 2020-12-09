const TokenFarm = artifacts.require("TokenFarm");

module.exports = async (callback) => {
    console.log('Running script for issuing tokens...')
    const tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens()
    console.log('Tokens issued')
    callback()
};