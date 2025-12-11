module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFilesAfterEnv: ['./test/setup.js'],
  testTimeout: 30000,  // Gives time for first binary download
  // No testEnvironment needed — the preset sets it to 'node'
};
