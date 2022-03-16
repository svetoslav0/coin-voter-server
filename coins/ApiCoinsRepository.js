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
                id,
                name,
                description,
                symbol,
                launch_date,
                owner,
                is_approved,
                date_added,
                logo_url,
                FORMAT(price, 16) AS price,
                FORMAT(market_cap, 4) AS market_cap,
                is_presale,
                website,
                telegram,
                twitter,
                contract_address
            FROM
                coins
            WHERE
                id = ?
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
                ?
            )
        `;

        await this._query(
            query,
            [
                coin.name,
                coin.description,
                coin.symbol,
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
    async update_status(id, status) {
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
     * @param user_id
     * @param limit
     * @param offset
     * @param order
     * @param date_added
     * @param is_approved
     * @param is_presale
     * @param is_promoted
     * @param ascending_order
     * @returns {Promise<*>}
     */
    async search_coins_for_logged_user(user_id, limit, offset, order, date_added, is_approved, is_presale, is_promoted, ascending_order = false) {
        const query = `
            SELECT 
                nested.id,
                nested.name,
                nested.symbol,
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
                WHERE 
                    c.is_approved = 1
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
                    v.user_id
                ) AS nested
            LEFT JOIN
                coin_votes AS cv
                    ON
                        nested.id = cv.coin_id
            LEFT JOIN promoted_coins AS p ON nested.id = p.coin_id
            WHERE
                1 = 1
                ${is_approved
                    ? ' AND nested.is_approved = ?'
                    : ''
                }
                ${is_presale
                    ? ' AND nested.is_presale = ?'
                    : ''
                }
                ${date_added
                    ? ' AND DATE(nested.date_added) = ?'
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
                ${is_promoted
                        ? ' AND is_promoted = ?'
                        : ''
                }
            ORDER BY
                ${order} ${ascending_order ? 'ASC' : 'DESC'}
            LIMIT ?, ?
        `;

        const parameters = [];
        parameters.push(user_id);
        parameters.push(user_id);

        if (is_approved) {
            parameters.push(is_approved === 'true' ? 1 : 0);
        }

        if (is_presale) {
            parameters.push(is_presale === 'true' ? 1 : 0);
        }

        if (date_added) {
            parameters.push(date_added);
        }

        if (is_promoted) {
            parameters.push(is_promoted === 'true' ? 1 : 0);
        }

        parameters.push(+offset);
        parameters.push(+limit);

        return this._query(query, parameters);
    }

    /**
     * @param limit
     * @param offset
     * @param order
     * @param date_added
     * @param is_approved
     * @param is_presale
     * @param is_promoted
     * @param ascending_order
     * @returns {Promise<*>}
     */
    async search_coins_for_no_user(limit, offset, order, date_added, is_approved, is_presale, is_promoted, ascending_order = false) {
        const query = `
            SELECT
                c.id,
                c.name,
                c.symbol,
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
                ${is_approved
                        ? ' AND c.is_approved = ?'
                        : ''
                }
                ${is_presale
                        ? ' AND c.is_presale = ?'
                        : ''
                }
                ${date_added
                    ? ' AND DATE(c.date_added) = ?'
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
                ${is_promoted
                        ? ' AND is_promoted = ?'
                        : ''
                }
            ORDER BY
                ${order} ${ascending_order ? 'ASC' : 'DESC'}
            LIMIT ?, ?
        `;

        const parameters = [];

        if (is_approved) {
            parameters.push(is_approved === 'true' ? 1 : 0);
        }

        if (is_presale) {
            parameters.push(is_presale === 'true' ? 1 : 0);
        }

        if (date_added) {
            parameters.push(date_added);
        }

        if (is_promoted) {
            parameters.push(is_promoted === 'true' ? 1 : 0);
        }

        parameters.push(+offset);
        parameters.push(+limit);

        return this._query(query, parameters);
    }

    /**
     * @param limit
     * @param offset
     * @param approved
     * @param order
     * @param date_added
     * @param ascending_order
     * @returns {Promise<*>}
     */
    async search_coins(limit, offset, approved, order, date_added, ascending_order = false) {
        const query = `
            SELECT
                n.id,
                n.name,
                n.symbol,
                n.launch_date,
                n.is_approved,
                n.date_added,
                n.logo_url,
                n.is_presale,
                FORMAT(n.price, 16) AS price,
                COUNT(n.coin_id) AS votes
            FROM (
                SELECT
                    c.id,
                    c.name,
                    c.symbol,
                    c.launch_date,
                    c.is_approved,
                    c.date_added,
                    c.logo_url,
                    c.is_presale,
                    c.price,
                    v.coin_id
                FROM
                    coins AS c
                LEFT JOIN
                    coin_votes AS v
                ON
                    c.id = v.coin_id
                ${approved !== undefined
                    ? approved === 'true'
                        ? 'WHERE c.is_approved = 1'
                        : 'WHERE c.is_approved = 0'
                    : ''}
                ${approved !== undefined && date_added
                    ? ' AND DATE(c.date_added) = ?'
                    : '' }
                ${approved === undefined && date_added
                    ? ' WHERE DATE(c.date_added) = ?'
                    : '' }
            ) AS n
            GROUP BY
                n.id,
                n.name,
                n.symbol,
                n.launch_date,
                n.is_approved,
                n.logo_url,
                n.is_presale,
                n.price,
                n.date_added
            ORDER BY
                ${order} ${ascending_order ? 'ASC' : 'DESC'}
            LIMIT ?, ?
        `;

        const parameters = [];
        if (date_added) {
            parameters.push(date_added);
        }

        parameters.push(+offset);
        parameters.push(+limit);

        return this._query(query, parameters);
    }

    /**
     * @param {string} keyword
     * @param {number} limit
     * @returns {Promise<*>}
     */
    async search_by_keyword(keyword, limit = CONSTANTS.RESTRICTIONS.DEFAULT_KEYWORD_SEARCH_LIMIT) {
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
                name LIKE ? OR
                symbol LIKE ? OR
                contract_address LIKE ?
            LIMIT ?
        `;

        const parameters = [keyword, keyword, keyword, limit];

        return this._query(query, parameters);
    }

    /**
     * @param approved
     * @param date_added
     * @returns {Promise<number>}
     */
    async get_total_from_search(approved, date_added) {
        const query = `
            SELECT
                COUNT(*) AS total
            FROM
                coins
            ${approved !== undefined
                ? approved === 'true'
                        ? 'WHERE is_approved = 1'
                        : 'WHERE is_approved = 0'
                : ''}
            ${approved !== undefined && date_added
                ? ' AND DATE(date_added) = ?'
                : '' }
            ${approved === undefined && date_added
                ? ' WHERE DATE(date_added) = ?'
                : '' }
        `;

        const params = [];
        if (date_added) {
            params.push(date_added);
        }

        const result = await this._query(query, params);
        if (result.length) {
            return result[0].total;
        }

        return 0;
    }

    /**
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<Array>}
     */
    async get_promoted_only(limit , offset) {
        const query = `
            SELECT
                n.id,
                n.name,
                n.symbol,
                n.logo_url,
                n.is_presale,
                n.launch_date,
                n.date_promoted,
                FORMAT(n.price, 16) AS price,
                COUNT(coin_votes.user_id) AS votes
            FROM
                coin_votes
            RIGHT JOIN (
                SELECT
                    c.id,
                    c.name,
                    c.symbol,
                    c.logo_url,
                    c.price,
                    c.is_presale,
                    c.launch_date,
                    p.date_promoted
                FROM
                    coins AS c
                INNER JOIN
                    promoted_coins AS p
                ON c.id = p.coin_id
            ) AS n
            ON coin_votes.coin_id = n.id
            GROUP BY
                n.id,
                n.name,
                n.symbol,
                n.logo_url,
                n.price,
                n.is_presale,
                n.launch_date,
                n.date_promoted
            ORDER BY
                n.date_promoted DESC
            LIMIT ?, ?
        `;

        const params = [+offset, +limit];
        return this._query(query, params);
    }

    /**
     * @returns {Promise<number>}
     */
    async get_total_promoted() {
        const query = `
            SELECT 
                COUNT(*) AS total
            FROM
                coins
            INNER JOIN 
                promoted_coins AS p
            ON coins.id = p.coin_id
        `;

        const result = await this._query(query);
        if (result.length) {
            return result[0].total;
        }

        return 0;
    }

    /**
     * @param {number} user_id
     * @param {Array<number>} coin_ids
     * @returns {Promise<*>}
     */
    async get_upvoted_coins_for_user(user_id, coin_ids) {
        const query = `
            SELECT
                c.id
            FROM
                coins AS c
            INNER JOIN
                coin_votes AS v
            ON
                c.id = v.coin_id
            WHERE
                v.user_id = ?
                    AND
                c.id IN(?)
        `;

        return this._query(query, [user_id, coin_ids]);
    }

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
