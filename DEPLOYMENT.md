# Deployment Guide

This document provides comprehensive instructions for deploying the Big World Bigger Ideas platform.

## Quick Links

- [Deployment Checklist](DEPLOYMENT-CHECKLIST.md) - Pre and post-deployment verification
- [Build Guide](BUILD.md) - Build instructions
- [Security Guide](SECURITY-GUIDE.md) - Security best practices

## Overview

Big World Bigger Ideas is deployed as a static website to GitHub Pages with a custom domain (kushmanmb.org). The deployment is fully automated via GitHub Actions.

## Deployment Architecture

- **Platform:** GitHub Pages
- **Domain:** kushmanmb.org (custom domain via CNAME)
- **Build System:** Node.js 18 + Tailwind CSS
- **Deployment Method:** GitHub Actions (automated on push to main)
- **Repository:** https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-

## Automated Deployment

### Workflow: `.github/workflows/deploy.yml`

The deployment workflow automatically triggers on:
1. Push to `main` branch
2. Manual workflow dispatch via GitHub Actions UI

### Deployment Process

The workflow performs the following steps:

1. **Build Phase**
   - Checkout repository code
   - Setup Node.js 18 environment
   - Install dependencies with `npm ci`
   - Run all test suites to verify code quality
   - Build optimized CSS with Tailwind (`npm run build:css`)
   - Prepare deployment package with required files

2. **Deploy Phase**
   - Configure GitHub Pages settings
   - Upload build artifacts
   - Deploy to GitHub Pages
   - Update custom domain (kushmanmb.org)

### Files Included in Deployment

The following files are copied to the `_site` directory for deployment:

**HTML Files:**
- `index.html` - Main landing page
- `editor.html` - Interactive markdown editor
- `BeyondGlobal.html` - BeyondGlobal branding page

**Assets:**
- `styles.css` - Base stylesheet
- `dist/output.css` - Compiled Tailwind CSS
- `BeyondGlobal.svg` - Logo and branding

**Configuration:**
- `CNAME` - Custom domain configuration (kushmanmb.org)
- `feature-flags.json` - Runtime feature flags
- `mint.json` - Mintlify documentation configuration

**Source Code:**
- `src/` - All JavaScript modules
- `contracts/` - Smart contract files

**Documentation Directories:**
- `api-reference/` - API reference documentation (Mintlify)
- `guides/` - User guides and tutorials
- `docs/` - Additional documentation and data
- `wiki/` - Wiki pages
- `EIPsInsight/` - Ethereum Improvement Proposals insights

**Documentation Files (Root Level):**
- `README.md` - Main documentation
- `CHATOPS.md` - ChatOps feature documentation
- `DEPLOYMENT.md` - This deployment guide
- `DEPLOYMENT-CHECKLIST.md` - Pre and post-deployment checklist
- `ETH_COMPONENT_OWNERSHIP.md` - Ethereum component ownership
- `OCTANT-V2-CORE.md` - Octant v2 core documentation
- `BUILD.md` - Build instructions
- `SECURITY-GUIDE.md` - Security best practices
- `SECURITY-AUDIT-SUMMARY.md` - Security audit summary
- `PUBLISHING.md` - Publishing guide
- `MINTLIFY.md` - Mintlify documentation guide
- `FRONTEND.md` - Frontend development guide
- `*.mdx` - All MDX files (introduction, installation, quickstart)

## Manual Deployment

If you need to trigger a deployment manually:

1. Go to the [Actions tab](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions/workflows/deploy.yml)
2. Click "Run workflow"
3. Select the `main` branch
4. Click "Run workflow"

## Local Testing

### Quick Local Deployment Test

Use the `deploy` npm script to test the entire deployment process locally:

```bash
# Install dependencies
npm ci

# Run the complete deployment preparation (tests, build CSS, prepare files)
npm run deploy
```

This will:
- ✅ Run all tests to ensure code quality
- 🎨 Build optimized CSS with Tailwind
- 📦 Prepare the deployment package in `_site/` directory
- ✨ Mirror the exact process used by GitHub Actions

The `_site/` directory will contain all files that would be deployed to GitHub Pages.

### Manual Step-by-Step Testing

You can also run each step individually:

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build CSS
npm run build:css

# Prepare deployment package
node scripts/prepare-deployment.js

