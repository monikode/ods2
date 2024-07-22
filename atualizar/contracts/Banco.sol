// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Banco {
    address public owner;

    struct Transacao {
        string tipo; // "deposito" ou "saque"
        uint valor;
        uint data;
    }

    mapping(address => uint) private saldos;
    mapping(address => Transacao[]) private transacoes;

    event Deposito(address indexed conta, uint valor);
    event Saque(address indexed conta, uint valor);
    event SaldoAtualizado(address indexed conta, uint saldo); // Adicionado para depuração

    constructor() {
        owner = msg.sender; // Define o criador do contrato como o proprietário
    }

    function saldoAtual() public view returns (uint) {
        return saldos[msg.sender];
    }

    function configurarValorInicial(address conta, uint valorInicial) public {
    require(msg.sender == owner, "Apenas o proprietario pode configurar o valor inicial.");
    saldos[conta] = valorInicial;
    }

    function depositar() public payable {
    require(msg.value > 0, "Valor do deposito deve ser maior que zero.");
    saldos[msg.sender] += msg.value;
    transacoes[msg.sender].push(Transacao("deposito", msg.value, block.timestamp));
    emit Deposito(msg.sender, msg.value);
    emit SaldoAtualizado(msg.sender, saldos[msg.sender]); // Adicionado para depuração
    }


    function sacar(uint valor) public {
        require(valor > 0, "Valor do saque deve ser maior que zero.");
        require(saldos[msg.sender] >= valor, "Saldo insuficiente.");
        
        // Atualiza o saldo antes de transferir para evitar reentrância
        saldos[msg.sender] -= valor;
        payable(msg.sender).transfer(valor);
        transacoes[msg.sender].push(Transacao("saque", valor, block.timestamp));
        emit Saque(msg.sender, valor);
        emit SaldoAtualizado(msg.sender, saldos[msg.sender]); // Adicionado para depuração
    }

    function extrato() public view returns (Transacao[] memory) {
        return transacoes[msg.sender];
    }

    function saldoDe(address conta) public view returns (uint) {
        return saldos[conta];
    }
}
