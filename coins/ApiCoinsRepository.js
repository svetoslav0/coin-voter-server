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
}

export default ApiCoinsRepository;
