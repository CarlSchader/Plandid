const { PassThrough } = require('stream');
const _ = require('underscore');

class PriorityQueue {
    constructor(operator=(x, y) => {return x > y;}, equalsOperator=(x, y) => {return x === y;}) {
        this.queue = [];
        this.operator = operator;
        this.equalsOperator = equalsOperator;
    }

    insert(element) {
        let i = binarySearch(this.queue, element, operator=this.operator, equalsOperator=this.equalsOperator);
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

// Always returns index which is by default less than or equal to searchItem. If length of container is 0, returns -1.
function binarySearch(container, searchItem, operator=(x, y) => {return x < y;}, equalsOperator=(x, y) => {return x === y;}) {
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
        else if (operator(searchItem, container[i])) {
            max = i;
        }
        else {
            min = i;
        }
        iOld = -1;
        i = Math.floor((max + min) / 2);
    }
    if (operator(searchItem, container[i])) {
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
    let index = binarySearch(schedule.plans, today.toString(), operator=dateStringLessThan, equalsOperator=dateStringEquals);
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
                TODO
            }
        }
    }
}

function planDays(schedule, days, lookbackDays) {
    
}

module.exports = {
    PriorityQueue, PriorityQueue,
    binarySearch: binarySearch
}