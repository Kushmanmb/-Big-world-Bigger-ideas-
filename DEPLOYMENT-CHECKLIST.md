# Deployment Checklist

This checklist ensures a smooth deployment process for the Big World Bigger Ideas platform.

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass locally (`npm test`)
- [ ] CSS builds successfully (`npm run build:css`)
- [ ] No console errors in development
- [ ] Code is properly linted (if applicable)
- [ ] Security audit completed (`npm audit`)

### Documentation
- [ ] README.md is up-to-date
- [ ] API documentation is current
- [ ] CHANGELOG updated (if applicable)
- [ ] Version number bumped (if needed)

### Configuration
- [ ] `feature-flags.json` is valid JSON
- [ ] `CNAME` file contains correct domain
- [ ] `mint.json` is properly configured
- [ ] No sensitive data in repository

### Files Verification
- [ ] All HTML files are present (index.html, editor.html, BeyondGlobal.html)
- [ ] Assets are built (dist/output.css)
- [ ] Documentation directories are complete (api-reference/, guides/, docs/, wiki/)
- [ ] Source code is included (src/, contracts/)

## Deployment Process

### Automated Deployment (Recommended)

**Deploy via Push to Main:**
1. [ ] Merge changes to `main` branch
2. [ ] GitHub Actions workflow triggers automatically
3. [ ] Monitor workflow in [Actions tab](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions)
4. [ ] Verify deployment completes successfully

**Manual Workflow Trigger:**
1. [ ] Go to [Actions > Deploy to GitHub Pages](https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions/workflows/deploy.yml)
2. [ ] Click "Run workflow"
3. [ ] Select `main` branch
4. [ ] Click "Run workflow" button
5. [ ] Monitor progress in workflow logs

### Build Steps (Automated)

The workflow automatically:
1. [ ] Checks out code
2. [ ] Sets up Node.js 18
3. [ ] Installs dependencies with `npm ci`
4. [ ] Runs all tests
5. [ ] Builds CSS with Tailwind
6. [ ] Prepares deployment package
7. [ ] Uploads to GitHub Pages
8. [ ] Deploys to production

## Post-Deployment Verification

### Website Accessibility
- [ ] Main site loads: https://kushmanmb.org
- [ ] Editor page works: https://kushmanmb.org/editor.html
- [ ] BeyondGlobal page: https://kushmanmb.org/BeyondGlobal.html
- [ ] HTTPS is enforced (no mixed content warnings)

### Content Verification
- [ ] Homepage displays correctly
- [ ] Navigation works
- [ ] All links are functional
- [ ] Images load properly (BeyondGlobal.svg)
- [ ] Styles are applied (Tailwind CSS working)

### Documentation Access
- [ ] README is accessible
- [ ] API documentation pages load
- [ ] Guides are available
- [ ] Wiki pages work
- [ ] MDX files render correctly (if Mintlify is configured)

### JavaScript Modules
- [ ] Feature flags load correctly
- [ ] Source modules are accessible
- [ ] No 404 errors for JS files
- [ ] Console shows no errors

### Custom Domain
- [ ] Domain resolves: kushmanmb.org
- [ ] WWW redirect works (if configured)
- [ ] SSL certificate is valid
- [ ] DNS propagation complete

## Troubleshooting

### Deployment Fails

**Test Failures:**
```bash
npm test  # Run locally to identify failing tests
```

**CSS Build Errors:**
```bash
npm run build:css  # Check for Tailwind CSS issues
```

**Missing Dependencies:**
```bash
npm ci  # Clean install all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Site Not Updating

- [ ] Check workflow completed successfully
- [ ] Wait 5-10 minutes for CDN cache to clear
- [ ] Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Check GitHub Pages settings in repository

### 404 Errors

- [ ] Verify file paths in HTML
- [ ] Check deployment package includes all files
- [ ] Ensure directory structure is preserved
- [ ] Review workflow logs for copy errors

### CSS Not Loading

- [ ] Verify `dist/output.css` was built
- [ ] Check file path in HTML: `dist/output.css` not `dist/output.css/`
- [ ] Clear browser cache
- [ ] Inspect network tab for 404 or CORS errors

## Rollback Procedure

If deployment causes issues:

1. [ ] Go to previous successful workflow run
2. [ ] Re-run the workflow from that commit
3. [ ] Or revert commit on main branch:
   ```bash
   git revert HEAD
   git push origin main
   ```
4. [ ] Wait for automatic redeployment

## Production Monitoring

### Regular Checks
- [ ] Monitor uptime
- [ ] Check for broken links
- [ ] Review analytics (if configured)
- [ ] Monitor GitHub Actions for failures
- [ ] Check for security vulnerabilities

### Maintenance
- [ ] Update dependencies regularly
- [ ] Review and rotate secrets
- [ ] Update documentation
- [ ] Respond to security advisories

## Emergency Contacts

- **Repository Owner:** Matthew Brace (kushmanmb)
- **Email:** kushmanmb@gmx.com
- **GitHub:** [@kushmanmb](https://github.com/kushmanmb)
- **ENS:** kushmanmb.eth

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Deployment Guide](DEPLOYMENT.md)
- [Build Guide](BUILD.md)
- [Security Guide](SECURITY-GUIDE.md)

---

**Last Updated:** 2026-02-25
**Version:** 1.0.0
