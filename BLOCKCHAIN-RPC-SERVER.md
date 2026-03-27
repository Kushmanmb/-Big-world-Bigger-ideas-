# Blockchain RPC Server

A Python-based JSON-RPC server that provides access to blockchain data and utilities from the Big-world-Bigger-ideas toolkit.

## Overview

The Blockchain RPC Server exposes blockchain functionality via a standard JSON-RPC 2.0 interface, making it easy to integrate blockchain queries into any application that can make HTTP requests.

## Features

- **Ethereum Contract Calls**: Make eth_call requests to Ethereum contracts
- **ERC-721 NFT Queries**: Query NFT token data (owner, balance, tokenURI, etc.)
- **ERC-20 Token Queries**: Query fungible token data (balance, name, symbol, decimals)
- **Bitcoin Mining Data**: Get Bitcoin network hashrate and difficulty
- **Multi-chain Support**: Query blockchain data via Blockchair API for Bitcoin, Ethereum, and Litecoin
- **Standards Compliant**: Implements JSON-RPC 2.0 specification
- **CORS Enabled**: Accessible from web browsers

## Installation

No additional dependencies required! The server uses only Python standard library.

```bash
# Ensure Python 3.7+ is installed
python3 --version

# Make the script executable (optional)
chmod +x blockchain_rpc_server.py
```

## Usage

### Starting the Server

```bash
# Start on default port (8545)
python3 blockchain_rpc_server.py

# Start on custom host and port
python3 blockchain_rpc_server.py --host 0.0.0.0 --port 3000

# Enable debug logging
python3 blockchain_rpc_server.py --debug
```

### Command Line Options

- `--host HOST`: Host to bind to (default: 127.0.0.1)
- `--port PORT`: Port to listen on (default: 8545)
- `--debug`: Enable debug logging

### Server Information

Get server info via GET request:

```bash
curl http://localhost:8545/
```

Response:
```json
{
  "name": "Blockchain RPC Server",
  "version": "1.0.0",
  "description": "JSON-RPC server for blockchain data and utilities",
  "methods": [...],
  "endpoints": {...}
}
```

## JSON-RPC Methods

### General Format

All JSON-RPC requests follow this format:

```json
{
  "jsonrpc": "2.0",
  "method": "method_name",
  "params": [...],
  "id": 1
}
```

### Available Methods

#### 1. `eth_call`

Make an Ethereum contract call.

**Parameters:**
- `transaction` (object): Transaction object with `to` and `data` fields
- `block` (string): Block parameter (default: "latest")
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [
      {
        "to": "0x1234567890123456789012345678901234567890",
        "data": "0x06fdde03"
      },
      "latest"
    ],
    "id": 1
  }'
```

#### 2. `erc721_ownerOf`

Get the owner of an ERC-721 NFT token.

**Parameters:**
- `contract_address` (string): ERC-721 contract address
- `token_id` (string|number): Token ID
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc721_ownerOf",
    "params": ["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", "1"],
    "id": 1
  }'
```

#### 3. `erc721_balanceOf`

Get the NFT balance of an address for a specific contract.

**Parameters:**
- `contract_address` (string): ERC-721 contract address
- `owner_address` (string): Owner address to check
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc721_balanceOf",
    "params": [
      "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "0x1234567890123456789012345678901234567890"
    ],
    "id": 1
  }'
```

#### 4. `erc721_tokenURI`

Get the metadata URI for an NFT token.

**Parameters:**
- `contract_address` (string): ERC-721 contract address
- `token_id` (string|number): Token ID
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc721_tokenURI",
    "params": ["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", "1"],
    "id": 1
  }'
```

#### 5. `erc721_name` / `erc721_symbol`

Get the name or symbol of an ERC-721 contract.

**Parameters:**
- `contract_address` (string): ERC-721 contract address
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc721_name",
    "params": ["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"],
    "id": 1
  }'
```

#### 6. `erc20_balanceOf`

Get the token balance of an address for an ERC-20 contract.

**Parameters:**
- `contract_address` (string): ERC-20 contract address
- `owner_address` (string): Owner address to check
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
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

#### 7. `erc20_name` / `erc20_symbol` / `erc20_decimals`

Get name, symbol, or decimals of an ERC-20 token.

**Parameters:**
- `contract_address` (string): ERC-20 contract address
- `rpc_url` (string, optional): Custom RPC endpoint

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "erc20_decimals",
    "params": ["0xdAC17F958D2ee523a2206206994597C13D831ec7"],
    "id": 1
  }'
```

