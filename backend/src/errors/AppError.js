export default class AppError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);

    this.name = "AppError";
    this.status = status ?? 400;
    this.code = code;
    this.details = details;
  }
}
