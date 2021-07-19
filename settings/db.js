// const mysql = require('mysql2');
//
// CHANGE CONFIGURATION IF NECESSARY
// const config = {
//     host: 'localhost',
//     port: 3306,
//     user: 'ad',
//     database: 'autodiallingdb',
//     password: 'Pass_123',
// };
//
// const connection = mysql.createConnection(config);
//
// connection.connect(err => {
//     if (err) {
//         return console.error('Ошибка подключения к БД!');
//     } else {
//         console.log('Подключение к БД успешно!');
//     }
// });
//
// module.exports = connection;

// const Sequelize = require('sequelize');
//
// const sequelize = new Sequelize(config.database, config.user, config.password, {
//     dialect: 'mysql',
//     host: config.host,
//     port: config.port,
//     define: {
//         timestamps: false,
//     }
// });
//
//
//
// console.log(123)
//
// sequelize
//     .sync()
//     .then(result => console.log('Good'))
//     .catch(err => console.log('ERROR'));
//
// module.exports = sequelize;