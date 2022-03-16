import { ApiCoinsError } from '../coins/ApiCoinsError.js';

const MILLISECONDS_TO_HOURS_COEFFICIENT = 36e5;

export class ApiController {
    /**
     * @returns {number}
     * @constructor
     */
    static get MILLISECONDS_TO_HOURS_COEFFICIENT() {
        return MILLISECONDS_TO_HOURS_COEFFICIENT;
    }

    /**
     * @param request
     * @param response
     * @param next
     */
    constructor(request, response, next) {
        /**
         * @protected
         */
        this._request = request || {};
        this._response = response;
        this._next = next;
        this._query = Object.assign(request.query || {}, request.body || {});
        /**
         * @protected
         */
        this._repository = request.repository;
    }

    /**
     * @returns {boolean}
     * @protected
     */
    _is_used_logged() {
        return this._request.user_id != null;
    }

    /**
     * @param value
     * @returns {boolean}
     * @protected
     */
    _parse_numeric_value_to_boolean(value) {
        if (!isNaN(value)) {
            return !!(+value);
        }

        return !!value;
    }

    /**
     * @returns {Promise<*>}
     * @protected
     */
    async _validate_coin_id_param_and_get_coin() {
        const id = this._request.params.id;
        const coin = await this._repository.coins.get_coin_by_id(id);

        if (!coin) {
            throw new ApiCoinsError(ApiCoinsError.ERRORS.NON_EXISTING_COIN_ID, { ID: id });
        }

        return coin;
    }
}
