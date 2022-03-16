import { ApiRepository } from '../common/ApiRepository.js';

class ApiCategoriesRepository extends ApiRepository {
    /**
     * @returns {Promise<*>}
     */
    async find_all() {
        const query = `
            SELECT
                id,
                name
            FROM
                categories
        `;

        return await this._query(query);
    }

    /**
     * @param id
     * @returns {Promise<*>}
     */
    async find_by_id(id) {
        const query = `
            SELECT
                id,
                name
            FROM
                categories
            WHERE
                id = ?
        `;

        const result = await this._query(query, [id]);
        if (result.length) {
            return result[0]
        }

        return null;
    }
}

export default ApiCategoriesRepository;