# Serve locally (requires a local HTTP server)
python3 -m http.server 8000 --directory _site
# Then visit http://localhost:8000
```

## Requirements

### Node.js Environment
- **Node.js Version:** >=14.0.0 (CI uses 18.x)
- **Package Manager:** npm

### Dependencies
- **Production:**
  - `@discord/embedded-app-sdk` ^2.4.0
  - `braces` ^3.0.3
  
- **Development:**
  - `tailwindcss` ^3.4.17
  - `postcss` ^8.5.6
  - `autoprefixer` ^10.4.24

## Custom Domain Configuration

The repository uses a custom domain (kushmanmb.org) configured via CNAME file:

**CNAME File Location:** `/CNAME`  
**Content:** `kushmanmb.org`

### DNS Requirements

For the custom domain to work, the following DNS records must be configured:

```
kushmanmb.org. IN A 185.199.108.153
kushmanmb.org. IN A 185.199.109.153
kushmanmb.org. IN A 185.199.110.153
kushmanmb.org. IN A 185.199.111.153
```

Or use a CNAME record:
```
kushmanmb.org. IN CNAME kushmanmb-org.github.io.
```

## GitHub Pages Settings

Required repository settings for GitHub Pages:

1. **Source:** GitHub Actions
2. **Custom Domain:** kushmanmb.org
3. **Enforce HTTPS:** Enabled
4. **Permissions:** Repository needs `pages: write` and `id-token: write`

## Deployment Verification

After deployment, verify the following:

1. **Website Accessibility:**
   - Visit https://kushmanmb.org
   - Verify the main page loads correctly
   - Check that styles are applied (Tailwind CSS)

2. **Feature Verification:**
   - Main landing page displays blockchain network documentation
   - Editor page (editor.html) is accessible and functional
   - Feature flags are loading correctly
   - JavaScript modules are accessible

3. **Domain Configuration:**
   - Custom domain (kushmanmb.org) resolves correctly
   - HTTPS is enforced
   - No mixed content warnings

4. **Build Artifacts:**
   - Check the Actions tab for successful deployment
   - Verify all tests passed
   - Review deployment logs if needed

## Troubleshooting

### Deployment Fails

If deployment fails, check:

1. **Test Failures:** Review test logs in GitHub Actions
   ```bash
   npm test  # Run locally to reproduce
   ```

2. **Build Errors:** Check CSS build logs
   ```bash
   npm run build:css
   ```

3. **Missing Dependencies:** Verify package.json and lock file
   ```bash
   npm ci  # Clean install
   ```

4. **Permissions:** Ensure repository has required permissions for GitHub Pages

### Custom Domain Issues

If the custom domain isn't working:

1. Verify CNAME file exists and contains `kushmanmb.org`
2. Check DNS records are properly configured
3. Wait for DNS propagation (can take 24-48 hours)
4. Verify GitHub Pages settings in repository settings

### CSS Not Loading

If styles aren't applied:

1. Check that `dist/output.css` was built successfully
2. Verify the file is included in the deployment package
3. Check browser console for 404 errors
4. Ensure file paths in HTML are correct

### Module Loading Errors

If JavaScript modules fail to load:

1. Verify the `src/` directory is included in deployment
2. Check browser console for errors
3. Ensure modules use CommonJS format (require/module.exports)
4. Verify no hardcoded file paths

## Security Considerations

### Sensitive Files Excluded

The following sensitive files are excluded from deployment:

- Private keys (`*.key`, `*.pem`, etc.)
- Environment variables (`.env`, `.env.local`, etc.)
- Wallet files (`*.wallet`, `wallet.json`, etc.)
- Node modules (`node_modules/`)
- Build artifacts that contain secrets

### Security Best Practices

1. **Never commit sensitive data** to the repository
2. **Use environment variables** for API keys and secrets
3. **Review changes** before pushing to main branch
4. **Monitor deployment logs** for exposed secrets
5. **Keep dependencies updated** to patch vulnerabilities

## Continuous Integration

The repository includes a CI workflow (`.github/workflows/ci.yml`) that runs on:

- Pull requests to `main` branch
- Pushes to branches other than `main`

CI workflow performs:
- Dependency installation
- Test suite execution
- Security audit (`npm audit`)
- File structure verification

## Support

For deployment issues or questions:

- **Creator:** Matthew Brace (kushmanmb)
- **Email:** kushmanmb@gmx.com
- **GitHub:** [@kushmanmb](https://github.com/kushmanmb)
- **ENS:** kushmanmb.eth

## References

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Node.js Documentation](https://nodejs.org/docs)
