const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { expect } = require("chai");

describe("MerkleDistributor", () => {
  let signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8;
  let walletAddresses,
    leaves,
    tree,
    pybt,
    token,
    MerkleDistributor,
    distributor;

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

    pybt = await ethers.getContractFactory("PYBT", signer1);
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

  describe("Testing with dummy accounts", () => {
    it("successful and unsuccessful claim", async () => {
      expect(await token.balanceOf(signer1.address)).to.be.equal(0);

      const proof = tree.getHexProof(KECCAK256(signer1.address));
      await distributor.connect(signer1).claim(proof);

      expect(await token.balanceOf(signer1.address)).to.be.equal(500);
      await expect(
        distributor.connect(signer1).claim(proof)
      ).to.be.revertedWith("MerkleDistributor: Account already claimed");

      expect(await token.balanceOf(signer1.address)).to.be.equal(500);
    });

    it("unsuccessful claim", async () => {
      const generatedAddress = "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc";
      const proof2 = tree.getHexProof(KECCAK256(generatedAddress));

      await expect(
        distributor.connect(signer1).claim(proof2)
      ).to.be.revertedWith("InvalidProof");
    });

    it("emits a successful event", async () => {
      const claimedSigner = signer1;
      // Generate Merkle proof for claimedAddress
      const proof = tree.getHexProof(KECCAK256(claimedSigner.address));
      await expect(distributor.connect(claimedSigner).claim(proof))
        .to.emit(distributor, "Claimed")
        .withArgs(claimedSigner.address, 500); // Verify the event emission with claimedAddress and 500 tokens
    });

    it("rejects invalid claims", async function () {
      const invalidAddress = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E";
      const proof = tree.getHexProof(KECCAK256(invalidAddress));

      await expect(distributor.claim(proof)).to.be.revertedWith("InvalidProof");
    });

    it("allows valid claims and prevents double claims", async function () {
      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await expect(distributor.claim(proof))
        .to.emit(distributor, "Claimed")
        .withArgs(signer1.address, 500);

      expect(await token.balanceOf(signer1.address)).to.equal(500);

      await expect(distributor.claim(proof)).to.be.revertedWith(
        "MerkleDistributor: Account already claimed"
      );
    });

    it("distributes tokens equally among whitelisted addresses", async () => {
      await distributor.distributeTokens(walletAddresses);

      const balance = await token.balanceOf(walletAddresses[0]);
      const expectedBalance = 2000 / walletAddresses.length;

      for (const address of walletAddresses) {
        expect(await token.balanceOf(address)).to.equal(expectedBalance);
      }
    });
  });
});
