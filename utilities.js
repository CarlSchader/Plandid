const { categoriesSet, millisecondMap } = require('./constants');
const { DateTime, Interval } = require('luxon');

function validRange(range, startKey="start", endKey="end") {
    return typeof(range[startKey]) === "number" && typeof(range[endKey]) === "number";
}

function weekTime(weekMillis) {
    return {
        totalMilliseconds: weekMillis,
        weekday: function() {
            if (this.totalMilliseconds === 0) {
                return 1;
            }
            else {
                return Math.floor(this.totalMilliseconds / millisecondMap.day) + 1;
            }
        },
        hour: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / millisecondMap.hour), 24);
            }
        },
        minute: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / millisecondMap.minute), 60);
            }
        },
        second: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / millisecondMap.second), 60);
            }
        },
        millisecond: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(this.totalMilliseconds, 1000);
            }
        }
    };
}

function modulo(n, m) {
    return ((n % m) + m) % m;
}

function weekMillis(utc) {
    return Interval.fromDateTimes(DateTime.fromMillis(utc).set({weekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0}), DateTime.fromMillis(utc)).length("milliseconds");
}

function utcFromWeekMillis(utcEarlier, millis) {
    let earlierMillis = weekMillis(utcEarlier);
    if (millis < earlierMillis) {
        return utcEarlier + millis + (millisecondMap.week - earlierMillis);
    }
    else {
        return utcEarlier + millis - earlierMillis;
    }
}

function weekJobLength(job) {
    if (job.end < job.start) {
        return millisecondMap.week - job.start + job.end;
    }
    else {
        return job.end - job.start;
    }
}

function copyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function sortRangedObjectArray(array, startKey="start") {
    return array.sort((x, y) => x[startKey] - y[startKey]);
}

function categoriesAreOkay(categories) {
    let seenCategories = new Set();
    for (let i = 0; i < categories.length; i++) {
        if (seenCategories.has(categories[i])) {
            return false;
        }
        else {
            seenCategories.add(categories[i]);
        }
        if (!categoriesSet.has(categories[i])) {
            return false;
        }
    }
    return true;
}

function categoryIsOkay(category) {
    if (categoriesSet.has(category) || category === null) {
        return true;
    }
    else {
        return false;
    }
}

function makeID(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 function checkName(name, record) {
    if (name.length < 1) {
        return false;
    }
    if (name.replace(/\s/g, '').length < 1) {
        return false;
    }
    if (name in record) {
        return false;
    }
    return true;
 }

 function localDate(utc) {
    return DateTime.fromMillis(utc).setZone(DateTime.local().zoneName);
}

module.exports = {
    copyObject: copyObject,
    checkName: checkName,
    categoriesAreOkay: categoriesAreOkay,
    categoryIsOkay: categoryIsOkay,
    makeID: makeID,
    sortRangedObjectArray: sortRangedObjectArray,
    weekMillis: weekMillis,
    modulo: modulo,
    utcFromWeekMillis: utcFromWeekMillis,
    weekJobLength: weekJobLength,
    validRange: validRange,
    localDate: localDate
}