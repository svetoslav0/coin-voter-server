import moment from 'moment';

import { CONSTANTS } from '../common/config/CONSTANTS.js';
import { ApiError } from '../common/ApiError.js';
import { ApiCoinsError } from './ApiCoinsError.js';
import { ApiCategoriesError } from '../categories/ApiCategoriesError.js';
import { ApiController } from '../common/ApiController.js';
import { ApiVotesController } from '../votes/ApiVotesController.js';

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
     * @returns {Promise<{coins: *}>}
     */
    async search() {
        await this._validate_search_coins_params();

        let coins;
        if (this._is_used_logged()) {
            coins = await this._repository.coins.search_coins_for_logged_user(this._request.user_id, this._query, this._query.descending_order);
            coins = await this._attach_votes_for_user(coins);
            coins = await this._attach_total_votes(coins);
        } else {
            coins = await this._repository.coins.search_coins_for_no_user(this._query, this._query.descending_order);
        }

        const total = await this._repository.coins.get_total_from_search(this._query);

        return {
            total,
            count: coins.length,
            offset: +this._query.offset,
            coins
        };
    }

    /**
     * @param coins
     * @returns {Promise<*>}
     * @private
     */
    async _attach_votes_for_user(coins) {
        if (!coins.length) {
            return coins;
        }

        const ids = coins.map(c => c.id);
        const latest_votes = await this._repository.votes.get_latest_votes_for_user(ids, this._request.user_id);

        return coins.map(c => {
            c.user_last_voted = null;
            const vote = latest_votes.filter(v => v.coin_id == c.id);

            if (vote.length) {
                c.user_last_voted = vote[0].latest_vote;
            }

            return c;
        });
    }

    /**
     * @param coins
     * @returns {Promise<*>}
     * @private
     */
    async _attach_total_votes(coins) {
        if (!coins.length) {
            return coins;
        }

        const ids = coins.map(c => c.id);
        const total_votes = await this._repository.votes.get_total_votes_for_coin_ids(ids);

        return coins.map(c => {
            c.total_votes = 0;

            const votes = total_votes.filter(v => v.coin_id == c.id);
            if (votes.length) {
                c.total_votes = votes[0].total_votes;
            }

            return c;
        });
    }

    /**
     * @returns {Promise<{coins: *}>}
     */
    async keyword_search() {
        this._validate_keyword_params();

        switch (this._request.role_id) {
            case CONSTANTS.USER_ROLES.ADMIN_ROLE_ID: {
                const filter = {
                    keyword: this._query.keyword
                };

                return {
                    coins: await this._repository
                        .coins
                        .common_search_by_keyword(filter)
                }
            }
            case CONSTANTS.USER_ROLES.USER_ROLE_ID: {
                return {
                    coins: await this._repository
                        .coins
                        .client_user_search_by_keyword(
                            this._request.user_id,
                            this._query.keyword
                        )
                }
            }
            default: {
                const filter = {
                    keyword: this._query.keyword,
                    is_approved: true
                };
                return {
                    coins: await this._repository.coins.common_search_by_keyword(filter)
                }
            }
        }
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

        coin.user_last_voted = null;
        if (this._request.user_id && this._request.role_id) {
            const vote = await this._repository.votes.get_last_vote(this._request.user_id, coin.id);
            if (vote && !ApiVotesController.can_vote_again(vote)) {
                coin.user_last_voted = vote.time_voted;
            }
        }

        coin.total_votes = await this._repository.votes.get_votes_for_coin(coin.id);
        coin.is_owner = this._request.user_id == coin.owner;

        return coin;
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_request_addition_params() {
        const { name, symbol, category, launch_date, website } = this._query;

        if (!name) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'name' });
        }

        if (!symbol) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'symbol' });
        }

        if (!category) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'category' });
        }

        const foundCategory = await this._repository.categories.find_by_id(category);
        if (!foundCategory) {
            throw new ApiCategoriesError(ApiCategoriesError.ERRORS.NON_EXISTING_CATEGORY_ID, { ID: category })
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
            category: this._query.category,
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
     * @returns {Promise<void>}
     * @private
     */
    async _validate_search_coins_params() {
        this._set_default_search_values();
        const { order, is_approved, is_presale, date_added, is_promoted, category } = this._query;
        const [order_value, order_turn] = order.split(':');

        this._validate_limit_and_offset_params();

        // todo: can be abstracted, to be fixed!

        if (!Object.values(CONSTANTS.COIN_ORDERS).includes(order_value.toLowerCase())) {
            const order_list = Object.values(CONSTANTS.COIN_ORDERS).join(', ');
            throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_COIN_ORDER_VALUE, { ORDER_LIST: order_list });
        }
        this._query.order = order_value;

        if (order_turn) {
            if (order_turn.toLowerCase() !== 'asc' && order_turn.toLowerCase() !== 'desc') {
                throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_COIN_ORDER);
            }
            this._query.descending_order = true;
        }

        this._validate_boolean_param(is_approved, 'is_approved');
        this._validate_boolean_param(is_presale, 'is_presale');
        this._validate_boolean_param(is_promoted, 'is_promoted');

        if (date_added) {
            if (!moment(date_added, 'YYYY-MM-DD', true).isValid()) {
                throw new ApiCoinsError(ApiCoinsError.ERRORS.INVALID_DATE, { FIELD: 'date_added' });
            }
        }

        if (category) {
            const foundCategory = await this._repository.categories.find_by_id(category);
            if (!foundCategory) {
                throw new ApiCategoriesError(ApiCategoriesError.ERRORS.NON_EXISTING_CATEGORY_ID, { ID: category })
            }
        }
    }

    /**
     * @private
     */
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

    /**
     * @private
     */
    _validate_keyword_params() {
        const { keyword, is_approved } = this._query;

        if (!keyword) {
            throw new ApiError(ApiError.ERRORS.FIELD_IS_REQUIRED, { FIELD: 'keyword' });
        }

        this._validate_boolean_param(is_approved, 'is_approved');
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
}
