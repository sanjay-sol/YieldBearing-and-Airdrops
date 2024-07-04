const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = require("ethers/lib/utils");

async function main() {
  const [
    deployer,
    signer2,
    signer3,
    signer4,
    signer5,
    signer6,
    signer7,
    signer8,
  ] = await ethers.getSigners();

  const walletAddresses = [
    deployer.address,
    signer2.address,
    signer3.address,
    signer4.address,
    signer5.address,
    signer6.address,
    signer7.address,
    signer8.address,
  ];

  const leaves = walletAddresses.map((address) =>
    ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address"], [address])
    )
  );

  // Creating  the Merkle Tree with the initial wallet addresses
  const tree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });

  const PYBT = await ethers.getContractFactory("PrivateYieldBearingERC20");
  const token = await PYBT.deploy(deployer.address, {
    value: ethers.utils.parseEther("1.0"),
  }); 

  // Deploy the MerkleDistributor contract
  const MerkleDistributor = await ethers.getContractFactory(
    "YieldBearingMerkleDistributor"
  );
  const distributor = await MerkleDistributor.deploy(
    token.address,
    tree.getHexRoot(),
    ethers.utils.parseEther("1.0"), // 1 ETH equivalent in wei ( as per Assignment requirement )
    deployer.address 
  );

  // Mint tokens to the distributor contract
  const totalMintAmount = ethers.utils.parseEther("9.0"); // 9 ETH equivalent in wei
  await token.connect(deployer).mint(distributor.address, totalMintAmount);

  console.log("PYBT Token deployed to:", token.address);
  console.log("MerkleDistributor deployed to:", distributor.address);
  console.log("Distributor deployed by:", deployer.address);

  // Store wallet addresses in a JSON file
  const fs = require("fs").promises;
  const indexedAddresses = walletAddresses.reduce((acc, address, index) => {
    acc[index] = address;
    return acc;
  }, {});

  await fs.writeFile(
    "whiteList/walletAddresses.json",
    JSON.stringify(indexedAddresses)
  );

  await fs.writeFile(
    "whiteList/PYBT_Address.json",
    JSON.stringify(token.address)
  );

  await distributor.distributeTokens(walletAddresses);

  console.log("Tokens distributed to whitelisted addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
