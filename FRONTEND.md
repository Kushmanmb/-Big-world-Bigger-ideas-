# Frontend Build & Deployment

This document describes the frontend build configuration and deployment setup for https://kushmanmb.org/.

## Overview

The website is a static site built with:
- **HTML/CSS** - Core structure and styling
- **Tailwind CSS v3** - Utility-first CSS framework (available for future use)
- **GitHub Actions** - Automated build and deployment
- **GitHub Pages** - Hosting platform

## Project Structure

### Frontend Files

```
/
├── index.html              # Main landing page
├── editor.html            # Web editor with markdown preview
├── BeyondGlobal.html      # BeyondGlobal branding page
├── BeyondGlobal.svg       # BeyondGlobal logo
├── styles.css             # Custom CSS styles
├── CNAME                  # Custom domain configuration
├── feature-flags.json     # Feature flag configuration
└── src/
    └── input.css          # Tailwind CSS source file
```

### Build Output

```
dist/
└── output.css             # Compiled Tailwind CSS (minified)
```

**Note:** The `dist/` directory is excluded from git (in `.gitignore`) and created during the build process.

## Custom Domain Configuration

The site is configured to deploy to **https://kushmanmb.org/** using GitHub Pages custom domain feature.

### CNAME File

The repository includes a `CNAME` file at the root containing:
```
kushmanmb.org
```

This file is automatically deployed to GitHub Pages and instructs GitHub to serve the site at the custom domain.

### DNS Configuration

For the custom domain to work, the following DNS records must be configured at your domain registrar:

**Apex domain (kushmanmb.org):**
```
Type: A
Name: @
Values:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
```

**www subdomain (optional):**
```
Type: CNAME
Name: www
Value: kushmanmb-org.github.io
```

See [GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) for the latest DNS configuration requirements.

## CSS Build System

### Tailwind CSS

The project uses **Tailwind CSS v3.4.17** for utility-first CSS styling.

**Configuration files:**
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration with Tailwind plugin
- `src/input.css` - Tailwind source file with directives

### Building CSS Locally

To build CSS for development:

```bash
# Install dependencies first
npm ci

# Build CSS (creates dist/output.css)
npm run build:css

# Watch for changes and rebuild automatically
npm run watch:css
```

### Current CSS Usage

**index.html:**
- Uses `styles.css` which contains all custom styles
- Does not currently use Tailwind utility classes
- Tailwind build is available for future enhancement

**editor.html:**
- Uses Tailwind CSS CDN for simplicity
- Has inline custom styles for editor layout

## Automated Deployment

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Build Steps:**
1. ✅ Checkout repository
2. ✅ Setup Node.js 18
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run all tests (`npm test`)
5. ✅ Build Tailwind CSS (`npm run build:css`)
6. ✅ Prepare deployment files
7. ✅ Upload to GitHub Pages
8. ✅ Deploy to production

### Deployment Files

The following files are automatically deployed to GitHub Pages:

- `index.html` - Main page
- `editor.html` - Web editor
- `BeyondGlobal.html` - Branding page
- `BeyondGlobal.svg` - Logo
- `styles.css` - Custom styles
- `dist/output.css` - Compiled Tailwind CSS
- `CNAME` - Custom domain config
- `feature-flags.json` - Feature flags
- `src/` - Source JavaScript modules
- `contracts/` - Smart contract files
- Documentation files (README.md, etc.)

### Excluded from Deployment

These files/directories are NOT deployed:
- `node_modules/` - Dependencies
- `.git/` - Git history
- `.github/` - Workflow files
- Test files (`*.test.js`)
- Configuration files (`package.json`, `tailwind.config.js`, etc.)

## Continuous Integration

**File:** `.github/workflows/ci.yml`

Runs on:
- Pull requests to `main`
- Pushes to non-main branches

**Checks:**
1. ✅ Run all tests
2. ✅ Security audit
3. ✅ Verify required files exist

## Local Development

### Prerequisites

```bash
# Node.js 14 or higher
node --version

# npm (comes with Node.js)
npm --version
```

### Setup

```bash
# Clone the repository
git clone https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-.git
cd -Big-world-Bigger-ideas-

# Install dependencies
npm ci

# Build CSS
npm run build:css
```

### Testing the Site Locally

