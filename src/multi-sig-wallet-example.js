/**
 * MultiSigWallet usage examples
 *
 * Demonstrates:
 *  1. Reading on-chain state with the MultiSigWallet client
 *  2. Deploying and interacting with the contract using ethers.js
 *  3. Fetching a verified ABI from Etherscan using ContractABIFetcher
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
// Example 2: Fetch verified ABI from Etherscan
// ─────────────────────────────────────────────────────────────────────────────

async function exampleFetchABIFromEtherscan() {
  console.log('\n=== MultiSigWallet — Fetch Verified ABI from Etherscan ===\n');
  console.log('Requires: ETHERSCAN_API_KEY environment variable\n');

  const snippet = `
const ContractABIFetcher = require('./contract-abi');

// Use environment variable — never hardcode API keys
const apiKey = process.env.ETHERSCAN_API_KEY;
if (!apiKey) throw new Error('ETHERSCAN_API_KEY environment variable is required');

const fetcher = new ContractABIFetcher(apiKey, 1); // chain ID 1 = Ethereum mainnet

// Replace with your deployed contract address
const deployedAddress = '0xYourDeployedContractAddress';

fetcher.getContractABI(deployedAddress)
  .then(result => {
    console.log('Verified ABI from Etherscan:', result.abi.length, 'entries');
  })
  .catch(err => console.error('Error:', err.message));
`;

  console.log(snippet);
}

// ─────────────────────────────────────────────────────────────────────────────
// Example 3: Deploy and interact using ethers.js (requires ethers installed)
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
  // Connect to a provider using environment variables — never hardcode credentials
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  const owners = [
    await signer.getAddress(),
    process.env.OWNER_2_ADDRESS,
    process.env.OWNER_3_ADDRESS,
  ];
  const requiredConfirmations = 2; // 2-of-3

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(owners, requiredConfirmations);
  await contract.waitForDeployment();

  console.log('Deployed to:', await contract.getAddress());

  // Submit a transaction (owner only)
  const tx = await contract.submitTransaction(
    process.env.RECIPIENT_ADDRESS,
    ethers.parseEther('0.1'),  // 0.1 ETH
    '0x'                        // empty calldata
  );
  await tx.wait();
  console.log('Transaction submitted');
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
  await exampleFetchABIFromEtherscan();
  await exampleWithEthers();
})();
