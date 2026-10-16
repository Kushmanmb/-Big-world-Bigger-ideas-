# GitHub Pages Setup Guide

This document provides instructions for configuring GitHub Pages to deploy the website at **https://kushmanmb.org**.

## Prerequisites

- Repository must be owned by the organization: `kushmanmb-org`
- Custom domain `kushmanmb.org` must be configured
- DNS records must be properly configured

## Automatic Deployment

The repository is configured with GitHub Actions for automatic deployment:

### Workflow: Deploy to GitHub Pages

**File:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Process:**
1. Checks out repository
2. Sets up Node.js 18
3. Installs dependencies (`npm ci`)
4. Runs all tests (`npm test`)
5. Deploys to GitHub Pages

## GitHub Pages Configuration

### Step 1: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
   - This allows the workflow to deploy directly

### Step 2: Configure Custom Domain

1. In the same Settings → Pages section:
   - **Custom domain:** Enter `kushmanmb.org`
   - Click "Save"
2. Wait for DNS check to complete
3. Enable "Enforce HTTPS" (recommended)

### Step 3: DNS Configuration

Configure your DNS provider with these records:

**⚠️ Note:** GitHub Pages IP addresses may change over time. Always verify these values against the [official GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) before configuring DNS.

#### For apex domain (kushmanmb.org):

```
Type: A
Name: @
Value: 185.199.108.153
```

```
Type: A
Name: @
Value: 185.199.109.153
```

```
Type: A
Name: @
Value: 185.199.110.153
```

```
Type: A
Name: @
Value: 185.199.111.153
```

#### For www subdomain (www.kushmanmb.org):

```
Type: CNAME
Name: www
Value: kushmanmb-org.github.io
```

### Step 4: Verify Custom Domain

Create a `CNAME` file in the repository root (if not already present):

```
kushmanmb.org
```

**Note:** The deploy workflow automatically includes this file in deployment.

## Testing Deployment

### Local Testing

Before deploying, test the site locally:

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Start local HTTP server
python3 -m http.server 8000

# Visit http://localhost:8000 in your browser
```

### Monitoring Deployment

1. Go to the "Actions" tab in GitHub
2. Click on the latest "Deploy to GitHub Pages" workflow run
3. Monitor the build and deploy steps
4. Once complete, visit https://kushmanmb.org

## Deployed Files

The following files are automatically deployed:

- `index.html` - Main documentation page
- `editor.html` - Web editor with live preview
- `styles.css` - Main stylesheet
- `feature-flags.json` - Feature flag configuration
- All documentation files (*.md)
- All JavaScript modules in `src/`

## Troubleshooting

### Site Not Updating

1. Check the Actions tab for failed workflows
2. Review workflow logs for errors
3. Ensure tests are passing
4. Clear browser cache and try again

### Custom Domain Not Working

1. Verify DNS records are correctly configured
2. Wait for DNS propagation (can take up to 48 hours)
3. Check Settings → Pages for DNS verification status
4. Ensure CNAME file exists in repository root

### 404 Errors

1. Check that `index.html` exists in repository root
2. Verify file names match exactly (case-sensitive)
3. Check deploy workflow uploaded all necessary files

### HTTPS Certificate Issues

1. Ensure "Enforce HTTPS" is enabled in Settings → Pages
2. Wait for GitHub to provision the certificate (can take a few minutes)
3. Try accessing the site in incognito/private mode

## Workflow Status Badge

The README includes a workflow status badge:

```markdown
[![Deploy](https://github.com/Kushmanmb/-Big-world-Bigger-ideas-/actions/workflows/deploy.yml/badge.svg)](https://github.com/Kushmanmb/-Big-world-Bigger-ideas-/actions/workflows/deploy.yml)
```

This shows the current deployment status.

## Maintenance

### Updating the Site

1. Make changes to HTML, CSS, or other files
2. Commit and push to a feature branch
3. Create a pull request to `main`
4. CI workflow will run tests automatically
5. After review and merge, deploy workflow runs automatically
6. Site updates within a few minutes

### Manual Deployment

If needed, trigger deployment manually:

1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

## Security

- All tests must pass before deployment
- Pull requests require review (recommended)
- Deployment only occurs on `main` branch
- No sensitive data should be in deployed files

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)

## Support

For issues related to:
- **Repository:** Open an issue in this repository
- **Custom domain:** Contact DNS provider
- **GitHub Pages:** Check GitHub Status or GitHub Support
