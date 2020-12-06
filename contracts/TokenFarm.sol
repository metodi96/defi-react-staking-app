// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 <=0.7.5;
import "./MetoTokenV2Farm.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    MetoTokenV2Farm public metoTokenV2;
    DaiToken public daiToken;

    constructor(MetoTokenV2Farm _metoTokenV2, DaiToken _daiToken) {
        //in order to use them in other functions
        metoTokenV2 = _metoTokenV2;
        daiToken = _daiToken;
    }

}