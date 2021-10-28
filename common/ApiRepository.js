export class ApiRepository {
    constructor(queryFunc) {
        this._query = queryFunc;
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
}
