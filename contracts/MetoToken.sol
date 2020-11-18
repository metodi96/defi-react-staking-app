// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.7.0;

contract MetoToken {
    //constructor 
    //set total number of tokens
    //read total number of tokens
    uint256 public totalSupply;

    constructor() public {
        totalSupply = 10000000;
    }
}