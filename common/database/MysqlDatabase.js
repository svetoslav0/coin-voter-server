import mysql from 'mysql';

import { config } from '../config/config.js';

export class MysqlDatabase {
    get_connection() {
        const settings = {
            host: config.database.host,
            database: config.database.database,
            user: config.database.user,
            password: config.database.password
        };

        console.log('Creating database connection . . .');
        const connection = mysql.createConnection(settings);
        connection.connect();

        return connection;
    }
}
