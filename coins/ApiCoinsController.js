import moment from 'moment';

import { ApiController } from '../common/ApiController.js';
import { ApiError } from '../common/ApiError.js';
import { ApiCoinsError } from './ApiCoinsError.js';
import { CONSTANTS } from '../common/config/CONSTANTS.js';

const DEFAULT_ORDER = CONSTANTS.COIN_ORDERS.ID;

export class ApiCoinsController extends ApiController {
    /**
     * @returns {Promise<{added: boolean}>}
     */
    async add_coin() {
        await this._validate_request_addition_params();

        const user_id = this._request.user_id;
        const role_id = this._request.role_id;
        const coin = this._get_coin_from_query();
        await this._repository.coins.add(
            coin, user_id, role_id == CONSTANTS.USER_ROLES.ADMIN_ROLE_ID
        );

        return { added: true };
    }

    /**
     * @returns {Promise<void>}
     */
    async approve() {
        await this._validate_coin_id_param_and_get_coin();
        await this._repository.coins.update_status(this._request.params.id, 1);
    }

    /**
     * @returns {Promise<{upvoted: boolean}>}
     */
    async vote() {
        await this._validate_coin_id_param_and_get_coin();
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
     * @returns {Promise<{success: boolean}>}
     */
    async remove_vote() {
        await this._validate_coin_id_param_and_get_coin();
        const coin_id = this._request.params.id;
        const user_id = this._request.user_id;

        const vote = await this._repository.votes.get_vote(user_id, coin_id);
        if (!vote) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.NON_EXISTING_COIN_VOTE);
        }

