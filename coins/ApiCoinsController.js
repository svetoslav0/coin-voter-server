import moment from 'moment';

import { ApiController } from '../common/ApiController.js';
import { ApiError } from '../common/ApiError.js';
import { ApiCoinsError } from './ApiCoinsError.js';
import { COIN_ORDERS } from '../common/config/COIN_ORDERS.js';

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;
const DEFAULT_ORDER = COIN_ORDERS.ID;

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
     * @returns {Promise<{upvoted: boolean}>}
     */
    async vote() {
        await this._validate_coin_id_param();
        const coin_id = this._request.params.id;
        const user_id = this._request.user_id;

        const vote = await this._repository.votes.get_vote(user_id, coin_id);

        if (!vote) {
            await this._repository.votes.add(user_id, coin_id);
            return {
                upvoted: true
            };
        }

        await this._repository.votes.remove(user_id, coin_id);
        return {
            upvoted: false
        };
    }

    /**
     * @returns {Promise<{coins: *}>}
     */
    async get_approved_coins() {
        await this._validate_get_coins_params();

        const { limit, offset, order } = this._query;
        const coins = await this._repository.coins.search_approved_coins(limit, offset, order);

        return { coins };
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

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_get_coins_params() {
        this._set_default_search_values();
        const { limit, offset, order } = this._query;

        if (isNaN(limit)) {
            throw new ApiError(ApiError.ERRORS.NON_NUMERIC_PARAM, { FIELD: 'limit' });
        }

        if (isNaN(offset)) {
            throw new ApiError(ApiError.ERRORS.NON_NUMERIC_PARAM, { FIELD: 'offset' });
        }

        if (limit < 0) {
            throw new ApiError(ApiError.ERRORS.NEGATIVE_PARAM, { FIELD: 'limit' });
        }

        if (offset < 0) {
            throw new ApiError(ApiError.ERRORS.NEGATIVE_PARAM, { FIELD: 'offset' });
        }

        if (!Object.values(COIN_ORDERS).includes(order.toLowerCase())) {
            const order_list = Object.values(COIN_ORDERS).join(', ');
            throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_COIN_ORDER, { ORDER_LIST: order_list });
        }
    }

    /**
     * @private
     */
    _set_default_search_values() {
        const { limit, offset, order } = this._query;

        if (!limit) {
            this._query.limit = DEFAULT_LIMIT;
        }

        if (!offset) {
            this._query.offset = DEFAULT_OFFSET;
        }

        if (!order) {
            this._query.order = DEFAULT_ORDER;
        }
    }
}
