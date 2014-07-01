var AtomicHooks = require('level-atomichooks');
var Padlock = require('padlock').Padlock;

function LevelIncrement(db, opts) {
    db = AtomicHooks(db);

    var lock = new Padlock();

    db.optsinc = opts || {};

    db.put = function (key, value, opts, callback) {
        if (typeof opts === 'function') {
            callback = opts;
            opts = {};
        }
        if (opts.type === 'counter') {
            lock.runwithlock(function () {
                db.parent.get(key, opts, function (err, val) {
                    if (err || !val) {
                        count = 0;
                    } else {
                        count = parseInt(val, 10);
                    }
                    count += value;
                    if (count === 0) {
                        db.parent.del(key, opts, function (err) {
                            lock.release();
                            callback(err, count);
                        });
                    } else {
                        db.parent.put(key, count, opts, function (err) {
                            lock.release();
                            callback(err, count);
                        });
                    }
                });
            });
        } else {
            db.parent.put(key, value, opts, callback);
        }
    };

    return db;
}

module.exports = LevelIncrement;
