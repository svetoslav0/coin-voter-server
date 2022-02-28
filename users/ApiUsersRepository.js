import { ApiRepository } from '../common/ApiRepository.js';

import { CONSTANTS } from '../common/config/CONSTANTS.js';

class ApiUsersRepository extends ApiRepository {
    /**
     * @param {string} username
     * @param {string} hash
     * @param {number} login_type_id
     * @returns {Promise<{id: number, username: string, role_id: number, login_type_id: number}>}
     */
    async add(username, hash, login_type_id = 1) {
        const query = `
            INSERT INTO
                users (
                    username,
                    password,
                    role_id,
                    login_type_id
                )
            VALUES (?, ?, ?, ?)
        `;

        const params = [
            username,
            hash,
            CONSTANTS.USER_ROLES.USER_ROLE_ID,
            login_type_id
        ];

        const result = await this._query(query, params);

        return {
            id: result.insertId,
            username,
            role_id: CONSTANTS.USER_ROLES.USER_ROLE_ID,
            login_type_id
        };

    }

    /**
     * @param {string} username
     * @returns {Promise<null|{id: number, username: string, password: string, role_id: number}>}
     */
    async get_user_by_username(username) {
        const query = `
            SELECT
                id,
                username,
                password,
                role_id
            FROM
                users
            WHERE
                username = ?
        `;

        const result = await this._query(query, [username]);

        if (result.length == 1) {
            return result[0];
        }

        return null;
    }
}

export default ApiUsersRepository;
