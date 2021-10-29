import express from 'express';

import { ApiMiddleware } from '../common/ApiMiddleware.js';
import { ApiCoinsController } from './ApiCoinsController.js';

const router = express.Router();

router.post('/requestAddition', ApiMiddleware.is_user_ordinary, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).request());
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

router.post('/vote/:id', ApiMiddleware.is_user_ordinary, async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).vote());
    } catch (e) {
        next(e);
    }
});

router.get('/', async (request, response, next) => {
    try {
        return response.json(await new ApiCoinsController(request, response, next).get_coins());
    } catch (e) {
        next(e);
    }
});

export default router;
