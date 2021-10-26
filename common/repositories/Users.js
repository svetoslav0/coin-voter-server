class Users {
    constructor(queryFunc) {
        this._query = queryFunc;
    }

    async getUserById(id) {
        return await this._query("select * from users");
    }
}

export default Users;
