import { ApiError } from '../common/ApiError.js';

const ERRORS = {
    NON_EXISTING_CATEGORY_ID: {
        status: 404,
        message: 'Category with ID {ID} does not exist'
    }
};

export class ApiCategoriesError extends ApiError {
    static get ERRORS() {
        return ERRORS;
    }
}
