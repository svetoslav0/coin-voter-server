import { ApiRepository } from '../common/ApiRepository.js';

class ApiVotesRepository extends ApiRepository {
    /**
     * @param user_id
     * @param coin_id
     * @returns {Promise<void>}
     */
    async get_last_vote(user_id, coin_id) {
        const query = `
            SELECT
                id,
                user_id,
                coin_id,
                time_voted
            FROM
                coin_votes
            WHERE
                user_id = ?
                    AND
                coin_id = ?
            ORDER BY
                time_voted
            DESC
        `;

        const vote = await this._query(query, [user_id, coin_id]);

        if (vote.length >= 1) {
            return vote[0];
        }

        return null;
    }

    /**
     * @param coin_ids
     * @param user_id
     * @returns {Promise<*>}
     */
    async get_latest_votes_for_user(coin_ids, user_id) {
        const query = `
            SELECT 
                user_id,
                coin_id,
                MAX(time_voted) AS latest_vote
            FROM
                coin_votes
            WHERE
                coin_id IN (?)
                    AND
                user_id = ?
            GROUP BY 
                user_id,
                coin_id;
        `;

        const parameters = [
            coin_ids,
            user_id
        ];

        return await this._query(query, parameters);
    }

    /**
     * @param coin_ids
     * @returns {Promise<*>}
     */
    async get_total_votes_for_coin_ids(coin_ids) {
        const query = `
            SELECT 
                coin_id,
                COUNT(user_id) AS total_votes
            FROM
                coin_votes
            WHERE
                coin_id IN (?)
            GROUP BY
                coin_id
        `;

        const parameters = [coin_ids];
        return await this._query(query, parameters);
    }

    /**
     * @param coin_id
     * @returns {Promise<*|number>}
     */
    async get_votes_for_coin(coin_id) {
        const query = `
            SELECT
                COUNT(*) AS votes_count
            FROM 
                 coins AS c
            INNER JOIN 
                coin_votes AS v
                    ON 
                v.coin_id = c.id
            WHERE c.id = ?;
        `;

        const result = await this._query(query, [coin_id]);
        if (result.length == 1) {
            return result[0].votes_count;
        }

        return 0;
    }

    /**
     * @param user_id
     * @param coin_id
     * @returns {Promise<void>}
     */
    async add(user_id, coin_id) {
        const query = `
            INSERT INTO
                coin_votes (
                    user_id,
                    coin_id
                )
            VALUES (?, ?)
        `;

        await this._query(query, [user_id, coin_id]);
    }

    /**
     * @param id
     * @returns {Promise<void>}
     */
    async remove(id) {
        const query = `
            DELETE FROM
                coin_votes
            WHERE
                id = ?
        `;

        await this._query(query, [id]);
    }
}

export default ApiVotesRepository;
