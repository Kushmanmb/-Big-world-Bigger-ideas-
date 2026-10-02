# Security Configuration

This file contains security settings for the Big World Bigger Ideas platform.

## Address Sanitization

Address sanitization is **ENABLED** by default to prevent blockchain address leaks in logs, error messages, and external API calls.

### Configuration

The address sanitization can be controlled via environment variables:

```bash
# Disable sanitization (NOT RECOMMENDED in production)
export SANITIZE_ADDRESSES=false

# Enable sanitization (default)
export SANITIZE_ADDRESSES=true
```

### How It Works

All blockchain addresses (Ethereum format: 0x + 40 hex characters) are automatically sanitized in:

1. **Console logs** - All console.log, console.error, console.warn outputs
2. **HTTP errors** - Error messages from failed API requests
3. **Error messages** - Any error message containing addresses
4. **Objects** - Deep sanitization of nested objects and arrays

### Sanitization Format

Addresses are shown as: `0xPREFIX****SUFFIX`

Example:
- Original: `0x1234567890123456789012345678901234567890`
- Sanitized: `0x1234********************************7890`

### Whitelisted Addresses

The following addresses are **NOT** sanitized (well-known contracts):
- `0x0000000000000000000000000000000000000000` (Zero address)
- `0x000000000000000000000000000000000000dead` (Burn address)

Additional addresses can be added to the whitelist programmatically.

### Usage in Code

```javascript
const { sanitize, sanitizeText, safeConsole } = require('./src/address-sanitizer');

// Sanitize a single address
const sanitized = sanitize('0x1234567890123456789012345678901234567890');

// Sanitize text containing addresses
const text = 'Send tokens to 0x1234567890123456789012345678901234567890';
const sanitizedText = sanitizeText(text);

// Use safe console (automatically sanitizes all output)
safeConsole.log('User address:', userAddress);
```

## HTTP Client Security

The HTTP client module (`src/http-client.js`) has been enhanced with automatic address sanitization:

- All error messages from HTTP requests are sanitized
- Failed API responses are sanitized before being included in error messages
- Request/response logging sanitizes addresses automatically

## Best Practices

1. **Never log raw addresses** in production environments
2. **Use safeConsole** instead of regular console for logging
3. **Keep SANITIZE_ADDRESSES enabled** in production
4. **Review logs** regularly for any address leaks
5. **Test with sanitization** enabled during development

## Security Audit Checklist

- [x] Address sanitization module created
- [x] HTTP client updated with sanitization
- [x] Test suite for sanitization (20 tests)
- [x] Documentation for security features
- [ ] Pre-commit hooks for address leak detection (planned)
- [ ] Security scanning for all modules (in progress)

## Reporting Security Issues

If you discover a security vulnerability, please email:
- **Security Contact**: mattbrace92@gmail.com
- **Subject**: [SECURITY] Big World Bigger Ideas

Do not create public issues for security vulnerabilities.

## Compliance

This security configuration helps maintain compliance with:
- GDPR (data minimization)
- ISO 27001 (information security)
- Privacy best practices for blockchain applications

## Updates

Last updated: 2026-04-07
Version: 1.0.0
