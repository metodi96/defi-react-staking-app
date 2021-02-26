//const MetoToken = artifacts.require("MetoToken");
const MetoToken = artifacts.require("MetoToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
  //await deployer.deploy(MetoToken);

  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  //accepts multiple arguments, subsequent arguments are passed to the constructor
  await deployer.deploy(MetoToken);
  const metoToken = await MetoToken.deployed();
  
  await deployer.deploy(TokenFarm, metoToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  await metoToken.transfer(tokenFarm.address, '1000000000000000000000000');
  
  //transfer some to an investor 100 DAI
  await daiToken.transfer(accounts[1], '100000000000000000000');

};
