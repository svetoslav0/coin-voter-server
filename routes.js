import express from 'express';

import users from './users/index.js';
import coins from './coins/index.js';
import votes from './votes/index.js';

const router = express.Router();

router.use('/users', users);
router.use('/coins', coins);
router.use('/votes', votes);

router.all('*', (request, response) => {
    console.log(request);
    return response.status(404)
        .json({
            error: 'Invalid route.'
        });
})

export { router };
