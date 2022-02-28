import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import { ApiController } from '../common/ApiController.js';
import { ApiError } from '../common/ApiError.js';
import { ApiUsersError } from './ApiUsersError.js';

import { config } from '../common/config/config.js';
import { CONSTANTS } from '../common/config/CONSTANTS.js';

export class ApiUsersController extends ApiController {
    /**
     * @returns {Promise<{token: (*)}>}
     */
    async login() {
        const { username, password } = this._query;
        await this._validate_login_params();

        const user = await this._repository.users.get_user_by_username(username);

        const isPasswordValid = await bcrypt.compare(password, user ? user.password : '');
        if (user && isPasswordValid) {
            return {
                token: this._generate_token(user)
            };
        }

        throw new ApiError(ApiError.ERRORS.INVALID_CREDENTIALS);
    }

    /**
     * @returns {Promise<{token: string}>}
     */
    async google_login() {
        const client = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID);
        const { token } = this._query;

        let ticket = null;
        try {
            ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_AUTH_CLIENT_ID
            });
        } catch (e) {
            throw new ApiUsersError(ApiUsersError.ERRORS.BAD_GOOGLE_TOKEN);
        }

        const { email } = ticket?.getPayload();

        let user = await this._repository.users.get_user_by_username(email);
        if (user == null) {
            user = await this._repository.users.add(email, CONSTANTS.LOGIN_TYPES.GOOGLE, CONSTANTS.LOGIN_TYPE_IDS.GOOGLE);
        }

        return {
            token: this._generate_token(user)
        };
    }

    /**
     * @returns {Promise<void>}
     */
    async register() {
        await this._validate_register_params();

        const salt = await bcrypt.genSalt(config.auth.salt_difficulty);
        const hash = await bcrypt.hash(this._query.password, salt);

        await this._repository.users.add(this._query.username, hash);
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_login_params() {
        const { username, password } = this._query;

        if (!username) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'username' });
        }

        if (!password) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'password' });
        }
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_register_params() {
        const { username, password, confirmPassword } = this._query;

        if (!username) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'username' });
        }

        if (!password) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'password' });
        }

        if (!confirmPassword) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'confirmPassword' });
        }

        const user = await this._repository.users.get_user_by_username(username);
        if (user) {
            throw new ApiError(ApiError.ERRORS.USERNAME_ALREADY_TAKEN, { USERNAME: username });
        }

        if (username.length < CONSTANTS.RESTRICTIONS.MIN_USERNAME_LENGTH) {
            throw new ApiError(ApiError.ERRORS.FIELD_MIN_LENGTH, {
                FIELD: 'username',
                LENGTH: CONSTANTS.RESTRICTIONS.MIN_USERNAME_LENGTH
            });
        }

        if (password.length < CONSTANTS.RESTRICTIONS.MIN_PASSWORD_LENGTH) {
            throw new ApiError(ApiError.ERRORS.FIELD_MIN_LENGTH, {
                FIELD: 'password',
                LENGTH: CONSTANTS.RESTRICTIONS.MIN_PASSWORD_LENGTH
            });
        }

        if (password != confirmPassword) {
            throw new ApiError(ApiError.ERRORS.PASSWORD_MISMATCH);
        }
    }

    /**
     * @param {{id: number, role_id: number}} user_data
     * @returns {string}
     * @private
     */
    _generate_token({id, role_id}) {
        const payload = {
            user_id: id,
            role_id: role_id
        };

        return jwt.sign(payload, config.auth.token_secret);
    }
}
