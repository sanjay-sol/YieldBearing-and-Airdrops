require("@nomiclabs/hardhat-waffle");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.6.12",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    artifacts: "./src/artifacts",
  },
};
