export const mockRes = <T>(data: T) => ({
  data,
  error: null,
});

export const mockErr = (message: string) => ({
  data: null,
  error: { message },
});