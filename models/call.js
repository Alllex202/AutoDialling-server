const db = require('../settings/db');

class Call {
    // constructor(entryId) {
    //     this.entryId = entryId;
    // }

    add(entryId) {
        // const sql = `INSERT calls()`
        // db.query()
    }

    static getAll() {
        const sql = `SELECT * FROM calls`;
        db.query(sql, (err, results) => {
            if (err) {
                return console.error(`Ошибка получения взонков из БД!: ${err}`);
            } else {
                console.log(results);
            }
        });
    }

    /**
     *
     * @param id personal key (pk)
     */
    static get(id) {
        const sql = `SELECT * FROM calls WHERE id = ?`;
        const params = [id];
        db.query(sql, params, (err, results) => {
            if (err) {
                return console.error(`Ошибка получения взонка с id ${id} из БД!: ${err}`);
            } else {
                console.log(results);
            }
        });
    }
}

module.exports = Call;