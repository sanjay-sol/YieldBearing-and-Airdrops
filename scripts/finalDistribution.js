const { ethers } = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const add = await fs.readFile("whiteList/PYBT_address.json", "utf8");
  const contractAddress = JSON.parse(add);
  const PYBT = await ethers.getContractAt(
    "PrivateYieldBearingERC20",
    contractAddress
  );

  try {
    await PYBT.distributeFinal();
    console.log(`Final distribution complete.`);
  } catch (error) {
    console.error(
      `Failed to distribute final tokens and yield: ${error.message}`
    );
  }
}

// Run with: npx hardhat run --network localhost scripts/finaldistribution.js
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
