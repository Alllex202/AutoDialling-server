const {Queue} = require('./index');

const queue = new Queue(1);

const arr = [1, 3, 2, 1, 1.3, 1.5, 4.5, 6];

arr.forEach((el, ind) =>
    queue.enqueue(() => asyncFunc(el), ind)
        .then((res) =>
            console.log(res, queue.length)));

setTimeout(() => {
    queue.enqueue(() => asyncFunc(1.5))
        .then((res) => {
            console.log(res, queue.length);
        });
}, 10000);

setTimeout(() => {
    queue.tryCancel(5);
}, 5000);

async function asyncFunc(num) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(num);
        }, num * 1000);
    });
}