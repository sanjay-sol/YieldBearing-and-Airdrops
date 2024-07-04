// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PrivateYieldBearingERC20 is ERC20, Ownable {
    uint256 public constant YIELD_DURATION = 30 days;
    uint256 public constant INITIAL_ETH_DEPOSIT = 1 ether;

    uint256 private _totalSupply;
    mapping(address => uint256) private _deposits;
    mapping(address => uint256) private _yieldWithdrawn;
    mapping(address => uint256) public yieldAmount; // Added mapping for yield amounts

    uint256 public startTimestamp;
    uint256 public endTimestamp;

    address[] private _participants;

    constructor(address initialOwner) payable ERC20("Private Yield Bearing Token", "PYBT") Ownable(initialOwner) {
        require(msg.value == INITIAL_ETH_DEPOSIT, "Initial ETH deposit must be 1 ETH");
        startTimestamp = block.timestamp;
        endTimestamp = startTimestamp + YIELD_DURATION;
        _totalSupply = 0;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        _totalSupply += amount;
        _participants.push(to);
    }

    function depositTokens(address participant, uint256 amount) external {
        require(amount > 0 && amount <= balanceOf(participant), "Invalid amount");
        _deposits[participant] += amount;
        _burn(participant, amount);
    }

    function calculateYield(address participant) public view returns (uint256) {
        uint256 timeHeld = block.timestamp - startTimestamp;
        if (timeHeld > YIELD_DURATION) {
            timeHeld = YIELD_DURATION;
        }
        uint256 amount = _deposits[participant];
        return (amount * timeHeld) / YIELD_DURATION;
    }

    function withdrawYield(address participant) external {
        require(_deposits[participant] > 0, "No deposits to withdraw");
        require(yieldAmount[participant] == 0, "Already withdrawn");

        uint256 yield = calculateYield(participant);
        yieldAmount[participant] = yield;
        _totalSupply += yield; // Increment total supply
        _yieldWithdrawn[participant] += yield; // Record withdrawn yield
        _deposits[participant] = 0;
        _mint(participant, _deposits[participant] + yield); // Mint tokens including yield
    }

    function distributeFinal() external {
        require(block.timestamp >= endTimestamp, "Yield period not ended");

        for (uint256 i = 0; i < _participants.length; i++) {
            address participant = _participants[i];
            uint256 yield = _yieldWithdrawn[participant];
            yieldAmount[participant] += yield;
            yieldAmount[participant] = 0; // Reset yield amount after distribution
        }
    }

    receive() external payable {
        require(msg.value == INITIAL_ETH_DEPOSIT, "Must send exactly 1 ETH");
    }
}
