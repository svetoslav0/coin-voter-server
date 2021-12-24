import { ApiRepository } from '../common/ApiRepository.js';

class ApiVotesRepository extends ApiRepository {
    /**
     * @param user_id
     * @param coin_id
     * @returns {Promise<void>}
     */
    async get_vote(user_id, coin_id) {
        const query = `
            SELECT
                user_id,
                coin_id
            FROM
                coin_votes
            WHERE
                user_id = ?
                    AND
                coin_id = ?
        `;

        const vote = await this._query(query, [user_id, coin_id]);

        if (vote.length == 1) {
            return vote[0];
        }

        return null;
    }

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
     * @param user_id
     * @param coin_id
     * @returns {Promise<void>}
     */
    async remove(user_id, coin_id) {
        const query = `
            DELETE FROM
                coin_votes
            WHERE
                user_id = ?
                    AND
                coin_id = ?
        `;

        await this._query(query, [user_id, coin_id]);
    }
}

export default ApiVotesRepository;
