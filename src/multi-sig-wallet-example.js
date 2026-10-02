/**
 * MultiSigWallet usage examples
 *
 * Demonstrates:
 *  1. Reading on-chain state with the MultiSigWallet client
 *  2. Deploying and interacting with the contract using ethers.js
 */

'use strict';

const MultiSigWallet = require('./multi-sig-wallet');

// ─────────────────────────────────────────────────────────────────────────────
// Example 1: Read on-chain state (no external dependencies)
// ─────────────────────────────────────────────────────────────────────────────

async function exampleReadOnChain() {
  // Replace with a real deployed MultiSignatureWallet address before running.
  // Using the zero address here is intentional as a placeholder — it will
  // result in an RPC call that returns empty data (no live contract at 0x00…00).
  const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
  const RPC_URL = 'https://ethereum.publicnode.com';

  console.log('=== MultiSigWallet — Read On-Chain State ===\n');

  const client = new MultiSigWallet(CONTRACT_ADDRESS, RPC_URL);

  try {
    const [owners, count, required] = await Promise.all([
      client.getOwners(),
      client.getTransactionCount(),
      client.getNumConfirmationsRequired(),
    ]);

    console.log('Owners:', owners);
    console.log('Transaction count:', count);
    console.log('Confirmations required:', required);

    if (Number(count) > 0) {
      const tx = await client.getTransaction(0);
      console.log('\nTransaction #0:', tx);
    }
  } catch (err) {
    console.error('Error reading on-chain state:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 2: Deploy and interact using ethers.js (requires ethers installed)
// ─────────────────────────────────────────────────────────────────────────────

async function exampleWithEthers() {
  console.log('\n=== MultiSigWallet — Deploy with ethers.js ===\n');
  console.log('Install ethers: npm install ethers');
  console.log('');

  // Illustrative snippet (not executed here — ethers may not be installed)
  const snippet = `
const { ethers } = require('ethers');
const MultiSigWallet = require('./multi-sig-wallet');

const { abi, bytecode } = MultiSigWallet;

async function deploy() {
  // Connect to a provider (e.g., MetaMask, local Hardhat node, etc.)
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const signer = await provider.getSigner();

  const owners = [
    await signer.getAddress(),
    '0xOwner2Address...',
    '0xOwner3Address...',
  ];
  const requiredConfirmations = 2; // 2-of-3

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(owners, requiredConfirmations);
  await contract.waitForDeployment();

  console.log('Deployed to:', await contract.getAddress());

  // Submit a transaction (owner only)
  const tx = await contract.submitTransaction(
    '0xRecipientAddress...',
    ethers.parseEther('0.1'),  // 0.1 ETH
    '0x'                        // empty calldata
  );
  await tx.wait();
  console.log('Transaction submitted');

  // Confirm the transaction with a second owner
  const signer2 = new ethers.Wallet('0xPRIVATE_KEY_2', provider);
  const contract2 = contract.connect(signer2);
  const confirmTx = await contract2.confirmTransaction(0);
  await confirmTx.wait();
  console.log('Transaction confirmed by owner 2');

  // Execute once threshold is reached
  const executeTx = await contract.executeTransaction(0);
  await executeTx.wait();
  console.log('Transaction executed');
}

deploy().catch(console.error);
`;

  console.log(snippet);
}

// ─────────────────────────────────────────────────────────────────────────────
// Run examples
// ─────────────────────────────────────────────────────────────────────────────

(async () => {
  await exampleReadOnChain();
  await exampleWithEthers();
})();
