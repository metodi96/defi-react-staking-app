// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <=0.7.0;

contract MetoToken {
    string public name = 'Meto Token';
    string public symbol = 'MT';
    string public standard = 'Meto Token v1.0';
    uint256 public totalSupply;
    mapping (address => uint) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    constructor(uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        //now to transfer the tokens
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        //emit transfer event
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}