        await this._repository.votes.remove(user_id, coin_id);
        return {
            success: true
        };
    }

    /**
     * @returns {Promise<{coins: *}>}
     */
    async search() {
        await this._validate_get_coins_params();

        const { limit, offset, order, approved, date_added } = this._query;
        const coins = await this._repository.coins.search_coins(limit, offset, approved, order, date_added);
        const total = await this._repository.coins.get_total_from_search(approved, date_added);

        return {
            total,
            count: coins.length,
            offset: +this._query.offset,
            coins: await this._parse_search_response(coins)
        };
    }

    async keyword_search() {
        this._validate_keyword_param();
        const { keyword } = this._query;

        const coins = await this._repository.coins.search_by_keyword(keyword);
        return { coins };
    }

    /**
     * TODO: Remove!
     * @deprecated
     * @returns {Promise<{count: *}>}
     */
    async get_upapproved_count() {
        const count = await this._repository.coins.get_unapproved_count();
        return { count };
    }

    /**
     * @returns {Promise<ApiCoin>}
     */
    async get_coin_by_id() {
        const coin = await this._validate_coin_id_param_and_get_coin();
        coin.is_approved = coin.is_approved == "1";

        coin.has_upvoted = false;
        if (this._request.user_id && this._request.role_id) {
            const vote = await this._repository.votes.get_vote(this._request.user_id, coin.id);
            if (vote) {
                coin.has_upvoted = true;
            }
        }

        coin.votes_count = await this._repository.votes.get_votes_for_coin(coin.id);
        coin.is_owner = this._request.user_id == coin.owner;

        return coin;
    }

    async get_promoted() {
        this._validate_limit_and_offset_params();
        const { limit, offset } = this._query;

        const coins = await this._repository.coins.get_promoted_only(limit, offset);
        const total = await this._repository.coins.get_total_promoted();
        coins.forEach(c => c.is_presale = this._parse_numeric_value_to_boolean(c.is_presale));

        return {
            total,
            count: coins.length,
            offset: +this._query.offset,
            coins: await this._attach_votes_for_user_for_each_coin(coins)
        };
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_request_addition_params() {
        const { name, symbol, launch_date, website } = this._query;

        if (!name) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'name' });
        }

        if (!symbol) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'symbol' });
        }

        if (!launch_date) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'launch_date' });
        }

        if (!moment(launch_date, 'YYYY-MM-DD', true).isValid()) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_DATE, { FIELD: 'launch_date' });
        }

        if (!website) {
            throw new ApiCoinsError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'website' });
        }

        // TODO: Validate price and market cap

        // TODO: validate and parse is_presale
    }

    /**
     * @returns {ApiCoin}
     * @private
     */
    _get_coin_from_query() {
        return {
            name: this._query.name,
            description: this._query.description,
            symbol: this._query.symbol,
            launch_date: this._query.launch_date,
            logo_url: this._query.logo_url,
            price: this._query.price,
            market_cap: this._query.market_cap,
            is_presale: this._query.is_presale === 'true',
            website: this._query.website,
            telegram: this._query.telegram,
            twitter: this._query.twitter,
            contract_address: this._query.contract_address
        };
    }

    /**
     * @returns {Promise<ApiCoin>}
     * @private
     */
    async _validate_coin_id_param_and_get_coin() {
        const id = this._request.params.id;
        const coin = await this._repository.coins.get_coin_by_id(id);

        if (!coin) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.NON_EXISTING_COIN_ID, { ID: id });
        }

        return coin;
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_get_coins_params() {
        this._set_default_search_values();
        const { order, approved, date_added } = this._query;

        this._validate_limit_and_offset_params();

        if (!Object.values(CONSTANTS.COIN_ORDERS).includes(order.toLowerCase())) {
            const order_list = Object.values(CONSTANTS.COIN_ORDERS).join(', ');
            throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_COIN_ORDER, { ORDER_LIST: order_list });
        }

        const approvedValue = approved?.toString().trim().toLowerCase();
        if (approvedValue && approvedValue !== 'true' && approvedValue !== 'false') {
            throw new ApiError(ApiError.ERRORS.INVALID_BOOLEAN_PARAM, { FIELD: 'approved' });
        }

        if (date_added) {
            if (!moment(date_added, 'YYYY-MM-DD', true).isValid()) {
                throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_DATE, { FIELD: 'date_added' });
            }

            // this._query.date_added = moment.utc(date_added).toDate();
        }
    }

    _validate_limit_and_offset_params() {
        this._set_default_promoted_values();
        const { limit, offset } = this._query;

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
    }

    _validate_keyword_param() {
        const { keyword } = this._query;

        if (!keyword) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'keyword' });
        }
    }

    /**
     * @private
     */
    _set_default_search_values() {
        const { limit, offset, order } = this._query;

        if (!limit) {
            this._query.limit = CONSTANTS.RESTRICTIONS.DEFAULT_SEARCH_LIMIT;
        }

        if (!offset) {
            this._query.offset = CONSTANTS.RESTRICTIONS.DEFAULT_SEARCH_OFFSET;
        }

        if (!order) {
            this._query.order = DEFAULT_ORDER;
        }
    }

    /**
     * @private
     */
    _set_default_promoted_values() {
        const { limit, offset } = this._query;

        if (!limit) {
            this._query.limit = CONSTANTS.RESTRICTIONS.DEFAULT_PROMOTED_LIMIT;
        }

        if (!offset) {
            this._query.offset = CONSTANTS.RESTRICTIONS.DEFAULT_SEARCH_OFFSET;
        }
    }

    /**
     * @param coins
     * @returns {Promise<*>}
     * @private
     */
    async _parse_search_response(coins) {
        coins = await this._attach_votes_for_user_for_each_coin(coins);
        coins = this._parse_is_approved_filed(coins);
        return coins;
    }

    _parse_is_approved_filed(coins) {
        return coins.map(c => {
            c.is_approved = c.is_approved == 1;
            return c;
        });
    }

    /**
     * @param coins
     * @returns {Promise<*>}
     * @private
     */
    async _attach_votes_for_user_for_each_coin(coins) {
        if (this._request.user_id && this._request.role_id) {
            const ids = coins.map(c => c.id);
            if (!ids.length) {
                return [];
            }

            const voted_coin_ids = (await this._repository
                .coins
                .get_upvoted_coins_for_user(this._request.user_id, ids))
                .map(x => x.id);

            return coins.map(c => {
                c.has_upvoted = !!voted_coin_ids.includes(c.id);
                return c;
            });
        }

        return coins.map(c => {
            c.has_upvoted = false;
            return c;
        });
    }
}
