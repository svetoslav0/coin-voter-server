export class ApiRepository {
    constructor(queryFunc) {
        /**
         * @protected
         */
        this._query = queryFunc;
    }
}
