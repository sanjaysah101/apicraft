# Contributing to apicraft

Thank you for your interest in contributing to apicraft! 🎉

## 🚨 Important Note

This project was built for the [100lines.dev hackathon](https://100lines.dev) with a strict **300-line limit** for JavaScript. The core `index.js` file must remain at exactly 300 executable lines (excluding comments and blank lines).

## What Can You Contribute?

### ✅ Welcome Contributions

- **Documentation improvements** (README, examples, tutorials)
- **Bug reports** with clear reproduction steps
- **Example use cases** and workflows
- **Mock server templates** and example projects
- **Translation** of documentation
- **Testing scripts** and verification tools
- **CI/CD configurations**

### ⚠️ Limited Contributions

- **Bug fixes in index.js** - Must maintain 300 lines exactly
- **Feature requests** - May need to wait for post-hackathon version
- **Refactoring** - Only if it improves readability without changing line count

## 📋 Before Contributing

1. **Check existing issues** to avoid duplicates
2. **Open an issue first** to discuss major changes
3. **Verify line count** if modifying `index.js`:

   ```bash
   node scripts/count-lines.js
   ```

## 🔧 Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/sanjaysah101/apicraft.git
cd apicraft

# Install pnpm (if not already)
npm install -g pnpm

# Link for local testing
chmod +x index.js
pnpm link --global

# Verify it works
apicraft --help
```

## 📝 Pull Request Process

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/amazing-docs`)
3. **Make your changes**
4. **Verify line count** (if applicable):

   ```bash
   node scripts/count-lines.js
   ```

5. **Test thoroughly**:

   ```bash
   apicraft --help
   apicraft get https://api.github.com/users/octocat
   ```

6. **Commit with clear message**:

   ```bash
   git commit -m "docs: add example for mock server usage"
   ```

7. **Push and create PR**
8. **Describe your changes** clearly in the PR description

## 🎯 Coding Guidelines

### For index.js modifications

- **Maintain 300 lines exactly**
- Use concise variable names for space efficiency
- Prioritize functionality over comments
- Every line must serve a purpose
- Test all affected features

### For documentation

- Use clear, concise language
- Include code examples
- Add emoji for visual clarity (but don't overdo it)
- Follow existing formatting style

## 🐛 Reporting Bugs

Please include:

- **Node version** (`node --version`)
- **OS and version**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Error messages** (if any)

Example:

```markdown
**Node Version:** v18.17.0
**OS:** macOS 13.4

**Steps:**
1. Run `apicraft get https://example.com`
2. Observe error

**Expected:** Should show response
**Actual:** Crashes with TypeError

**Error:**
```

TypeError: Cannot read property 'body' of undefined

```
```

## 💡 Feature Requests

For features that would require changing `index.js`:

1. Open an issue with the `enhancement` label
2. Describe the use case clearly
3. Explain why it's essential
4. Note: May be deferred until post-hackathon version

## 🧪 Testing

Currently, there are no automated tests (to save lines in the main file). When testing changes:

```bash
# Basic functionality
apicraft init
apicraft get https://api.github.com/users/octocat
apicraft save test get https://api.github.com/users/octocat
apicraft run test
apicraft history
apicraft generate curl

# Mock server
mkdir test-mocks
echo '{"test": true}' > test-mocks/GET_test.json
apicraft mock ./test-mocks 3000
# In another terminal: curl http://localhost:3000/test

# Environment
apicraft env dev
apicraft set baseUrl https://api.github.com
apicraft get {{baseUrl}}/users/octocat
```

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, makes apicraft better for everyone!

---

Questions? Open an issue or reach out to the maintainers.
