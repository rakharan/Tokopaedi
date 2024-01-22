export class BaseError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.code = this.constructor.name;
        this.statusCode = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string) {
        super(message);
        this.statusCode = 401;
    }
}

export class MissingRequestError extends BaseError {
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
    }
}

export class BadInputError extends BaseError {
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
    }
}

export class MailError extends BaseError {
    constructor(message: string) {
        super(message);
        this.statusCode = 400;
    }
}

export class ResultNotFoundError extends BaseError {
    constructor(message: string) {
        super(message);
        this.statusCode = 404;
    }
}

export class ApiError extends BaseError {
    constructor(message: string) {
        super(message);
        this.statusCode = 500;
    }
}