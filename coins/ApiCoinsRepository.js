import { CONSTANTS } from '../common/config/CONSTANTS.js';
import { ApiRepository } from '../common/ApiRepository.js';

class ApiCoinsRepository extends ApiRepository {
    /**
     * @param id
     * @returns {Promise<null|*>}
     */
    async get_coin_by_id(id) {
        const query = `
            SELECT
                coins.id,
                coins.name,
                coins.description,
                coins.symbol,
                coins.launch_date,
                coins.owner,
                coins.is_approved,
                coins.date_added,
                coins.logo_url,
                FORMAT(coins.price, 16) AS price,
                FORMAT(coins.market_cap, 4) AS market_cap,
                coins.is_presale,
                coins.website,
                coins.telegram,
                coins.twitter,
                coins.contract_address,
                categories.id AS category_id,
                categories.name AS category_name
            FROM
                coins
            INNER JOIN
                categories
                    ON
                coins.category = categories.id
            WHERE
                coins.id = ?
        `;

        const result = await this._query(query, [id]);

        if (result.length == 1) {
            return result[0];
        }

        return null;
    }

    /**
     * @param symbol
     * @returns {Promise<null|*>}
     */
    async get_coin_by_symbol(symbol) {
        const query = `
            SELECT
                id,
                name,
                description,
                symbol,
                launch_date,
                owner,
                is_approved
            FROM
                coins
            WHERE
                symbol = ?
        `;

        const result = await this._query(query, [symbol]);

        if (result.length == 1) {
            return result[0];
        }

        return null;
    }

    /**
     * @param {ApiCoin} coin
     * @param {number} user_id
     * @param {boolean} is_approved
     * @returns {Promise<void>}
     */
    async add(coin, user_id, is_approved) {
        const query = `
            INSERT INTO
                coins (
                    name,
                    description,
                    symbol,
                    category,
                    launch_date,
                    owner,
                    is_approved,
                    logo_url,
                    price,
                    market_cap,
                    is_presale,
                    website,
                    telegram,
                    twitter,
                    contract_address
                )
            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
        `;

        await this._query(
            query,
            [
                coin.name,
                coin.description,
                coin.symbol,
                coin.category,
                coin.launch_date,
                user_id,
                is_approved ? 1 : 0,
                coin.logo_url,
                coin.price || null,
                coin.market_cap || null,
                coin.is_presale ? 1 : 0,
                coin.website,
                coin.telegram || null,
                coin.twitter || null,
                coin.contract_address || null
            ]
        );
    }

    /**
     * @param id
     * @param status
     * @returns {Promise<void>}
     */
    async update_is_approved_for_coin(id, status) {
        const query = `
            UPDATE
                coins
            SET
                is_approved = ?
            WHERE
                id = ?
        `;

        await this._query(query, [status, id]);
    }

    /**
     * @returns {Promise<void>}
     */
    async update_all_to_approved() {
        const query = `
            UPDATE 
                coins
            SET
                is_approved = 1
            WHERE
                is_approved = 0
        `;

        await this._query(query);
    }

