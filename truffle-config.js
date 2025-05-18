const HDWalletProvider = require('@truffle/hdwallet-provider');

// Replace with your mnemonic and Infura project ID
const mnemonic = 'YOUR_MNEMONIC'; // Your MetaMask seed phrase = the security code
const infuraProjectId = 'YOUR_INFURA_PROJECT_ID'; // Your Infura project ID

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
    sepolia: {
      provider: () => new HDWalletProvider(
        mnemonic,
        `https://sepolia.infura.io/v3/${infuraProjectId}`
      ),
      network_id: 11155111, // Sepolia's network ID
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
