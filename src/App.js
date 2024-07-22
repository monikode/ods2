import React, { useState, useEffect } from "react";
import Web3 from "web3";
import BancoArtifact from "./build/contracts/Banco.json";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

import PropTypes from "prop-types";
import { TextField } from "@mui/material";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [banco, setBanco] = useState(null);
  const [conta, setConta] = useState("");
  const [saldo, setSaldo] = useState("");
  const [saldoInicial, setSaldoInicial] = useState("");
  const [value, setValue] = React.useState(0);
  const [transacoes, setTransacoes] = useState([]);
  const [deposito, setDeposito] = useState(1);
  const [saque, setSaque] = useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3(
          Web3.givenProvider || "http://localhost:8545"
        );
        setWeb3(web3Instance);

        const contas = await web3Instance.eth.getAccounts();
        setConta(contas[0]);

        const networkId = await web3Instance.eth.net.getId();
        console.log(networkId);
        const deployedNetwork = BancoArtifact.networks[networkId];
        console.log(BancoArtifact.networks);

        if (!deployedNetwork) {
          console.error("Contrato não encontrado na rede atual.");
          return;
        }

        const contrato = new web3Instance.eth.Contract(
          BancoArtifact.abi,
          deployedNetwork.address
        );
        setBanco(contrato);

        const saldoAtual = await contrato.methods
          .saldoAtual()
          .call({ from: contas[0] });
        setSaldo(web3Instance.utils.fromWei(saldoAtual, "ether").toString());
        setSaldoInicial(
          web3Instance.utils.fromWei(saldoAtual, "ether").toString()
        );

      } catch (error) {
        console.error("Erro ao inicializar Web3:", error);
      }
    };

    initWeb3();
    extrato();
  }, []);

  const depositar = async () => {
    try {
      if (!banco) return;
      await banco.methods.depositar().send({
        from: conta,
        value: web3.utils.toWei(deposito.toString(), "ether"),
        gas: 4712388,
        gasPrice: 100000000000,
      });
      const saldoAtual = await banco.methods.saldoAtual().call({ from: conta });
      setSaldo(web3.utils.fromWei(saldoAtual, "ether").toString());
      extrato()
    } catch (error) {
      console.error("Erro ao depositar:", error);
    }
  };

  const sacar = async () => {
    try {
      if (!banco) return;
      await banco.methods.sacar(web3.utils.toWei(saque.toString(), "ether")).send({
        from: conta,
        gas: 4712388,
        gasPrice: 100000000000,
      });
      const saldoAtual = await banco.methods.saldoAtual().call({ from: conta });
      setSaldo(web3.utils.fromWei(saldoAtual, "ether").toString());
      extrato()
    } catch (error) {
      console.error("Erro ao sacar:", error);
    }
  };

  const extrato = async () => {
    try {
      if (!banco) return;

      const contas = await web3.eth.getAccounts();
      const conta = contas[0]; // Pegue a primeira conta

      // Busque eventos de depósito e saque
      const eventosDeposito = await banco.getPastEvents("Deposito", {
        filter: { conta },
        fromBlock: 0,
        toBlock: "latest",
      });

      const eventosSaque = await banco.getPastEvents("Saque", {
        filter: { conta },
        fromBlock: 0,
        toBlock: "latest",
      });


      // Combine os eventos em uma única lista
      const transacoesList = eventosDeposito
        .map((evento) => ({
          tipo: "deposito",
          valor: evento.returnValues.valor,
          data: evento.returnValues.timestamp,
        }))
        .concat(
          eventosSaque.map((evento) => ({
            tipo: "saque",
            valor: evento.returnValues.valor,
            data: evento.returnValues.timestamp,
          }))
        );

      // Atualize o estado com a lista de transações
      setTransacoes(transacoesList);
    } catch (error) {
      console.error("Erro ao buscar extrato:", error);
    }
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  return (
    <div>
      <h1>Banco dApp Saldo {saldo} ETH </h1>
      <Box sx={{ bgcolor: "background.paper" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Depositar" />
          <Tab label="Sacar" />
          <Tab label="Extrato" />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <TextField
          id="outlined-basic"
          type="number"
          label="Valor"
          variant="outlined"
          value={deposito}
          onChange={(e) => setDeposito(e.target.value)}
        />
        <Button variant="contained" onClick={depositar}>
          Depositar
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <TextField
          id="outlined-basic"
          type="number"
          label="Valor"
          variant="outlined"
          value={saque}
          onChange={(e) => setSaque(e.target.value)}
        />
        <Button variant="contained" onClick={sacar}>
          Sacar
        </Button>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <TableContainer component={Paper} style={{ marginTop: 20 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor (ETH)</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transacoes.map((transacao, index) => (
                <TableRow key={index}>
                  <TableCell>{transacao.tipo}</TableCell>
                  <TableCell>
                    {web3.utils.fromWei(transacao.valor, "ether")}
                  </TableCell>
                  <TableCell>
                    {new Date(transacao.data * 1000).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>
    </div>
  );
};

export default App;
