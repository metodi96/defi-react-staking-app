// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.7.0;

//ignore this, it is supposed to work even if it shows there's an error
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SimpleStorage.sol";

contract TestSimpleStorage {

  function testItStoresAValue() public {
    SimpleStorage simpleStorage = SimpleStorage(DeployedAddresses.SimpleStorage());

    simpleStorage.set(89);

    uint expected = 89;

    Assert.equal(simpleStorage.get(), expected, "It should store the value 89.");
  }

}
