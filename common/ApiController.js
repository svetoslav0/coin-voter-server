export class ApiController {
    constructor(request, response, next) {
        this._request = request || {};
        this._response = response;
        this._next = next;
        this._query = Object.assign(request.query || {}, request.body || {});
        this._repository = request.repository;
    }
}
