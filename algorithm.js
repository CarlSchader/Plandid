const _ = require('underscore');
const { copyObject } = require('./utilities');

function rangedObjectsOverlap(x, y, startKey="start", endKey="end") {
    if ((x[startKey] >= y[startKey] && x[startKey] <= y[endKey]) || (x[endKey] <= y[endKey] && x[endKey] >= y[startKey])) {
        return true;
    }
    else  {
        return false;
    }
}

function rangeOverlap(list, element, startKey="start", endKey="end") {
    if (list.length === 0) {
        return false;
    }
    else {
        let index = binarySearch(list, element, (x, y) => x[startKey] < y[startKey], (x, y) => x[startKey] === y[startKey]);
        return rangedObjectsOverlap(element, list[index], startKey, endKey) || (index !== 0 && rangedObjectsOverlap(element, list[index - 1], startKey, endKey));
    }
}

// Adds an element to a list but merges the elements if there ranges overlap.
// The range start is found with the startKey and the end with the endKey.
function rangeMerge(
    list, 
    element, 
    startKey="start", 
    endKey="end", 
    lowerOperator=(x, y) => {return x[startKey] < y[startKey]}, 
    lowerEqualsOperator=(x, y) => {return (x[startKey] < y[endKey] && x[startKey] > y[startKey]) || x[startKey] === y[startKey] || x[startKey] === y[endKey]}, 
    upperOperator=(x, y) => {return x[endKey] < y[startKey]}, 
    upperEqualsOperator=(x, y) => {return (x[endKey] < y[endKey] && x[endKey] > y[startKey]) || x[endKey] === y[startKey] || x[endKey] === y[endKey]}
    ) {
    if (list.length === 0) {
        return [element];
    }
    let lowerIndex = binarySearch(list, element, lessThanOperator=lowerOperator, equalsOperator=lowerEqualsOperator);
    let upperIndex = binarySearch(list, element, lessThanOperator=upperOperator, equalsOperator=upperEqualsOperator);

    if (upperIndex < list.length && upperOperator(element, list[upperIndex])) {
        upperIndex = upperIndex - 1;
    }

    let newElement = copyObject(element);
    if (lowerIndex < list.length && lowerIndex > -1 && list[lowerIndex][startKey] < newElement[startKey]) {
        newElement[startKey] = list[lowerIndex][startKey];
    }
    if (upperIndex < list.length && upperIndex > -1 && list[upperIndex][endKey] > newElement[endKey]) {
        newElement[endKey] = list[upperIndex][endKey];
    }
    let newList = copyObject(list);
    let removeCount = upperIndex - lowerIndex + 1;
    newList.splice(lowerIndex, removeCount, newElement);
    return newList;
}

class PriorityQueue {
    constructor(operator=(x, y) => {return x > y;}, equalsOperator=(x, y) => {return x === y;}) {
        this.queue = [];
        this.operator = operator;
        this.equalsOperator = equalsOperator;
    }

    insert(element) {
        let i = binarySearch(this.queue, element, lessThanOperator=this.operator, equalsOperator=this.equalsOperator);
        if (i >= this.queue.length) {
            this.queue.push(element)
        }
        else {
            this.queue.splice(i, 0, element);
        }
    }

    pop() {
        return this.queue.shift();
    }

    empty() {
        return this.queue.length === 0;
    }
}

// Always returns index which is less than or equal to searchItem.
function binarySearch(container, searchItem, lessThanOperator=(x, y) => {return x < y;}, equalsOperator=(x, y) => {return x === y;}) {
    if (container.length === 0) {
        return 0;
    }
    let min = 0;
    let max = container.length - 1;
    let i = Math.floor((max + min) / 2);
    let iOld = -1;
    while (i !== iOld) {
        if (equalsOperator(searchItem, container[i])) {
            return i;
        }
        else if (lessThanOperator(searchItem, container[i])) {
            max = i;
        }
        else {
            min = i;
        }
        iOld = i;
        i = Math.floor((max + min) / 2);
    }
    if (lessThanOperator(searchItem, container[i])) {
        return i;
    }
    else {
        return i + 1;
    }
}

// planDays Helpers

function dateStringLessThan(string1, string2) {
    return new Date(string1) < new Date(string2);
}

function dateStringEquals(string1, string2) {
    return new Date(string1) === new Date(string2)
}

function daysBetween(date1, date2) {
    return Math.abs(date1.getTime() - date2.getTime()) / 86400000;
}

function createTimeQueue(schedule, lookbackDays) {
    // let timeQueue = PriorityQueue(operator=(x, y) => {x[1] < y[1];}, equalsOperator=(x, y) => {x[1] === y[1];});
    const today = new Date();
    let timeMap = {};
    let index = binarySearch(schedule.plans, today.toString(), lessThanOperator=dateStringLessThan, equalsOperator=dateStringEquals);
    while (true) {
        if (index < 0 || index >= schedule.plans.length) {
            break;
        }
        let plan = schedule.plans[index];
        if (daysBetween(today, new Date(plan.date)) > lookbackDays) {
            break;
        }
        else {
            for (let j = 0; j < plan.length; j++) {
                break // TODODODODOD
            }
        }
    }
}

function planDays(schedule, days, lookbackDays) {
    
}

module.exports = {
    PriorityQueue, PriorityQueue,
    binarySearch: binarySearch,
    rangeMerge: rangeMerge,
    rangeOverlap: rangeOverlap
}