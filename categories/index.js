import express from 'express';

import { ApiCategoriesController } from './ApiCategoriesController.js';
import { ApiMiddleware } from '../common/ApiMiddleware.js';

const router = express.Router();

router.get('/', async (request, response, next) => {
    try {
        return response.status(201).json(await new ApiCategoriesController(request, response, next).get_all());
    } catch (e) {
        next(e);
    }
});

router.post('/', ApiMiddleware.is_user_admin, async (request, response, next) => {
    try {
        return response.json(await new ApiCategoriesController(request, response, next).add());
    } catch (e) {
        next(e);
    }
})

router.patch('/:id', ApiMiddleware.is_user_admin, async (request, response, next) => {
    try {
        return response.json(await new ApiCategoriesController(request, response, next).update());
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', ApiMiddleware.is_user_admin, async (request, response, next) => {
    try {
        return response.json(await new ApiCategoriesController(request, response, next).remove());
    } catch (e) {
        next(e);
    }
});

export default router;
