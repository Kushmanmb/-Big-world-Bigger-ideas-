#!/usr/bin/env python3
"""
Blockchain RPC Server
A JSON-RPC server that provides access to blockchain data and utilities.

This server exposes methods for:
- Ethereum contract calls (eth_call)
- ERC-721 NFT queries (balanceOf, ownerOf, tokenURI)
- ERC-20 token queries
- Bitcoin mining data
- Multi-chain blockchain data via Blockchair

Usage:
    python3 blockchain_rpc_server.py [--host HOST] [--port PORT]

Example:
    python3 blockchain_rpc_server.py --host 0.0.0.0 --port 8545
"""

import json
import argparse
import logging
import re
import ipaddress
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import hashlib

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BlockchainRPCHandler(BaseHTTPRequestHandler):
    """HTTP request handler for JSON-RPC blockchain requests"""
    
    # Default RPC endpoints
    DEFAULT_ETH_RPC = "https://ethereum.publicnode.com"
    DEFAULT_BITCOIN_API = "https://mempool.space/api"
    DEFAULT_BLOCKCHAIR_API = "https://api.blockchair.com"

    # Allowlist of supported Blockchair blockchain identifiers
    ALLOWED_BLOCKCHAINS = frozenset([
        'bitcoin', 'bitcoin-cash', 'ethereum', 'litecoin', 'bitcoin-sv',
        'dogecoin', 'dash', 'ripple', 'stellar', 'monero', 'cardano',
        'zcash', 'mixin', 'groestlcoin', 'tezos', 'eos', 'bitcoin/testnet'
    ])

    # Allowlist of supported Bitcoin mining time periods
    ALLOWED_PERIODS = frozenset(['1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'])

    # Allowlist of trusted ETH RPC hostnames
    ALLOWED_ETH_RPC_HOSTS = frozenset([
        'ethereum.publicnode.com',
        'mainnet.infura.io',
        'eth-mainnet.alchemyapi.io',
        'eth-mainnet.g.alchemy.com',
        'rpc.ankr.com',
        'cloudflare-eth.com',
        'api.mycryptoapi.com',
        'eth.llamarpc.com',
        'rpc.flashbots.net',
        'eth-goerli.g.alchemy.com',
        'goerli.infura.io',
        'eth-sepolia.g.alchemy.com',
        'sepolia.infura.io',
        'mainnet.base.org',
        'base-mainnet.g.alchemy.com',
        'mainnet.optimism.io',
        'opt-mainnet.g.alchemy.com',
        'polygon-rpc.com',
        'polygon-mainnet.g.alchemy.com',
    ])

    @classmethod
    def _validate_rpc_url(cls, url):
        """Validate that an RPC URL is safe to use (HTTPS, trusted host).

        Args:
            url: The URL string to validate.

        Returns:
            The validated URL string.

        Raises:
            ValueError: If the URL is not allowed.
        """
        try:
            parsed = urlparse(url)
        except Exception:
            raise ValueError("Invalid RPC URL format")

        if parsed.scheme != 'https':
            raise ValueError("RPC URL must use HTTPS")

        hostname = parsed.hostname or ''

        # Block private / loopback addresses
        is_ip = True
        try:
            addr = ipaddress.ip_address(hostname)
        except ValueError:
            is_ip = False

        if is_ip:
            if addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_reserved:
                raise ValueError("RPC URL must not target a private or reserved IP address")
        else:
            # Not an IP address – check against the hostname allowlist
            if hostname not in cls.ALLOWED_ETH_RPC_HOSTS:
                raise ValueError(
                    f"RPC host '{hostname}' is not in the list of trusted endpoints"
                )

        return url

    @classmethod
    def _validate_blockchain(cls, blockchain):
        """Validate a Blockchair blockchain identifier.

        Args:
            blockchain: The blockchain name provided by the caller.

        Returns:
            The validated blockchain string.

        Raises:
            ValueError: If the blockchain name is not in the allowlist.
        """
        if blockchain not in cls.ALLOWED_BLOCKCHAINS:
            raise ValueError(
                f"Unsupported blockchain '{blockchain}'. "
                f"Allowed values: {sorted(cls.ALLOWED_BLOCKCHAINS)}"
            )
        return blockchain

    @classmethod
    def _validate_period(cls, period):
        """Validate a Bitcoin mining time period identifier.

        Args:
            period: The period string provided by the caller.

        Returns:
            The validated period string.

        Raises:
            ValueError: If the period is not in the allowlist.
        """
        if period not in cls.ALLOWED_PERIODS:
            raise ValueError(
                f"Unsupported period '{period}'. "
                f"Allowed values: {sorted(cls.ALLOWED_PERIODS)}"
            )
        return period

    @staticmethod
    def _validate_block_id(block_id):
        """Validate a block height or hash parameter.

        Only digits (block height) or 64 hex characters (block hash) are accepted.

        Args:
            block_id: The block identifier provided by the caller.

        Returns:
            The validated block_id string.

        Raises:
            ValueError: If the block_id contains unexpected characters.
        """
        block_id_str = str(block_id)
        # Accept either a pure decimal block height or an exactly 64-character hex block hash
        if not (re.fullmatch(r'\d+', block_id_str) or re.fullmatch(r'[0-9a-fA-F]{64}', block_id_str)):
            raise ValueError(
                "block_id must be a decimal block height or a 64-character hex block hash"
            )
        return block_id_str

    @staticmethod
    def _validate_chain_address(address):
        """Validate a blockchain address parameter used in Blockchair queries.

        Accepts standard alphanumeric addresses (Bitcoin, Ethereum, etc.) and
        rejects values that contain path separators or other unexpected characters.

        Args:
            address: The address string provided by the caller.

        Returns:
            The validated address string.

        Raises:
            ValueError: If the address contains unexpected characters.
        """
        # Allow alphanumeric characters plus common address prefixes/separators:
        # - '0x' prefix for Ethereum addresses
        # - Bech32 Bitcoin addresses use lowercase alphanumeric plus '1' (already covered)
        # - Some address formats include hyphens (e.g., Tezos KT1-style) – excluded intentionally
        #   because Blockchair addresses never contain path-significant characters like '/', '.', '?'
        if not re.fullmatch(r'[0-9a-zA-Z]{1,130}', address):
            raise ValueError(
                "Address must contain only alphanumeric characters (max 130 chars)"
            )
        return address
    
    def do_POST(self):
        """Handle POST requests for JSON-RPC calls"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            logger.info(f"Received RPC request: {request_data.get('method', 'unknown')}")
            
            # Process JSON-RPC request
            response = self.process_rpc_request(request_data)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON: {e}")
            self.send_error_response(-32700, "Parse error", str(e))
        except Exception as e:
            logger.error(f"Internal error: {e}")
            self.send_error_response(-32603, "Internal error", str(e))
    
    def do_GET(self):
        """Handle GET requests - provide server info"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        info = {
            "name": "Blockchain RPC Server",
            "version": "1.0.0",
            "description": "JSON-RPC server for blockchain data and utilities",
            "methods": [
                "eth_call",
                "erc721_balanceOf",
                "erc721_ownerOf",
                "erc721_tokenURI",
                "erc721_name",
                "erc721_symbol",
                "erc20_balanceOf",
                "erc20_name",
                "erc20_symbol",
                "erc20_decimals",
                "bitcoin_hashrate",
                "bitcoin_difficulty",
                "blockchair_getBlock",
                "blockchair_getAddress",
                "server_info"
            ],
            "endpoints": {
                "ethereum": self.DEFAULT_ETH_RPC,
                "bitcoin": self.DEFAULT_BITCOIN_API,
                "blockchair": self.DEFAULT_BLOCKCHAIR_API
            }
        }
        
        self.wfile.write(json.dumps(info, indent=2).encode('utf-8'))
    
    def process_rpc_request(self, request):
        """Process a JSON-RPC request and return response"""
        rpc_id = request.get('id', 1)
        method = request.get('method', '')
        params = request.get('params', [])
        
        try:
            # Route to appropriate method handler
            if method == 'eth_call':
                result = self.handle_eth_call(params)
            elif method.startswith('erc721_'):
                result = self.handle_erc721_method(method, params)
            elif method.startswith('erc20_'):
                result = self.handle_erc20_method(method, params)
            elif method.startswith('bitcoin_'):
                result = self.handle_bitcoin_method(method, params)
            elif method.startswith('blockchair_'):
                result = self.handle_blockchair_method(method, params)
            elif method == 'server_info':
                result = self.handle_server_info()
            else:
                return self.create_error_response(rpc_id, -32601, "Method not found")
            
            return self.create_success_response(rpc_id, result)
            
        except Exception as e:
            logger.error(f"Error processing {method}: {e}")
            return self.create_error_response(rpc_id, -32603, f"Internal error: {str(e)}")
    
    def handle_eth_call(self, params):
        """Handle eth_call RPC method"""
        if len(params) < 2:
            raise ValueError("eth_call requires at least 2 parameters: [transaction, block]")
        
        tx_data = params[0]
        block = params[1] if len(params) > 1 else "latest"
        raw_rpc_url = params[2] if len(params) > 2 else self.DEFAULT_ETH_RPC

        # Validate user-supplied RPC URL to prevent SSRF
        rpc_url = self._validate_rpc_url(raw_rpc_url)
        
        # Make eth_call request to Ethereum node
        rpc_request = {
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": [tx_data, block],
            "id": 1
        }
        
        result = self.make_http_request(rpc_url, rpc_request)
        return result.get('result', '')
    
    def handle_erc721_method(self, method, params):
        """Handle ERC-721 token methods"""
        method_name = method.replace('erc721_', '')
        
        if len(params) < 1:
            raise ValueError(f"{method} requires contract address as first parameter")
        
        contract_address = params[0]
        raw_rpc_url = params[-1] if len(params) > 1 and params[-1].startswith('http') else self.DEFAULT_ETH_RPC
        # Validate user-supplied RPC URL to prevent SSRF
        rpc_url = self._validate_rpc_url(raw_rpc_url)
        
        # ERC-721 function signatures
        signatures = {
            'balanceOf': '0x70a08231',  # balanceOf(address)
            'ownerOf': '0x6352211e',    # ownerOf(uint256)
            'tokenURI': '0xc87b56dd',   # tokenURI(uint256)
            'name': '0x06fdde03',       # name()
            'symbol': '0x95d89b41',     # symbol()
            'totalSupply': '0x18160ddd' # totalSupply()
        }
        
        if method_name not in signatures:
            raise ValueError(f"Unknown ERC-721 method: {method_name}")
        
        # Build call data
        signature = signatures[method_name]
        
        if method_name == 'balanceOf':
            if len(params) < 2:
                raise ValueError("balanceOf requires owner address")
            owner = params[1].replace('0x', '').zfill(64)
            data = signature + owner
        elif method_name == 'ownerOf':
            if len(params) < 2:
                raise ValueError("ownerOf requires tokenId")
            token_id = hex(int(params[1]))[2:].zfill(64)
            data = signature + token_id
        elif method_name == 'tokenURI':
            if len(params) < 2:
                raise ValueError("tokenURI requires tokenId")
            token_id = hex(int(params[1]))[2:].zfill(64)
            data = signature + token_id
        else:
            # Methods with no parameters
            data = signature
        
        # Make eth_call
        tx_data = {
            "to": contract_address,
            "data": data
        }
        
        return self.handle_eth_call([tx_data, "latest", rpc_url])
    
    def handle_erc20_method(self, method, params):
        """Handle ERC-20 token methods"""
        method_name = method.replace('erc20_', '')
        
        if len(params) < 1:
            raise ValueError(f"{method} requires contract address as first parameter")
        
        contract_address = params[0]
        raw_rpc_url = params[-1] if len(params) > 1 and params[-1].startswith('http') else self.DEFAULT_ETH_RPC
        # Validate user-supplied RPC URL to prevent SSRF
        rpc_url = self._validate_rpc_url(raw_rpc_url)
        
        # ERC-20 function signatures
        signatures = {
            'balanceOf': '0x70a08231',  # balanceOf(address)
            'name': '0x06fdde03',       # name()
            'symbol': '0x95d89b41',     # symbol()
            'decimals': '0x313ce567',   # decimals()
            'totalSupply': '0x18160ddd' # totalSupply()
        }
        
        if method_name not in signatures:
            raise ValueError(f"Unknown ERC-20 method: {method_name}")
        
        # Build call data
        signature = signatures[method_name]
        
        if method_name == 'balanceOf':
            if len(params) < 2:
                raise ValueError("balanceOf requires owner address")
            owner = params[1].replace('0x', '').zfill(64)
            data = signature + owner
        else:
            # Methods with no parameters
            data = signature
        
        # Make eth_call
        tx_data = {
            "to": contract_address,
            "data": data
        }
        
        return self.handle_eth_call([tx_data, "latest", rpc_url])
    
    def handle_bitcoin_method(self, method, params):
        """Handle Bitcoin-related methods"""
        method_name = method.replace('bitcoin_', '')
        
        if method_name == 'hashrate':
            raw_period = params[0] if params else '1w'
            # Validate period against allowlist to prevent URL injection
            period = self._validate_period(raw_period)
            url = f"{self.DEFAULT_BITCOIN_API}/v1/mining/hashrate/{period}"
            response = self.make_http_get(url)
            return response
        
        elif method_name == 'difficulty':
            url = f"{self.DEFAULT_BITCOIN_API}/v1/difficulty-adjustment"
            response = self.make_http_get(url)
            return response
        
        else:
            raise ValueError(f"Unknown Bitcoin method: {method_name}")
    
    def handle_blockchair_method(self, method, params):
        """Handle Blockchair API methods"""
        method_name = method.replace('blockchair_', '')
        
        if len(params) < 1:
            raise ValueError(f"{method} requires blockchain parameter")
        
        blockchain = params[0]  # e.g., 'bitcoin', 'ethereum', 'litecoin'
        # Validate blockchain name against allowlist to prevent URL path injection
        self._validate_blockchain(blockchain)
        
        if method_name == 'getBlock':
            if len(params) < 2:
                raise ValueError("getBlock requires block height or hash")
            block_id = self._validate_block_id(params[1])
            url = f"{self.DEFAULT_BLOCKCHAIR_API}/{blockchain}/dashboards/block/{block_id}"
            response = self.make_http_get(url)
            return response
        
        elif method_name == 'getAddress':
            if len(params) < 2:
                raise ValueError("getAddress requires address")
            address = self._validate_chain_address(params[1])
            url = f"{self.DEFAULT_BLOCKCHAIR_API}/{blockchain}/dashboards/address/{address}"
            response = self.make_http_get(url)
            return response
        
        else:
            raise ValueError(f"Unknown Blockchair method: {method_name}")
    
    def handle_server_info(self):
        """Return server information"""
        return {
            "name": "Blockchain RPC Server",
            "version": "1.0.0",
            "status": "running",
            "methods": 12
        }
    
    def make_http_request(self, url, json_data):
        """Make an HTTP POST request with JSON data"""
        try:
            data = json.dumps(json_data).encode('utf-8')
            req = Request(url, data=data, headers={'Content-Type': 'application/json'})
            
            with urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
                return result
                
        except HTTPError as e:
            logger.error(f"HTTP Error: {e.code} - {e.reason}")
            raise Exception(f"HTTP Error: {e.code}")
        except URLError as e:
            logger.error(f"URL Error: {e.reason}")
            raise Exception(f"URL Error: {e.reason}")
    
    def make_http_get(self, url):
        """Make an HTTP GET request"""
        try:
            req = Request(url, headers={'Accept': 'application/json'})
            
            with urlopen(req, timeout=30) as response:
                result = json.loads(response.read().decode('utf-8'))
                return result
                
        except HTTPError as e:
            logger.error(f"HTTP Error: {e.code} - {e.reason}")
            raise Exception(f"HTTP Error: {e.code}")
        except URLError as e:
            logger.error(f"URL Error: {e.reason}")
            raise Exception(f"URL Error: {e.reason}")
    
    def create_success_response(self, rpc_id, result):
        """Create a JSON-RPC success response"""
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "result": result
        }
    
    def create_error_response(self, rpc_id, code, message):
        """Create a JSON-RPC error response"""
        return {
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {
                "code": code,
                "message": message
            }
        }
    
    def send_error_response(self, code, message, data=None):
        """Send an error response"""
        self.send_response(500 if code < 0 else 400)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        error_response = {
            "jsonrpc": "2.0",
            "id": None,
            "error": {
                "code": code,
                "message": message
            }
        }
        
        if data:
            error_response["error"]["data"] = data
        
        self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to use Python logging instead of stderr"""
        logger.info(f"{self.address_string()} - {format % args}")


def run_server(host='127.0.0.1', port=8545):
    """Start the blockchain RPC server"""
    server_address = (host, port)
    httpd = HTTPServer(server_address, BlockchainRPCHandler)
    
    logger.info(f"Blockchain RPC Server starting on {host}:{port}")
    logger.info(f"Available methods:")
    logger.info(f"  - eth_call: Make Ethereum contract calls")
    logger.info(f"  - erc721_*: Query ERC-721 NFT tokens")
    logger.info(f"  - erc20_*: Query ERC-20 tokens")
    logger.info(f"  - bitcoin_*: Get Bitcoin mining data")
    logger.info(f"  - blockchair_*: Query multi-chain blockchain data")
    logger.info(f"  - server_info: Get server information")
    logger.info(f"")
    logger.info(f"Server is ready to accept connections!")
    logger.info(f"Try: curl http://{host}:{port}/")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("\nShutting down server...")
        httpd.shutdown()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Blockchain RPC Server - JSON-RPC interface for blockchain data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Start server on default port (8545)
  python3 blockchain_rpc_server.py
  
  # Start on custom host and port
  python3 blockchain_rpc_server.py --host 0.0.0.0 --port 3000
  
  # Get server info
  curl http://localhost:8545/
  
  # Make an RPC call (get ERC-721 token owner)
  curl -X POST http://localhost:8545/ \\
    -H "Content-Type: application/json" \\
    -d '{"jsonrpc":"2.0","method":"erc721_ownerOf","params":["0xContractAddress","1"],"id":1}'
        """
    )
    
    parser.add_argument(
        '--host',
        type=str,
        default='127.0.0.1',
        help='Host to bind to (default: 127.0.0.1)'
    )
    
    parser.add_argument(
        '--port',
        type=int,
        default=8545,
        help='Port to listen on (default: 8545)'
    )
    
    parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug logging'
    )
    
    args = parser.parse_args()
    
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)
    
    run_server(args.host, args.port)


if __name__ == '__main__':
    main()
