pragma solidity ^0.5.8;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./BetterPayBase.sol";


contract BetterPayEscrow is BetterPayBase {
  using SafeMath for uint256;

  event EscrowStarted(bytes32 indexed manifest, bytes32 digest);
  event PaymentReceived(bytes32 indexed manifest, uint256 amount, address sender, bytes32 digest);
  event BuyerConfirmed(bytes32 indexed manifest, bytes32 digest);
  event SellerConfirmed(bytes32 indexed manifest, bytes32 digest);
  event DisputeOpened(bytes32 indexed manifest, bytes32 digest);
  event DisputeData(bytes32 indexed manifest, address owner, bytes32 digest);
  event DisputeClosed(bytes32 indexed manifest, bytes32 digest);
  event RefundIssued(bytes32 indexed manifest, uint256 amount, address receiver, bytes32 digest);
  event PaymentDisbursed(bytes32 indexed manifest, uint256 amount, uint256 fee, address receiver, bytes32 digest);

  // list of escrows
  mapping(bytes32 => Escrow) internal escrows;

  // commission rate
  uint256 commission = 50; // 0.5% in basis points (parts per 10,000)

  // modifiers
  modifier onlyBuyer(bytes32 _manifest) {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.buyer.account != address(0), "Buyer must exist.");
    require(msg.sender == escrow.buyer.account, "Must be a buyer.");
    _;
  }

  modifier onlySeller(bytes32 _manifest) {
    Escrow storage escrow = escrows[_manifest];
    require(msg.sender == escrow.seller.account, "Must be a seller.");
    _;
  }

  modifier notFinal(bytes32 _manifest) {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.finalized == false, "Escrow should not be finalized.");
    _;
  }

  // start escrow
  function startEscrow(
    address payable _buyer,
    address payable _seller,
    uint256 _targetAmount,
    bytes32 _manifest,
    bytes32 _digest
  )
    public
  {
    require(escrows[_manifest].manifest == 0, "Manifest already exists.");
    bytes32 manifest = _createEscrow(
      _buyer,
      _seller,
      _targetAmount,
      _manifest
    );

    emit EscrowStarted(manifest, _digest);
  }

  // get escrow
  function getEscrow(bytes32 _manifest)
    public
    view
    returns (
      address buyer,
      bool buyerConfirmed,
      address seller,
      bool sellerConfirmed,
      bytes32 manifest,
      uint256 balance,
      uint256 targetAmount,
      bool finalized,
      bool disputed
    )
  {
    Escrow storage escrow = escrows[_manifest];
    return (
      escrow.buyer.account,
      escrow.buyer.confirmation,
      escrow.seller.account,
      escrow.seller.confirmation,
      escrow.manifest,
      escrow.balance,
      escrow.targetAmount,
      escrow.finalized,
      escrow.disputed
    );
  }

  // make payment to escrow
  function makePayment(bytes32 _manifest, bytes32 _digest)
    public
    payable
  {
    Escrow storage escrow = escrows[_manifest];
    uint256 newBalance = msg.value + escrow.balance;
    require(msg.value > 0, "Payment needs to be more than zero.");
    require(newBalance <= escrow.targetAmount, "Cannot exceed the target amount.");
    require(escrow.disputed == false, "There shouldn't be any disputes.");

    // allows sender to become the buyer.
    if (escrow.buyer.account == address(0)) {
      // if buyer account is 0, then set the account to the sender.
      escrow.buyer.account = msg.sender;
    }

    // update new balance
    escrow.balance = newBalance;
    emit PaymentReceived(
      _manifest,
      msg.value,
      msg.sender,
      _digest
    );
  }

  // confirm seller
  function confirmSeller(bytes32 _manifest, bytes32 _digest)
    public
    onlySeller(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.seller.confirmation == false, "Seller has already confirmed.");

    // update confirmation
    escrow.seller.confirmation = true;
    emit SellerConfirmed(_manifest, _digest);
  }

  // confirm buyer
  function confirmBuyer(bytes32 _manifest, bytes32 _digest)
    public
    onlyBuyer(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.buyer.confirmation == false, "Buyer has already confirmed.");
    require(escrow.buyer.account != address(0), "Buyer must exist to confirm.");

    // update confirmation
    escrow.buyer.confirmation = true;
    emit BuyerConfirmed(_manifest, _digest);
  }

  // open dispute
  function openDispute(bytes32 _manifest, bytes32 _digest)
    public
    onlyBuyer(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == false, "Dispute has already started.");

    // set dispute to true
    escrow.disputed = true;
    emit DisputeOpened(_manifest, _digest);
  }

  // add dispute buyer data
  function addDisputeBuyerData(bytes32 _manifest, bytes32 _digest)
    public
    onlyBuyer(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == true, "Dispute must be in progress.");
    emit DisputeData(_manifest, msg.sender, _digest);
  }

  // add dispute seller data
  function addDisputeSellerData(bytes32 _manifest, bytes32 _digest)
    public
    onlySeller(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == true, "Dispute must be in progress.");
    emit DisputeData(_manifest, msg.sender, _digest);
  }

  // close dispute
  function closeDispute(bytes32 _manifest, bytes32 _digest)
    public
    onlyBuyer(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == true, "Dispute is not started.");

    // set dispute to false
    escrow.disputed = false;
    emit DisputeClosed(_manifest, _digest);
  }

  // issue refund back to the buyer
  function issueRefund(bytes32 _manifest, bytes32 _digest)
    public
    onlySeller(_manifest)
    notFinal(_manifest)
  {
    _issueRefund(_manifest, _digest);
  }

  // disburse payment
  function disbursePayment(bytes32 _manifest, bytes32 _digest)
    public
    onlySeller(_manifest)
    notFinal(_manifest)
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.disputed == false, "There shouldn't be any disputes.");
    require(escrow.buyer.confirmation == true, "Buyer must confirm.");
    require(escrow.seller.confirmation == true, "Seller must confirm.");
    _disbursePayment(_manifest, _digest);
  }

  // check to see if target amount is met with balance
  function confirmedTargetAmount(bytes32 _manifest)
    public
    view
    returns (bool)
  {
    Escrow storage escrow = escrows[_manifest];
    return escrow.balance == escrow.targetAmount;
  }

  // issue refund back to the buyer
  function _issueRefund(
    bytes32 _manifest,
    bytes32 _digest
  )
    internal
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.balance > 0, "Balance must be greater than 0.");
    require(escrow.buyer.account != address(0), "Buyer must exist.");

    // send refund and finalize
    escrow.finalized = true;
    uint256 amountToTransfer = escrow.balance;
    escrow.buyer.account.transfer(amountToTransfer);
    emit RefundIssued(
      _manifest,
      amountToTransfer,
      escrow.buyer.account,
      _digest
    );
  }

  // disburse payment to seller
  function _disbursePayment(
    bytes32 _manifest,
    bytes32 _digest
  )
    internal
  {
    Escrow storage escrow = escrows[_manifest];
    require(escrow.balance > 0, "Balance must be greater than 0.");

    // send fund and finalize
    escrow.finalized = true;

    // subtract fee
    uint256 fee = commission * escrow.balance / 10000;
    uint256 amountToTransfer = escrow.balance - fee;
    escrow.seller.account.transfer(amountToTransfer);
    emit PaymentDisbursed(
      _manifest,
      amountToTransfer,
      fee,
      escrow.seller.account,
      _digest
    );
  }

  // create new escrow
  function _createEscrow(
    address payable _buyer,
    address payable _seller,
    uint256 _targetAmount,
    bytes32 _manifest
  )
    internal
    returns (bytes32)
  {
    require(_targetAmount > 0, "targetAmount cannot be zero.");
    Escrow memory escrow = Escrow({
      owner: msg.sender,
      buyer: Participant({
        account: _buyer,
        confirmation: false
      }),
      seller: Participant({
        account: _seller,
        confirmation: false
      }),
      manifest: _manifest,
      balance: 0,
      targetAmount: _targetAmount,
      finalized: false,
      disputed: false
    });

    escrows[_manifest] = escrow;

    return escrow.manifest;
  }
}