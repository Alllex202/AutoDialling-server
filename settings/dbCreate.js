// const mysql = require('mysql2');
//
// // CHANGE CONFIGURATION IF NECESSARY
// const config = {
//     host: 'localhost',
//     port: 3306,
//     user: 'ad',
//     password: 'Pass_123',
// };
//
// createDB();
//
// function createDB() {
//
//     const connectionServer = mysql.createConnection(config);
//
//     connectionStart();
//
//     function connectionStart() {
//         connectionServer.connect(err => {
//             if (err) {
//                 throw new Error(`Ошибка при подключении к серверу MySQL! : ${err}`);
//             } else {
//                 console.log('Подключение к серверу MySQL успешно!');
//                 createDB();
//             }
//         });
//     }
//
//     function createDB() {
//         connectionServer.query(`CREATE DATABASE IF NOT EXISTS autodiallingdb;`, err => {
//             if (err) {
//                 throw new Error(`Ошибка при создании новой БД! : ${err}`);
//             } else {
//                 console.log(`Новая БД autodiallingdb создана!`);
//                 connectionEnd();
//             }
//         });
//     }
//
//     function connectionEnd() {
//         connectionServer.end(err => {
//             if (err) {
//                 throw new Error(`Ошибка при отключении сервера MySQL! : ${err}`);
//             } else {
//                 console.log('Соединение с сервером MySQL прекращено!');
//                 createTablesAndTests();
//             }
//         });
//     }
// }
//
// function createTablesAndTests() {
//
//     const connectionDB = mysql.createConnection({
//         ...config,
//         database: 'autodiallingdb',
//     });
//
//     connectionStart();
//
//     function connectionStart() {
//         connectionDB.connect(err => {
//             if (err) {
//                 throw new Error(`Ошибка при подключении к БД! : ${err}`);
//             } else {
//                 console.log('Подключение к БД успешно!');
//                 createTableEntries();
//             }
//         });
//     }
//
//     function createTableEntries() {
//         connectionDB.query(`CREATE TABLE IF NOT EXISTS entries (
//         id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
//         office_address VARCHAR(100) NOT NULL,
//         datetime DATETIME NOT NULL,
//         service VARCHAR(150) NOT NULL,
//         first_name VARCHAR(50) NOT NULL,
//         second_name VARCHAR(50) NOT NULL,
//         phone_number VARCHAR(15),
//         identifier VARCHAR(50) NOT NULL UNIQUE
//         );`, (err) => {
//             if (err) {
//                 throw new Error(`Ошибка при создании новой таблицы (entries)! : ${err}`);
//             } else {
//                 console.log(`Новая таблица (entries) создана!`);
//                 createTableCalls();
//             }
//         });
//     }
//
//     function createTableCalls() {
//         connectionDB.query(`CREATE TABLE IF NOT EXISTS calls (
//         id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
//         entry_id INT UNIQUE NOT NULL,
//         calls_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
//         result BOOL,
//         CONSTRAINT calls_entries_fk
//         FOREIGN KEY (entry_id) REFERENCES entries (id)
//         );`, err => {
//             if (err) {
//                 throw new Error(`Ошибка при создании новой таблицы (calls)! : ${err}`);
//             } else {
//                 console.log(`Новая таблица (calls) создана!`);
//                 tests();
//             }
//         });
//     }
//
//     function tests() {
//         const now = new Date();
//
//         insertEntries();
//
//         function insertEntries() {
//             connectionDB.query(`INSERT entries(office_address, datetime, service, first_name, second_name, phone_number, identifier)
//             VALUES (?, ?, ?, ?, ?, ?, ?),
//             (?, ?, ?, ?, ?, ?, ?);`,
//                 [
//                     'qwe',
//                     `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
//                     'mfc',
//                     'John',
//                     'Smith',
//                     '+7912345680',
//                     `id${now.getTime()}`,
//                     'office',
//                     `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
//                     'mfc123',
//                     'Kim',
//                     'Yan',
//                     null,
//                     `id${now.getTime() + 1}`,
//                 ],
//                 (err, results) => {
//                     if (err) {
//                         throw new Error(`Ошибка добавление новых записей (entry) в таблицу (entries)!: ${err}`);
//                     } else {
//                         console.log(`Новые записи (entry) в таблицу (entries) успешно добавлены!`);
//                         // console.log(results);
//                         insertCalls(results.insertId);
//                     }
//                 });
//         }
//
//         function insertCalls(entry_id) {
//             connectionDB.query(`INSERT calls(entry_id)
//             VALUES (?);`,
//                 [entry_id],
//                 (err, results) => {
//                     if (err) {
//                         // console.error(`Ошибка добавление новых записей (call) в таблицу (calls)!: ${err}`);
//                         throw new Error(`Ошибка добавление новых записей (call) в таблицу (calls)!: ${err}`);
//                     } else {
//                         console.log(`Новые записи (call) в таблицу (calls) успешно добавлены!`);
//                         // console.log(results);
//                         deleteCalls();
//                     }
//                 });
//         }
//
//         function deleteCalls() {
//             connectionDB.query(`DELETE FROM calls;`, err => {
//                 if (err) {
//                     throw new Error(`Ошибка при удалении тестовых данных из таблицы calls!: ${err}`);
//                 } else {
//                     console.log(`Тестовые данные из таблицы calls удалены!`);
//                     deleteEntries();
//                 }
//             });
//         }
//
//         function deleteEntries() {
//             connectionDB.query(`DELETE FROM entries;`, err => {
//                 if (err) {
//                     throw new Error(`Ошибка при удалении тестовых данных из таблицы entries!: ${err}`);
//                 } else {
//                     console.log(`Тестовые данные из таблицы entries удалены!`);
//                     connectionEnd();
//                 }
//             });
//         }
//     }
//
//     function connectionEnd() {
//         connectionDB.end(err => {
//             if (err) {
//                 throw new Error(`Ошибка при отключении БД! : ${err}`);
//             } else {
//                 console.log('Создание БД завершено успешно!');
//                 console.log('Все тесты прошли успешно!');
//                 console.log('Соединение с БД прекращено!');
//             }
//         });
//     }
// }
