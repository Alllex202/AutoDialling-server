module.exports = (Sequelize, sequelize) => {
    return sequelize.define('entry', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        officeAddress: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        deleted: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        datetime: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        service: {
            type: Sequelize.STRING(150),
            allowNull: false,
        },
        firstName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        secondName: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        phoneNumber: {
            type: Sequelize.STRING(15),
        },
        identifier: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
    });
};
