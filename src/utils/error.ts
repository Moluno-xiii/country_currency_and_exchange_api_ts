class HTTPError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public apiName: string
  ) {
    super(message);
  }
}

export default HTTPError;
