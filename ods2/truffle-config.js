module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,  // Certifique-se de que a porta corresponde à do Ganache CLI
      network_id: "*", // Match any network id
    },
  },
  compilers: { 
    solc: {
      version: "0.8.0", // Specify compiler version
    },
  },
};
