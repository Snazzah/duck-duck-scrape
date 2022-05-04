module.exports = {
  extends: 'snazzah',
  overrides: [
    {
      files: ['test/**/*.ts'],
      globals: {
        describe: true,
        it: true,
        beforeEach: true
      }
    }
  ]
};
