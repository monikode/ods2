
const Banco = artifacts.require("Banco");

module.exports = async function(callback) {
  try {
    //(a primeira conta por padrão)
    const contas = await web3.eth.getAccounts();
    const contaRemetente = contas[0];

    const valorSaque = web3.utils.toWei('1', 'ether');

    const banco = await Banco.deployed();


    await banco.sacar(valorSaque, { from: contaRemetente });


    const saldoAtual = await banco.saldoAtual({ from: contaRemetente });
    console.log("Saldo após o saque:", web3.utils.fromWei(saldoAtual.toString(), 'ether'));

    callback();
  } catch (error) {
    console.error("Erro ao realizar saque:", error);
    callback(error);
  }
};
