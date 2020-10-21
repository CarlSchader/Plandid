const { categorySet } = require('./constants');
const { DateTime, Interval } = require('luxon');

function modulo(n, m) {
    return ((n % m) + m) % m;
}

function weekMillis(utc) {
    return Interval.fromDateTimes(DateTime.fromMillis(utc).set({weekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0}), DateTime.fromMillis(utc)).length("milliseconds");
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
        if (!categorySet.has(categories[i])) {
            return false;
        }
    }
    return true;
}

function categoryIsOkay(category) {
    if (categorySet.has(category) || category === null) {
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

module.exports = {
    copyObject: copyObject,
    checkName: checkName,
    categoriesAreOkay: categoriesAreOkay,
    categoryIsOkay: categoryIsOkay,
    makeID: makeID,
    sortRangedObjectArray: sortRangedObjectArray,
    weekMillis: weekMillis,
    modulo: modulo
}