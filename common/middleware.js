export class Middleware {
    constructor(request, response) {
        this._request = request;
        this._response = response;
    }

    async authorize_user() {
        const user = 1; // TODO: FIX THIS
        this._request.user = user;
    }
}
