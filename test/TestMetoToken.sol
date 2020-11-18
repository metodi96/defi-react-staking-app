// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.7.0;

//ignore this, it is supposed to work even if it shows there's an error
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MetoToken.sol";

contract TestMetoToken {

  function testItSetsTotalSupplyOnDeploy() public {
    MetoToken metoToken = MetoToken(DeployedAddresses.MetoToken());
    uint expected = 10000000;
    Assert.equal(metoToken.totalSupply(), expected, "It should set the value 10000000 to the total supply.");
  }

}