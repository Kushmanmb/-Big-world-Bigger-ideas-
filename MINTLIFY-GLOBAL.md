# Using Mintlify Globally

While this repository has Mintlify installed as a dev dependency, you can also install Mintlify globally on your system for easier access across multiple projects.

## Global Installation

To install Mintlify globally, run:

```bash
npm install -g mintlify
```

This is the command referenced in the issue: `npm i -g mintlify`

## Benefits of Global Installation

1. **Quick Access**: Use `mintlify` command from anywhere without `npx`
2. **Multiple Projects**: Work with Mintlify across different repositories
3. **Faster Execution**: No need to download each time you run commands

## Usage After Global Installation

Once installed globally, you can use Mintlify commands directly:

```bash
# Start development server
mintlify dev

# Build documentation
mintlify build

# Check Mintlify version
mintlify --version

# Get help
mintlify --help
```

## Repository-Specific Installation

This repository also includes Mintlify as a dev dependency, so you can use it via npm scripts without global installation:

```bash
# Install dependencies (includes Mintlify)
npm install

# Use via npm scripts
npm run docs:dev
npm run docs:build
```

## When to Use Global vs Local Installation

### Use Global Installation When:
- You work with multiple Mintlify projects
- You want quick command-line access
- You frequently create new documentation projects

### Use Local Installation When:
- You want version consistency in your project
- You're working in a team environment
- You want reproducible builds in CI/CD

## Recommendation

**Best Practice**: Use both!
- Install globally for convenience: `npm i -g mintlify`
- Keep as dev dependency for version locking
- Use npm scripts in your workflow for consistency

## Version Management

### Check Global Version
```bash
mintlify --version
```

### Check Local Version
```bash
npx mintlify --version
```

### Update Global Installation
```bash
npm update -g mintlify
```

### Update Local Installation
```bash
npm update mintlify
```

## Troubleshooting

### Command Not Found After Global Install

If `mintlify` command is not found after global installation:

1. Check npm global path:
   ```bash
   npm config get prefix
   ```

2. Add to PATH (if needed):
   - **macOS/Linux**: Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export PATH="$(npm config get prefix)/bin:$PATH"
     ```
   - **Windows**: Add npm global path to system PATH environment variable

3. Restart your terminal

### Permission Errors (Linux/macOS)

If you get permission errors during global installation:

```bash
# Option 1: Use sudo (not recommended)
sudo npm i -g mintlify

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm i -g mintlify
```

### Version Conflicts

If you experience issues with different versions:

1. Uninstall global version:
   ```bash
   npm uninstall -g mintlify
   ```

2. Reinstall:
   ```bash
   npm i -g mintlify
   ```

3. Use local version via npx if issues persist:
   ```bash
   npx mintlify dev
   ```

## Related Documentation

- [MINTLIFY.md](./MINTLIFY.md) - Complete Mintlify setup guide for this repository
- [README.md](./README.md) - Main project documentation
- [Mintlify Docs](https://mintlify.com/docs) - Official Mintlify documentation

---

**Note**: The `npm i -g mintlify` command installs Mintlify globally on your system. This repository already includes Mintlify as a development dependency, so global installation is optional but can be convenient for developers who work with multiple documentation projects.
