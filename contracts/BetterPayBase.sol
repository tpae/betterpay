pragma solidity ^0.5.8;
import "@openzeppelin/contracts/math/SafeMath.sol";


contract BetterPayBase {
  using SafeMath for uint256;

  struct Participant {
    // account address of the participant
    address payable account;

    // participant confirmation status
    bool confirmation;
  }

  struct Escrow {
    // either seller or buyer can be the owner
    address owner;

    // seller
    Participant seller;

    // buyer
    Participant buyer;

    // render manifest
    bytes32 manifest;

    // current balance
    uint256 balance;

    // target amount
    uint256 targetAmount;

    // indicate whether escrow has been finalized
    bool finalized;

    // indicate whether escrow has been disputed
    bool disputed;
  }
}