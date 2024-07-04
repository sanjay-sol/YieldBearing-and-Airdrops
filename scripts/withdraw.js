const { ethers } = require("hardhat");
const fs = require("fs").promises;

async function main() {
  //   const walletAddresses = require("./whiteList/walletAddresses.json");
  const data = await fs.readFile("whiteList/checkList.json", "utf8");
  const participants = JSON.parse(data);
  const walletAddresses = Object.values(participants);
  const add = await fs.readFile("whiteList/PYBT_address.json", "utf8");
  const contractAddress = JSON.parse(add);
  const PYBT = await ethers.getContractAt(
    "PrivateYieldBearingERC20",
    contractAddress
  );
  const index = 4;
  const participant = walletAddresses[index];
  try {
    await PYBT.withdrawYield(participant);
    console.log(`Withdrawn yield for participant ${participant}`);
  } catch (error) {
    console.error(
      `Failed to withdraw yield for participant ${participant}: ${error.message}`
    );
  }
}

// Run with: npx hardhat run --network localhost scripts/withdraw.js
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
