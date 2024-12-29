require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",

  networks: {
    ganache: {
      url: "http://localhost:7545",
      mnemonic: "rain arrange aware hamster stool bomb home barely matter spread near like",
    },
  },
};
