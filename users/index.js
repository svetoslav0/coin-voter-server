import express from 'express';

import { ApiUsersController } from './ApiUsersController.js';

const router = express.Router();

router.post('/login', async (request, response, next) => {
    try {
        return response.json(await new ApiUsersController(request, response, next).login());
    } catch (e) {
        next(e);
    }
});

router.post('/googleLogin', async (request, response, next) => {
    try {
        return response.json(await new ApiUsersController(request, response, next).google_login());
    } catch (e) {
        next(e);
    }
});

router.post('/register',  async (request, response, next) => {
    try {
        return response.json(await new ApiUsersController(request, response, next).register());
    } catch (e) {
        next(e);
    }
});

export default router;
