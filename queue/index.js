class Queue {
    constructor(maxLimit) {
        if (maxLimit < 1) {
            throw new Error('Argument "maxLimit" cannot be less than 1');
        }
        this._maxLimit = maxLimit;
        this._query = [];
        this._active = 0;
    }

    async enqueue(func, id) {
        if (++this._active > this._maxLimit) {
            await new Promise(resolve => this._query.push({resolve, isCanceled: false, id: id}));
        }

        try {
            return  {res: await func(), isLast: this._active - 1 <= 0};
        } catch (e) {
            throw e;
        } finally {
            this._active--;
            this._tryCallNext();
        }
    }

    _tryCallNext() {
        if (this._query.length > 0) {
            const next = this._query.shift();
            if (!next.isCanceled) {
                next.resolve();
            } else {
                this._tryCallNext();
            }
        }
    }

    tryCancel(id) {
        this._query.forEach(el => {
            if (el.id === id) {
                el.isCanceled = true;
            }
        })
    }

    get length() {
        return this._active;
    }
}

module.exports.Queue = Queue;