#### 8. `bitcoin_hashrate`

Get Bitcoin network hashrate for a time period.

**Parameters:**
- `period` (string): Time period ('1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all')

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "bitcoin_hashrate",
    "params": ["1w"],
    "id": 1
  }'
```

#### 9. `bitcoin_difficulty`

Get Bitcoin difficulty adjustment information.

**Parameters:** None

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "bitcoin_difficulty",
    "params": [],
    "id": 1
  }'
```

#### 10. `blockchair_getBlock`

Get block information from Blockchair API.

**Parameters:**
- `blockchain` (string): Blockchain name ('bitcoin', 'ethereum', 'litecoin')
- `block_id` (string|number): Block height or hash

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "blockchair_getBlock",
    "params": ["bitcoin", 700000],
    "id": 1
  }'
```

#### 11. `blockchair_getAddress`

Get address information from Blockchair API.

**Parameters:**
- `blockchain` (string): Blockchain name ('bitcoin', 'ethereum', 'litecoin')
- `address` (string): Blockchain address

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "blockchair_getAddress",
    "params": ["bitcoin", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"],
    "id": 1
  }'
```

#### 12. `server_info`

Get server status and information.

**Parameters:** None

**Example:**
```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "server_info",
    "params": [],
    "id": 1
  }'
```

## Response Format

### Success Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {...}
}
```

### Error Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Internal error: description"
  }
}
```

### Error Codes

- `-32700`: Parse error (Invalid JSON)
- `-32601`: Method not found
- `-32603`: Internal error
- `-32600`: Invalid Request

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function getTokenOwner(contractAddress, tokenId) {
  const response = await axios.post('http://localhost:8545/', {
    jsonrpc: '2.0',
    method: 'erc721_ownerOf',
    params: [contractAddress, tokenId],
    id: 1
  });
  
  return response.data.result;
}
```

### Python

```python
import requests

def get_token_owner(contract_address, token_id):
    response = requests.post('http://localhost:8545/', json={
        'jsonrpc': '2.0',
        'method': 'erc721_ownerOf',
        'params': [contract_address, token_id],
        'id': 1
    })
    
    return response.json()['result']
```

### cURL

```bash
curl -X POST http://localhost:8545/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"erc721_ownerOf","params":["0xContract","1"],"id":1}'
```

## Architecture

The server is built using:
- **Python HTTP Server**: Standard library `http.server` for HTTP handling
- **JSON-RPC 2.0**: Standard JSON-RPC protocol implementation
- **No External Dependencies**: Uses only Python standard library

### Default Endpoints

- **Ethereum RPC**: `https://ethereum.publicnode.com`
- **Bitcoin API**: `https://mempool.space/api`
- **Blockchair API**: `https://api.blockchair.com`

## Security Considerations

1. **Localhost Only**: By default, the server binds to `127.0.0.1` (localhost only)
2. **No Authentication**: The server does not implement authentication by default
3. **CORS Enabled**: Cross-origin requests are allowed (suitable for development)
4. **Rate Limiting**: No built-in rate limiting (consider using a reverse proxy)

### Production Deployment

For production use, consider:
- Running behind a reverse proxy (nginx, Apache)
- Implementing authentication and rate limiting
- Using HTTPS/TLS encryption
- Restricting CORS to specific origins
- Implementing request logging and monitoring

## Troubleshooting

### Server Won't Start

```bash
# Check if port is already in use
netstat -tuln | grep 8545

# Use a different port
python3 blockchain_rpc_server.py --port 3000
```

### Connection Refused

Ensure the server is running and accessible:

```bash
# Check if server is running
ps aux | grep blockchain_rpc_server.py

# Test connectivity
curl http://localhost:8545/
```

### API Call Failures

If external API calls fail:
- Check internet connectivity
- Verify firewall settings
- Check if API endpoints are accessible
- Review server logs for detailed error messages

## Contributing

This server is part of the Big-world-Bigger-ideas blockchain toolkit. To contribute:

1. Follow the existing code style
2. Add tests for new methods
3. Update documentation
4. Submit a pull request

## License

ISC License - See repository LICENSE file for details.

## Author

Matthew Brace (kushmanmb)
- GitHub: [@kushmanmb](https://github.com/kushmanmb)
- Email: kushmanmb@gmx.com
- ENS: kushmanmb.eth

## Related Projects

- [Big-world-Bigger-ideas](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-): Main blockchain utilities repository
- NPM Package: [big-world-bigger-ideas](https://www.npmjs.com/package/big-world-bigger-ideas)
