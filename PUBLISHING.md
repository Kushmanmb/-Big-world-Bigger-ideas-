# Publishing Guide

This guide explains how to publish the `big-world-bigger-ideas` package to npm.

## Prerequisites

1. **NPM Account**: You must have an npm account. [Sign up here](https://www.npmjs.com/signup) if you don't have one.
2. **NPM Access Token**: Create an npm access token with publish permissions.
3. **GitHub Secret**: Add the npm token to GitHub repository secrets as `NPM_TOKEN`.
4. **Branch Permissions**: Ensure the GitHub Actions bot has permission to push to the main branch (or disable branch protection temporarily for the bot).

## Important: Branch Protection

If you have branch protection rules enabled on `main`:
- The workflow needs permission to push version commits and tags
- Either add `github-actions[bot]` as an exception in branch protection rules
- Or use Method 1 (manual version bump) instead of the automated workflow dispatch

## Setup NPM Token in GitHub

1. Go to [npm access tokens](https://www.npmjs.com/settings/tokens)
2. Create a new "Automation" token (for CI/CD)
3. Copy the token
4. Go to your GitHub repository: Settings → Secrets and variables → Actions
5. Create a new secret named `NPM_TOKEN` and paste the token value

## Publishing Methods

### Method 1: Automated Publishing via GitHub Release (Recommended)

This is the recommended method as it creates both a GitHub release and publishes to npm.

1. **Update the version** in `package.json`:
   ```bash
   npm version patch  # for bug fixes (1.0.0 → 1.0.1)
   npm version minor  # for new features (1.0.0 → 1.1.0)
   npm version major  # for breaking changes (1.0.0 → 2.0.0)
   ```

2. **Push the version tag**:
   ```bash
   git push origin main --follow-tags
   ```

3. **Create a GitHub Release**:
   - Go to your repository on GitHub
   - Click "Releases" → "Draft a new release"
   - Choose the version tag you just created
   - Write release notes
   - Click "Publish release"

The workflow will automatically:
- Run all tests
- Verify package contents
- Publish to npm
- Add provenance information

### Method 2: Manual Workflow Dispatch

For quick updates without manually creating a release:

1. Go to Actions → "Publish to NPM" workflow
2. Click "Run workflow"
3. Select version bump type (patch/minor/major)
4. Click "Run workflow"

The workflow will automatically:
- Run all tests
- Bump the version in package.json
- Commit and push the version change
- Create a git tag
- Publish to npm with provenance
- Create a GitHub release

This is the easiest method for quick releases.

### Method 3: Local Publishing (Emergency Only)

Only use this method if automated publishing is unavailable.

1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Verify package contents**:
   ```bash
   npm pack --dry-run
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Publish**:
   ```bash
   npm publish --access public
   ```

## Version Management

Use these npm scripts to manage versions:

```bash
npm run version:patch  # Bump patch version (1.0.0 → 1.0.1)
npm run version:minor  # Bump minor version (1.0.0 → 1.1.0)
npm run version:major  # Bump major version (1.0.0 → 2.0.0)
```

These commands will:
- Update `package.json` and `package-lock.json`
- Create a git commit
- Create a git tag

Then push with:
```bash
git push origin main --follow-tags
```

## Pre-publish Checks

The following checks run automatically before publishing:

1. **Tests**: All tests must pass (`npm test`)
2. **Package verification**: Verifies which files will be published
3. **Provenance**: Adds supply chain security metadata (npm >= 9.5.0)

## Package Contents

The published package includes:

- `index.js` - Main entry point
- `src/*.js` - Source modules (excluding tests and examples)
- `src/*.md` - Module documentation
- `README.md` - Main documentation

Excluded files (see `.npmignore`):
- Test files (`*.test.js`)
- Example files (`*-example.js`)
- Development files (`.github/`, `contracts/`)
- HTML demo files
- CSS source files

## Verification

After publishing, verify the package:

1. **Check npm registry**:
   ```bash
   npm view big-world-bigger-ideas
   ```

2. **Install and test locally**:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install big-world-bigger-ideas
   node -e "console.log(require('big-world-bigger-ideas'))"
   ```

3. **View on npmjs.com**:
   Visit https://www.npmjs.com/package/big-world-bigger-ideas

## Troubleshooting

### "You must be logged in to publish packages"
- Ensure `NPM_TOKEN` is set in GitHub repository secrets
- For local publishing, run `npm login` first

### "You do not have permission to publish"
- Verify you are a collaborator on the npm package
- Check if the package name is available

### Tests failing
- Fix failing tests before publishing
- Run `npm test` locally to debug

### Package too large
- Review `.npmignore` to exclude unnecessary files
- Use `npm pack --dry-run` to see what will be published

### Push failed during automated version bump
- Check if branch protection rules are blocking the GitHub Actions bot
- Add `github-actions[bot]` to allowed users in branch protection
- Or use Method 1 (manual version update) instead

### Workflow permissions error
- Ensure the workflow has `contents: write` permission
- Check that the repository allows GitHub Actions to create and approve pull requests

## Release Checklist

Before each release:

- [ ] Update version in `package.json`
- [ ] Update `README.md` if needed
- [ ] Run `npm test` locally
- [ ] Review `npm pack --dry-run` output
- [ ] Push changes and tags to GitHub
- [ ] Create GitHub release
- [ ] Verify package on npm
- [ ] Test installation in a fresh project
- [ ] Update documentation if needed

## Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes (backward compatible)

Examples:
- Bug fix: `1.0.0` → `1.0.1`
- New feature: `1.0.1` → `1.1.0`
- Breaking change: `1.1.0` → `2.0.0`

## Support

For publishing issues:
- Check [npm documentation](https://docs.npmjs.com/)
- Review workflow logs in GitHub Actions
- Contact repository maintainer: kushmanmb@gmx.com
