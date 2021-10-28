import express from 'express';

import { ApiMiddleware } from '../common/ApiMiddleware.js';

const router = express.Router();

router.get('/', ApiMiddleware.is_user_admin, async (request, response, next) => {
    response.json({ sent: true });
});

export default router;
