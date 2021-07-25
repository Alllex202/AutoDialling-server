module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'ad',
    database: process.env.DB_NAME || 'autodiallingdb',
    dialect: process.env.DB_DIALECT || 'mysql',
    password: process.env.DB_PASSWORD || 'Pass_123',
};
