import jwt from 'jsonwebtoken';

import { ApiError } from './ApiError.js';

import { config } from './config/config.js';
import { CONSTANTS } from './config/CONSTANTS.js';

export class ApiMiddleware {
    constructor(request, response, next) {
        this._request = request;
        this._response = response;
        this._next = next;
    }

    /**
     * @param request
     * @param response
     * @param next
     * @returns {Promise<*>}
     */
    static async is_user_ordinary(request, response, next) {
        try {
            await ApiMiddleware._authorize_user(request);
        } catch (err) {
            return next(err);
        }

        if (request.role_id >= CONSTANTS.USER_ROLES.USER_ROLE_ID) {
            return next();
        }

        next(new ApiError(ApiError.ERRORS.UNAUTHORIZED));
    }

    /**
     * @param request
     * @param response
     * @param next
     * @returns {Promise<*>}
     */
    static async is_user_admin(request, response, next) {
        try {
            await ApiMiddleware._authorize_user(request);
        } catch (err) {
            return next(err);
        }

        if (request.role_id >= CONSTANTS.USER_ROLES.ADMIN_ROLE_ID) {
            return next();
        }

        next(new ApiError(ApiError.ERRORS.UNAUTHORIZED));
    }

    static async try_to_authorize_user(request, response, next) {
        const token = request.query.token;

        if (!token) {
            return next();
        }

        try {
            const verified = jwt.verify(token, config.auth.token_secret);
            const { user_id, role_id } = verified;

            request.user_id = user_id;
            request.role_id = role_id;
        } catch (err) {
            console.log(ApiError.ERRORS.INVALID_TOKEN);
        }

        next();
    }

    /**
     * @param request
     * @returns {Promise<*>}
     * @private
     */
    static async _authorize_user(request) {
        const token = request.query.token;

        if (!token) {
            throw new ApiError(ApiError.ERRORS.MISSING_TOKEN);
        }

        try {
            const verified = jwt.verify(token, config.auth.token_secret);
            const { user_id, role_id } = verified;

            request.user_id = user_id;
            request.role_id = role_id;

            return true;
        } catch (err) {
            throw new ApiError(ApiError.ERRORS.INVALID_TOKEN);
        }
    }
}
