#!/usr/bin/env python3
"""
Example usage of blockchain_rpc_server.py
Demonstrates how to interact with the RPC server from Python
"""

import json
from urllib.request import Request, urlopen

# Server configuration
RPC_URL = "http://localhost:8545/"

def rpc_call(method, params=None):
    """Make a JSON-RPC call to the server"""
    if params is None:
        params = []
    
    request_data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    
    data = json.dumps(request_data).encode('utf-8')
    req = Request(RPC_URL, data=data, headers={'Content-Type': 'application/json'})
    
    with urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        return result

def main():
    """Example usage of the RPC server"""
    
    print("🌐 Blockchain RPC Server - Usage Examples")
    print("=" * 60)
    
    # Example 1: Get server info
    print("\n📊 Example 1: Get Server Information")
    print("-" * 60)
    response = rpc_call("server_info")
    print(f"Server: {response['result']['name']}")
    print(f"Version: {response['result']['version']}")
    print(f"Status: {response['result']['status']}")
    
    # Example 2: Query ERC-721 NFT (Bored Ape Yacht Club)
    print("\n🎨 Example 2: Query ERC-721 NFT Token Owner")
    print("-" * 60)
    print("Contract: Bored Ape Yacht Club (BAYC)")
    print("Token ID: 1")
    print("\nNote: This requires network connectivity to Ethereum RPC")
    print("Example call:")
    print('  rpc_call("erc721_ownerOf", [')
    print('    "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",')
    print('    "1"')
    print('  ])')
    
    # Example 3: Query ERC-20 token
    print("\n💰 Example 3: Query ERC-20 Token Balance")
    print("-" * 60)
    print("Contract: USDT")
    print("Address: Sample address")
    print("\nNote: This requires network connectivity to Ethereum RPC")
    print("Example call:")
    print('  rpc_call("erc20_balanceOf", [')
    print('    "0xdAC17F958D2ee523a2206206994597C13D831ec7",')
    print('    "0x1234567890123456789012345678901234567890"')
    print('  ])')
    
    # Example 4: Bitcoin mining data
    print("\n⛏️  Example 4: Get Bitcoin Hashrate")
    print("-" * 60)
    print("Time period: 1 week")
    print("\nNote: This requires network connectivity to mempool.space")
    print("Example call:")
    print('  rpc_call("bitcoin_hashrate", ["1w"])')
    
    # Example 5: Blockchair data
    print("\n🔗 Example 5: Query Blockchain Data (Blockchair)")
    print("-" * 60)
    print("Blockchain: Bitcoin")
    print("Block: 700000")
    print("\nNote: This requires network connectivity to Blockchair API")
    print("Example call:")
    print('  rpc_call("blockchair_getBlock", ["bitcoin", 700000])')
    
    # Example 6: Custom RPC endpoint
    print("\n🌍 Example 6: Use Custom RPC Endpoint")
    print("-" * 60)
    print("You can specify a custom RPC endpoint as the last parameter:")
    print('  rpc_call("erc721_name", [')
    print('    "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",')
    print('    "https://eth.llamarpc.com"')
    print('  ])')
    
    print("\n" + "=" * 60)
    print("✅ Examples complete!")
    print("\n💡 Tips:")
    print("  - Start server: python3 blockchain_rpc_server.py")
    print("  - Use curl for testing: curl http://localhost:8545/")
    print("  - Check logs with --debug flag for troubleshooting")
    print("  - All methods support custom RPC endpoints")
    print("\n📚 For full documentation, see: BLOCKCHAIN-RPC-SERVER.md")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n⚠️  Make sure the RPC server is running:")
        print("   python3 blockchain_rpc_server.py")
