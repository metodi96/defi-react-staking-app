var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MetoToken = artifacts.require("MetoToken");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  //accepts multiple arguments, subsequent arguments are passed to the constructor
  deployer.deploy(MetoToken, 10000000);
};