    /**
     * @param {number} user_id
     * @param {ApiSearchFilter} filter
     * @param {boolean} ascending_order
     * @returns {Promise<*>}
     */
    async search_coins_for_logged_user(user_id, filter, ascending_order = false) {
        const query = `
            SELECT 
                nested.id,
                nested.name,
                nested.symbol,
                nested.category,
                nested.date_added,
                nested.launch_date,
                nested.is_approved,
                nested.logo_url,
                nested.is_presale,
                FORMAT(nested.price, 16) AS price,
                IF (
                    nested.user_id = ?,
                    nested.last_voted,
                    NULL
                    ) AS user_last_voted,
                IF (
                    p.coin_id IS NOT NULL,
                    1,
                    0
                    ) AS is_promoted,
                COUNT(cv.id) AS total_votes
            FROM (
                SELECT c.id,
                    c.name,
                    c.symbol,
                    c.category,
                    v.user_id,
                    c.date_added,
                    c.launch_date,
                    c.is_approved,
                    c.logo_url,
                    c.is_presale,
                    c.price,
                    IF (
                        v.user_id = ?,
                        MAX(v.time_voted),
                        null
                        ) AS last_voted
                FROM coins c
                    LEFT JOIN
                        coin_votes AS v
                            ON
                                c.id = v.coin_id
                GROUP BY
                    c.id,
                    c.name,
                    c.symbol,
                    c.category,
                    c.date_added,
                    c.launch_date,
                    c.is_approved,
                    c.logo_url,
                    c.is_presale,
                    c.price,
                    v.user_id
                ) AS nested
            LEFT JOIN
                coin_votes AS cv
                    ON
                        nested.id = cv.coin_id
            LEFT JOIN promoted_coins AS p ON nested.id = p.coin_id
            WHERE
                1 = 1
                ${filter.is_approved
                    ? ' AND nested.is_approved = ?'
                    : ''
                }
                ${filter.is_presale
                    ? ' AND nested.is_presale = ?'
                    : ''
                }
                ${filter.date_added
                        ? ' AND DATE(nested.date_added) = ?'
                        : ''
                }
                ${filter.category
                        ? ' AND category = ?'
                        : ''
                }
            GROUP BY
                nested.id,
                nested.name,
                nested.symbol,
                nested.date_added,
                nested.launch_date,
                nested.is_approved,
                nested.logo_url,
                nested.is_presale,
                nested.price
            HAVING
                1 = 1
                ${filter.is_promoted
                        ? ' AND is_promoted = ?'
                        : ''
                }
            ORDER BY
                ${filter.order} ${ascending_order ? 'ASC' : 'DESC'}
            LIMIT ?, ?
        `;

        let parameters = [];
        parameters.push(user_id);
        parameters.push(user_id);
        parameters = parameters.concat(this._build_search_parameters(filter));

        return this._query(query, parameters);
    }

    /**
     * @param {ApiSearchFilter} filter
     * @param ascending_order
     * @returns {Promise<*>}
     */
    async search_coins_for_no_user(filter, ascending_order = false) {
        const query = `
            SELECT
                c.id,
                c.name,
                c.symbol,
                c.category,
                c.date_added,
                c.launch_date,
                c.is_approved,
                c.logo_url,
                c.is_presale,
                FORMAT(c.price, 16) AS price,
                NULL AS user_last_voted,
                IF (
                    p.coin_id IS NOT NULL,
                    1,
                    0
                    ) AS is_promoted,
                COUNT(v.coin_id) AS total_votes
            FROM
                coins AS c
            LEFT JOIN
                coin_votes AS v 
                    ON
                c.id = v.coin_id
            LEFT JOIN
                promoted_coins AS p
                    ON
                c.id = p.coin_id
            WHERE
                1 = 1
                ${filter.is_approved
                    ? ' AND c.is_approved = ?'
                    : ''
                }
                ${filter.is_presale
                    ? ' AND c.is_presale = ?'
                    : ''
                }
                ${filter.date_added
                    ? ' AND DATE(c.date_added) = ?'
                    : ''
                }
                ${filter.category
                    ? ' AND category = ?'
                    : ''
                }
            GROUP BY
                c.id,
                c.name,
                c.symbol,
                c.date_added,
                c.launch_date,
                c.is_approved,
                c.logo_url,
                c.is_presale,
                c.price,
                is_promoted
            HAVING
                1 = 1
                ${filter.is_promoted
                        ? ' AND is_promoted = ?'
                        : ''
                }
            ORDER BY
                ${filter.order} ${ascending_order ? 'ASC' : 'DESC'}
            LIMIT ?, ?
        `;

        return this._query(query, this._build_search_parameters(filter));
    }

    /**
     * @param {ApiSearchFilter} filter
     * @returns {*[]}
     * @private
     */
    _build_search_parameters(filter) {
        const parameters = [];

        if (filter.is_approved) {
            parameters.push(filter.is_approved === 'true' ? 1 : 0);
        }

        if (filter.is_presale) {
            parameters.push(filter.is_presale === 'true' ? 1 : 0);
        }

        if (filter.date_added) {
            parameters.push(filter.date_added);
        }

        if (filter.category) {
            parameters.push(filter.category);
        }

        if (filter.is_promoted) {
            parameters.push(filter.is_promoted === 'true' ? 1 : 0);
        }

        parameters.push(+filter.offset);
        parameters.push(+filter.limit);

        return parameters;
    }

