# Blockchain RPC Server - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Server

```bash
python3 blockchain_rpc_server.py
```

The server will start on `http://127.0.0.1:8545` by default.

### Step 2: Test the Server

Open another terminal and run:

```bash
curl http://localhost:8545/
```

You should see server information in JSON format.

### Step 3: Make Your First RPC Call

```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"server_info","params":[],"id":1}'
```

## 📋 Quick Reference

### Starting the Server

| Command | Description |
|---------|-------------|
| `python3 blockchain_rpc_server.py` | Start on default port (8545) |
| `python3 blockchain_rpc_server.py --port 3000` | Start on custom port |
| `python3 blockchain_rpc_server.py --host 0.0.0.0` | Listen on all interfaces |
| `python3 blockchain_rpc_server.py --debug` | Enable debug logging |

### Testing with curl

```bash
# Get server info (GET request)
curl http://localhost:8545/

# Get server info (JSON-RPC)
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"server_info","params":[],"id":1}'

# Query ERC-721 NFT owner
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"erc721_ownerOf","params":["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","1"],"id":1}'

# Get Bitcoin hashrate
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"bitcoin_hashrate","params":["1w"],"id":1}'
```

### Testing with Python

```python
import requests

# Make an RPC call
response = requests.post('http://localhost:8545/', json={
    'jsonrpc': '2.0',
    'method': 'server_info',
    'params': [],
    'id': 1
})

print(response.json()['result'])
```

Or use the provided example script:

```bash
python3 blockchain_rpc_server_example.py
```

### Testing with JavaScript/Node.js

```javascript
const axios = require('axios');

async function rpcCall(method, params = []) {
  const response = await axios.post('http://localhost:8545/', {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1
  });
  return response.data.result;
}

// Example usage
rpcCall('server_info').then(result => {
  console.log(result);
});
```

## 📚 Available Methods

| Method | Description | Example Params |
|--------|-------------|----------------|
| `server_info` | Get server information | `[]` |
| `eth_call` | Make Ethereum contract call | `[{to: "0x...", data: "0x..."}, "latest"]` |
| `erc721_ownerOf` | Get NFT token owner | `["0xContract", "1"]` |
| `erc721_balanceOf` | Get NFT balance | `["0xContract", "0xAddress"]` |
| `erc721_tokenURI` | Get token metadata URI | `["0xContract", "1"]` |
| `erc721_name` | Get contract name | `["0xContract"]` |
| `erc721_symbol` | Get contract symbol | `["0xContract"]` |
| `erc20_balanceOf` | Get token balance | `["0xContract", "0xAddress"]` |
| `erc20_name` | Get token name | `["0xContract"]` |
| `erc20_symbol` | Get token symbol | `["0xContract"]` |
| `erc20_decimals` | Get token decimals | `["0xContract"]` |
| `bitcoin_hashrate` | Get Bitcoin hashrate | `["1w"]` |
| `bitcoin_difficulty` | Get difficulty adjustment | `[]` |
| `blockchair_getBlock` | Get block data | `["bitcoin", 700000]` |
| `blockchair_getAddress` | Get address data | `["bitcoin", "address"]` |

## 🔧 Common Use Cases

### Query NFT Ownership

```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc721_ownerOf",
    "params": [
      "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "1"
    ],
    "id": 1
  }'
```

### Check Token Balance

```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc20_balanceOf",
    "params": [
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "0x1234567890123456789012345678901234567890"
    ],
    "id": 1
  }'
```

### Get Bitcoin Network Stats

```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "bitcoin_hashrate",
    "params": ["1d"],
    "id": 1
  }'
```

## 🎯 Next Steps

1. **Read the full documentation**: [BLOCKCHAIN-RPC-SERVER.md](./BLOCKCHAIN-RPC-SERVER.md)
2. **Run the test suite**: `python3 test_rpc_server.py`
3. **Try the examples**: `python3 blockchain_rpc_server_example.py`
4. **Integrate with your app**: Use the provided code examples

## 🆘 Troubleshooting

### Server won't start

```bash
# Check if port is in use
netstat -tuln | grep 8545

# Use a different port
python3 blockchain_rpc_server.py --port 3000
```

### Connection refused

Make sure the server is running:

```bash
ps aux | grep blockchain_rpc_server.py
```

### API calls failing

Check server logs with debug mode:

```bash
python3 blockchain_rpc_server.py --debug
```

## 📖 More Information

- Full documentation: [BLOCKCHAIN-RPC-SERVER.md](./BLOCKCHAIN-RPC-SERVER.md)
- Main repository: [README.md](./README.md)
- Report issues: [GitHub Issues](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues)
