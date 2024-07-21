// migrations/1_deploy_contracts.js
const Bank = artifacts.require("Bank");

module.exports = function(deployer) {
  deployer.deploy(Bank);
};
