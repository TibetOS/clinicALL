import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  // Store original console methods
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  // Create mocks
  const mockConsole = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    mockConsole.debug.mockClear();
    mockConsole.info.mockClear();
    mockConsole.warn.mockClear();
    mockConsole.error.mockClear();

    // Replace console methods
    console.debug = mockConsole.debug;
    console.info = mockConsole.info;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('createLogger', () => {
    it('should create a logger with all log levels', async () => {
      // Dynamic import to get fresh module with mocked console
      const { createLogger } = await import('./logger');
      const log = createLogger('TestModule');

      expect(log.debug).toBeDefined();
      expect(log.info).toBeDefined();
      expect(log.warn).toBeDefined();
      expect(log.error).toBeDefined();
    });

    it('should prefix messages with module name in development', async () => {
      const { createLogger } = await import('./logger');
      const log = createLogger('TestModule');

      log.debug('debug message');
      log.info('info message');
      log.warn('warn message');
      log.error('error message');

      expect(mockConsole.debug).toHaveBeenCalledWith('[TestModule]', 'debug message');
      expect(mockConsole.info).toHaveBeenCalledWith('[TestModule]', 'info message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[TestModule]', 'warn message');
      expect(mockConsole.error).toHaveBeenCalledWith('[TestModule]', 'error message');
    });

    it('should handle multiple arguments', async () => {
      const { createLogger } = await import('./logger');
      const log = createLogger('MultiArg');

      log.info('message', { data: 'value' }, 123);

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[MultiArg]',
        'message',
        { data: 'value' },
        123
      );
    });

    it('should handle objects and arrays', async () => {
      const { createLogger } = await import('./logger');
      const log = createLogger('Objects');
      const testObj = { foo: 'bar', nested: { a: 1 } };
      const testArr = [1, 2, 3];

      log.debug(testObj);
      log.info(testArr);

      expect(mockConsole.debug).toHaveBeenCalledWith('[Objects]', testObj);
      expect(mockConsole.info).toHaveBeenCalledWith('[Objects]', testArr);
    });

    it('should handle errors', async () => {
      const { createLogger } = await import('./logger');
      const log = createLogger('Errors');
      const error = new Error('Test error');

      log.error('Something went wrong:', error);

      expect(mockConsole.error).toHaveBeenCalledWith('[Errors]', 'Something went wrong:', error);
    });
  });

  describe('default logger', () => {
    it('should be pre-configured with App prefix', async () => {
      const { logger } = await import('./logger');
      logger.info('test message');

      expect(mockConsole.info).toHaveBeenCalledWith('[App]', 'test message');
    });
  });

  describe('logger isolation', () => {
    it('should create independent loggers for different modules', async () => {
      const { createLogger } = await import('./logger');
      const log1 = createLogger('Module1');
      const log2 = createLogger('Module2');

      log1.info('from module 1');
      log2.info('from module 2');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);
      expect(mockConsole.info).toHaveBeenNthCalledWith(1, '[Module1]', 'from module 1');
      expect(mockConsole.info).toHaveBeenNthCalledWith(2, '[Module2]', 'from module 2');
    });
  });
});
