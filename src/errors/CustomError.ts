// src/errors/CustomError.ts
export class CustomError extends Error {
  statusCode: number;
  errors: string[];

  constructor(
    message: string,
    statusCode: number = 500,
    errors: string[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  serializeErrors() {
    // Retorna sempre o array de erros, mesmo que esteja vazio
    return this.errors;
  }
}
