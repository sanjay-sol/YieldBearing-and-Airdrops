

# Yield-Bearing Project
- [Interaction ](#Interaction)
## Quick Workflow

 

```
1. Initial Deployment and Token Minting
   |-> Developer deploys smart contract with 1 ETH
   |-> Contract mints tokens
       |-> Tokens represent the total supply for the protocol
       |-> Tokens will be used for distribution and yield generation

2. Airdrop to Whitelisted Participants
   |-> Tokens distributed to whitelisted addresses
       |-> Half of the minted tokens allocated for distribution
       |-> Participants receive their tokens securely
   |-> Merkle tree used for secure distribution
       |-> Ensures proof of eligibility
       |-> Prevents double-claiming of tokens

3. Participant Deposits
   |-> Participants deposit tokens
       |-> Participants transfer received tokens back into the contract
       |-> Tokens are locked in the contract for yield generation
   |-> Tokens used to generate yield
       |-> Deposited tokens contribute to the total pool
       |-> Yield is calculated based on the pooled tokens

4. Yield Generation
   |-> Yield generated over 30 days
       |-> Yield accrues daily based on the total deposits
       |-> Yield rate determined by the contract parameters
       |-> Total yield is added to the contract’s balance over time

5. Withdrawals During Yield Period
   |-> Participants can withdraw tokens and yield
       |-> Participants can withdraw deposited tokens plus accrued yield
       |-> Withdrawals reduce the participant's deposit amount
   |-> Merkle tree reconstructed on withdrawals
       |-> Merkle tree is updated to reflect withdrawals
       |-> Prevents double-claiming and ensures accurate balance tracking

6. Final Yield Distribution
   |-> Remaining tokens and yield distributed at end of period
       |-> After 30 days, remaining tokens and yield are calculated
       |-> Distribution proportional to each participant's deposit
   |-> Distribution done using Merkle tree
       |-> Merkle tree used to verify participant balances
       |-> Ensures fair and secure final distribution


```
### Testing the Secure Claiming 

<img width="663" alt="Screenshot 2024-07-04 at 3 29 23 PM" src="https://github.com/sanjay-sol/sanjay-sol/assets/114111046/7d8974dd-ac7f-44b5-b27b-1390c49c5161">

## Workflow Steps
#### 1. Initial Deployment and Token Minting
Deployment: The developer deploys a smart contract with an initial seed amount of one ETH.
Token Minting: The contract mints a certain number of tokens that will be used throughout the protocol.
#### 2. Airdrop to Whitelisted Participants
Airdrop: Half of the minted tokens are distributed to a set of whitelisted addresses.
Security: The distribution uses Merkle trees to ensure security and prevent double-claiming.
#### 3. Participant Deposits
Deposits: Participants who receive tokens can deposit them back into the smart contract.
Yield Eligibility: Depositing tokens allows participants to start earning yield on their holdings.
#### 4. Yield Generation
Yield Accumulation: The total tokens deposited by all participants are used to generate yield.
Duration: The yield generation period lasts for thirty days.
 #### 5. Withdrawals During Yield Period
Withdrawals: Participants can withdraw their tokens along with any accumulated yield at any time during the thirty-day period.
Security Update: When a withdrawal occurs, the Merkle tree is reconstructed to ensure no double-claiming takes place.
#### 6. Final Yield Distribution
End of Period: At the end of the thirty-day yield period, the remaining tokens and the generated yield are distributed proportionally to all participants who have not withdrawn their tokens.
Security: This final distribution also uses Merkle trees to ensure secure and accurate distribution of tokens and yield.


# Interaction

## Setting Up Development Environment

1. **Start Local Blockchain:**
   - Open Terminal 1:
     ```
     npx hardhat node
     ```
   This starts a local Ethereum blockchain with accounts pre-funded with fake ETH for testing.

2. **Compile Contracts:**
   - Open Terminal 2:
     ```
     npx hardhat compile
     ```
   Compiles your Solidity contracts defined in the project.

##  Contracts Interactions

3. **Run Airdrop Script:**
```
npx hardhat run --network localhost scripts/airdrop.js
```
Executes the airdrop script to distribute tokens based on a specified logic.

4. **Check Airdrop Balance:**
- Run:
  ```
  npx hardhat run --network localhost scripts/airdropChackbalance.js
  ```
Copy and paste the airdrop address to check the balance.

## Testing Merkle Proofs

5. **Test Claims using Merkle Proofs:**
```
npx hardhat test

```

Runs tests to validate claiming tokens using Merkle proofs.

## Yield Bearing Contract Interactions

6. **Deploy Yield Bearing Contract:**
```
npx hardhat run --network localhost scripts/deploy.js

```
Deploys the Yield Bearing contract on the local blockchain.

7. **Participant Interaction:**
```
npx hardhat run --network localhost scripts/participate.js


```
Participants interact with the contract by depositing tokens.

8. **Calculate Yield:**
```
npx hardhat run --network localhost scripts/calculateYield.js

```
Calculates the yield participants can earn based on their deposits.

9. **Withdraw Yield:**
```
npx hardhat run --network localhost scripts/withdraw.js


```
Participants withdraw their calculated yield.

10. **Verify Zero Yield After Withdrawal:**
 
   ```
   npx hardhat run --network localhost scripts/calculateYield.js
   ```
 Ensure that the withdrawn account shows zero yield after withdrawal.

11. **Final Distribution:**
 ```
 npx hardhat run --network localhost scripts/finalDistribution.js
 ```
 Automatically triggers after 30 days to distribute remaining yields.



# HTLC-Atomic-Swaps
