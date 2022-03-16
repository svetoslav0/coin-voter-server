import express from 'express';

import { ApiMiddleware } from '../common/ApiMiddleware.js';
import { ApiCoinsController } from './ApiCoinsController.js';

const router = express.Router();

router.post('/', ApiMiddleware.is_user_ordinary, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).add_coin());
    } catch (e) {
        next(e);
    }
});

router.post('/approve/:id', ApiMiddleware.is_user_admin, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).approve());
    } catch (e) {
        next(e);
    }
});

router.get('/', ApiMiddleware.try_to_authorize_user, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).search());
    } catch (e) {
        next(e);
    }
});

router.get('/keywordSearch', async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).keyword_search());
    } catch (e) {
        next(e);
    }
});

router.get('/unapprovedCount', ApiMiddleware.is_user_admin, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).get_upapproved_count());
    } catch (e) {
        next(e);
    }
});

router.get('/:id', ApiMiddleware.try_to_authorize_user, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).get_coin_by_id());
    } catch (e) {
        next(e);
    }
});

export default router;
