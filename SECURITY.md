# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Big-world-Bigger-ideas seriously. If you have discovered a security vulnerability, please report it to us responsibly.

### Where to Report

**Please DO NOT file a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities by emailing:
- **Security Contact:** [Repository Owner's Email - Update with actual email]
- **Subject Line:** "SECURITY: [Brief Description]"

### What to Include

When reporting a vulnerability, please include:

1. **Description** - A clear description of the vulnerability
2. **Impact** - What an attacker could potentially do
3. **Reproduction Steps** - Detailed steps to reproduce the issue
4. **Affected Components** - Which files, modules, or features are affected
5. **Suggested Fix** - If you have ideas on how to fix the issue (optional)
6. **Your Contact Info** - How we can reach you for follow-up questions

### Example Report

```
Subject: SECURITY: Private Key Exposure in Wallet Module

Description:
The wallet.js module may expose private keys in error messages under certain conditions.

Impact:
An attacker who can trigger specific error conditions could potentially view private keys in log files.

Reproduction:
1. Create a wallet with wallet.generate()
2. Call wallet.encrypt() with an invalid parameter type
3. Check error message output

Affected Components:
- src/wallet.js (lines 45-52)
- Error handling in encrypt() method

Suggested Fix:
Sanitize all error messages to remove sensitive data before logging.

Contact: security-researcher@example.com
```

## Response Timeline

We are committed to responding to security reports in a timely manner:

- **Initial Response:** Within 24 hours
- **Vulnerability Confirmation:** Within 3 business days
- **Fix Development:** Depends on severity
  - Critical: Within 24-48 hours
  - High: Within 1 week
  - Medium: Within 2 weeks
  - Low: Within 1 month
- **Public Disclosure:** After fix is deployed and users have time to update (typically 7-14 days)

## Security Update Process

When a security vulnerability is confirmed:

1. **Acknowledgment** - We will acknowledge your report and confirm the vulnerability
2. **Development** - We will develop a fix in a private branch
3. **Testing** - The fix will be thoroughly tested
4. **Release** - We will release a security patch
5. **Notification** - We will notify users through:
   - GitHub Security Advisory
   - Release notes
   - README update (if necessary)
6. **Credit** - With your permission, we will credit you in the security advisory

## Scope

### In Scope

The following components are in scope for security reports:

✅ **Core Modules:**
- `src/wallet.js` - Wallet encryption and key management
- `src/erc721.js` - ERC-721 NFT interactions
- `src/erc20.js` - ERC-20 token interactions
- `src/token-history.js` - Ownership history tracking
- `src/bitcoin-mining.js` - Bitcoin data fetching
- `src/feature-flags.js` - Feature flag management
- `src/zkpdf.js` - Zero-knowledge proof functionality
- `src/contract-abi.js` - Smart contract ABI handling

✅ **Security-Critical Areas:**
- Private key handling and storage
- API key management
- Password and encryption operations
- Authentication and authorization
- Input validation
- RPC endpoint interactions
- Cryptographic operations

✅ **Infrastructure:**
- GitHub Actions workflows
- Dependency vulnerabilities
- Configuration security

### Out of Scope

The following are generally out of scope:

❌ **Low-Impact Issues:**
- Known issues in third-party dependencies (report to the maintainers directly)
- Issues requiring physical access to the user's device
- Social engineering attacks
- Denial of service attacks on public blockchain networks

❌ **Test/Example Code:**
- Hardcoded values in test files (`*.test.js`)
- Placeholder values in example files (`*-example.js`)
- Development/demo credentials clearly marked as such

❌ **Expected Behavior:**
- JavaScript memory limitations (GC prevents true memory wiping)
- Browser-based security limitations
- Rate limiting on public RPC endpoints (not controlled by us)

## Security Best Practices

### For Contributors

When contributing to this project:

1. **Never commit secrets** - Use environment variables for all sensitive data
2. **Review .gitignore** - Ensure sensitive file patterns are excluded
3. **Use strong passwords** - In examples, demonstrate good password practices
4. **Validate all inputs** - Especially addresses, token IDs, and user-provided data
5. **Use environment variables** - For API keys, RPC URLs, and configuration
6. **Document security** - Add security notes to code handling sensitive data
7. **Test security features** - Write tests for authentication, encryption, and validation

### For Users

When using this library:

1. **Update regularly** - Keep the library and dependencies up to date
2. **Secure your environment** - Use `.env` files and never commit them
3. **Use strong passwords** - When encrypting wallets, use 16+ character passwords
4. **Protect private keys** - Never share private keys or log them
5. **Verify transactions** - Always verify transaction details before signing
6. **Use test networks** - Test on testnets (Sepolia, Goerli) before mainnet
7. **Keep backups** - Securely backup encrypted wallets and recovery phrases

## Known Security Considerations

### JavaScript Memory Limitations

JavaScript does not provide true memory wiping capabilities due to automatic garbage collection. The `clearSensitiveData()` method in the Wallet module is a best-effort approach but cannot guarantee data is removed from memory.

**Mitigation:**
- Use the `clearSensitiveData()` method after wallet operations
- For high-security applications, consider using hardware wallets or HSMs
- Minimize the time sensitive data remains in memory

### Browser Local Storage

Never store unencrypted private keys or passwords in browser local storage.

**Recommendation:**
- Always encrypt sensitive data before storage
- Use sessionStorage instead of localStorage when possible
- Consider using browser extension APIs for secure storage

### Third-Party RPC Providers

When using public RPC endpoints, be aware that providers can see:
- Your IP address
- Contract addresses you interact with
- Transaction data you query

**Mitigation:**
- Use your own RPC node for sensitive operations
- Use VPN or Tor for additional privacy
- Consider using Infura, Alchemy, or other reputable providers

## Security Audits

This project undergoes regular security audits:

- **Latest Audit:** February 25, 2026
- **Audit Reports:** See `SECURITY-AUDIT-*.md` files
- **Next Audit:** Scheduled for May 2026

## Acknowledgments

We would like to thank the following security researchers for responsibly disclosing vulnerabilities:

- *(No vulnerabilities reported yet)*

If you report a security vulnerability and would like to be acknowledged, please let us know in your report.

## Contact

For any security-related questions or concerns:

- **Security Issues:** [Email - Update with actual contact]
- **General Questions:** Open a GitHub issue (for non-security questions only)
- **Documentation:** See `SECURITY-GUIDE.md` and `SECURITY-AUDIT-*.md` files

## Additional Resources

- [SECURITY-GUIDE.md](./SECURITY-GUIDE.md) - Security best practices for developers
- [SECURITY-AUDIT-2026-02-25.md](./SECURITY-AUDIT-2026-02-25.md) - Latest security audit report
- [.env.example](./.env.example) - Example environment configuration
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

## License

This security policy is part of the Big-world-Bigger-ideas project and is subject to the same license.

---

**Last Updated:** February 25, 2026  
**Version:** 1.0
