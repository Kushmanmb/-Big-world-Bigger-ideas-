# Security Best Practices for Developers

This document outlines security best practices when working with this blockchain and cryptocurrency utilities repository.

## 🔒 Critical Security Rules

### Never Commit Secrets

**NEVER** commit the following to version control:

- **Private Keys**: Blockchain wallet private keys, seed phrases, mnemonics
- **API Keys**: Etherscan, Blockchair, or any other API service keys
- **Passwords**: User passwords, encryption passwords, database credentials
- **Tokens**: Authentication tokens, access tokens, refresh tokens
- **Certificates**: SSL/TLS certificates, SSH private keys
- **Configuration Files**: Files containing any of the above

### Use Environment Variables

Always use environment variables for sensitive configuration:

```javascript
// ❌ WRONG - Never hardcode secrets
const apiKey = 'sk_live_1234567890abcdef';

// ✅ CORRECT - Use environment variables
const apiKey = process.env.ETHERSCAN_API_KEY;
```

### Example Environment Variable Setup

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your actual values to `.env`**:
   ```
   ETHERSCAN_API_KEY=your_real_api_key_here
   ```

3. **Load environment variables in your code**:
   ```javascript
   require('dotenv').config(); // If using dotenv package
   const apiKey = process.env.ETHERSCAN_API_KEY;
   ```

4. **Verify `.env` is in `.gitignore`** (already configured in this repo)

## 🛡️ Wallet Security

### Private Key Management

**DO**:
- ✅ Generate private keys using cryptographically secure methods
- ✅ Encrypt private keys before storing them
- ✅ Use hardware wallets for high-value accounts
- ✅ Store encrypted wallets in secure locations
- ✅ Use the provided `Wallet` encryption module (AES-256-CBC + PBKDF2)

**DON'T**:
- ❌ Store private keys in plain text
- ❌ Share private keys via email, chat, or any communication channel
- ❌ Store private keys in browser local storage
- ❌ Log private keys to console or log files
- ❌ Include private keys in error messages

### Password Guidelines

When encrypting wallets:

1. **Minimum Length**: 8 characters (enforced by the Wallet module)
2. **Recommended Length**: 16+ characters
3. **Complexity**: Mix of uppercase, lowercase, numbers, and symbols
4. **Uniqueness**: Don't reuse passwords across different wallets

Example of good password:
```
MyW@llet2024!SecureP@ssphrase
```

## 🔐 API Key Security

### Getting API Keys

- **Etherscan**: https://etherscan.io/apis (free tier available)
- **Blockchair**: https://blockchair.com/api (optional for some features)

### Protecting API Keys

1. **Store in environment variables**:
   ```bash
   export ETHERSCAN_API_KEY="your_key_here"
   ```

2. **Use separate keys for development/production**:
   ```
   ETHERSCAN_API_KEY_DEV=dev_key_here
   ETHERSCAN_API_KEY_PROD=prod_key_here
   ```

3. **Rotate keys regularly**: Generate new API keys every 90 days

4. **Monitor usage**: Check API key usage for unusual activity

### API Key Exposure Response

If you accidentally commit an API key:

1. **Revoke the key immediately** on the provider's website
2. **Generate a new key**
3. **Remove the key from git history**:
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   git filter-repo --replace-text <(echo "OLD_API_KEY==>REMOVED")
   ```
4. **Force push** (only if you have the authority):
   ```bash
   git push --force
   ```

## 🔐 Package Manager Security

### Ruby Gems and Bundler

When working with private Ruby gems or GitHub Packages:

**DO**:
- ✅ Use environment variables for authentication tokens
- ✅ Configure credentials in `~/.gem/credentials` (never commit this file)
- ✅ Use `bundle config` to set credentials locally
- ✅ Use GitHub Actions secrets for CI/CD authentication

**DON'T**:
- ❌ **NEVER** include credentials in gem source URLs
- ❌ **NEVER** commit `.bundle/config` with credentials
- ❌ **NEVER** commit `.gem/credentials` file
- ❌ Don't use passwords or tokens in `Gemfile` or `Gemfile.lock`

### Insecure Example (DO NOT USE):
```bash
# ❌ WRONG - Credentials exposed in URL
gem sources --add https://username:token@rubygems.pkg.github.com/ORG/

