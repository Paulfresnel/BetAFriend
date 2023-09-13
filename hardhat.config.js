require("@nomicfoundation/hardhat-toolbox");
require("dotenv");
console.log(process.env.ALCHEMY_URL);
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks:{
    mumbai:{
      url: process.env.ALCHEMY_URL,
    },
    hardhat:{},
  }
};
