import { ApiError } from '../common/ApiError.js';

const ERRORS = {
    SYMBOL_EXISTS: {
        status: 400,
        message: 'Coin with that symbol already exists'
    },
    INVALID_DATE: {
        status: 400,
        message: 'launch_date field must be in format YYYY-MM-DD'
    },
    NON_EXISTING_COIN_ID: {
        status: 404,
        message: 'Coin with ID {ID} does not exist'
    },
    INVALID_COIN_ORDER: {
        status: 400,
        message: 'Invalid order, must be one these: {ORDER_LIST}'
    }
};

export class ApiCoinsError extends ApiError {
    static get ERRORS() {
        return ERRORS;
    }
}
