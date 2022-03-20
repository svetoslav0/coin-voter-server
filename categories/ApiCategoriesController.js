import { ApiController } from '../common/ApiController.js';
import { ApiError } from '../common/ApiError.js';
import { ApiCategoriesError } from './ApiCategoriesError.js';

export class ApiCategoriesController extends ApiController {
    /**
     * @returns {Promise<*>}
     */
    async get_all() {
        return await this._repository.categories.find_all();
    }

    /**
     * @returns {Promise<void>}
     */
    async add() {
        await this._validate_name_param();

        await this._repository.categories.add({
            name: this._query.name
        });
    }

    /**
     * @returns {Promise<void>}
     */
    async update() {
        await this._validate_category_id();
        await this._validate_name_param();

        await this._repository.categories.update({
            id: this._request.params.id,
            name: this._query.name
        });
    }

    /**
     * @returns {Promise<void>}
     */
    async remove() {
        await this._validate_category_id();
        await this._repository.categories.delete(this._request.params.id);
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_category_id() {
        const id = this._request.params.id;

        const category = await this._repository.categories.find_by_id(id);
        if (!category) {
            throw new ApiCategoriesError(
                ApiCategoriesError.ERRORS.NON_EXISTING_CATEGORY_ID,
                {
                    ID: id
                });
        }
    }

    /**
     * @returns {Promise<void>}
     * @private
     */
    async _validate_name_param() {
        const name = this._query.name;
        if (!name) {
            throw new ApiError(
                ApiError.ERRORS.FIELD_IS_REQUIRED,
                {
                    FIELD: 'name'
                });
        }
    }
}
