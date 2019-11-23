pragma solidity ^0.5.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./BetterPayEscrow.sol";
import "./BetterPayACL.sol";


contract BetterPayCore is BetterPayEscrow, BetterPayACL {
  using SafeMath for uint256;

  event SettleDispute(bytes32 indexed manifest, address abitrator, bytes32 digest);
  event PushRefund(bytes32 indexed manifest, address abitrator, bytes32 digest);
  event PushDisburse(bytes32 indexed manifest, address abitrator, bytes32 digest);

  // admin functions
  function addDisputeAdminData(bytes32 _manifest, bytes32 _digest)
    public
    onlyAdmin()
  {
    emit DisputeData(_manifest, msg.sender, _digest);
  }

  function forceSettleDispute(bytes32 _manifest, bytes32 _digest)
    public
    onlyAdmin()
  {
    Escrow storage escrow = escrows[_manifest];
    escrow.disputed = false;
    emit SettleDispute(_manifest, msg.sender, _digest);
  }

  function forcePushRefund(bytes32 _manifest, bytes32 _digest)
    public
    onlyAdmin()
  {
    emit PushRefund(_manifest, msg.sender, _digest);
    _issueRefund(_manifest, _digest);
  }

  function forcePushDisburse(bytes32 _manifest, bytes32 _digest)
    public
    onlyAdmin()
  {
    emit PushDisburse(_manifest, msg.sender, _digest);
    _disbursePayment(_manifest, _digest);
  }

  // arbitrator functions
  function addDisputeArbitratorData(bytes32 _manifest, bytes32 _digest)
    public
    onlyArbitrator()
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == true, "Dispute must be in progress.");
    emit DisputeData(_manifest, msg.sender, _digest);
  }

  function settleDispute(bytes32 _manifest, bytes32 _digest)
    public
    onlyArbitrator()
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == true, "Dispute must be in progress.");
    escrow.disputed = false;
    emit SettleDispute(_manifest, msg.sender, _digest);
  }

  function pushRefund(bytes32 _manifest, bytes32 _digest)
    public
    onlyArbitrator()
    notFinal(_manifest)
  {
    emit PushRefund(_manifest, msg.sender, _digest);
    _issueRefund(_manifest, _digest);
  }

  function pushDisburse(bytes32 _manifest, bytes32 _digest)
    public
    onlyArbitrator()
    notFinal(_manifest)
  {
    emit PushDisburse(_manifest, msg.sender, _digest);
    _disbursePayment(_manifest, _digest);
  }
}