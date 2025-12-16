// __mocks__/dotenv.js
module.exports = {
  // `config` is a jest mock function so you can assert on it if you ever need to
  config: jest.fn(() => ({
    // Return a plain object; you can add any env vars your code reads
    parsed: {
      PORT: '8080',
      SESSION_SECRET: 'test-secret',
      // Add more fake vars here if needed, e.g.:
      //GOOGLE_CLIENT_ID: 'dummy-id',
      //GOOGLE_CLIENT_SECRET: 'dummy-secret',
    },
  })),
};