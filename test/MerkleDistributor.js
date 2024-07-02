const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { expect } = require("chai");

describe("MerkleDistributor", () => {
  beforeEach(async () => {
    [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] =
      await ethers.getSigners();

    walletAddresses = [
      signer1,
      signer2,
      signer3,
      signer4,
      signer5,
      signer6,
      signer7,
      signer8,
    ].map((s) => s.address);

    leaves = walletAddresses.map((x) => KECCAK256(x));

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

    pybt = await ethers.getContractFactory("PrivateYieldBearingERC20", signer1);
    token = await pybt.deploy();

    MerkleDistributor = await ethers.getContractFactory(
      "MerkleDistributor",
      signer1
    );

    distributor = await MerkleDistributor.deploy(
      token.address,
      tree.getHexRoot(),
      500
    );

    await token.connect(signer1).mint(distributor.address, "4000");
  });

  describe("8 account tree", () => {
    it("successful and unsuccessful claim", async () => {
      expect(await token.balanceOf(signer1.address)).to.be.equal(0);

      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await distributor.connect(signer1).claim(proof);

      expect(await token.balanceOf(signer1.address)).to.be.equal(500);

      expect(distributor.connect(signer1).claim(proof)).to.be.revertedWith(
        "MerkleDistributor: Drop already claimed."
      );

      expect(await token.balanceOf(signer1.address)).to.be.equal(500);
    });

    it("unsuccessful claim", async () => {
      const generatedAddress = "0x4dE8dabfdc4D5A508F6FeA28C6f1B288bbdDc26e";
      const proof2 = tree.getHexProof(KECCAK256(generatedAddress));

      expect(distributor.connect(signer1).claim(proof2)).to.be.revertedWith(
        "MerkleDistributor: Invalid proof."
      );
    });

    it("emits a successful event", async () => {
      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await expect(distributor.connect(signer1).claim(proof))
        .to.emit(distributor, "Claimed")
        .withArgs(signer1.address, 500);
    });
  });
});
