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
                is_approved
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
     * @param name
     * @param description
     * @param symbol
     * @param launch_date
     * @param user_id
     * @returns {Promise<void>}
     */
    async add_unapproved(name, description, symbol, launch_date, user_id) {
        const query = `
            INSERT INTO
                coins (
                    name,
                    description,
                    symbol,
                    launch_date,
                    owner,
                    is_approved
                )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await this._query(
            query,
            [name, description, symbol, launch_date, user_id, 0]
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
     * @param limit
     * @param offset
     * @param order
     * @param ascending_order
     * @returns {Promise<*>}
     */
    async search_approved_coins(limit, offset, approved, order, ascending_order = false) {
        const query = `
            SELECT
                n.id,
                n.name,
                n.symbol,
                n.launch_date,
                n.is_approved,
                COUNT(n.coin_id) AS votes
            FROM (
                SELECT
                    c.id,
                    c.name,
                    c.symbol,
                    c.launch_date,
                    c.is_approved,
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
            ) AS n
            GROUP BY
                n.id,
                n.name,
                n.symbol,
                n.launch_date,
                n.is_approved
            ORDER BY
                ${order} ${ascending_order ? 'ASC' : 'DESC'}
            LIMIT ?, ?
        `;

        return this._query(query, [+offset, +limit]);
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
