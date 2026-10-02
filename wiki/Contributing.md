# Contributing to Big World Bigger Ideas

Thank you for your interest in contributing! This guide will help you get started.

## 🤝 Ways to Contribute

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for improvements
- 📝 **Improve documentation** - Help others understand the project
- 🔧 **Submit code** - Fix bugs or add features
- 🧪 **Write tests** - Improve test coverage
- 🎨 **Improve UI** - Enhance user interfaces

## 📋 Before You Start

1. **Check existing issues** - Someone may already be working on it
2. **Open an issue first** - Discuss major changes before coding
3. **Read the documentation** - Understand the project structure
4. **Run the tests** - Ensure everything works before you start

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/-Big-world-Bigger-ideas-.git
cd -Big-world-Bigger-ideas-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Test additions or updates
- `refactor/` - Code refactoring

## 💻 Development Workflow

### Running Tests

Before making changes, ensure all tests pass:

```bash
npm test
```

Run specific module tests:

```bash
npm run test:erc721
npm run test:bitcoin-mining
```

### Code Style

This project follows these conventions:

#### JavaScript Style
- Use **CommonJS** (`require`/`module.exports`), not ES modules
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_CASE for constants
- Add descriptive comments for complex logic

#### Example:

```javascript
// Good
const ERC721Fetcher = require('./erc721');
const contractAddress = '0x1234...';

class TokenTracker {
  constructor(address) {
    this.address = address;
  }
  
  async getOwner(tokenId) {
    // Validate token ID
    if (!this.isValidTokenId(tokenId)) {
      throw new Error('Invalid token ID');
    }
    
    // Fetch owner
    return await this.fetcher.getOwner(tokenId);
  }
}

module.exports = TokenTracker;
```

### Input Validation

Always validate user inputs:

```javascript
// Validate Ethereum addresses
function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Address is required and must be a string');
  }
  
  const cleanAddress = address.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(cleanAddress) && !/^[0-9a-fA-F]{40}$/.test(cleanAddress)) {
    throw new Error('Invalid Ethereum address format');
  }
  
  return cleanAddress;
}
```

### Error Handling

Provide descriptive error messages:

```javascript
// Good
throw new Error('Invalid token ID. Must be a non-negative integer.');

// Bad
throw new Error('Invalid input');
```

### Writing Tests

Each module should have a corresponding test file:

```javascript
// module-name.test.js
const ModuleName = require('./module-name');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.error(error.message);
    failed++;
  }
}

async function testAsync(description, fn) {
  try {
    await fn();
    console.log(`✓ ${description}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.error(error.message);
    failed++;
  }
}

// Test cases
test('Should validate inputs', () => {
  const instance = new ModuleName();
  // Test implementation
});

testAsync('Should handle async operations', async () => {
  const result = await someAsyncFunction();
  // Assertions
});