**Option 1: Simple HTTP Server (Python)**
```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

**Option 2: Node.js HTTP Server**
```bash
npx http-server -p 8000
# Visit http://localhost:8000
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Making Changes

1. **Edit HTML files** - Changes are immediate
2. **Edit styles.css** - Refresh browser to see changes
3. **Edit Tailwind (src/input.css)** - Run `npm run build:css` then refresh
4. **Watch mode** - Run `npm run watch:css` for auto-rebuild

### Running Tests

```bash
# Run all tests
npm test

# Run specific module tests
npm run test:wallet
npm run test:feature-flags
# ... (see package.json for all test scripts)
```

## Deployment Process

### Automatic Deployment

When changes are pushed to `main`:

1. CI workflow runs tests
2. Deploy workflow builds CSS
3. Site is deployed to GitHub Pages
4. Available at https://kushmanmb.org/ within minutes

### Manual Deployment

To trigger deployment manually:

1. Go to GitHub Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

### Monitoring Deployment

1. Go to repository **Actions** tab
2. Click on latest "Deploy to GitHub Pages" run
3. Monitor build and deploy steps
4. Check for any errors in logs
5. Once complete, verify site at https://kushmanmb.org/

## GitHub Pages Settings

### Repository Settings → Pages

**Build and deployment:**
- **Source:** GitHub Actions
- **Custom domain:** kushmanmb.org
- **Enforce HTTPS:** Enabled (recommended)

**Note:** These settings are configured in the repository settings, not in code.

## Troubleshooting

### CSS Not Building

**Problem:** `npm run build:css` fails

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build:css
```

### Deployment Fails

**Problem:** Deploy workflow fails

**Possible causes:**
1. Tests failing - Fix tests first
2. Missing files - Ensure all referenced files exist
3. Permissions - Verify workflow has correct permissions
4. Dependencies - Check `npm ci` completes successfully

**Solution:** Check workflow logs in Actions tab for specific error

### Custom Domain Not Working

**Problem:** Site not accessible at kushmanmb.org

**Solutions:**
1. Verify CNAME file exists and contains correct domain
2. Check DNS records at domain registrar
3. Wait for DNS propagation (up to 48 hours)
4. Verify GitHub Pages settings show domain as verified
5. Clear browser cache and try incognito mode

### Tailwind Styles Not Applying

**Problem:** Tailwind utility classes not working

**Current state:** 
- `index.html` uses custom styles only (no Tailwind utilities)
- `editor.html` uses Tailwind CDN

**To use Tailwind in index.html:**
1. Add utility classes to HTML
2. Build CSS: `npm run build:css`
3. Reference built CSS: `<link rel="stylesheet" href="dist/output.css">`
4. Keep `styles.css` for custom styles

## Best Practices

### Before Committing

1. ✅ Build CSS: `npm run build:css`
2. ✅ Run tests: `npm test`
3. ✅ Test locally: Open `index.html` in browser
4. ✅ Verify no secrets in code
5. ✅ Check `.gitignore` excludes build artifacts

### CSS Development

- **Use styles.css** for custom component styles
- **Use Tailwind** for utility classes when needed
- **Build before commit** to verify compilation works
- **Don't commit dist/** - It's generated during deployment

### Deployment Strategy

- **Main branch** = production (auto-deploys)
- **Feature branches** = development (CI tests only)
- **Pull requests** = review before merge
- **Manual trigger** = emergency deployments only

## Performance Optimization

### Current Optimizations

1. ✅ Minified CSS (`--minify` flag)
2. ✅ Static site (fast loading)
3. ✅ GitHub Pages CDN
4. ✅ HTTPS enabled
5. ✅ Minimal dependencies

### Future Enhancements

- [ ] Image optimization (compress BeyondGlobal.svg if possible)
- [ ] Enable caching headers
- [ ] Consider CSS splitting for larger sites
- [ ] Add service worker for offline support

## Version History

- **2026-02-24:** Initial frontend build configuration
  - Added CNAME for custom domain
  - Configured Tailwind CSS v3 build
  - Updated deploy workflow to build CSS
  - Added BeyondGlobal assets to deployment

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## Support

For issues or questions:
- **Repository Issues:** Open an issue on GitHub
- **Email:** kushmanmb@gmx.com
- **Owner:** Matthew Brace (@kushmanmb)
