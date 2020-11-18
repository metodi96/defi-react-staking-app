var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var MetoToken = artifacts.require("MetoToken");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(MetoToken);
};
