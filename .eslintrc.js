module.exports = {
  ignorePatterns: ['scripts', 'test/__util__/data', 'testing'],
  extends: 'snazzah',
  overrides: [
    {
      files: ['test/**/*.ts'],
      globals: {
        describe: true,
        it: true,
        beforeEach: true
      },
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.eslint.json'
      }
    }
  ]
};
