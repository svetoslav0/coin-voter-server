import bcrypt from 'bcryptjs'
import { ApiController } from '../common/ApiController.js';
import { ApiError } from '../common/ApiError.js';

const MIN_USERNAME_LENGTH = 4;
const MIN_PASSWORD_LENGTH = 4;
const SALT_DIFFICULTY = 10;

export class ApiUsersController extends ApiController {
    async login() {
        return await this._repository.user.getUserById(1);
    }

    async register() {
        await this._validate_register_params();

        const salt = await bcrypt.genSalt(SALT_DIFFICULTY);
        const hash = await bcrypt.hash(this._query.password, salt);

        await this._repository.user.add(this._query.username, hash);
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

        const user = await this._repository.user.getUserByUsername(username);
        if (user) {
            throw new ApiError(ApiError.ERRORS.USERNAME_ALREADY_TAKEN, { USERNAME: username });
        }

        if (username.length < MIN_USERNAME_LENGTH) {
            throw new ApiError(ApiError.ERRORS.FIELD_MIN_LENGTH, {
                FIELD: 'username',
                LENGTH: MIN_USERNAME_LENGTH
            });
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            throw new ApiError(ApiError.ERRORS.FIELD_MIN_LENGTH, {
                FIELD: 'password',
                LENGTH: MIN_PASSWORD_LENGTH
            });
        }

        if (password != confirmPassword) {
            throw new ApiError(ApiError.ERRORS.PASSWORD_MISMATCH);
        }
    }
}
