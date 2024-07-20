import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import BankContract from './contracts/Bank.json';

const App = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BankContract.networks[networkId];
      const instance = new web3.eth.Contract(
        BankContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      setContract(instance);

      const balance = await instance.methods.balances(accounts[0]).call();
      setBalance(balance);
    };

    init();
  }, []);

  const handleDeposit = async () => {
    await contract.methods.deposit().send({ from: account, value: Web3.utils.toWei(amount, 'ether') });
    const balance = await contract.methods.balances(account).call();
    setBalance(balance);
  };

  const handleWithdraw = async () => {
    await contract.methods.withdraw(Web3.utils.toWei(amount, 'ether')).send({ from: account });
    const balance = await contract.methods.balances(account).call();
    setBalance(balance);
  };

  return (
    <div>
      <h1>Bank Transactions DApp</h1>
      <p>Your account: {account}</p>
      <p>Balance: {Web3.utils.fromWei(balance, 'ether')} ETH</p>
      <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in ETH" />
      <button onClick={handleDeposit}>Deposit</button>
      <button onClick={handleWithdraw}>Withdraw</button>
    </div>
  );
};

export default App;
