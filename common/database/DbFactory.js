import { DATABASES } from '../config/DATABASES.js';
import { MysqlDatabase } from './MysqlDatabase.js';

export class DbFactory {
    create(type) {
        switch (type) {
            case DATABASES.MYSQL:
                return new MysqlDatabase();
            default:
                throw new Error(`Invalid database driver: ${type}`);
        }
    }
}
