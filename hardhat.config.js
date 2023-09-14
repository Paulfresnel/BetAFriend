require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

console.log(process.env.ALCHEMY_URL);
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "polygon_mumbai",
  networks: {
    hardhat: {
    },
    polygon_mumbai: {
      url: process.env.ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ALCHEMY_URL
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};
