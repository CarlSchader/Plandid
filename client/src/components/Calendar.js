import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { executeQuery, localDateFromValues, rangesOverlap, copyObject, localDate } from '../utilities';
import { millisecondMap } from '../constants';
import Month from './Month';

function Calendar({tier=""}) {
    const [query, setQuery] = useState(null);
    const [plans, setPlans] = useState([]);
    const [month, setMonth] = useState(localDateFromValues().month);
    const [year, setYear] = useState(localDateFromValues().year);

    useEffect(executeQuery(query, {path: "/plans/getPlans", data: {}, onResponse: function(res) {setPlans(res.data)}}), [query]);

    function handleOnClick(forward) {
        return function () {
            if (forward) {
                if (month === 12) {
                    setMonth(1);
                    setYear(year + 1);
                }
                else {
                    setMonth(month + 1);
                }
            }
            else {
                if (month === 1) {
                    setMonth(12);
                    setYear(year - 1);
                }
                else {
                    setMonth(month - 1);
                }
            }
        }
    }
    
    function planSchedule() {
        let dt = localDateFromValues();
        let utcStart = dt.toMillis();
        let utcEnd = DateTime.local().set({year: year, month: month, day: dt.daysInMonth, hour: 23, minute: 59, second: 59, millisecond: 999}).toMillis();
        console.log(utcEnd)
        setQuery({
            path: "plans/makePlans",
            data: {utcStart: utcStart, utcEnd: utcEnd}
        });
    }

    function getMonthPlans() {
        let monthPlans = []
        let dt = localDateFromValues();
        let utcStart = localDateFromValues({year: year, month: month, day: 1}).toMillis();
        let utcEnd = localDateFromValues({year: year, month: month, day: 1}).toMillis() + (31 * millisecondMap.day);
        for (let i = 0; i < plans.length; i++) {
            if (rangesOverlap(plans[i], {start: utcStart, end: utcEnd})) {
                monthPlans.push(copyObject(plans[i]));
            }
            else if (plans[i].start >= utcEnd) {
                break;
            }
        }
        return monthPlans;
    }

    function nextMonth(year, month) {
        let dt = localDateFromValues({year: year, month: month});
        return localDate(localDateFromValues({year: year, month: month, day: dt.daysInMonth}).toMillis() + millisecondMap.day).monthLong;
    }

    function previousMonth(year, month) {
        let dt = localDateFromValues({year: year, month: month});
        return localDate(localDateFromValues({year: year, month: month, day: 1}).toMillis() - millisecondMap.day).monthLong;
    }

    return (
        <div>
            <Button onClick={planSchedule} variant="primary">Plan Month</Button>
            <Month tier={tier} year={year} month={month} plans={getMonthPlans()}/>
            <Button style={{marginLeft: "5%"}} onClick={handleOnClick(false)} variant="success" size="lg" type="button">
                {previousMonth(year, month)}
            </Button>
            <Button style={{marginRight: "5%"}} className="float-right" onClick={handleOnClick(true)} variant="success" size="lg" type="button">
                {nextMonth(year, month)}
            </Button>
        </div>
    );
}

export default Calendar;