const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'autodiallingdb',
    password: 'Password123',

});

connection.connect(err => {
    if (err) {
        return console.error('Ошибка подключения к БД!');
    } else {
        console.log('Подключение к БД успешно!');
    }
});

module.exports = connection;
