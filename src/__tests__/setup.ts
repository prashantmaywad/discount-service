// Test setup file
// Mock mongoose connection
jest.mock('../config/database', () => ({
  connectDatabase: jest.fn(),
}));

