import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Util from 'util';

import { router } from './routes.js';
import { ApiMiddleware } from './common/ApiMiddleware.js';
import { ApiError } from './common/ApiError.js';
import { DbFactory } from './common/database/DbFactory.js';

import { config } from './common/config/config.js';
import { CONSTANTS } from './common/config/CONSTANTS.js';

import UsersRepository from './users/ApiUsersRepository.js';
import CoinsRepository from './coins/ApiCoinsRepository.js';
import VotesRepository from './votes/ApiVotesRepository.js';

const dbConnection = (new DbFactory()).create(CONSTANTS.DB_DRIVERS.MYSQL).get_connection();
const queryFunc = Util.promisify(dbConnection.query).bind(dbConnection);

const app = express();
const port = config.server_port;

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(morgan('dev'));

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
                coins: new CoinsRepository(queryFunc),
                votes: new VotesRepository(queryFunc)
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
        : 'Something went wrong . . .';

    console.error(err);

    res.status(statusCode)
        .send({ error: errorMessage });
});

app.listen(port, () => console.log(`Running on port ${port} . . .`));
