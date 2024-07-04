const { ethers } = require("hardhat");
const fs = require("fs").promises;

async function main() {
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const data = await fs.readFile("whiteList/checkList.json", "utf8");
  const participants = JSON.parse(data);
  const participantAddresses = Object.values(participants);
  const Token = await ethers.getContractAt("AirdropPYBT", tokenAddress);

  for (let address of participantAddresses) {
    const balance = await Token.balanceOf(address);
    console.log(
      `Balance of ${address}: ${ethers.utils.formatUnits(balance, 18)} PYBT`
    );
  }
}

// Run the script with: npx hardhat run scripts/checkBalances.js --network localhost
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
