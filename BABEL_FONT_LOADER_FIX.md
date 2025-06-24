# Babel Font Loader Conflict Fix

## Problem
The project was failing to build in GitHub Actions with the following error:

```
Failed to compile.

./src/app/layout.tsx:2:1
Syntax error: "next/font" requires SWC although Babel is being used due to a custom babel config being present.
Read more: https://nextjs.org/docs/messages/babel-font-loader-conflict
```

## Root Cause
- The project uses `next/font/google` in `src/app/layout.tsx` for font optimization
- A custom `babel.config.js` file was present for Jest testing configuration
- Next.js detected the babel config and switched from SWC to Babel for compilation
- `next/font` requires SWC to function properly, causing a conflict

## Solution
Separated the Babel configuration to be used only for testing:

### 1. Renamed babel config
- Moved `babel.config.js` → `babel.test.config.js`
- This prevents Next.js from automatically detecting and using Babel

### 2. Updated Jest configuration
Modified `jest.config.js` to explicitly use the test-specific babel config:

```javascript
transform: {
  '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.test.config.js' }],
  '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.test.config.js' }],
},
```

### 3. Result
- Next.js now uses SWC for compilation (enabling `next/font` to work)
- Jest still uses Babel for test transpilation
- Both build and tests work correctly

## Files Modified
- `babel.config.js` → `babel.test.config.js` (renamed)
- `jest.config.js` (updated to reference specific babel config)

## Verification
- ✅ `npm run build` - Successful production build
- ✅ `npm test` - All tests pass with Babel transpilation
- ✅ Next.js fonts work correctly in production

## Benefits
- Eliminates the babel/SWC conflict
- Maintains testing functionality
- Allows optimal font loading with Next.js
- Improves build performance (SWC is faster than Babel)
