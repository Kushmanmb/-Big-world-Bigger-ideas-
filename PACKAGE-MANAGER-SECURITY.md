# Package Manager Security Guide

## Overview

This guide provides security best practices for managing credentials with package managers (npm, RubyGems, pip, etc.). **Never expose authentication tokens or credentials in package manager URLs or configuration files committed to version control.**

## 🚨 Common Security Mistakes

### ❌ CRITICAL: Never Use Credentials in URLs

**These patterns are INSECURE and should NEVER be used:**

```bash
# ❌ Ruby/Bundler - Credentials in gem source URL
gem sources --add https://username:Bearer_token@rubygems.pkg.github.com/ORG/
gem sources --add https://kushmanmb:ghp_abc123@rubygems.pkg.github.com/ORG/

# ❌ NPM - Credentials in registry URL
npm config set registry https://username:token@registry.npmjs.org/

# ❌ Pip/Python - Credentials in index URL
pip install --index-url https://username:password@pypi.org/simple/
```

**Why these are dangerous:**
- Credentials are stored in plain text in configuration files
- They appear in shell history
- They can be logged to CI/CD systems
- They may be accidentally committed to git
- URLs with credentials can be leaked through error messages

## ✅ Secure Authentication Methods

### Ruby Gems and Bundler

#### Option 1: Use Bundle Config (Recommended)
```bash
# Store credentials securely using bundle config
bundle config https://rubygems.pkg.github.com/ORG/ ${GITHUB_TOKEN}

# This stores credentials in .bundle/config (which should be gitignored)
```

#### Option 2: Use .gem/credentials File
```bash
# Add credentials to ~/.gem/credentials
echo ":github: Bearer ${GITHUB_TOKEN}" >> ~/.gem/credentials
chmod 600 ~/.gem/credentials

# Add GitHub Packages source without credentials in Gemfile
# Gemfile:
source "https://rubygems.pkg.github.com/ORG/" do
  gem "your-private-gem"
end
```

#### Option 3: Environment Variables in CI/CD
```yaml
# .github/workflows/example.yml
- name: Configure Bundler
  env:
    BUNDLE_RUBYGEMS__PKG__GITHUB__COM: ${{ secrets.GITHUB_TOKEN }}
  run: |
    bundle config https://rubygems.pkg.github.com/ORG/ ${GITHUB_TOKEN}
    bundle install
```

### NPM / Yarn

#### Option 1: Use .npmrc with Environment Variables
```bash
# Create .npmrc in your home directory or project (add to .gitignore)
echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

# Or use npm login
npm login --registry=https://registry.npmjs.org/
```

#### Option 2: GitHub Packages with npm
```bash
# Add to .npmrc (DO NOT commit this file)
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
@OWNER:registry=https://npm.pkg.github.com/
```

### Python / Pip

#### Option 1: Use .pypirc Configuration (Recommended)
```ini
# ~/.pypirc (DO NOT commit this file)
[distutils]
index-servers =
    pypi
    github

[pypi]
username = __token__
password = <your-token-here>

[github]
repository = https://upload.pypi.org/legacy/
username = __token__
password = <your-github-token>
```

Then use without credentials in URL:
```bash
pip install your-package
```

#### Option 2: Use keyring for secure credential storage (Most Secure)
```bash
# Install keyring support
pip install keyring

# Store credentials securely in system keyring
keyring set https://upload.pypi.org/legacy/ __token__

# Pip will automatically use keyring for authentication
pip install your-package
```

#### Option 3: Use environment variables for CI/CD only
```bash
# For CI/CD pipelines only - use secrets management
pip install --index-url https://pypi.org/simple/ \
  --extra-index-url https://upload.pypi.org/simple/ \
  your-package

# Configure credentials via environment in CI:
# PIP_INDEX_URL=https://pypi.org/simple/
# PIP_EXTRA_INDEX_URL with credentials stored in CI secrets
```

## 🔒 Security Best Practices

### 1. Use Dedicated Credential Files (Gitignored)

