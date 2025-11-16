# Backend Tests

Comprehensive unit tests for Career Hub AI backend (Sprint 6.5).

## 📁 Test Structure

```
tests/
├── setup.ts              # Test configuration and global mocks
├── mocks/
│   └── index.ts         # Common mock data and utilities
└── unit/
    ├── sanitization.test.ts      # XSS/sanitization tests (Sprint 6.4)
    ├── loginAttempts.test.ts     # Login attempt tracking tests (Sprint 6.3)
    └── securityChecks.test.ts    # Security validation tests (Sprint 6.1)
```

## 🚀 Running Tests

### Prerequisites

Install dependencies first:
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Only Unit Tests
```bash
npm run test:unit
```

### Run Tests for CI/CD
```bash
npm run test:ci
```

## 📊 Coverage Reports

After running `npm run test:coverage`, view the coverage report:

- **Terminal**: Summary displayed in console
- **HTML Report**: Open `coverage/index.html` in browser
- **LCOV**: `coverage/lcov.info` for CI integration

## ✅ Coverage Thresholds

Tests must maintain minimum 60% coverage:
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

## 📝 Writing New Tests

### Test File Naming
- Unit tests: `*.test.ts` in `tests/unit/`
- Use descriptive names: `featureName.test.ts`

### Test Structure (AAA Pattern)
```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange - Setup test data
    const input = 'test data';

    // Act - Execute the function
    const result = functionToTest(input);

    // Assert - Verify the result
    expect(result).toBe('expected output');
  });
});
```

### Using Mocks
```typescript
import { mockUser, mockRequest, mockResponse } from '../mocks/index.js';

it('should use mock data', () => {
  const req = mockRequest({ body: { email: mockUser.email } });
  const res = mockResponse();

  // Test your function
  myFunction(req, res);

  expect(res.json).toHaveBeenCalled();
});
```

## 🧪 What's Tested

### Sprint 6.4: Data Protection (`sanitization.test.ts`)
- ✅ XSS attack prevention
- ✅ HTML sanitization (script tags, iframes, event handlers)
- ✅ Rich text sanitization (allows safe HTML)
- ✅ URL validation (blocks dangerous protocols)
- ✅ Data masking (emails, phones)
- ✅ SQL injection detection
- ✅ XSS pattern detection

### Sprint 6.3: Authentication Security (`loginAttempts.test.ts`)
- ✅ Failed login attempt tracking
- ✅ Account lockout after 5 attempts
- ✅ 15-minute lockout duration
- ✅ Automatic lockout expiry
- ✅ Case-insensitive email handling
- ✅ Brute force attack prevention

### Sprint 6.1: Security Checks (`securityChecks.test.ts`)
- ✅ Environment variable validation
- ✅ Production vs development checks
- ✅ HTTPS requirement in production
- ✅ API key format validation
- ✅ Missing configuration detection
- ✅ Security feature logging

## 🐛 Debugging Tests

### Run Single Test File
```bash
npm test tests/unit/sanitization.test.ts
```

### Run Single Test Suite
```bash
npm test -- -t "sanitizeHtml"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Show Console Logs
Comment out console mocks in `tests/setup.ts`:
```typescript
// global.console = { ... }; // Comment this out
```

## 📚 Jest Configuration

See `jest.config.js` for full configuration:
- ES Modules support
- TypeScript transformation
- Coverage thresholds
- Test matching patterns

## 🔧 Troubleshooting

### "Cannot find module" errors
- Ensure all imports end with `.js` extension
- Check `jest.config.js` module name mapper

### "Timeout" errors
- Increase timeout in `jest.config.js`
- Or use `jest.setTimeout(10000)` in specific tests

### Coverage not showing files
- Check `collectCoverageFrom` in `jest.config.js`
- Ensure source files are in `src/` directory

## 📖 Best Practices

1. **Test One Thing**: Each test should verify one specific behavior
2. **Descriptive Names**: Test names should read like documentation
3. **AAA Pattern**: Arrange, Act, Assert structure
4. **Independent Tests**: Tests shouldn't depend on each other
5. **Mock External Dependencies**: Use mocks for databases, APIs, etc.
6. **Edge Cases**: Test empty strings, null, undefined, invalid input
7. **Fast Tests**: Unit tests should run in milliseconds

## 🎯 Next Steps

Planned test additions:
- Integration tests for API endpoints (Sprint 6.6)
- End-to-end tests for user flows (Sprint 6.7)
- Performance tests (Sprint 6.8)

## 📞 Support

For questions about tests:
- Check existing test files for examples
- Read Jest documentation: https://jestjs.io/
- Review test mocks in `tests/mocks/`
