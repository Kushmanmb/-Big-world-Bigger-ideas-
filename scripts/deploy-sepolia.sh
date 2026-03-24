#!/usr/bin/env bash
#
# deploy-sepolia.sh
#
# Deploys a Solidity contract to the Sepolia testnet using forge create and
# automatically verifies the source code on Etherscan.
#
# Usage:
#   ./scripts/deploy-sepolia.sh <ContractFile.sol> <ContractName> [constructor args...]
#
# Examples:
#   ./scripts/deploy-sepolia.sh contracts/ERC20Token.sol ERC20Token "MyToken" "MTK" 1000000000000000000000000
#   ./scripts/deploy-sepolia.sh contracts/Proxy.sol Proxy 0xYourAdminAddress
#
# Required environment variables (copy .env.example to .env and fill in values):
#   PRIVATE_KEY        – deployer private key (never commit this)
#   ETHERSCAN_API_KEY  – Etherscan API key for contract verification
#
# Optional environment variable:
#   SEPOLIA_RPC_URL    – Sepolia JSON-RPC endpoint
#                        (defaults to https://rpc.sepolia.ethpandaops.io)
#
# Prerequisites:
#   - Foundry installed (https://getfoundry.sh)
#   - forge installed and on PATH
#

set -euo pipefail

# ── Helpers ────────────────────────────────────────────────────────────────────

info()  { printf '\033[0;32m[INFO]\033[0m  %s\n' "$*"; }
error() { printf '\033[0;31m[ERROR]\033[0m %s\n' "$*" >&2; }

# ── Argument validation ────────────────────────────────────────────────────────

if [[ $# -lt 2 ]]; then
  error "Usage: $0 <ContractFile.sol> <ContractName> [constructor args...]"
  error "Example: $0 contracts/ERC20Token.sol ERC20Token \"MyToken\" \"MTK\" 1000000000000000000000000"
  exit 1
fi

CONTRACT_FILE="$1"
CONTRACT_NAME="$2"
shift 2
CONSTRUCTOR_ARGS=("$@")

# ── Environment variable validation ───────────────────────────────────────────

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  error "PRIVATE_KEY environment variable is not set."
  error "Set it in your .env file (see .env.example) and source it before running:"
  error "  export PRIVATE_KEY=0x..."
  exit 1
fi

if [[ -z "${ETHERSCAN_API_KEY:-}" ]]; then
  error "ETHERSCAN_API_KEY environment variable is not set."
  error "Get a free key at https://etherscan.io/apis and add it to your .env file."
  exit 1
fi

RPC_URL="${SEPOLIA_RPC_URL:-https://rpc.sepolia.ethpandaops.io}"

# ── Validate contract file exists ─────────────────────────────────────────────

if [[ ! -f "$CONTRACT_FILE" ]]; then
  error "Contract file not found: $CONTRACT_FILE"
  exit 1
fi

# ── Build forge create arguments ──────────────────────────────────────────────

FORGE_ARGS=(
  create
  "${CONTRACT_FILE}:${CONTRACT_NAME}"
  --rpc-url   "$RPC_URL"
  --private-key "$PRIVATE_KEY"
  --verify
  --verifier  etherscan
  --etherscan-api-key "$ETHERSCAN_API_KEY"
)

if [[ ${#CONSTRUCTOR_ARGS[@]} -gt 0 ]]; then
  FORGE_ARGS+=(--constructor-args "${CONSTRUCTOR_ARGS[@]}")
fi

# ── Deploy ────────────────────────────────────────────────────────────────────

info "Deploying ${CONTRACT_NAME} from ${CONTRACT_FILE}"
info "Network : Sepolia (chain ID 11155111)"
info "RPC URL : ${RPC_URL}"
info ""
# Print command with sensitive values redacted so they don't appear in logs.
REDACTED_ARGS=("${FORGE_ARGS[@]}")
for i in "${!REDACTED_ARGS[@]}"; do
  if [[ "${REDACTED_ARGS[$i]}" == "--private-key" ]]; then
    REDACTED_ARGS[$((i + 1))]="<redacted>"
  fi
  if [[ "${REDACTED_ARGS[$i]}" == "--etherscan-api-key" ]]; then
    REDACTED_ARGS[$((i + 1))]="<redacted>"
  fi
done
info "Running: forge ${REDACTED_ARGS[*]}"
info ""

forge "${FORGE_ARGS[@]}"
