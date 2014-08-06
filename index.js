var Padlock = require('padlock').Padlock;

function LevelIncrement(parent, optsinc) {
    var lock = new Padlock();

    optsinc = optsinc || {};

    function DB() {};
    DB.prototype = parent;
    var db = new DB();
    db.parent = parent;

    db.increment = function (key, value, opts, callback) {
        if (typeof opts === 'function') {
            callback = opts;
            opts = {};
        }
        lock.runwithlock(function () {
            db.parent.get(key, opts, function (err, val) {
                var count;
                if (err || !val) {
                    count = 0;
                } else {
                    count = parseInt(val, 10);
                }
                count += value;
                if (count === 0) {
                    db.parent.del(key, opts, function (err) {
                        lock.release();
                        callback(undefined, count);
                    });
                } else {
                    db.parent.put(key, count, opts, function (err) {
                        lock.release();
                        callback(err, count);
                    });
                }
            });
        });
    };

    db.getCount = function (key, opts, callback) {
        if (typeof opts === 'function') {
            callback = opts;
            opts = {};
        }
        if (opts.type ===  'counter') {
            db.parent.get(key, opts, function (err, val) {
                if (err || !val) {
                    callback(undefined, 0);
                } else {
                    callback(err, val);
                }
            });
        } else {
            db.parent.get(key, opts, function (err, value) {
                if (err || !value) {
                    value = 0;
                }
                callback(undefined, value);
            });
        }
    }

    return db;
}

module.exports = LevelIncrement;
