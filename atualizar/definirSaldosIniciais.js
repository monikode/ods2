// definirSaldosIniciais.js
const Banco = artifacts.require("Banco");

module.exports = async function(callback) {
  try {
    const banco = await Banco.deployed();
    const contas = await web3.eth.getAccounts();

    for (let i = 0; i < contas.length; i++) {
      const saldoGanache = await web3.eth.getBalance(contas[i]);
      await banco.configurarValorInicial(contas[i], saldoGanache, { from: contas[0] }); 
    }

    console.log("Saldos iniciais definidos.");
    callback();
  } catch (error) {
    console.error("Erro ao definir saldos iniciais:", error);
    callback(error);
  }
};
