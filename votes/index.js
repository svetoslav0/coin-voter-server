import express from 'express';

import { ApiMiddleware } from '../common/ApiMiddleware.js';
import { ApiVotesController } from './ApiVotesController.js';

const router = express.Router();

router.post('/:id', ApiMiddleware.is_user_ordinary, async (request, response, next) => {
    try {
        return response.json(await new ApiVotesController(request, response, next).add_vote());
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', ApiMiddleware.is_user_ordinary, async (request, response, next) => {
    try {
        return response.json(await new ApiVotesController(request, response, next).remove_last_vote());
    } catch (e) {
        next(e);
    }
});

export default router;
