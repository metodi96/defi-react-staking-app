// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;

contract DaiToken {
    string public name = 'Mock Dai Token';
    string public symbol = 'mDAI';
    string public standard = 'Mock Dai Token v1.0';
    uint256 public totalSupply = 1000000000000000000000000;
    mapping (address => uint) public balanceOf;
    mapping (address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    //I the owner approve the spender to spend _value amount of tokens
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    constructor() {
        balanceOf[msg.sender] = totalSupply;
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

    //spender is the account that we want to approve to send on our behalf (e.g. address of an exchange)
    function approve(address _spender, uint256 _value) public returns (bool success) {
        //handle allowance and approve event
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    //delegated transfer
    //3 accounts msg.sender, transfer from and transfer to
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}