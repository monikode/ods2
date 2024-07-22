const Banco = artifacts.require("Banco");

module.exports = function (deployer) {
  deployer.deploy(Banco);
};
