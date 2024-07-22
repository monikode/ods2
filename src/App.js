import React, { useState, useEffect } from "react";
import Web3 from "web3";
import BancoArtifact from "./build/contracts/Banco.json";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [banco, setBanco] = useState(null);
  const [conta, setConta] = useState("");
  const [saldo, setSaldo] = useState("");
  const [saldoInicial, setSaldoInicial] = useState("");
  const [saldoAposDeposito, setSaldoAposDeposito] = useState("");
  const [saldoAposSaque, setSaldoAposSaque] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      // Configurar Web3
      const web3Instance = new Web3(
        Web3.givenProvider || "http://localhost:8545"
      );
      setWeb3(web3Instance);

      // Obter contas
      const contas = await web3Instance.eth.getAccounts();
      setConta(contas[0]);

      for (let i = 0; i < contas.length; i++) {
        const saldoGanache = await web3Instance.eth.getBalance(contas[i]);
        await banco.configurarValorInicial(contas[i], saldoGanache, { from: contas[0] }); 
      }
      

      // Obter o contrato
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = BancoArtifact.networks[networkId];
      const contrato = new web3Instance.eth.Contract(
        BancoArtifact.abi,
        deployedNetwork && deployedNetwork.address
      );
      setBanco(contrato);


     

      // Verificar saldo inicial
      const saldo = await contrato.methods
        .saldoAtual()
        .call({ from: contas[0] });

      setSaldo(web3Instance.utils.fromWei(saldo, "ether").toString());
      setSaldoInicial(web3Instance.utils.fromWei(saldo, "ether").toString());
    };

    initWeb3();
  }, []);

  const depositar = async () => {
    try {
      await banco.methods.depositar().send({
        from: conta,
        value: web3.utils.toWei("8", "ether"), // Valor reduzido para testes
        gas: 4712388,
        gasPrice: 100000000000,
      });
      const saldo = await banco.methods.saldoAtual().call({ from: conta });
      setSaldo(web3.utils.fromWei(saldo, "ether").toString());
    } catch (error) {
      console.error("Erro ao depositar:", error);
    }
  };

  const sacar = async () => {
    try {
      await banco.methods.sacar(web3.utils.toWei("1.5", "ether")).send({
        from: conta,
        gas: 4712388,
        gasPrice: 100000000000,
      });
      const saldo = await banco.methods.saldoAtual().call({ from: conta });
      setSaldo(web3.utils.fromWei(saldo, "ether").toString());
    } catch (error) {
      console.error("Erro ao sacar:", error);
    }
  };

  const extrato = async () => {

    const contas = await web3.eth.getAccounts();

    const eventosDeposito = await banco.getPastEvents("Deposito", {
      filter: { conta: contas[0] },
      fromBlock: 0,
      toBlock: "latest",
    });

    const eventosSaque = await banco.getPastEvents("Saque", {
      filter: { conta: contas[0] },
      fromBlock: 0,
      toBlock: "latest",
    });

    console.log("Eventos de Depósito:");
    eventosDeposito.forEach((evento) => {
      console.log(`- Conta: ${evento.returnValues.conta}`);
      console.log(
        `  Valor: ${web3.utils.fromWei(evento.returnValues.valor, "ether")} ETH`
      );
      console.log(`  Tx Hash: ${evento.transactionHash}`);
      console.log(`  Block: ${evento.blockNumber}`);
      console.log();
    });

    console.log("Eventos de Saque:");
    eventosSaque.forEach((evento) => {
      console.log(`- Conta: ${evento.returnValues.conta}`);
      console.log(
        `  Valor: ${web3.utils.fromWei(evento.returnValues.valor, "ether")} ETH`
      );
      console.log(`  Tx Hash: ${evento.transactionHash}`);
      console.log(`  Block: ${evento.blockNumber}`);
      console.log();
    });
  };

  return (
    <div>
      <h1>Banco dApp</h1>
      <h1>Saldo {saldo} ETH </h1>
      <h1>Saldo inicial {saldoInicial} ETH </h1>
      <div>
        <button onClick={depositar}>Depositar 8 ETH</button>
        <button onClick={sacar}>Sacar 1.5 ETH</button>
        <button onClick={extrato}>extrato</button>
      </div>
    </div>
  );
};

export default App;
