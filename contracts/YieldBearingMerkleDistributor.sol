// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YieldBearingMerkleDistributor is Ownable {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;

    uint256 public totalYieldReceived; // Total native token yield received
    mapping(address => bool) public claimed;
    mapping(address => uint256) public yieldEarned;

    event Claimed(address indexed account, uint256 dropAmount);
    event Distributed(address[] addresses, uint256 amountPerAddress);

    constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_, address owner) Ownable(owner) {
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
    }

    /**
     * @dev Allows PrivateYieldBearingERC20 to send native token yield to this contract.
     * @param amount The amount of native tokens to receive.
     */
    function receiveYield(uint256 amount) external {
        require(msg.sender == token, "Only PrivateYieldBearingERC20 can call this function");
        totalYieldReceived += amount;
    }

    /**
     * @dev Allows an eligible account to claim tokens based on a Merkle proof.
     * @param merkleProof The Merkle proof array that proves the account's eligibility.
     */
    function claim(bytes32[] calldata merkleProof) external {
        address account = msg.sender;
        require(!claimed[account], "MerkleDistributor: Account already claimed");

        bytes32 node = keccak256(abi.encodePacked(account));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        claimed[account] = true;
        uint256 totalAmount = dropAmount + getEarnedYield(account);
        require(IERC20(token).transfer(account, totalAmount), "MerkleDistributor: Transfer failed");

        emit Claimed(account, totalAmount);
    }

    /**
     * @dev Distributes tokens equally among specified addresses.
     * @param addresses The array of addresses to distribute tokens to.
     */
    function distributeTokens(address[] memory addresses) external onlyOwner {
        uint256 totalSupply = IERC20(token).balanceOf(address(this));
        uint256 tokensToDistribute = totalSupply / 2; // Distribute half of the tokens
        uint256 amountPerAddress = tokensToDistribute / addresses.length;

        for (uint256 i = 0; i < addresses.length; i++) {
            require(!claimed[addresses[i]], "MerkleDistributor: Account already claimed");
            IERC20(token).safeTransfer(addresses[i], amountPerAddress);
            claimed[addresses[i]] = true;
        }

        emit Distributed(addresses, amountPerAddress);
    }

    /**
     * @dev Calculates the earned yield for an account based on the proportion of time held.
     * @param account The account to calculate yield for.
     */
    function getEarnedYield(address account) public view returns (uint256) {
        if (claimed[account]) return 0; // Already claimed

        uint256 totalSupply = IERC20(token).totalSupply();
        uint256 accountBalance = IERC20(token).balanceOf(account);
        uint256 yieldShare = (totalYieldReceived * accountBalance) / totalSupply;

        return yieldShare;
    }

    /**
     * @dev Internal function to verify Merkle proof.
     * @param merkleProof The Merkle proof array.
     * @param account The account to verify.
     */
    function verifyProof(bytes32[] memory merkleProof, address account) internal view returns (bool) {
        bytes32 node = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(merkleProof, merkleRoot, node);
    }

    error InvalidProof();
}
