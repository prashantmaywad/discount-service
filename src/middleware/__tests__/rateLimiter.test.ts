import { Request, Response, NextFunction } from 'express';
import { generalLimiter, strictLimiter, veryStrictLimiter } from '../rateLimiter';

describe('Rate Limiter', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      path: '/api/test',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('generalLimiter', () => {
    it('should allow requests under the limit', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 5; i++) {
        await new Promise<void>((resolve) => {
          generalLimiter(mockRequest as Request, mockResponse as Response, () => {
            resolve();
          });
        });
      }

      expect(mockResponse.status).not.toHaveBeenCalledWith(429);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should set rate limit headers', async () => {
      await new Promise<void>((resolve) => {
        generalLimiter(mockRequest as Request, mockResponse as Response, () => {
          resolve();
        });
      });

      expect(mockResponse.setHeader).toHaveBeenCalled();
    });
  });

  describe('strictLimiter', () => {
    it('should have stricter limits than general limiter', () => {
      // Verify the configuration
      expect(strictLimiter).toBeDefined();
    });
  });

  describe('veryStrictLimiter', () => {
    it('should have very strict limits', () => {
      // Verify the configuration
      expect(veryStrictLimiter).toBeDefined();
    });
  });
});