# ❌ WRONG - Token in Gemfile
source "https://username:ghp_token123@rubygems.pkg.github.com/ORG/"
```

### Secure Example (CORRECT):
```bash
# ✅ CORRECT - Use bundle config with environment variable
bundle config https://rubygems.pkg.github.com/ORG/ $GITHUB_TOKEN

# ✅ CORRECT - Use .gem/credentials file
echo ":github: Bearer ${GITHUB_TOKEN}" >> ~/.gem/credentials
chmod 600 ~/.gem/credentials

# ✅ CORRECT - Gemfile without credentials
source "https://rubygems.pkg.github.com/ORG/" do
  gem "private-gem"
end
```

### NPM and JavaScript Packages

When working with private npm packages:

**Secure Configuration**:
```bash
# ✅ Use .npmrc with environment variable
echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

# ✅ Use npm login
npm login --registry=https://registry.npmjs.org/
```

**Never commit `.npmrc` files containing auth tokens**.

## 📝 Code Review Security Checklist

Before committing code, verify:

- [ ] No hardcoded API keys, passwords, or secrets
- [ ] All sensitive data uses environment variables
- [ ] `.env` files are in `.gitignore`
- [ ] No private keys in code or comments
- [ ] No credentials in package manager URLs (gem sources, npm registry, etc.)
- [ ] No `.bundle/config`, `.gem/credentials`, or `.npmrc` files with tokens
- [ ] Test files clearly indicate test credentials are not real
- [ ] Example files use placeholder values (e.g., `YOUR_API_KEY_HERE`)
- [ ] No sensitive data in error messages or logs

## 🧪 Testing Security

### Test Credentials

It's **acceptable** to use hardcoded credentials in test files when:

1. **They are clearly fake/test values**
2. **They are documented as test-only**
3. **They match the pattern of real credentials but are invalid**

Example from `wallet.test.js`:
```javascript
// SECURITY NOTE: Test password - not a real credential
const password = 'TestPassword123';
```

### Security Testing

Run security scans regularly:

```bash
# Check for secrets in code
npm audit

# Use git-secrets to prevent commits with secrets
git secrets --scan

# Run CodeQL analysis (automated in CI/CD)
# Configured in .github/workflows/
```

## 🚨 Incident Response

If you discover a security issue:

1. **Do NOT** create a public GitHub issue
2. **Report privately** to: security@your-domain.com (update this)
3. **Include details**: What you found, where, potential impact
4. **Wait for acknowledgment** before public disclosure

See `.github/SECURITY.md` for full vulnerability reporting process.

## 📚 Additional Resources

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## ✅ Encryption Implementation

This repository uses industry-standard encryption:

- **Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Randomly generated per encryption
- **IV**: Randomly generated per encryption

This is implemented in `src/wallet.js` and has been audited for security.

## 🔍 Regular Security Audits

Security measures in place:

1. **Comprehensive `.gitignore`**: 228 lines covering all secret types
2. **Branch Protection**: Signed commits required on main branch
3. **Automated Scanning**: GitHub security scanning enabled
4. **Dependency Audits**: Regular `npm audit` checks
5. **Code Review**: All PRs require review before merge

Last security audit: 2026-02-25
Next scheduled audit: 2026-05-25

**Recent Security Enhancements (February 2026):**
- Fixed API key logging exposure in example files
- Added memory management for private keys (`clearSensitiveData()` method)
- Enhanced cryptographic randomness validation
- Improved zero-knowledge proof nonce handling
- Added comprehensive security audit documentation

See `SECURITY-AUDIT-2026-02.md` for detailed audit findings and fixes.

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for a security review before committing sensitive changes.
