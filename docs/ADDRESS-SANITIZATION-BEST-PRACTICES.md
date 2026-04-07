# Address Sanitization Security Best Practices

This guide provides best practices for using the address sanitization features in the Big World Bigger Ideas platform to prevent blockchain address leaks.

## Overview

The platform includes a comprehensive address sanitization system that automatically redacts blockchain addresses from:
- Console logs
- Error messages
- HTTP request/response data
- Debug outputs
- External API calls

## Quick Start

### Using Safe Console

Replace `console` with `safeConsole` to automatically sanitize all log output:

```javascript
const { safeConsole } = require('./address-sanitizer');

// Unsafe - may leak addresses
console.log('User address:', userAddress);

// Safe - addresses automatically sanitized
safeConsole.log('User address:', userAddress);
// Output: User address: 0x1234********************************7890
```

### Sanitizing Individual Values

```javascript
const { sanitize, sanitizeText, sanitizeObject } = require('./address-sanitizer');

// Sanitize a single address
const safe = sanitize('0x1234567890123456789012345678901234567890');
// Result: 0x1234********************************7890

// Sanitize text containing addresses
const text = 'Send to 0x1234567890123456789012345678901234567890';
const safeText = sanitizeText(text);
// Result: Send to 0x1234********************************7890

// Sanitize complex objects
const data = {
  from: '0x1234567890123456789012345678901234567890',
  to: '0xabcdef1234567890123456789012345678901234',
  amount: '100'
};
const safeData = sanitizeObject(data);
```

## When to Use Sanitization

### ✅ Always Sanitize

1. **Production Logs**: All logging in production environments
2. **Error Messages**: Any error that might include addresses
3. **API Responses**: External API responses shown to users
4. **Debug Output**: Debug information shown to non-admin users
5. **Analytics**: Data sent to analytics platforms
6. **Monitoring**: Application monitoring and alerting

### ⚠️ Consider Sanitizing

1. **Development Logs**: Can help catch issues early
2. **Test Output**: Useful for CI/CD pipelines
3. **Documentation**: Examples in documentation
4. **Screenshots**: Any screenshots shared publicly

### ❌ Don't Sanitize

1. **Internal Database Records**: Where full addresses are needed
2. **Transaction Signing**: Actual transaction construction
3. **Admin Tools**: Internal admin dashboards (with proper access control)
4. **Blockchain Queries**: RPC calls to blockchain nodes

## Configuration

### Environment Variables

```bash
# Disable sanitization (for development/testing only)
export SANITIZE_ADDRESSES=false

# Enable sanitization (default, recommended for production)
export SANITIZE_ADDRESSES=true
```

### Custom Configuration

```javascript
const { AddressSanitizer } = require('./address-sanitizer');

const customSanitizer = new AddressSanitizer({
  enabled: true,
  visiblePrefix: 8,  // Show 0x + 6 chars
  visibleSuffix: 6,  // Show last 6 chars
  redactionChar: '*',
  whitelist: [
    '0x0000000000000000000000000000000000000000'
  ]
});

const sanitized = customSanitizer.sanitizeAddress(address);
```

## Integration Examples

### Express.js Middleware

```javascript
const { sanitizeObject } = require('./address-sanitizer');

app.use((err, req, res, next) => {
  // Sanitize error before sending to client
  const sanitizedError = sanitizeObject({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json(sanitizedError);
});
```

### Error Handling

```javascript
const { safeConsole, sanitizeText } = require('./address-sanitizer');

try {
  await someBlockchainOperation(userAddress);
} catch (error) {
  // Log with sanitization
  safeConsole.error('Operation failed:', error.message);
  
  // Or sanitize manually
  const safeMessage = sanitizeText(error.message);
  throw new Error(safeMessage);
}
```

### HTTP Client Usage

The platform's `http-client` module automatically sanitizes error messages:

```javascript
const { makeRequest } = require('./http-client');

try {
  const data = await makeRequest({
    hostname: 'api.example.com',
    path: '/address/0x1234567890123456789012345678901234567890'
  });
} catch (error) {
  // Error message is already sanitized
  console.error(error.message);
  // Output: HTTP 404: Address 0x1234****7890 not found
}
```

