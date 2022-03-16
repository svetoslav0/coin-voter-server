import express from 'express';

import { ApiCategoriesController } from './ApiCategoriesController.js';

const router = express.Router();

router.get('/', async (request, response, next) => {
    try {
        return response.json(await new ApiCategoriesController(request, response, next).get_all());
    } catch (e) {
        next(e);
    }
});

export default router;
