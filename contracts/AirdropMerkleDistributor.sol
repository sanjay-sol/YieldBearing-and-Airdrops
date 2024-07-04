// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

error AlreadyClaimed();
error InvalidProof();

contract AirdropMerkleDistributor {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public dropAmount;

    mapping(address => bool) public claimed;

    event Claimed(address indexed account, uint256 dropAmount);
    event Distributed(address[] addresses, uint256 amountPerAddress);

    constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_) {
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
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
        require(IERC20(token).transfer(account, dropAmount), "MerkleDistributor: Transfer failed");

        emit Claimed(account, dropAmount);
    }

    /**
     * @dev Distributes tokens equally among specified addresses.
     * @param addresses The array of addresses to distribute tokens to.
     */
    function distributeTokens(address[] memory addresses) public {
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
}



// pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// error AlreadyClaimed();
// error InvalidProof();

// contract MerkleDistributor {
//     using SafeERC20 for IERC20;

//     address public immutable token;
//     bytes32 public immutable merkleRoot;
//     uint256 public dropAmount;

//     mapping(address => uint256) public addressesClaimed;

//     event Claimed(address _from, uint256 _dropAmount);
//     event Distributed(address[] _addresses, uint256 _amountPerAddress);

//     constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_) {
//         token = token_;
//         merkleRoot = merkleRoot_;
//         dropAmount = dropAmount_;
//     }

//     function claim(bytes32[] calldata merkleProof) external {
//         address account = msg.sender;
//         uint256 index = addressesClaimed[account];
//         require(index == 0, "MerkleDistributor: Account not eligible for claim");

//         bytes32 node = keccak256(abi.encodePacked(account));
//         if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

//         addressesClaimed[account] = 1;
//         require(IERC20(token).transfer(account, dropAmount), "MerkleDistributor: Transfer failed");

//         emit Claimed(account, dropAmount);
//     }

//     function distributeTokens(address[] memory addresses) public {
//         uint256 totalSupply = IERC20(token).balanceOf(address(this));
//         uint256 tokensToDistribute = totalSupply / 2; // Distribute half of the tokens
//         uint256 amountPerAddress = tokensToDistribute / addresses.length;

//         for (uint256 i = 0; i < addresses.length; i++) {
//             IERC20(token).safeTransfer(addresses[i], amountPerAddress);
//         }

//         emit Distributed(addresses, amountPerAddress);
//     }
// }