// Summary
console.log(`\nTests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
```

### Adding New Modules

When adding a new module, include:

1. **Main module file**: `src/module-name.js`
2. **Test file**: `src/module-name.test.js`
3. **Example file**: `src/module-name-example.js`
4. **Documentation**: `src/MODULE-NAME.md`

Update `package.json` scripts:

```json
{
  "scripts": {
    "test:module-name": "node src/module-name.test.js",
    "module-name:demo": "node src/module-name-example.js"
  }
}
```

Update `index.js` to export the module:

```javascript
module.exports = {
  // ... existing exports
  ModuleName: require('./src/module-name')
};
```

## 📝 Documentation

### Update Documentation

When adding or modifying features:

1. **Update README.md** if changing core functionality
2. **Update module documentation** in `src/MODULE-NAME.md`
3. **Add JSDoc comments** to functions
4. **Update CHANGELOG** (if exists)

### JSDoc Example

```javascript
/**
 * Fetches the owner of an ERC-721 token
 * @param {number|string} tokenId - The token ID to query
 * @returns {Promise<{owner: string, contractAddress: string, tokenId: string}>}
 * @throws {Error} If token ID is invalid
 */
async getOwner(tokenId) {
  // Implementation
}
```

## 🧪 Testing Your Changes

### 1. Run All Tests

```bash
npm test
```

### 2. Run Your Module Tests

```bash
npm run test:your-module
```

### 3. Test Examples

```bash
npm run your-module:demo
```

### 4. Manual Testing

Test your changes manually with real data to ensure they work as expected.

## 📤 Submitting Changes

### 1. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add: Token balance caching feature"
# or
git commit -m "Fix: Address validation for checksummed addresses"
# or
git commit -m "Docs: Update ERC721 module documentation"
```

Commit message prefixes:
- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Docs:` - Documentation changes
- `Test:` - Test additions or changes
- `Refactor:` - Code refactoring

### 2. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:
   - **Title**: Clear, descriptive title
   - **Description**: What changes were made and why
   - **Related Issues**: Link to related issues
   - **Testing**: How you tested the changes
   - **Screenshots**: If applicable

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added/updated and all tests pass
- [ ] Documentation updated
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts
- [ ] Feature branch is up to date with main

## 🔍 Code Review Process

After submitting a PR:

1. **Automated checks run** - Tests, linting, security scans
2. **Maintainer review** - Code is reviewed for quality and fit
3. **Feedback addressed** - Make requested changes
4. **Approval and merge** - Once approved, PR is merged

### Responding to Feedback

- Be open to suggestions and constructive criticism
- Ask questions if you don't understand feedback
- Make requested changes promptly
- Update your PR branch as needed

## 🎯 Best Practices

### Code Quality

- **Keep it simple** - Write clear, readable code
- **Single responsibility** - Each function should do one thing
- **DRY principle** - Don't repeat yourself
- **Error handling** - Handle errors gracefully
- **Input validation** - Validate all user inputs

### Security

- **Never commit secrets** - No API keys, private keys, or passwords
- **Validate inputs** - Sanitize and validate all user inputs
- **Use environment variables** - For sensitive configuration
- **Follow OWASP guidelines** - For web security best practices

### Testing

- **Test edge cases** - Null, undefined, empty values
- **Test error conditions** - Ensure errors are handled
- **Test with real data** - When possible and safe
- **Keep tests isolated** - Tests shouldn't depend on each other

## 📊 Project Structure

```
big-world-bigger-ideas/
├── src/                      # Source code
│   ├── erc721.js            # ERC-721 module
│   ├── erc721.test.js       # ERC-721 tests
│   ├── erc721-example.js    # ERC-721 examples
│   ├── ERC721.md            # ERC-721 docs
│   └── ...                  # Other modules
├── .github/                 # GitHub configuration
│   └── workflows/           # GitHub Actions
├── index.js                 # Main entry point
├── package.json             # Dependencies and scripts
└── README.md               # Main documentation
```

## 🐛 Reporting Bugs

### Bug Report Template

When reporting bugs, include:

1. **Description** - Clear description of the bug
2. **Steps to Reproduce** - Exact steps to reproduce
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - Node.js version, OS, etc.
6. **Code Sample** - Minimal code to reproduce
7. **Error Messages** - Full error messages and stack traces

### Example:

```markdown
## Bug Description
ERC721Fetcher throws error with valid contract address

## Steps to Reproduce
1. Create fetcher: `new ERC721Fetcher('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D')`
2. Call getOwner: `fetcher.getOwner(1)`
3. Error occurs

## Expected Behavior
Should return owner address

## Actual Behavior
Throws "Invalid address format" error

## Environment
- Node.js: v18.0.0
- OS: macOS 13.0
- Package version: 1.0.0

## Error Message
```
Error: Invalid address format
  at validateAddress (erc721.js:10)
```
```

## 💡 Feature Requests

When suggesting features:

1. **Describe the feature** - What should it do?
2. **Use case** - Why is it needed?
3. **Examples** - How would it be used?
4. **Alternatives** - Have you considered alternatives?

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `question` - Further information requested

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and discussions
- **Email** - mattbrace92@gmail.com for private inquiries

## 📜 License

By contributing, you agree that your contributions will be licensed under the ISC License.

## 🙏 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- README acknowledgments (for significant contributions)

---

**Thank you for contributing to Big World Bigger Ideas!** 🌏
