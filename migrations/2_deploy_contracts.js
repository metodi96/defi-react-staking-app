//const MetoToken = artifacts.require("MetoToken");
const MetoTokenV2Farm = artifacts.require("MetoTokenV2Farm");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
  //await deployer.deploy(MetoToken);

  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  //accepts multiple arguments, subsequent arguments are passed to the constructor
  await deployer.deploy(MetoTokenV2Farm);
  const metoTokenV2 = await MetoTokenV2Farm.deployed();
  
  await deployer.deploy(TokenFarm, metoTokenV2.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  await metoTokenV2.transfer(tokenFarm.address, '1000000000000000000000000');
  
  //transfer some to an investor 100 DAI
  await daiToken.transfer(accounts[1], '100000000000000000000');

};
