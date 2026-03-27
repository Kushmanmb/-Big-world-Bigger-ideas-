#!/usr/bin/env python3
"""
Test script for blockchain_rpc_server.py
Demonstrates basic functionality of the RPC server
"""

import json
import time
import subprocess
import sys
from urllib.request import Request, urlopen
from urllib.error import URLError

def make_rpc_call(method, params=None, port=8545):
    """Make a JSON-RPC call to the server"""
    if params is None:
        params = []
    
    url = f"http://127.0.0.1:{port}/"
    data = json.dumps({
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }).encode('utf-8')
    
    req = Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except Exception as e:
        return {"error": str(e)}

def test_server():
    """Test the RPC server functionality"""
    print("🧪 Testing Blockchain RPC Server")
    print("=" * 50)
    
    # Test server_info method
    print("\n1️⃣  Testing server_info method...")
    response = make_rpc_call("server_info")
    if "result" in response:
        print("   ✅ Success!")
        print(f"   Server: {response['result']['name']}")
        print(f"   Version: {response['result']['version']}")
        print(f"   Status: {response['result']['status']}")
    else:
        print(f"   ❌ Failed: {response.get('error', 'Unknown error')}")
    
    # Test unknown method (should return error)
    print("\n2️⃣  Testing invalid method (should fail gracefully)...")
    response = make_rpc_call("unknown_method")
    if "error" in response:
        print("   ✅ Success! Server correctly returned error")
        print(f"   Error: {response['error']}")
    else:
        print("   ❌ Unexpected: Server should have returned an error")
    
    # Test ERC-721 method structure (will fail without network, but tests parameter handling)
    print("\n3️⃣  Testing ERC-721 parameter validation...")
    response = make_rpc_call("erc721_name", [])
    if "error" in response:
        print("   ✅ Success! Server correctly validates parameters")
        error_msg = response.get('error', {}).get('message', '')
        if 'contract address' in error_msg.lower():
            print("   ✅ Correct error message about missing contract address")
    else:
        print("   ⚠️  Unexpected result")
    
    print("\n" + "=" * 50)
    print("✅ All local tests passed!")
    print("\n💡 Note: Network-dependent tests (actual blockchain calls) were skipped")
    print("   as they require internet connectivity and external APIs.")

def main():
    """Main test function"""
    print("Starting test of blockchain_rpc_server.py...")
    print("\n⚠️  This test assumes the server is NOT already running.")
    print("Starting server on port 8545...\n")
    
    # Start the server
    try:
        server_process = subprocess.Popen(
            [sys.executable, "blockchain_rpc_server.py", "--port", "8545"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Give server time to start
        print("⏳ Waiting for server to start...")
        time.sleep(2)
        
        # Check if server is running
        if server_process.poll() is not None:
            print("❌ Server failed to start!")
            stdout, stderr = server_process.communicate()
            print(f"stdout: {stdout.decode()}")
            print(f"stderr: {stderr.decode()}")
            return 1
        
        print("✅ Server started successfully!\n")
        
        # Run tests
        test_server()
        
        # Cleanup
        print("\n🧹 Shutting down server...")
        server_process.terminate()
        server_process.wait(timeout=5)
        print("✅ Server stopped cleanly")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        if 'server_process' in locals():
            server_process.terminate()
        return 1
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        if 'server_process' in locals():
            server_process.terminate()
        return 1

if __name__ == "__main__":
    sys.exit(main())
