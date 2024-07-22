const Banco = artifacts.require("Banco");


module.exports = async function(callback) {
    try {
        // Obter a instância do contrato
        const banco = await Banco.deployed();

        const contas = await web3.eth.getAccounts();

        const eventosDeposito = await banco.getPastEvents('Deposito', {
            filter: { conta: contas[0] },
            fromBlock: 0,
            toBlock: 'latest'
        });

        const eventosSaque = await banco.getPastEvents('Saque', {
            filter: { conta: contas[0] },
            fromBlock: 0,
            toBlock: 'latest'
        });

        console.log("Eventos de Depósito:");
        eventosDeposito.forEach(evento => {
            console.log(`- Conta: ${evento.returnValues.conta}`);
            console.log(`  Valor: ${web3.utils.fromWei(evento.returnValues.valor, 'ether')} ETH`);
            console.log(`  Tx Hash: ${evento.transactionHash}`);
            console.log(`  Block: ${evento.blockNumber}`);
            console.log();
        });

        console.log("Eventos de Saque:");
        eventosSaque.forEach(evento => {
            console.log(`- Conta: ${evento.returnValues.conta}`);
            console.log(`  Valor: ${web3.utils.fromWei(evento.returnValues.valor, 'ether')} ETH`);
            console.log(`  Tx Hash: ${evento.transactionHash}`);
            console.log(`  Block: ${evento.blockNumber}`);
            console.log();
        });

        callback();
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