Always ensure these files are in `.gitignore`:
- `.bundle/config` (Bundler credentials)
- `.gem/credentials` (RubyGems credentials)
- `.npmrc` (NPM credentials)
- `.pypirc` (Python package credentials)
- `pip.conf` / `pip.ini` (Pip configuration)

### 2. Use Environment Variables

For CI/CD and automation:
```bash
# Good practice - use environment variables
export GITHUB_TOKEN="ghp_abc123..."
export NPM_TOKEN="npm_abc123..."
export GEM_HOST_API_KEY="rubygems_abc123..."

# Then use them without hardcoding
bundle config https://rubygems.pkg.github.com/ORG/ ${GITHUB_TOKEN}
```

### 3. Limit Token Scope and Permissions

- Create tokens with minimal required permissions
- Use read-only tokens when possible
- Create separate tokens for different purposes
- Rotate tokens regularly (e.g., every 90 days)

### 4. Use Secret Management in CI/CD

#### GitHub Actions
```yaml
- name: Configure package access
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: |
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" > .npmrc
```

#### GitLab CI
```yaml
variables:
  BUNDLE_RUBYGEMS__PKG__GITHUB__COM: $GITHUB_TOKEN
```

### 5. Never Log or Echo Credentials

```bash
# ❌ Bad - logs token
echo "Token: ${GITHUB_TOKEN}"

# ✅ Good - logs safely
echo "Token configured successfully"
```

## 🔍 Detecting Exposed Credentials

### Scan for Exposed Credentials
```bash
# Use git-secrets
git secrets --scan

# Use truffleHog
trufflehog git file://. --only-verified

# Use gitleaks
gitleaks detect --source . --verbose
```

### Regular Expression Patterns to Avoid

These patterns should never appear in your code:
```regex
# Credentials in URLs
https://[^:]+:[^@]+@.*\.pkg\.github\.com
https://[^:]+:[^@]+@registry\.npmjs\.org
https://[^:]+:[^@]+@pypi\.org

# Bearer tokens in URLs
https://[^:]+:Bearer[^@]+@
https://[^:]+:ghp_[^@]+@
```

## 🚨 If Credentials Are Exposed

If you accidentally commit credentials:

1. **Immediately revoke/rotate the token**
   - GitHub: Settings → Developer settings → Personal access tokens
   - NPM: npm.com → Account settings → Access tokens
   - RubyGems: rubygems.org → Edit profile → API keys

2. **Remove from git history**
   ```bash
   # Use git-filter-repo (recommended)
   git filter-repo --replace-text <(echo "EXPOSED_TOKEN==>REDACTED")
   
   # Or use BFG Repo-Cleaner
   bfg --replace-text passwords.txt
   ```

3. **Force push to update history**
   ```bash
   git push --force --all
   ```

4. **Notify your team and security contact**

## ✅ Checklist for Package Manager Security

Before committing code:

- [ ] No credentials in package manager URLs
- [ ] No credentials in `Gemfile`, `package.json`, `requirements.txt`, etc.
- [ ] Credential files are in `.gitignore`
- [ ] Environment variables used for sensitive data
- [ ] CI/CD uses secrets management
- [ ] No tokens in shell scripts or documentation
- [ ] Examples use placeholders (e.g., `YOUR_TOKEN_HERE`)

## 📚 Additional Resources

- [GitHub: Working with GitHub Packages](https://docs.github.com/en/packages)
- [NPM: Using private packages](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow)
- [RubyGems: Security best practices](https://guides.rubygems.org/security/)
- [Python: Securing PyPI packages](https://packaging.python.org/guides/publishing-package-distribution-releases-using-github-actions-ci-cd-workflows/)

## 🆘 Support

For security concerns:
- Email: kushmanmb@gmx.com
- Review: [SECURITY-GUIDE.md](./SECURITY-GUIDE.md)
- Policy: [.github/SECURITY.md](./.github/SECURITY.md)

---

**Remember**: The security of your credentials is critical. When in doubt, ask for a security review before committing configuration changes.
