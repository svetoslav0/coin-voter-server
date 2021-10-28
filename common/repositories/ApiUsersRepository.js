const USER_ROLE_ID = 1;
const ADMIN_ROLE_ID = 2;

class ApiUsersRepository {
    constructor(queryFunc) {
        this._query = queryFunc;
    }

    async getUserById(id) {
        // todo: reimplement this method
        return await this._query("select * from users");
    }

    async add(username, hash) {
        const query = `
            INSERT INTO
                users (
                    username,
                    password,
                    role_id
                )
            VALUES (?, ?, ?)
        `;

        await this._query(query, [username, hash, USER_ROLE_ID]);
    }

    async getUserByUsername(username) {
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
