// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;
import "./MetoToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    address public owner;
    MetoToken public metoToken;
    DaiToken public daiToken;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => uint) public timeOfStakingFor;

    address[] public stakers;

    event Staked(address by, uint256 amount);
    event Withdrawn(address by, uint256 amount);

    constructor(MetoToken _metoToken, DaiToken _daiToken) {
        //in order to use them in other functions
        metoToken = _metoToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner of the token farm can call this function");
        _;
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

        //update time of staking
        timeOfStakingFor[msg.sender] = block.timestamp;

        // add user to stakers array only if they havent staked already,
        // because later we'd want to give them only once the issued tokens
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        //update staking status
        hasStaked[msg.sender] = true;

        emit Staked(msg.sender, _amount);
    }

    //unstake tokens - investor withdraws money (withdraw)
    //withdraw and arbitrary amount of tokens
    function withdrawTokens(uint256 _amount) public {
        require(_amount > 0, "Amount cannot be 0");
        require(_amount <= stakingBalance[msg.sender], "Cannot withdraw more than you have in your staking balance");
        require(hasStaked[msg.sender], "Caller must have staked in order to withdraw something");
        //allow them to withdraw a week after their latest stake
        require(timeOfStakingFor[msg.sender] + 1 days <= block.timestamp);

        //transfer mock dai tokens to this contract for staking
        daiToken.transfer(msg.sender, _amount);

        //transfer 5% of the withdrawn amount back in meto tokens
        metoToken.transfer(msg.sender, (_amount*5)/100);

        //update staking balance
        stakingBalance[msg.sender] -= _amount;

        //if account has withdrawn everything we need to remove them from the stakers array
        if (stakingBalance[msg.sender] == 0) {
            address[] storage arr = stakers;
            for (uint i=0; i < arr.length; i++) {
                if (arr[i] == msg.sender) {
                    arr[i] = arr[arr.length - 1];
                    arr.pop();
                    //update staking status
                    hasStaked[msg.sender] = false;
                    break;
                }
            }
        }
        emit Withdrawn(msg.sender, _amount);
    }
}