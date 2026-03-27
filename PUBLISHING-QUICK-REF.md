# Quick Publishing Reference

## 🚀 Quick Publish Checklist

### For Patch Release (Bug Fixes)
```bash
npm run version:patch
git push origin main --follow-tags
```
Then create a GitHub release with the new tag.

### For Minor Release (New Features)
```bash
npm run version:minor
git push origin main --follow-tags
```
Then create a GitHub release with the new tag.

### For Major Release (Breaking Changes)
```bash
npm run version:major
git push origin main --follow-tags
```
Then create a GitHub release with the new tag.

## 🔍 Pre-Publish Commands

```bash
# Run all tests
npm test

# Preview package contents
npm pack --dry-run

# Check package size
npm pack
ls -lh big-world-bigger-ideas-*.tgz
```

## 📦 What Gets Published?

✅ **Included:**
- `index.js` - Main entry point
- `src/*.js` - Core modules (29 files)
- `src/*.md` - Module docs
- `README.md` - Main documentation

❌ **Excluded:**
- Test files (`*.test.js`)
- Example files (`*-example.js`)
- HTML demos
- Development configs
- GitHub workflows

## 🔗 Links

- **Full Guide:** [PUBLISHING.md](./PUBLISHING.md)
- **NPM Package:** https://www.npmjs.com/package/big-world-bigger-ideas
- **GitHub Actions:** https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/actions

## ⚙️ Automated Workflow

The GitHub Actions workflow automatically:
1. ✅ Runs all tests
2. ✅ Verifies package contents  
3. ✅ Publishes to npm with provenance
4. ✅ Creates release notes

## 🆘 Troubleshooting

**Tests failing?**
```bash
npm test
```

**Need to republish same version?**
- Not possible on npm
- Increment version even for small fixes

**Workflow not triggering?**
- Ensure `NPM_TOKEN` secret is set in GitHub
- Check workflow logs in Actions tab
