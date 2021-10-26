import express from 'express';

import { UsersController } from './UsersController.js';

const router = express.Router();

router.post('/login', async (request, response) => {
    const result = await new UsersController(request).login();

    response.send(result);
});

router.post('/register', (request, response) => {

});

export default router;
