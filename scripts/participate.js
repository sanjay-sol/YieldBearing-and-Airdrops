const { ethers } = require("hardhat");
const fs = require("fs").promises;
async function main() {
  const data = await fs.readFile("whiteList/walletAddresses.json", "utf8");
  const participants = JSON.parse(data);
  const participantAddresses = Object.values(participants);

  const add = await fs.readFile("whiteList/PYBT_address.json", "utf8");
  const contractAddress = JSON.parse(add);
  const PYBT = await ethers.getContractAt(
    "PrivateYieldBearingERC20",
    contractAddress
  );

  for (let index in participantAddresses) {
    const participant = participantAddresses[index];
    const depositAmount = Math.random() * 0.56; // Random amount between 0 and 0.56 ( assuming each whitiste participant will deposit between 0 and 0.56 PYBT)
    await PYBT.depositTokens(
      participant,
      ethers.utils.parseEther(depositAmount.toString())
    );
    console.log(
      `Deposited ${depositAmount} PYBT for participant ${participant}`
    );
  }
}

// Run with: npx hardhat run --network localhost scripts/participate.js
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
