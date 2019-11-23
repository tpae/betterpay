var BetterPay = artifacts.require("./BetterPay.sol");

module.exports = function(deployer) {
  deployer.deploy(BetterPay);
};
