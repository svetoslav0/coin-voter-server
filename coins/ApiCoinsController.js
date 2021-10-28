import moment from 'moment';

import { ApiController } from '../common/ApiController.js';
import { ApiError } from '../common/ApiError.js';
import { ApiCoinsError } from './ApiCoinsError.js';

export class ApiCoinsController extends ApiController {
    /**
     * @returns {Promise<void>}
     */
    async request() {
        const { name, description, symbol, launch_date } = this._query;
        await this._validate_request_addition_params();

        const user_id = this._request.user_id;
        await this._repository.coins.add_unapproved(name, description, symbol, launch_date, user_id);
    }

    /**
     * @returns {Promise<void>}
     */
    async approve() {
        await this._validate_coin_id_param();
        await this._repository.coins.update_status(this._request.params.id, 1);
    }

    /**
     * @returns {Promise<void>}
     */
    async vote() {
        await this._validate_coin_id_param();
        const coin_id = this._request.params.id;
        const user_id = this._request.user_id;

        const vote = await this._repository.votes.get_vote(user_id, coin_id);

        // upvote
        if (!vote) {
            return await this._repository.votes.add(user_id, coin_id);
        }

        // unvote
        return await this._repository.votes.remove(user_id, coin_id);
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_request_addition_params() {
        const { name, symbol, launch_date } = this._query;

        if (!name) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'name' });
        }

        if (!symbol) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'symbol' });
        }

        const coin = await this._repository.coins.get_coin_by_symbol(symbol);
        if (coin) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.SYMBOL_EXISTS);
        }

        if (!launch_date) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'launch_date' });
        }

        if (!moment(launch_date, 'YYYY-MM-DD').isValid()) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_DATE);
        }
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_coin_id_param() {
        const id = this._request.params.id;
        const coin = await this._repository.coins.get_coin_by_id(id);

        if (!coin) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.NON_EXISTING_COIN_ID, { ID: id });
        }
    }
}
