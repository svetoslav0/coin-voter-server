import { ApiError } from '../common/ApiError.js';

const ERRORS = {
    INVALID_DATE: {
        status: 400,
        message: '{FIELD} field must be in format YYYY-MM-DD'
    },
    NON_EXISTING_COIN_ID: {
        status: 404,
        message: 'Coin with ID {ID} does not exist'
    },
    INVALID_COIN_ORDER_VALUE: {
        status: 400,
        message: 'Invalid order value, must be one these: {ORDER_LIST}'
    },
    INVALID_COIN_ORDER: {
        status: 400,
        message: 'Invalid order, must be either "ASC" or "DESC"'
    },
    NON_EXISTING_COIN_VOTE: {
        status: 400,
        message: 'Cannot remove non-existing vote'
    }
};

export class ApiCoinsError extends ApiError {
    static get ERRORS() {
        return ERRORS;
    }
}
