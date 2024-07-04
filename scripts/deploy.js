const { ethers } = require("hardhat");

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
    ethers.utils.solidityKeccak256(["address"], [address])
  );

  // Create the Merkle Tree
  const { MerkleTree } = require("merkletreejs");
  const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
    sortPairs: true,
  });

  // Deploy the PYBT contract
  const PYBT = await ethers.getContractFactory("PrivateYieldBearingERC20");
  const token = await PYBT.deploy(deployer.address, {
    value: ethers.utils.parseEther("1.0"),
  }); // Send 1 ETH

  // Deploy the MerkleDistributor contract
  const MerkleDistributor = await ethers.getContractFactory(
    "YieldBearingMerkleDistributor"
  );
  const distributor = await MerkleDistributor.deploy(
    token.address,
    tree.getHexRoot(),
    ethers.utils.parseEther("1.0") // Example: 1 ETH equivalent in wei
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
         "whiteList/PYBT_address.json",
            JSON.stringify(token.address)
     );

  // Distribute tokens to whitelisted addresses
  await distributor.distributeTokens(walletAddresses);

  console.log("Tokens distributed to whitelisted addresses.");
}

// Execute the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
