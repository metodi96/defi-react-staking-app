// SPDX-License-Identifier: MIT
pragma solidity >= 0.7.0 <=0.7.5;
import "./MetoTokenV2Farm.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    address public owner;
    MetoTokenV2Farm public metoTokenV2;
    DaiToken public daiToken;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    address[] public stakers;

    event Staked(address by, uint256 amount);

    constructor(MetoTokenV2Farm _metoTokenV2, DaiToken _daiToken) {
        //in order to use them in other functions
        metoTokenV2 = _metoTokenV2;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    function getStakers() public view returns(address[] memory) {
        return stakers;
    }

    //stake tokens - investor puts money into the app (deposit)

    function stakeTokens(uint256 _amount) public {
        require(_amount > 0, "Amount cannot be 0");
        //transfer mock dai tokens to this contract for staking

        daiToken.transferFrom(msg.sender, address(this), _amount);

        //update staking balance
        stakingBalance[msg.sender] += _amount;

        // add user to stakers array only if they havent staked already,
        // because later we'd want to give them only once the issued tokens
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        //update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;

        emit Staked(msg.sender, _amount);
    }

    //unstake tokens - investor withdraws money (withdraw)

    //issue tokens

}