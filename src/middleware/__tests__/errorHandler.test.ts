import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../errorHandler';

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    delete process.env.NODE_ENV;
  });

  describe('AppError', () => {
    it('should create AppError with message and status code', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should default to status code 500', () => {
      const error = new AppError('Test error');

      expect(error.statusCode).toBe(500);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 400);

      expect(error.stack).toBeDefined();
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', () => {
      const appError = new AppError('Not found', 404);

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Not found',
        statusCode: 404,
      });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle generic Error in production', () => {
      process.env.NODE_ENV = 'production';
      const genericError = new Error('Database connection failed');

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Something went wrong',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', genericError);
    });

    it('should handle generic Error in development', () => {
      process.env.NODE_ENV = 'development';
      const genericError = new Error('Database connection failed');

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Database connection failed',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', genericError);
    });

    it('should handle errors without NODE_ENV set', () => {
      delete process.env.NODE_ENV;
      const genericError = new Error('Unknown error');

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Something went wrong',
      });
    });

    it('should handle different status codes for AppError', () => {
      const appError = new AppError('Unauthorized', 401);

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should handle 409 conflict error', () => {
      const appError = new AppError('Resource conflict', 409);

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Resource conflict',
        statusCode: 409,
      });
    });
  });
});

