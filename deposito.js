
const Banco = artifacts.require("Banco");

module.exports = async function(callback) {
  try {
    //conta do Ganache
    const contas = await web3.eth.getAccounts();

    //instância do contrato
    const banco = await Banco.deployed();

    await banco.depositar({ from: contas[0], value: web3.utils.toWei('1', 'ether') });

    const saldo = await banco.saldoAtual({ from: contas[0] });
    console.log("Saldo após o depósito:", web3.utils.fromWei(saldo.toString(), 'ether'), "ETH");

    callback();
  } catch (error) {
    console.error("Erro ao realizar o depósito:", error);
    callback(error);
  }
};