    /**
     * @param filter
     * @param {number} limit
     * @returns {Promise<*>}
     */
    async common_search_by_keyword(filter, limit = CONSTANTS.RESTRICTIONS.DEFAULT_KEYWORD_SEARCH_LIMIT) {
        const keyword = `%${filter.keyword}%`;

        const query = `
            SELECT
                id,
                name,
                symbol,
                logo_url,
                contract_address
            FROM
                coins
            WHERE
                (
                    name LIKE ? OR
                    symbol LIKE ? OR
                    contract_address LIKE ?
                )
                AND 1 = 1
                ${
                    filter.is_approved
                    ? ' AND is_approved = ?'
                    : ''
                }
            LIMIT ?
        `;

        const params = [];
        params.push(keyword);
        params.push(keyword);
        params.push(keyword);
        if (filter.is_approved) {
            params.push(filter.is_approved ? 1 : 0);
        }

        params.push(limit);

        return await this._query(query, params);
    }

    /**
     * @param user_id
     * @param keyword
     * @param limit
     * @returns {Promise<*>}
     */
    async client_user_search_by_keyword(user_id, keyword, limit = CONSTANTS.RESTRICTIONS.DEFAULT_KEYWORD_SEARCH_LIMIT) {
        keyword = `%${keyword}%`;

        const query = `
            SELECT
                id,
                name,
                symbol,
                logo_url,
                contract_address
            FROM
                coins
            WHERE
                (
                    name LIKE ? OR
                    symbol LIKE ? OR
                    contract_address LIKE ?
                )
                AND
                (
                    is_approved = 1 OR
                    owner = ?
                )
            LIMIT ?
        `;

        const params = [];
        params.push(keyword);
        params.push(keyword);
        params.push(keyword);
        params.push(user_id);
        params.push(limit);

        return await this._query(query, params);
    }

    /**
     * @param {ApiSearchFilter} filter
     * @returns {Promise<number>}
     */
    async get_total_from_search(filter) {
        const query = `
            SELECT
                COUNT(c.id) AS total
            FROM
                coins AS c
            LEFT JOIN
                promoted_coins AS p
                    ON c.id = p.coin_id
            WHERE
                1 = 1
                ${
                    filter.date_added
                    ? ' AND DATE(c.date_added) = ?'
                    : ''
                }
                ${
                    filter.is_approved
                    ? ' AND c.is_approved = ?'
                    : ''
                }
                ${
                    filter.is_presale
                    ? ' AND c.is_presale = ?'
                    : ''
                }
                ${
                    filter.is_promoted
                    ? 
                        filter.is_promoted === 'true'
                        ? ' AND p.date_promoted IS NOT NULL'
                        : ' AND p.date_promoted IS NULL'
                    : ''
                }
                ${
                    filter.category
                    ? ' AND c.category = ?'
                    : ''
                }
        `;

        const params = [];
        if (filter.date_added) {
            params.push(filter.date_added);
        }

        if (filter.is_approved) {
            params.push(filter.is_approved === 'true' ? 1 : 0);
        }

        if (filter.is_presale) {
            params.push(filter.is_presale === 'true' ? 1 : 0);
        }

        if (filter.category) {
            params.push(filter.category);
        }

        const result = await this._query(query, params);

        if (result.length == 1) {
            return result[0].total;
        }

        return 0;
    }

    /**
     * @deprecated Use search methods instead
     * @returns {Promise<null|*>}
     */
    async get_unapproved_count() {
        const query = `
            SELECT
                COUNT(*) AS count
            FROM
                coins
            WHERE
                is_approved = 0
        `;

        const result = await this._query(query);

        if (result.length == 1) {
            return result[0].count;
        }

        return null;
    }
}

export default ApiCoinsRepository;
