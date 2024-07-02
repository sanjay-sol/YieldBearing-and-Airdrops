// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
// import {IMerkleDistributor} from "./interfaces/IMerkleDistributor.sol";

error AlreadyClaimed();
error InvalidProof();

contract MerkleDistributor {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;

    mapping(address => uint256) public addressesClaimed;

    event Claimed(address _from, uint256 _dropAmount);

    // This is a packed array of booleans.
    // mapping(uint256 => uint256) private claimedBitMap;

    constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_) {
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
    }

    // function isClaimed(uint256 index) public view returns (bool) {
    //     uint256 claimedWordIndex = index / 256;
    //     uint256 claimedBitIndex = index % 256;
    //     uint256 claimedWord = claimedBitMap[claimedWordIndex];
    //     uint256 mask = (1 << claimedBitIndex);
    //     return claimedWord & mask == mask;
    // }

    // function _setClaimed(uint256 index) private {
    //     uint256 claimedWordIndex = index / 256;
    //     uint256 claimedBitIndex = index % 256;
    //     claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    // }

    function claim(bytes32[] calldata merkleProof) external {
        address account = msg.sender;
        uint256 index = addressesClaimed[account];
        require(index == 0, "MerkleDistributor: Account not eligible for claim");

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(account));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        // Mark it claimed and send the token.
        addressesClaimed[account] = 1;
        require(IERC20(token).transfer(account, dropAmount), "MerkleDistributor: Transfer failed");

        emit Claimed(account, dropAmount);
    }
}
