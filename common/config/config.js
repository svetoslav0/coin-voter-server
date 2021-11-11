export const config = {
    server_port: 8090,
    database: {
        host: 'localhost',
        database: 'coiner',
        user: 'root',
        password: 'root'
    },
    auth: {
        salt_difficulty: 10,
        token_secret: 'querty'
    }
};
