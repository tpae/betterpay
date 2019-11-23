pragma solidity ^0.5.8;
import "./BetterPayCore.sol";


contract BetterPay is BetterPayCore {
  // owner can withdraw the balance
  function withdrawBalance()
    public
    onlyOwner()
  {
    msg.sender.transfer(address(this).balance);
  }
}