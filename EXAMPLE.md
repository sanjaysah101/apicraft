# apicraft Examples

Practical examples and use cases for apicraft.

## Table of Contents

- [Basic HTTP Requests](#basic-http-requests)
- [Environment Management](#environment-management)
- [Workflow Automation](#workflow-automation)
- [Mock Server Examples](#mock-server-examples)
- [Code Generation](#code-generation)
- [Real-World Scenarios](#real-world-scenarios)

## Basic HTTP Requests

### Simple GET Request

```bash
apicraft get https://api.github.com/users/sanjaysah101
```

### POST with JSON Body

```bash
apicraft post https://jsonplaceholder.typicode.com/posts '{
  "title": "Hello World",
  "body": "This is my first post",
  "userId": 1
}'
```

### PUT Request

```bash
apicraft put https://jsonplaceholder.typicode.com/posts/1 '{
  "id": 1,
  "title": "Updated Title",
  "body": "Updated content",
  "userId": 1
}'
```

### DELETE Request

```bash
apicraft delete https://jsonplaceholder.typicode.com/posts/1
```

## Environment Management

### Setting Up Multiple Environments

```bash
# Initialize config
apicraft init

# Configure development
apicraft env dev
apicraft set baseUrl http://localhost:3000
apicraft set apiKey dev_key_123

# Configure production
apicraft env prod
apicraft set baseUrl https://api.production.com
apicraft set apiKey prod_key_456

# Switch between environments
apicraft env dev
apicraft get {{baseUrl}}/users

apicraft env prod
apicraft get {{baseUrl}}/users
```

### Using Variables in Requests

```bash
apicraft env dev
apicraft set baseUrl https://api.github.com
apicraft set username sanjaysah101

# Use variables
apicraft get {{baseUrl}}/users/{{username}}
apicraft get {{baseUrl}}/users/{{username}}/repos
```

## Workflow Automation

### Testing API Endpoints

```bash
# Set up test environment
apicraft env dev
apicraft set baseUrl http://localhost:3000

# Save test requests
apicraft save healthCheck get {{baseUrl}}/health
apicraft save createUser post {{baseUrl}}/users '{"name":"Test User","email":"test@example.com"}'
apicraft save getUsers get {{baseUrl}}/users
apicraft save deleteUser delete {{baseUrl}}/users/1

# Run tests
apicraft run healthCheck
apicraft run createUser
apicraft run getUsers
apicraft run deleteUser
```

### CI/CD Integration

```bash
#!/bin/bash
# test-api.sh

# Switch to production environment
apicraft env prod

# Run smoke tests
apicraft run healthCheck || exit 1
apicraft run getVersion || exit 1

echo "✓ All smoke tests passed"
```

### Development Workflow

```bash
# Morning routine
apicraft env dev
apicraft run healthCheck
apicraft run getLatestData

# During development
apicraft get {{baseUrl}}/new-endpoint
apicraft save testNewEndpoint get {{baseUrl}}/new-endpoint

# Generate code for frontend
apicraft run testNewEndpoint
apicraft generate fetch > src/api/newEndpoint.js
```

## Mock Server Examples

### Basic Mock Server

```bash
# Create mock directory
mkdir api-mocks

# Create mock responses
cat > api-mocks/GET_users.json << 'EOF'
{
  "users": [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob", "email": "bob@example.com"}
  ]
}
EOF

cat > api-mocks/GET_users_1.json << 'EOF'
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}
EOF

cat > api-mocks/POST_users.json << 'EOF'
{
  "id": 3,
  "name": "New User",
  "status": "created"
}
EOF

# Start mock server
apicraft mock ./api-mocks 3000
```

### E-commerce Mock API

```bash
mkdir ecommerce-mocks

# Products
cat > ecommerce-mocks/GET_api_products.json << 'EOF'
{
  "products": [
    {"id": 1, "name": "Laptop", "price": 999.99},
    {"id": 2, "name": "Mouse", "price": 29.99}
  ]
}
EOF

# Single product
cat > ecommerce-mocks/GET_api_products_1.json << 'EOF'
{
  "id": 1,
  "name": "Laptop",
  "price": 999.99,
  "description": "High-performance laptop",
  "stock": 15
}
EOF

# Cart
cat > ecommerce-mocks/GET_api_cart.json << 'EOF'
{
  "items": [],
  "total": 0
}
EOF

# Checkout
cat > ecommerce-mocks/POST_api_checkout.json << 'EOF'
{
  "orderId": "ORD-12345",
  "status": "confirmed",
  "total": 1029.98
}
EOF

apicraft mock ./ecommerce-mocks 4000
```

### Authentication Mock

```bash
mkdir auth-mocks

cat > auth-mocks/POST_api_login.json << 'EOF'
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
EOF

cat > auth-mocks/POST_api_register.json << 'EOF'
{
  "id": 2,
  "email": "newuser@example.com",
  "status": "registered"
}
EOF

cat > auth-mocks/GET_api_me.json << 'EOF'
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin"
}
EOF

apicraft mock ./auth-mocks 3001
```

## Code Generation

### Generate Fetch Code

```bash
# Make a request
apicraft post https://api.example.com/users '{"name":"John","email":"john@example.com"}'

# Generate fetch code
apicraft generate fetch
```

Output:

```javascript
fetch('https://api.example.com/users', {
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\":\"John\",\"email\":\"john@example.com\"}"
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Generate Axios Code

```bash
apicraft get https://api.github.com/users/sanjaysah101
apicraft generate axios
```

### Generate cURL Command

```bash
apicraft post https://api.example.com/data '{"key":"value"}'
apicraft generate curl
```

Output:

```bash
curl -X POST 'https://api.example.com/data' -H 'Content-Type: application/json' -d '{"key":"value"}'
```

## Real-World Scenarios

### Scenario 1: Frontend Developer Testing Backend

```bash
# Backend team provided staging API
apicraft env staging
apicraft set baseUrl https://staging-api.company.com
apicraft set authToken eyJhbGc...

# Test authentication
apicraft post {{baseUrl}}/auth/login '{"email":"dev@test.com","password":"test123"}'

# Save common requests
apicraft save getProfile get {{baseUrl}}/users/me
apicraft save updateProfile put {{baseUrl}}/users/me '{"name":"Dev User"}'
apicraft save listPosts get {{baseUrl}}/posts

# Generate code for app
apicraft run getProfile
apicraft generate fetch > src/api/profile.js
```

### Scenario 2: API Integration Testing

```bash
# Test third-party API integration
apicraft env test
apicraft set baseUrl https://api.external-service.com
apicraft set apiKey sk_test_123456

# Test endpoints
apicraft get {{baseUrl}}/status
apicraft post {{baseUrl}}/webhooks '{"url":"https://myapp.com/webhook","events":["user.created"]}'

# Save for regression testing
apicraft save checkStatus get {{baseUrl}}/status
apicraft save registerWebhook post {{baseUrl}}/webhooks '{"url":"https://myapp.com/webhook"}'
```

### Scenario 3: Microservices Development

```bash
# Service A (Users)
apicraft env users-service
apicraft set baseUrl http://localhost:3001
apicraft save getUserById get {{baseUrl}}/users/{{userId}}

# Service B (Orders)
apicraft env orders-service
apicraft set baseUrl http://localhost:3002
apicraft save getOrders get {{baseUrl}}/orders

# Service C (Payments)
apicraft env payments-service
apicraft set baseUrl http://localhost:3003
apicraft save processPayment post {{baseUrl}}/payments '{"amount":100,"currency":"USD"}'

# Test entire flow
apicraft env users-service
apicraft set userId 123
apicraft run getUserById

apicraft env orders-service
apicraft run getOrders

apicraft env payments-service
apicraft run processPayment
```

### Scenario 4: Documentation and Demos

```bash
# Create mock for documentation
mkdir docs-api

# Example responses for docs
cat > docs-api/GET_api_v1_products.json << 'EOF'
{
  "data": [
    {
      "id": "prod_123",
      "name": "Wireless Headphones",
      "price": 199.99,
      "category": "Electronics"
    },
    {
      "id": "prod_456",
      "name": "Coffee Mug",
      "price": 12.99,
      "category": "Kitchen"
    }
  ],
  "total": 2,
  "page": 1
}
EOF

# Start mock server
apicraft mock ./docs-api 3000

# Test the API
apicraft get http://localhost:3000/api/v1/products
```

## Advanced Features

### Using History and Replay

```bash
# Make some requests
apicraft get https://jsonplaceholder.typicode.com/users/1
apicraft post https://jsonplaceholder.typicode.com/posts '{"title":"Test","body":"Content","userId":1}'

# View recent history
apicraft history

# Replay a previous request
apicraft replay 1

# Generate code from history
apicraft generate fetch
```

### Custom Headers

```bash
# Set custom headers for environment
apicraft env dev
apicraft set Authorization "Bearer your-token-here"
apicraft set Content-Type "application/json"

# Make request with headers
apicraft get https://api.example.com/protected-endpoint
```

### Working with Different Content Types

```bash
# JSON API
apicraft post https://api.example.com/data '{"key":"value"}'

# Form data (note: CLI currently supports JSON primarily)
# For form data, you might need to use curl generation
apicraft post https://api.example.com/upload '{"file":"data"}'
apicraft generate curl
```

## Integration Examples

### With Development Workflow

```bash
# Initialize project
apicraft init

# Set up environments
apicraft env dev
apicraft set baseUrl http://localhost:3000

apicraft env staging
apicraft set baseUrl https://staging-api.company.com

apicraft env prod
apicraft set baseUrl https://api.company.com

# Save common development requests
apicraft save health get {{baseUrl}}/health
apicraft save login post {{baseUrl}}/auth/login '{"email":"dev@example.com","password":"dev123"}'

# Daily development routine
apicraft env dev
apicraft run health
apicraft run login
```

### CI/CD Pipeline Integration

```yaml
# .github/workflows/api-tests.yml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install apicraft
        run: npm install -g apicraft
      - name: Run API tests
        run: |
          apicraft env test
          apicraft set baseUrl ${{ secrets.TEST_API_URL }}
          apicraft run smoke-tests
```

### Shell Script Automation

```bash
#!/bin/bash
# api-smoke-test.sh

set -e

echo "Running API smoke tests..."

# Initialize if needed
[ ! -f .apicraft.json ] && apicraft init

# Configure test environment
apicraft env smoke
apicraft set baseUrl $SMOKE_TEST_URL

# Run tests
apicraft save health get {{baseUrl}}/health
apicraft save version get {{baseUrl}}/version

apicraft run health
apicraft run version

echo "✓ All smoke tests passed!"
```

## Best Practices

1. **Environment Separation**: Use different environments for dev, staging, and production to avoid accidental data changes.

2. **Request Saving**: Save frequently used requests to avoid retyping URLs and parameters.

3. **History Utilization**: Leverage request history for debugging and generating code snippets.

4. **Mock Development**: Use mock servers during frontend development when backend APIs aren't ready.

5. **Version Control**: Keep your `.apicraft.json` configuration in version control (exclude sensitive data).

6. **Code Generation**: Use the generate command to quickly create client code from tested API calls.

7. **Automation**: Integrate apicraft into your development and CI/CD workflows for consistent API testing.

## Troubleshooting

### Common Issues and Solutions

**Connection Timeouts**

```bash
# Increase timeout setting
apicraft set timeout 60000
```

**SSL/TLS Issues**

```bash
# For self-signed certificates in development
# Note: This is not recommended for production
NODE_TLS_REJECT_UNAUTHORIZED=0 apicraft get https://dev-api.example.com
```

**Large Response Handling**

```bash
# Responses are formatted automatically
# For very large responses, consider piping to tools like jq
apicraft get https://api.example.com/large-dataset | jq '.data | length'
```

**Configuration Issues**

```bash
# Reset configuration
rm .apicraft.json
apicraft init

# Check current environment
apicraft env
```

For more detailed information, run `apicraft help` or visit the main repository.