## Testing

### Unit Tests

```javascript
const { sanitize } = require('./address-sanitizer');
const assert = require('assert');

describe('Address Sanitization', () => {
  it('should sanitize addresses', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const sanitized = sanitize(address);
    
    assert(!sanitized.includes('1234567890123456789012345678901234567890'));
    assert(sanitized.includes('****'));
  });
});
```

### Integration Tests

```javascript
const { safeConsole } = require('./address-sanitizer');

// Mock console to test output (plain Node.js)
const originalLog = console.log;
let loggedArgs = [];
console.log = (...args) => {
  loggedArgs.push(args);
  originalLog(...args);
};

safeConsole.log('Address:', '0x1234567890123456789012345678901234567890');

// Verify the logged address is sanitized
const loggedAddress = loggedArgs[0][1];
if (!loggedAddress.includes('****')) {
  throw new Error('Address was not sanitized');
}

// Restore original console.log
console.log = originalLog;
```

## Whitelisting

### Adding Addresses to Whitelist

For well-known contracts that are safe to display:

```javascript
const { addToWhitelist } = require('./address-sanitizer');

// Add Uniswap V2 Router
addToWhitelist('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');

// Now this address won't be sanitized
```

### Built-in Whitelisted Addresses

- `0x0000000000000000000000000000000000000000` - Zero address
- `0x000000000000000000000000000000000000dead` - Burn address

## Security Checklist

Before deploying to production:

- [ ] All `console.log` replaced with `safeConsole.log`
- [ ] Error messages sanitized with `sanitizeText()`
- [ ] API responses sanitized with `sanitizeObject()`
- [ ] `SANITIZE_ADDRESSES` environment variable set to `true`
- [ ] Logs reviewed for any address leaks
- [ ] Tests verify sanitization is working
- [ ] Documentation updated with security practices
- [ ] Team trained on safe logging practices

## Common Mistakes

### ❌ Logging Raw Objects

```javascript
// BAD: May leak addresses
console.log('Transaction:', transaction);
```

### ✅ Use Safe Console

```javascript
// GOOD: Automatically sanitized
safeConsole.log('Transaction:', transaction);
```

### ❌ String Concatenation Before Sanitization

```javascript
// BAD: Concatenates before sanitization
const message = `Send to ${address}`;
console.log(message);
```

### ✅ Sanitize Then Concatenate

```javascript
// GOOD: Sanitize first
const message = `Send to ${sanitize(address)}`;
console.log(message);
```

## Monitoring

### Detecting Address Leaks

Use the validation function to detect leaks:

```javascript
const { defaultSanitizer } = require('./address-sanitizer');

const logOutput = getRecentLogs();
const result = defaultSanitizer.validateNoAddressLeaks(logOutput);

if (!result.valid) {
  console.error('Address leak detected!');
  console.error('Exposed addresses:', result.exposedAddresses);
}
```

### Automated Scanning

```javascript
// In CI/CD pipeline
const fs = require('fs');
const { defaultSanitizer } = require('./address-sanitizer');

const logFiles = ['app.log', 'error.log'];

let hasLeaks = false;
for (const file of logFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const result = defaultSanitizer.validateNoAddressLeaks(content);
  
  if (!result.valid) {
    console.error(`Leaks found in ${file}:`, result.exposedAddresses);
    hasLeaks = true;
  }
}

if (hasLeaks) {
  process.exit(1);
}
```

## Performance Considerations

- Sanitization adds minimal overhead (~1-5ms per operation)
- Use `enabled: false` in development if needed for debugging
- Cache sanitized values for frequently accessed data
- Whitelist known safe addresses to reduce processing

## Compliance

This sanitization system helps comply with:

- **GDPR**: Data minimization principle
- **ISO 27001**: Information security controls
- **Privacy Laws**: Reducing personally identifiable information in logs
- **Audit Requirements**: Clean logs without sensitive data

## Support

For questions or issues:
- GitHub Issues: [Report a bug](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues)
- Email: mattbrace92@gmail.com

## Updates

- **v1.0.0** (2026-04-07): Initial release with full sanitization support
