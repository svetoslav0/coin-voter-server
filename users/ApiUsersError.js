import { ApiError } from '../common/ApiError.js';

const ERRORS = {
    BAD_GOOGLE_TOKEN: {
        status: 400,
        message: 'Invalid or expired google token'
    }
};

export class ApiUsersError extends ApiError {
    static get ERRORS() {
        return ERRORS;
    }
}
