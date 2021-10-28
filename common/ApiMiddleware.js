export class ApiMiddleware {
    constructor(request, response, next) {
        this._request = request;
        this._response = response;
        this._next = next;
    }

    async authorize_user() {
        const user = 1; // TODO: FIX THIS
        this._request.user = user;
    }
}
