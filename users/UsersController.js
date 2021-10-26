export class UsersController {
    constructor(request) {
        this._repo = request.repository;
    }

    async login() {
        return await this._repo.user.getUserById(1);
    }
}
