export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleBeautifierError(error: unknown) {
  if (error instanceof SyntaxError) {
    throw new ApiError(400, 'Invalid syntax in provided code', {
      details: error.message,
    });
  }

  if (error instanceof ApiError) {
    throw error;
  }

  throw new ApiError(500, 'Failed to process code', {
    details: error instanceof Error ? error.message : 'Unknown error',
  });
}

export function handleMinifierError(error: unknown) {
  if (error instanceof SyntaxError) {
    throw new ApiError(400, 'Invalid syntax in provided code', {
      details: error.message,
    });
  }

  if (error instanceof ApiError) {
    throw error;
  }

  throw new ApiError(500, 'Failed to minify code', {
    details: error instanceof Error ? error.message : 'Unknown error',
  });
}
