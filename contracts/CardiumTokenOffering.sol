pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";

interface ERC20 {
    function transfer(address receiver, uint amount) external;
}

contract CardiumTokenOffering is Pausable{
    using SafeMath for uint256;

    uint public tokenPrice;
    ERC20 public tokenReward;

    function CardiumTokenOffering (uint _tokenPrice, address _token) public{
        tokenPrice = _tokenPrice;
        tokenReward = ERC20(_token);
    }

    function () public payable whenNotPaused {
        uint256 tokens = msg.value.div(tokenPrice);
        tokenReward.transfer(msg.sender, tokens);
    }

    function setPrice(uint256 _tokenPrice) public onlyOwner {
        tokenPrice = _tokenPrice;
    }
}