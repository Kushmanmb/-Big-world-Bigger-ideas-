# Pre-commit Hooks Setup Guide

This guide explains how to set up pre-commit hooks to prevent accidentally committing sensitive data like private keys, API keys, and passwords.

## Why Pre-commit Hooks?

Pre-commit hooks automatically scan your code before each commit to catch:
- Private keys and seed phrases
- API keys and tokens
- Passwords and secrets
- Sensitive configuration files
- Common security vulnerabilities

This provides an extra safety net beyond the `.gitignore` file.

## Option 1: Using detect-secrets (Recommended)

[detect-secrets](https://github.com/Yelp/detect-secrets) is a tool by Yelp that scans for secrets in your code.

### Installation

```bash
# Install detect-secrets globally or as a dev dependency
npm install --save-dev detect-secrets-hook

# Or install with pip
pip install detect-secrets
```

### Setup

1. **Create a baseline:**
   ```bash
   detect-secrets scan > .secrets.baseline
   ```

2. **Review the baseline:**
   ```bash
   detect-secrets audit .secrets.baseline
   ```

3. **Add to pre-commit hook:**
   
   Create or edit `.git/hooks/pre-commit`:
   ```bash
   #!/bin/bash
   
   # Run detect-secrets
   detect-secrets-hook --baseline .secrets.baseline $(git diff --cached --name-only)
   
   if [ $? -ne 0 ]; then
       echo "❌ Potential secrets detected! Commit aborted."
       echo "Run 'detect-secrets scan --update .secrets.baseline' to update baseline"
       exit 1
   fi
   
   echo "✅ No secrets detected"
   exit 0
   ```

4. **Make hook executable:**
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

## Option 2: Using git-secrets (Alternative)

[git-secrets](https://github.com/awslabs/git-secrets) is an AWS tool that prevents secrets from being committed.

### Installation (macOS)

```bash
brew install git-secrets
```

### Installation (Linux)

```bash
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

### Setup

1. **Install hooks in your repository:**
   ```bash
   cd /path/to/-Big-world-Bigger-ideas-
   git secrets --install
   ```

2. **Add patterns to scan:**
   ```bash
   # AWS keys
   git secrets --add 'AKIA[0-9A-Z]{16}'
   git secrets --add '[0-9a-zA-Z/+]{40}'
   
   # Private keys (64 hex chars)
   git secrets --add '[0-9a-fA-F]{64}'
   
   # Google API keys
   git secrets --add 'AIza[0-9A-Za-z\\-_]{35}'
   
   # Generic patterns
   git secrets --add 'api[_-]?key'
   git secrets --add 'apikey'
   git secrets --add 'private[_-]?key'
   git secrets --add 'secret[_-]?key'
   
   # Ethereum addresses (for informational purposes)
   git secrets --add '0x[a-fA-F0-9]{40}'
   ```

3. **Add allowed patterns (whitelist):**
   ```bash
   # Allow test addresses
   git secrets --add --allowed 'abcdefabcdef1234567890abcdefabcdef123456'
   
   # Allow example placeholders
   git secrets --add --allowed 'YOUR_API_KEY_HERE'
   git secrets --add --allowed 'your_.*_here'
   ```

4. **Test the setup:**
   ```bash
   # Create a test file with a fake secret
   echo "AWS_KEY=AKIAIOSFODNN7EXAMPLE" > test-secret.txt
   git add test-secret.txt
   git commit -m "test"
   # Should be blocked!
   
   # Clean up
   git reset HEAD test-secret.txt
   rm test-secret.txt
   ```

## Option 3: Using Husky + Custom Script (Most Flexible)

[Husky](https://typicode.github.io/husky/) makes Git hooks easy to manage and share with your team.

### Installation

```bash
npm install --save-dev husky
npx husky install
```

### Setup

1. **Add prepare script to package.json:**
   ```json
   {
     "scripts": {
       "prepare": "husky install"
     }
   }
   ```

2. **Create pre-commit hook:**
   ```bash
   npx husky add .husky/pre-commit "npm run pre-commit"
   ```

3. **Add pre-commit script to package.json:**
   ```json
   {
     "scripts": {
       "prepare": "husky install",
       "pre-commit": "node scripts/check-secrets.js"
     }
   }
   ```

4. **Create `scripts/check-secrets.js`:**
   ```javascript
   #!/usr/bin/env node
   
   const { execSync } = require('child_process');
   const fs = require('fs');
   
   console.log('🔍 Scanning for secrets...');
   
   // Get staged files
   const stagedFiles = execSync('git diff --cached --name-only')
     .toString()
     .split('\n')
     .filter(f => f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.md'));
   
   // Patterns to check
   const dangerousPatterns = [
     // AWS keys
     { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
     { pattern: /[0-9a-zA-Z/+]{40}/, name: 'AWS Secret Key' },
     
     // Private keys (64 hex chars, excluding test data)
     { pattern: /(?<!test).*[0-9a-fA-F]{64}/, name: 'Potential Private Key' },
     
     // Google API keys
     { pattern: /AIza[0-9A-Za-z\-_]{35}/, name: 'Google API Key' },
     
     // Generic API keys
     { pattern: /api[_-]?key["\s:=]+["\']?[a-zA-Z0-9]{20,}/, name: 'API Key' },
     
     // Passwords (excluding test files)
     { pattern: /password["\s:=]+["\'][^"\']{8,}/, name: 'Hardcoded Password' }
   ];
   
   // Allowed patterns (whitelist)
   const allowedPatterns = [
     'YOUR_API_KEY_HERE',
     'your_api_key_here',
     'example.com',
     'test',
     'demo',
     'abcdefabcdef1234567890abcdefabcdef123456',
     '0x0000000000000000000000000000000000000000'
   ];
   
   let foundSecrets = false;
   
   for (const file of stagedFiles) {
     if (!fs.existsSync(file)) continue;
     
     const content = fs.readFileSync(file, 'utf8');
     const lines = content.split('\n');
     
     for (let i = 0; i < lines.length; i++) {
       const line = lines[i];
       
       for (const { pattern, name } of dangerousPatterns) {
         if (pattern.test(line)) {
           // Check if it's an allowed pattern
           const isAllowed = allowedPatterns.some(allowed => line.includes(allowed));
           
           if (!isAllowed) {
             console.error(`\n❌ ${name} detected in ${file}:${i + 1}`);
             console.error(`   ${line.trim().substring(0, 80)}...`);
             foundSecrets = true;
           }
         }
       }
     }
   }
   
   if (foundSecrets) {
     console.error('\n❌ Potential secrets detected! Commit aborted.');
     console.error('\nIf this is a false positive, you can:');
     console.error('1. Update scripts/check-secrets.js to whitelist the pattern');
     console.error('2. Use git commit --no-verify (NOT recommended)');
     console.error('3. Remove the sensitive data and use environment variables\n');
     process.exit(1);
   }
   
   console.log('✅ No secrets detected\n');
   process.exit(0);
   ```

5. **Make the script executable:**
   ```bash
   chmod +x scripts/check-secrets.js
   ```

6. **Test the hook:**
   ```bash
   # Make a change and try to commit
   echo "test change" >> README.md
   git add README.md
   git commit -m "test hook"
   # Should run the secret scanner
   ```

## Option 4: GitHub Secret Scanning (GitHub-side)

GitHub provides automatic secret scanning for public repositories and GitHub Advanced Security subscribers.

### Setup

1. **Enable secret scanning** (if available):
   - Go to repository Settings → Code security and analysis
   - Enable "Secret scanning"
   - Enable "Push protection"

2. **Review alerts:**
   - GitHub will notify you if secrets are detected
   - Alerts appear in Security → Secret scanning alerts

## Recommended Setup for This Project

We recommend using **Option 3 (Husky + Custom Script)** because:

1. ✅ Easy to install and configure
2. ✅ Works on all platforms (Windows, macOS, Linux)
3. ✅ Customizable to project needs
4. ✅ Shared with team (hooks are in Git)
5. ✅ Node.js based (matches project stack)
6. ✅ No external dependencies to install

## Quick Setup (Recommended)

Run these commands to set up pre-commit hooks:

```bash
# Install Husky
npm install --save-dev husky
npx husky install

# Add prepare script
npm pkg set scripts.prepare="husky install"

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Create pre-commit hook
npx husky add .husky/pre-commit "npm run pre-commit"

# Add pre-commit script to package.json
npm pkg set scripts.pre-commit="node scripts/check-secrets.js"

# Create the check-secrets.js script
# (Copy the script from Option 3 above)

# Make it executable
chmod +x scripts/check-secrets.js

# Test it
echo "test" >> README.md
git add README.md
git commit -m "test pre-commit hook"
git reset HEAD~1  # Undo test commit
git checkout README.md  # Revert changes
```

## Bypassing Hooks (Emergency Only)

If you absolutely need to bypass the hooks (not recommended):

```bash
git commit --no-verify -m "message"
```

⚠️ **Warning:** Only use `--no-verify` if you're certain your commit doesn't contain secrets!

## Testing Your Setup

Create a test file to verify the hooks are working:

```bash
# Create a file with a fake secret
echo "AKIA123456789ABCDEFG" > test-secret.txt

# Try to commit it
git add test-secret.txt
git commit -m "test secret detection"

# If the hook is working, the commit should be blocked!
# If not blocked, the hook is not properly installed

# Clean up
rm test-secret.txt
git reset HEAD
```

## Integration with CI/CD

You can also run secret scanning in your CI/CD pipeline:

### GitHub Actions

Create `.github/workflows/secret-scan.yml`:

```yaml
name: Secret Scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Install detect-secrets
        run: pip install detect-secrets
      
      - name: Scan for secrets
        run: |
          detect-secrets scan --baseline .secrets.baseline
          
      - name: Audit baseline
        run: |
          detect-secrets audit .secrets.baseline
```

## Troubleshooting

### Hooks Not Running

```bash
# Check if hooks are installed
ls -la .git/hooks/

# Reinstall hooks
npx husky install

# Check hook permissions
chmod +x .git/hooks/pre-commit
```

### False Positives

Update the `allowedPatterns` array in `scripts/check-secrets.js` to whitelist false positives.

### Want to Remove Hooks

```bash
# Remove Husky
rm -rf .husky
npm uninstall husky

# Or disable temporarily
git config --global core.hooksPath /dev/null
```

## Summary

Pre-commit hooks are a critical security measure for blockchain projects. Choose the option that best fits your workflow:

- **Husky + Custom Script** - Best for JavaScript projects (Recommended)
- **detect-secrets** - Best for Python-heavy projects
- **git-secrets** - Best for AWS-centric projects
- **GitHub Secret Scanning** - Best as an additional layer

Remember: Pre-commit hooks are **not a replacement** for proper security practices, but they provide an important safety net!

---

**Last Updated:** February 25, 2026  
**Maintained By:** Security Team
