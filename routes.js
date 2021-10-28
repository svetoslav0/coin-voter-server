import express from 'express';

import users from './users/index.js';
import coins from './coins/index.js';

const router = express.Router();

router.use('/users', users);
router.use('/coins', coins);

router.all('/', (request, response) => {
    response.status(404).json({
        error: 'Invalid route.'
    });
})

export { router };
