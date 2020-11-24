import axios from 'axios';
import _ from "lodash"
import config from './config';
import { DateTime } from 'luxon';

function invert(obj) {
    return _.invert(obj);
}

function copyObject(obj) {
    return _.cloneDeep(obj);
}

function modulo(n, m) {
    return ((n % m) + m) % m;
}

function localDateFromValues({
    year = DateTime.local().year,
    month = DateTime.local().month, // starts at 1
    day = DateTime.local().day, // starts at 1
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
    weekday = null, // starts at 1
} = {}) {
    if (weekday !== null) {
        let dt = DateTime.local(year, month, day);
        return dt.set({weekday: weekday, hour: hour, minute: minute, second: second, millisecond: millisecond});
    }
    else {
        return DateTime.local(year, month, day, hour, minute, second, millisecond);
    }
}

function localDate(utc) {
    return DateTime.fromMillis(utc).setZone(DateTime.local().zoneName);
}

function localWeekTime(weekMillis) {
    return {
        totalMilliseconds: modulo(weekMillis + (DateTime.local().offset * 60000), 604800000),
        weekday: function() {
            if (this.totalMilliseconds === 0) {
                return 1;
            }
            else {
                return Math.floor(this.totalMilliseconds / 86400000) + 1;
            }
        },
        hour: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / 3600000), 24);
            }
        },
        minute: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / 60000), 60);
            }
        },
        second: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / 1000), 60);
            }
        },
        millisecond: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(this.totalMilliseconds, 1000);
            }
        },
        toLocaleString: function(format=null) {
            if (format === null) {
                return DateTime.local().set({weekday: this.weekday(), hour: this.hour(), minute: this.minute(), second: this.second(), millisecond: this.millisecond()}).toLocaleString();
            }
            else {
                return DateTime.local().set({weekday: this.weekday(), hour: this.hour(), minute: this.minute(), second: this.second(), millisecond: this.millisecond()}).toLocaleString(format);
            }
        }
    };
}

function executeQuery(query=null, afterQuery=null) {
    function executeQueries() {
        if (Array.isArray(query)) {
            for (let i = 0; i < query.length; i++) {
                if (i === query.length - 1) {
                    sendRequest(query[i].path, query[i].data || {}, (res) => {
                        if ("onResponse" in query) {
                            query[i].onResponse(res);
                        }
                        executeAfterQueries();
                    });
                }
                else {
                    if ("onResponse" in query[i]) {
                        sendRequest(query[i].path, query[i].data || {}, query[i].onResponse);
                    }
                    else {
                        sendRequest(query[i].path, query[i].data || {});
                    }
                }
            }
        }
        else {
            sendRequest(query.path, query.data || {}, (res) => {
                if ("onResponse" in query) {
                    query.onResponse(res);
                }
                executeAfterQueries();
            });
        }
    }
    function executeAfterQueries() {
        if (afterQuery !== null) {
            if (Array.isArray(afterQuery)) {
                for (let i = 0; i < afterQuery.length; i++) {
                    if ("onResponse" in afterQuery[i]) {
                        sendRequest(afterQuery[i].path, afterQuery[i].data || {}, afterQuery[i].onResponse);
                    }
                    else {
                        sendRequest(afterQuery[i].path, afterQuery[i].data || {});
                    }
                }
            }
            else {
                if ("onResponse" in afterQuery) {
                    sendRequest(afterQuery.path, afterQuery.data || {}, afterQuery.onResponse);
                }
                else {
                    sendRequest(afterQuery.path, afterQuery.data || {});
                }
            }
        }
    }
    return function() {
        if (query !== null) {
            executeQueries();
        }
        else {
            executeAfterQueries();
        }
    };
}

// onResponse takes a response argument.
function sendRequest(path, data, onResponse=function(res) {if (res.data !== 0) window.alert(res.data)}) {
    axios.post(path, data, {baseURL: config.url, withCredentials: true}).then(onResponse);
}

function variantFromCategory(category, defaultVariant="") {
    let variant = variants[category];
    if (variant === undefined) {
        return defaultVariant;
    }
    else {
        return variant;
    }
}

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
}

const variants = ["primary", "secondary", "success", "warning", "danger", "info", "dark"];

// Assumes range2.start <= range2.end
function insideRange(range1, range2, startKey="start", endKey="end") {
    return range1[startKey] >= range2[startKey] && range1[endKey] <= range2[endKey];
}

function rangesOverlap(range1, range2, startKey="start", endKey="end") {
    return (range1[startKey] >= range2[startKey] && range1[startKey] <= range2[endKey]) || (range1[endKey] <= range2[endKey] && range1[endKey] >= range2[startKey]);
}

// Assumes list is sorted
function overlapSearch(item, list, startKey="start", endKey="end") {
    for (let i = 0; i < list.length; i++) {
        if (rangesOverlap(item, list[i], startKey, endKey)) {
            return true;
        }
    }
    return false;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }

function rruleString(zoneName, startMillis, untilMillis, frequency, interval) {
    const dtStart = localDate(startMillis).setZone(zoneName);
    const dtUntil = localDate(untilMillis).setZone(zoneName);
    return `DTSTART;TZID=${zoneName}:${pad(dtStart.year, 4)}${pad(dtStart.month, 2)}${pad(dtStart.day, 2)}T${pad(dtStart.hour, 2)}${pad(dtStart.minute, 2)}${pad(dtStart.second, 2)}\nRRULE:FREQ=${frequency.toUpperCase()};UNTIL=${pad(dtUntil.year, 4)}${pad(dtUntil.month, 2)}${pad(dtUntil.day, 2)}T${pad(dtUntil.hour, 2)}${pad(dtUntil.minute, 2)}${pad(dtUntil.second, 2)};INTERVAL=${interval}`;
}

function rruleStringUntilDate(string) {
    const startIndex = string.indexOf('UNTIL=', 0) + 6;
    const endIndex = string.indexOf(';', startIndex);
    let dateString = string.substring(startIndex, endIndex);
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6));
    const day = parseInt(dateString.substring(6, 8));
    // skip a char here because of rrule date format adding a T
    const hour = parseInt(dateString.substring(9, 11));
    const minute = parseInt(dateString.substring(11, 13));
    const second = parseInt(dateString.substring(13, 15));
    return DateTime.local().setZone(rruleStringTimeZone(string)).set({year: year, month: month, day: day, hour: hour, minute: minute, second: second});
}

function rruleStringTimeZone(string) {
    const index = string.indexOf("TZID=", 0) + 5;
    return string.substring(index, string.indexOf(':', index)); 
}

function rruleStringFrequency(string) {
    const index = string.indexOf("FREQ=", 0) + 5;
    return string.substring(index, string.indexOf(';', index));
}

function rruleStringInterval(string) {
    const index = string.indexOf("INTERVAL=", 0) + 9;
    return parseInt(string.substring(index, string.length));
}

export {
    executeQuery,
    sendRequest,
    categoryMap,
    variants,
    variantFromCategory,
    localDate,
    localDateFromValues,
    localWeekTime,
    modulo,
    copyObject,
    insideRange,
    rangesOverlap,
    overlapSearch,
    pad,
    rruleString,
    rruleStringUntilDate,
    rruleStringTimeZone,
    rruleStringFrequency,
    rruleStringInterval,
    invert
}