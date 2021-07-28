/**
 *
 * @param {number} min is included
 * @param {number} max is not included
 * @returns {number} result is [min; max)
 */
module.exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}