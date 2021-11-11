import { MysqlDatabase } from './MysqlDatabase.js';
import { CONSTANTS } from '../config/CONSTANTS.js';

export class DbFactory {
    create(type) {
        switch (type) {
            case CONSTANTS.DB_DRIVERS.MYSQL:
                return new MysqlDatabase();
            default:
                throw new Error(`Invalid database driver: ${type}`);
        }
    }
}
