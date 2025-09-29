# 🎨 apicraft

> A unified CLI for the complete API development lifecycle - from testing to mocking to code generation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

**apicraft** is a powerful, zero-dependency CLI tool that replaces Postman, curl, and mock servers for developers who live in the terminal. Built for the [100lines.dev](https://100lines.dev) hackathon with exactly 300 lines of JavaScript.

## ✨ Features

- 🚀 **HTTP Client** - Make GET, POST, PUT, DELETE, PATCH requests with beautiful formatted output
- 🔧 **Environment Management** - Switch between dev/prod environments, use variable interpolation
- 💾 **Request Storage** - Save and replay your favorite API requests
- 🔄 **Code Generation** - Convert any request to fetch/axios/curl code instantly
- 📜 **History & Replay** - Track all requests, replay any previous request
- 🎭 **Mock Server** - Spin up instant mock APIs from JSON files
- ⚡ **Zero Dependencies** - Only uses Node.js built-ins
- 📦 **Git Friendly** - Version control your API configurations

## 🚀 Quick Start

### Installation

```bash
# Using pnpm (recommended)
pnpm install -g apicraft

# Using npm
npm install -g apicraft

# Or run directly with npx
npx apicraft <command>
```

### First Steps

```bash
# Initialize your project
apicraft init

# Make your first request
apicraft get https://api.github.com/users/sanjaysah101

# Set up environment variables
apicraft set baseUrl https://api.example.com
apicraft get {{baseUrl}}/users
```

## 📖 Usage

### HTTP Requests

```bash
# GET request
apicraft get https://api.github.com/users/sanjaysah101

# POST with JSON body
apicraft post https://api.example.com/users '{"name":"John","email":"john@example.com"}'

# PUT request
apicraft put https://api.example.com/users/1 '{"name":"John Doe"}'

# DELETE request
apicraft delete https://api.example.com/users/1

# PATCH request
apicraft patch https://api.example.com/users/1 '{"name":"Jane"}'
```

### Save & Run Requests

```bash
# Save a request for later
apicraft save getUser get https://api.example.com/users/1

# Run a saved request
apicraft run getUser

# List all saved requests
apicraft list
```

### Environment Management

```bash
# Switch environment (default: dev, prod)
apicraft env dev

# Set environment variables
apicraft set baseUrl https://api.example.com
apicraft set apiKey abc123

# Use variables in requests
apicraft get {{baseUrl}}/users
apicraft get https://api.example.com/data -H "Authorization: {{apiKey}}"
```

### Code Generation

```bash
# Make a request first
apicraft get https://api.github.com/users/sanjaysah101

# Generate code from last request
apicraft generate fetch    # JavaScript fetch
apicraft generate axios    # Axios
apicraft generate curl     # cURL command
```

### History & Replay

```bash
# View recent requests
apicraft history

# View last 20 requests
apicraft history 20

# Replay a request from history (by index)
apicraft replay 1
```

### Mock Server

```bash
# Create mock files
mkdir mocks
echo '{"id":1,"name":"John Doe"}' > mocks/GET_users_1.json
echo '{"users":[{"id":1,"name":"John"}]}' > mocks/GET_users.json

# Start mock server
apicraft mock ./mocks 3000

# Now access: http://localhost:3000/users/1
```

**Mock File Naming Convention:**

- Format: `{METHOD}_{path}_{with}_{underscores}.json`
- Example: `GET_users_1.json` → `GET /users/1`
- Example: `POST_api_login.json` → `POST /api/login`

## 📁 Configuration File

apicraft stores configuration in `.apicraft.json`:

```json
{
  "environments": {
    "default": {
      "baseUrl": "",
      "headers": {}
    },
    "dev": {
      "baseUrl": "http://localhost:3000",
      "headers": {
        "Authorization": "Bearer dev-token"
      }
    },
    "prod": {
      "baseUrl": "https://api.production.com",
      "headers": {
        "Authorization": "Bearer prod-token"
      }
    }
  },
  "saved": {
    "getUser": {
      "method": "get",
      "url": "{{baseUrl}}/users/1",
      "options": {}
    }
  },
  "settings": {
    "timeout": 30000,
    "followRedirects": true
  }
}
```

## 🎯 Use Cases

### API Testing Workflow

```bash
# Set up environment
apicraft env dev
apicraft set baseUrl http://localhost:3000

# Test endpoints
apicraft get {{baseUrl}}/health
apicraft post {{baseUrl}}/users '{"name":"Test User"}'

# Save successful requests
apicraft save createUser post {{baseUrl}}/users '{"name":"Test"}'
```

### Frontend Development

```bash
# Start mock server while backend is being built
apicraft mock ./api-mocks 3000

# Generate code for your app
apicraft get http://localhost:3000/users
apicraft generate fetch
# Copy the generated code into your app
```

### CI/CD Integration

```bash
# Run saved health check in CI pipeline
apicraft run healthCheck || exit 1

# Test API endpoints after deployment
apicraft env prod
apicraft run smokeTests
```

## 🏆 Why apicraft?

| Feature | apicraft | Postman | curl | httpie |
|---------|----------|---------|------|--------|
| CLI Native | ✅ | ❌ | ✅ | ✅ |
| Zero Dependencies | ✅ | N/A | ✅ | ❌ |
| Git Friendly Config | ✅ | ❌ | ❌ | ❌ |
| Code Generation | ✅ | ✅ | ❌ | ❌ |
| Mock Server | ✅ | ✅ | ❌ | ❌ |
| Request History | ✅ | ✅ | ❌ | ❌ |
| Environment Variables | ✅ | ✅ | ❌ | ❌ |
| Beautiful Output | ✅ | ✅ | ❌ | ✅ |

## 🛠️ Development

### Local Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/apicraft.git
cd apicraft

# Install dependencies (none! but setup pnpm)
pnpm install

# Link locally for testing
chmod +x index.js
pnpm link --global

# Test it out
apicraft --help
```

### Running Locally Without Installation

If you prefer not to install globally, you can run the tool directly using Node.js:

```bash
# Clone and navigate to the project
git clone https://github.com/sanjaysah101/apicraft.git
cd apicraft

# Run commands directly
node index.js get https://api.github.com/users/sanjaysah101
node index.js --help
node index.js init
node index.js env dev
```

### Line Count Verification

```bash
# Count non-blank, non-comment lines
node scripts/count-lines.js
```

## 📝 Examples

### Complete Workflow Example

```bash
# 1. Initialize project
apicraft init

# 2. Configure environment
apicraft env dev
apicraft set baseUrl https://jsonplaceholder.typicode.com

# 3. Make requests
apicraft get {{baseUrl}}/users/1

# 4. Save useful requests
apicraft save getPost get {{baseUrl}}/posts/1
apicraft save createPost post {{baseUrl}}/posts '{"title":"Test","body":"Content","userId":1}'

# 5. Generate code
apicraft generate fetch

# 6. Check history
apicraft history

# 7. Replay a request
apicraft replay 1
```

### Mock Server Example

```bash
# Create mock structure
mkdir -p mocks/api
echo '{"status":"healthy"}' > mocks/GET_health.json
echo '{"users":[]}' > mocks/GET_api_users.json
echo '{"id":1,"name":"John"}' > mocks/GET_api_users_1.json

# Start server
apicraft mock ./mocks 4000

# Test endpoints
curl http://localhost:4000/health
curl http://localhost:4000/api/users
curl http://localhost:4000/api/users/1
```

## 🤝 Contributing

This project was built for the 100lines.dev hackathon with a strict 300-line limit. While the core is feature-complete, contributions for documentation, examples, and bug fixes are welcome!

## 📄 License

MIT © [Your Name]

## 🏅 Hackathon

Built for [CLI Line-Limit Hackathon 2025](https://100lines.dev) - September 26-29, 2025

**Line Count:** 300 lines (JavaScript)
**Challenge:** Every Line Counts

---

<div align="center">
  <strong>Made with ❤️ for developers who love the terminal</strong>
</div>
