// test/PYBT.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PYBT Contract", function () {
  let PYBTContract;
  let pybt;
  let owner;
  let participant;

  beforeEach(async function () {
    PYBTContract = await ethers.getContractFactory("PYBT");
    [owner, participant] = await ethers.getSigners();

    // Deploy PYBT contract with initial ETH deposit of 1 ETH
    pybt = await PYBTContract.deploy(owner.address, {
      value: ethers.utils.parseEther("1"),
    });
    await pybt.deployed();
  });

  it("should deploy with correct initial ETH deposit", async function () {
    const initialEthDeposit = await ethers.provider.getBalance(pybt.address);
    expect(initialEthDeposit).to.equal(ethers.utils.parseEther("1"));
  });

  it("should allow owner to mint tokens", async function () {
    const initialTotalSupply = await pybt.totalSupply();

    await pybt.connect(owner).mint(participant.address, 1000);

    const balance = await pybt.balanceOf(participant.address);
    expect(balance).to.equal(1000);

    const newTotalSupply = await pybt.totalSupply();
    expect(newTotalSupply).to.equal(initialTotalSupply.add(1000));
  });

  it("should allow participants to deposit tokens", async function () {
    await pybt.connect(owner).mint(participant.address, 1000);
    await pybt.connect(participant).approve(pybt.address, 1000);

    await pybt.connect(participant).depositTokens(participant.address, 500);

    const participantBalance = await pybt.balanceOf(participant.address);
    expect(participantBalance).to.equal(500);

    const contractBalance = await pybt.balanceOf(pybt.address);
    expect(contractBalance).to.equal(500);
  });

  it("should calculate yield correctly", async function () {
    await pybt.connect(owner).mint(participant.address, 1000);
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 15]); // Move time forward by 15 days

    const yieldAmount = await pybt.calculateYield(participant.address);
    expect(yieldAmount).to.be.closeTo(500, 10); // Allow for minor time discrepancies
  });

  it("should allow participants to withdraw yield", async function () {
    await pybt.connect(owner).mint(participant.address, 1000);
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 30]); // Move time forward by 30 days

    await pybt.connect(participant).depositTokens(participant.address, 1000);

    const initialBalance = await pybt.balanceOf(participant.address);
    expect(initialBalance).to.equal(2000);

    await pybt.connect(participant).withdrawYield(participant.address);

    const finalBalance = await pybt.balanceOf(participant.address);
    expect(finalBalance).to.be.closeTo(2500, 10); // Account for yield calculation
  });

  it("should distribute final tokens and yield correctly", async function () {
    await pybt.connect(owner).mint(participant.address, 1000);
    await ethers.provider.send("evm_increaseTime", [60 * 60 * 24 * 30]); // Move time forward by 30 days

    await pybt.connect(participant).depositTokens(participant.address, 1000);

    await pybt.distributeFinal();

    const finalYieldAmount = await pybt.yieldAmount(participant.address);
    expect(finalYieldAmount).to.equal(500); // Assuming yield calculation was 500 tokens
  });
});
