const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
