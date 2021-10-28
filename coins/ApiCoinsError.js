import { ApiError } from '../common/ApiError.js';

const ERRORS = {
    SYMBOL_EXISTS: {
        status: 400,
        message: 'Coin with that symbol already exists'
    },
    INVALID_DATE: {
        status: 400,
        message: 'launch_date field must be in format YYYY-MM-DD'
    }
};

export class ApiCoinsError extends ApiError {
    static get ERRORS() {
        return ERRORS;
    }
}
