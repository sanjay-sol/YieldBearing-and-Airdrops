const { ethers } = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const data = await fs.readFile("whiteList/walletAddresses.json", "utf8");
  const participants = JSON.parse(data);
  const walletAddresses = Object.values(participants);

  const add = await fs.readFile("whiteList/PYBT_address.json", "utf8");
  const contractAddress = JSON.parse(add);
  //   const contractAddress = "0xfbC22278A96299D91d41C453234d97b4F5Eb9B2d"; // Replace with deployed contract address
  const PYBT = await ethers.getContractAt(
    "PrivateYieldBearingERC20",
    contractAddress
  );

  await network.provider.send("evm_increaseTime", [300]);
  await network.provider.send("evm_mine");

  for (const participant of walletAddresses) {
    try {
      const yieldAmount = await PYBT.calculateYield(participant);
      console.log(
        `Yield for participant ${participant}: ${ethers.utils.formatUnits(
          yieldAmount,
          18
        )} PYBT`
      );
    } catch (error) {
      console.error(`Error calculating yield for ${participant}:`, error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
