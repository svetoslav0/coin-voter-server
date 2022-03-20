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

    /**
     * @param category
     * @returns {Promise<void>}
     */
    async add(category) {
        const query = `
            INSERT INTO
                categories (name)
            VALUES
                (?);
        `;

        const parameters = [
            category.name
        ];

        await this._query(query, parameters);
    }

    /**
     * @param category
     * @returns {Promise<void>}
     */
    async update(category) {
        const query = `
            UPDATE
                categories
            SET
                name = ?
            WHERE
                id = ?
        `;

        const parameters = [
            category.name,
            category.id
        ];

        await this._query(query, parameters);
    }

    /**
     * @param id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const query = `
            DELETE FROM
                categories
            WHERE
                id = ?
        `;

        const params = [id];
        await this._query(query, params);
    }
}

export default ApiCategoriesRepository;
