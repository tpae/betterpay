pragma solidity ^0.5.8;
import "@openzeppelin/contracts/access/Roles.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";


contract BetterPayACL is Ownable {
  using Roles for Roles.Role;

  Roles.Role private admins;
  Roles.Role private arbitrators;

  // modifiers
  modifier onlyAdmin {
    require(isAdmin(), "Is not an admin.");
    _;
  }

  modifier onlyArbitrator {
    require(isArbitrator(), "Is not an arbitrator.");
    _;
  }

  // manage admins
  function addAdmin(address _admin) public onlyOwner {
    admins.add(_admin);
  }

  function removeAdmin(address _admin) public onlyOwner {
    admins.remove(_admin);
  }

  function isAdmin() public view returns (bool) {
    return isOwner() || admins.has(msg.sender);
  }

  // manage arbitrators
  function addArbitrator(address _arbitrator) public onlyAdmin {
    arbitrators.add(_arbitrator);
  }

  function removeArbitrator(address _arbitrator) public onlyAdmin {
    arbitrators.remove(_arbitrator);
  }

  function isArbitrator() public view returns (bool) {
    return isOwner() || admins.has(msg.sender) || arbitrators.has(msg.sender);
  }
}