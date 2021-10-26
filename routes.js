import express from 'express';

import users from './users/index.js';

const router = express.Router();

router.use('/users', users);

router.all('/', (request, response) => {
    response.status(404).json({
        error: 'Invalid route.'
    });
})

export { router };
