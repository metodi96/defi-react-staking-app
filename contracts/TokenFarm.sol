// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;
import "./MetoToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    address public owner;
    MetoToken public metoToken;
    DaiToken public daiToken;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    address[] public stakers;

    event Staked(address by, uint256 amount);
    event Withdrawn(address by, uint256 amount);
    event Issued(address to, uint256 amount);

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
    //withdraw and arbitrary amount of tokens
    function withdrawTokens(uint256 _amount) public {
        require(_amount > 0, "Amount cannot be 0");
        require(_amount <= stakingBalance[msg.sender], "Cannot withdraw more than you have in your staking balance");
        require(hasStaked[msg.sender], "Caller must have staked in order to withdraw something");
        //transfer mock dai tokens to this contract for staking

        daiToken.transfer(msg.sender, _amount);

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
                    isStaking[msg.sender] = false;
                    break;
                }
            }
        }
        emit Withdrawn(msg.sender, _amount);
    }

    //issue tokens
    function issueTokens() public onlyOwner {
        //issue tokens which are the same amount as the tokens the user has staked
        for (uint256 i = 0; i < stakers.length; i++) {
            if (stakingBalance[stakers[i]] > 0 ) {
                metoToken.transfer(stakers[i], stakingBalance[stakers[i]]);
                emit Issued(stakers[i], stakingBalance[stakers[i]]);
            }
        }
    }
}