module.exports = {
  presets: [
    // Only use babel presets when in test environment (for Jest)
    // This allows Next.js to use SWC for builds while Jest uses Babel for tests
    ...(process.env.NODE_ENV === 'test' ? [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { runtime: 'automatic' }],
      '@babel/preset-typescript',
    ] : [])
  ],
  plugins: [],
};
