const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { BigNumber } = require("ethers");
const fs = require("fs").promises;

async function main() {
  [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] =
    await ethers.getSigners();

  const walletAddresses = [
    signer1,
    signer2,
    signer3,
    signer4,
    signer5,
    signer6,
    signer7,
    signer8,
  ].map((s) => s.address);

  const leaves = walletAddresses.map((x) => KECCAK256(x));
  const tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

  const Pybt = await ethers.getContractFactory("PYBT", signer1);
  const token = await Pybt.deploy();

  const MerkleDistributor = await ethers.getContractFactory(
    "MerkleDistributor",
    signer1
  );

  const distributor = await MerkleDistributor.deploy(
    token.address,
    tree.getHexRoot(),
    BigNumber.from("1000000000000000000")
  );

  // Mint 18 tokens to the distributor contract
  const totalMintAmount = BigNumber.from("9000000000000000000");
  await token.connect(signer1).mint(distributor.address, totalMintAmount);

  console.log("PYBT address:", token.address);
  console.log("MerkleDistributor:", distributor.address);
  console.log("signer1:", signer1.address);

  const indexedAddresses = {};
  walletAddresses.forEach((x, idx) => (indexedAddresses[idx] = x));

  const serializedAddresses = JSON.stringify(indexedAddresses);
  await fs.writeFile("whiteList/walletAddresses.json", serializedAddresses);

  await distributor.distributeTokens(walletAddresses);

  console.log("Tokens distributed to whitelisted addresses.");
}

// npx hardhat run --network localhost scripts/deploy.js

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// const { MerkleTree } = require("merkletreejs");
// const KECCAK256 = require("keccak256");
// const { BigNumber } = require("ethers");
// const fs = require("fs").promises;

// async function main() {
//   [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] =
//     await ethers.getSigners();
//   walletAddresses = [
//     signer1,
//     signer2,
//     signer3,
//     signer4,
//     signer5,
//     signer6,
//     signer7,
//     signer8,
//   ].map((s) => s.address);
//   leaves = walletAddresses.map((x) => KECCAK256(x));
//   tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });
//   TofuCoin = await ethers.getContractFactory("PYBT", signer1);
//   token = await TofuCoin.deploy();
//   MerkleDistributor = await ethers.getContractFactory(
//     "MerkleDistributor",
//     signer1
//   );

//   distributor = await MerkleDistributor.deploy(
//     token.address,
//     tree.getHexRoot(),
//     BigNumber.from("1000000000000000000")
//   );

//   await token
//     .connect(signer1)
//     .mint(distributor.address, BigNumber.from("9000000000000000000"));

//   console.log("TofuCoin:", token.address);
//   console.log("MerkleDistributor:", distributor.address);
//   console.log("signer1:", signer1.address);

//   const indexedAddresses = {};
//   walletAddresses.map((x, idx) => (indexedAddresses[idx] = x));

//   const serializedAddresses = JSON.stringify(indexedAddresses);

//   await fs.writeFile("whiteList/walletAddresses.json", serializedAddresses);
// }

// // npx hardhat run --network localhost scripts/deploy.js

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
