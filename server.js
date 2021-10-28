import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import Util from 'util';

import { router } from './routes.js';
import { DATABASES } from './common/config/DATABASES.js';
import { ApiMiddleware } from './common/ApiMiddleware.js';
import { ApiError } from './common/ApiError.js';
import { DbFactory } from './common/database/DbFactory.js';
// TODO: import configuration

import UsersRepository from './users/ApiUsersRepository.js';
import CoinsRepository from './coins/ApiCoinsRepository.js';

const dbConnection = (new DbFactory()).create(DATABASES.MYSQL).get_connection();
const queryFunc = Util.promisify(dbConnection.query).bind(dbConnection);

const app = express();
const port = 8090; // TODO: Move in configuration

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(
    /**
     * @param {express.Request} request
     * @param {express.Response} response
     * @param {express.NextFunction} next
     * @returns {Promise<void>}
     */
    async (request, response, next) => {
        try {
            request.middleware = new ApiMiddleware(request, response, next);
            request.repository = {
                users: new UsersRepository(queryFunc),
                coins: new CoinsRepository(queryFunc)
            };
            next();
        } catch (err) {
            next(err);
        }
    }
);

app.use(router);

// TODO: Fix me!
app.use(function (err, req, res, next) {
    const error = err instanceof ApiError
        ? err.to_json().message
        : err;

    const statusCode = err.status || 500;
    const errorMessage = Object.keys(error).length // incorrect, probably -> err instanceof ApiError
        ? error
        : "Something went wrong . . .";

    console.error(err);

    res.status(statusCode)
        .send({ error: errorMessage });
});

app.listen(port, () => console.log(`Running on port ${port} . . .`))
