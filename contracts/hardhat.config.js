require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    chainA: {
      url: "https://virtual.rpc.tenderly.co/Iamsid/project/private/chainA-testnet/13a320b5-3bac-4e86-b95d-854accf54c3c",
    chainId: 17371,
    accounts: ["5779fc2b84ca9360718770dcd45b18d5a48ef0108f5bbe4a782587a812db0fbb"]
    },
    chainB: {
      url: "https://virtual.rpc.tenderly.co/Iamsid/project/private/chainB-testnet/341f6445-73b5-4aa1-9d42-984516a26237",
    chainId: 17372,
    accounts: ["372909bc8ae9231121faeb94a534667c86cf3ac7b547369f3d432e23b7873862"]
    }
  }
};
