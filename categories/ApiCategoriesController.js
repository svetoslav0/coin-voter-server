import { ApiController } from '../common/ApiController.js';

export class ApiCategoriesController extends ApiController {
    /**
     * @returns {Promise<*>}
     */
    async get_all() {
        return await this._repository.categories.find_all();
    }
}
