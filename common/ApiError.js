import format from 'string-template';

/**
 * Error data object
 * @typedef {Object} ErrorData
 * @property {number} status - HTTP status of error
 * @property {string} [code] - Error code
 * @property {string} [message] - Message to show for user
 */
const ERRORS = {
    FIELD_IS_REQUIRED: {
        status: 400,
        message: '{FIELD} field is required'
    },
    USERNAME_ALREADY_TAKEN: {
        status: 400,
        message: 'Username {USERNAME} is already taken'
    },
    FIELD_MIN_LENGTH: {
        status: 400,
        message: '{FIELD} must be at least {LENGTH} chars'
    },
    PASSWORD_MISMATCH: {
        status: 400,
        message: 'Passwords mismatch'
    }
}

export class ApiError extends Error {
    static get ERRORS() {
        return ERRORS;
    }

    static process_error_with_data(error, error_data) {
        if (error_data) {
            Object.keys(error).forEach(key => {
                if (typeof error[key] === 'string') {
                    error[key] = format(error[key], error_data);
                }
            });
        }

        return error;
    }


    constructor(error, error_data) {
        super(error.message);
        this._error = Object.assign({}, error);
        this._error_data = error_data;
    }

    get code() {
        return this._error.code;
    }

    get status() {
        return this._error.status;
    }

    to_json() {
        this.constructor.process_error_with_data(this._error, this._error_data);

        return this._error;
    }
}
