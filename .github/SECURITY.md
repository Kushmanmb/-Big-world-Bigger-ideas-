# Branch Protection and Security Configuration

## Overview

This document describes the branch protection rules and security configurations implemented in this repository to protect sensitive data and maintain code quality.

## Branch Protection Rulesets

### Main Branch Protection (`branch-protection.json`)

Protects the `main` and `master` branches with the following rules:

#### Required Reviews
- **Minimum Required Approvals**: 1 approving review required
- **Dismiss Stale Reviews**: Automatically dismiss approvals when new commits are pushed
- **Require Review Thread Resolution**: All review comments must be resolved before merging

#### Branch Restrictions
- **Prevent Deletion**: Main branch cannot be deleted
- **Prevent Force Push**: Non-fast-forward pushes are blocked
- **Linear History**: Requires a linear commit history (no merge commits)
- **Signed Commits**: All commits must be signed

#### Status Checks
- **Strict Status Checks**: Branches must be up-to-date before merging
- Additional status checks can be configured as needed

#### Bypass Actors
- Repository administrators can bypass these rules when necessary

### Release Branch Protection (`release-protection.json`)

Protects release and hotfix branches with stricter requirements:

#### Required Reviews
- **Minimum Required Approvals**: 2 approving reviews required
- **Dismiss Stale Reviews**: Automatically dismiss approvals when new commits are pushed
- **Require Last Push Approval**: At least one approval must be from a commit after the last push
- **Require Review Thread Resolution**: All review comments must be resolved

#### Branch Restrictions
- **Prevent Deletion**: Release branches cannot be deleted
- **Prevent Force Push**: Non-fast-forward pushes are blocked
- **Linear History**: Requires a linear commit history

## Enhanced .gitignore Configuration

The `.gitignore` file has been enhanced to prevent accidental commits of sensitive data:

### Private Keys and Certificates
- SSL/TLS certificates (*.pem, *.crt, *.key)
- Private key files (*.key, *.ppk)
- Keystores and certificate stores (*.keystore, *.jks, *.p12, *.pfx)

### SSH Keys
- All common SSH key formats (id_rsa, id_dsa, id_ecdsa, id_ed25519)
- PuTTY private keys (*.ppk)

### Environment Variables and Secrets
- Environment files (.env, .env.*, *.env)
- Secret configuration files (*secret*, *.secret, secrets.json, etc.)
- API keys and tokens (*apikey*, *.token, tokens.json)

### Blockchain and Cryptocurrency
- Wallet files (*.wallet, wallet.json, wallet.dat)
- Keystore directories and files
- Mnemonic and seed phrases (mnemonic.txt, seed.txt)
- Private key files (private-key.txt, privatekey.txt)

### Cloud Provider Credentials
- **AWS**: .aws/, aws-credentials, credentials.csv
- **Google Cloud**: *service-account*.json, gcloud-service-key.json
- **Azure**: *.azureauth, *.publishsettings

### Database Credentials
- Database configuration files (database.yml, database.json)
- Database credential files (*.db-credentials, *.sql-credentials)

### Local Configuration Files
- Local configuration overrides (config.local.*, local.config.*)
- Development-specific settings that may contain secrets

### Backup and Temporary Files
- Backup files (*.backup, *.bak, *.old)
- Temporary files (*.tmp, *.temp, tmp/, temp/)
- Swap files (*.swp, *.swo)

### Log Files
- Application logs (*.log, logs/, log/)
- May contain sensitive information like API keys, tokens, or personal data

## Applying Branch Protection Rules

### Using GitHub Web Interface

1. Navigate to repository **Settings** → **Branches**
2. Click **Add branch protection rule** or **Add ruleset**
3. Import the JSON configurations from `.github/rulesets/`

### Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Apply main branch protection
gh api repos/{owner}/{repo}/rulesets \
  --method POST \
  --input .github/rulesets/branch-protection.json

# Apply release branch protection
gh api repos/{owner}/{repo}/rulesets \
  --method POST \
  --input .github/rulesets/release-protection.json
```

### Using GitHub API

```bash
# Using curl with GitHub API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/{owner}/{repo}/rulesets \
  -d @.github/rulesets/branch-protection.json
```

## Security Best Practices

### Before Committing Code

1. **Review Changes**: Always review files before committing
   ```bash
   git status
   git diff
   ```

2. **Check for Secrets**: Use tools like `git-secrets` or `truffleHog`
   ```bash
   # Install git-secrets
   git secrets --scan
   ```

3. **Use Environment Variables**: Never hardcode secrets in code
   ```javascript
   // ❌ Bad
   const apiKey = "sk_live_1234567890abcdef";
   
   // ✅ Good
   const apiKey = process.env.API_KEY;
   ```

### Managing Secrets

1. **Use Environment Variables**: Store secrets in `.env` files (which are gitignored)
2. **Use Secret Management**: Consider services like:
   - GitHub Secrets (for CI/CD)
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager

3. **Encrypt Sensitive Files**: If you must store sensitive files, encrypt them first

### What to Do If Secrets Are Committed

If you accidentally commit secrets to the repository:

1. **Immediately Revoke/Rotate**: Invalidate the exposed secret
2. **Remove from History**: Use tools to remove the secret from git history
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   git filter-repo --path SECRET_FILE --invert-paths
   ```
3. **Force Push**: Update the remote repository (requires force push permission)
   ```bash
   git push --force
   ```
4. **Notify Team**: Inform your team about the incident

## Testing .gitignore Rules

To verify that sensitive files are properly ignored:

```bash
# Create test files
touch test.key test.pem .env test-secret.json

# Check if they're ignored
git status

# Clean up test files
rm test.key test.pem .env test-secret.json
```

## Monitoring and Compliance

### Regular Audits
- Review access logs periodically
- Audit who has bypass permissions
- Check for any accidentally committed secrets

### Automated Scanning
Consider integrating tools like:
- **Dependabot**: Automatic dependency updates
- **CodeQL**: Security vulnerability scanning
- **Snyk**: Dependency and container scanning
- **GitGuardian**: Secret detection in code

## Support and Questions

For questions about security configurations or to report security issues:

- **Email**: [mattbrace92@gmail.com](mailto:mattbrace92@gmail.com)
- **Website**: [kushmanmb.org](https://kushmanmb.org)
- **ENS**: kushmanmb.base.eth

## References

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Repository Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Git Security Best Practices](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**
