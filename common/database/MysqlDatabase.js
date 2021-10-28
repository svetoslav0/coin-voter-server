import mysql from 'mysql';

export class MysqlDatabase {
    get_connection() {
        const settings = {
            host: 'localhost',
            database: 'coiner',
            user: 'root',
            password: 'root'
        };

        console.log('Creating database connection . . .');
        const connection = mysql.createConnection(settings);
        connection.connect();

        return connection;
    }
}
