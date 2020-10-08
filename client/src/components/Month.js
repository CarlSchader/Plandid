import React, { useState, useEffect } from 'react';
import { Container, Col, Card, Row } from 'react-bootstrap';
import Day from './Day';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function initializeDayValues(year, month) {
    let numberOfDays = new Date(year, month + 1, 0).getDate();
    let numberOfDaysPreviousMonth = 0;
    if (month === 0) {
        numberOfDaysPreviousMonth = new Date(year - 1, 11 + 1, 0).getDate();
    }
    else {
        numberOfDaysPreviousMonth = new Date(year, month - 1 + 1, 0).getDate();
    }
    let firstDayOfTheWeek = new Date(year, month, 1).getDay();
    let array = new Array(42);
    for (let i = 0; i < firstDayOfTheWeek; i++) {
        array[i] = {day: numberOfDaysPreviousMonth - firstDayOfTheWeek + 1 + i, color: 'bg-secondary'};
    }
    let color = 'bg-white';
    for (let i = firstDayOfTheWeek; i < 42; i++) {
        if ((i - firstDayOfTheWeek) === numberOfDays) {
            color = 'bg-secondary';
        }
        array[i] = {day: ((i - firstDayOfTheWeek) % numberOfDays) + 1, color: color};
    }
    return array;
}

function Month(props) { // year, month
    const [dayValues, setDayValues] = useState(initializeDayValues(props.year, props.month));

    useEffect(function() {
        setDayValues(initializeDayValues(props.year, props.month));
    }, [props.year, props.month]);

    function daysOfJSX(start, count) {
        let jsx = [];
        for (let i = start; i < count + start; i++) {
            jsx.push(<Col><Day color={dayValues[i].color} value={dayValues[i].day}/></Col>);
        }
        return jsx;
    }

    return (
        <Card className="text-center">
            <Card.Header>{months[props.month]} {props.year}</Card.Header>
            <Container>
                <Row>
                    <Col>Sunday</Col><Col>Monday</Col><Col>Tuesday</Col><Col>Wednesday</Col><Col>Thursday</Col><Col>Friday</Col><Col>Saturday</Col>
                </Row>
                <Row>
                    {/* <Col><Day className={dayValues[].color} value={dayValues[0].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[1].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[2].day}/></Col><Col><Day value={dayValues[3].day}/></Col><Col><Day value={dayValues[4].day}/></Col><Col><Day value={dayValues[5].day}/></Col><Col><Day value={dayValues[6].day}/></Col> */}
                    {daysOfJSX(0, 7)}
                </Row>
                <Row>
                    {/* <Col><Day className={dayValues[].color} value={dayValues[7].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[8].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[9].day}/></Col><Col><Day value={dayValues[10].day}/></Col><Col><Day value={dayValues[11].day}/></Col><Col><Day value={dayValues[12].day}/></Col><Col><Day value={dayValues[13].day}/></Col> */}
                    {daysOfJSX(7, 7)}
                </Row>
                <Row>
                    {/* <Col><Day className={dayValues[].color} value={dayValues[14].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[15].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[16].day}/></Col><Col><Day value={dayValues[17].day}/></Col><Col><Day value={dayValues[18].day}/></Col><Col><Day value={dayValues[19].day}/></Col><Col><Day value={dayValues[20].day}/></Col> */}
                    {daysOfJSX(14, 7)}
                </Row>
                <Row>
                    {/* <Col><Day className={dayValues[].color} value={dayValues[21].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[22].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[23].day}/></Col><Col><Day value={dayValues[24].day}/></Col><Col><Day value={dayValues[25].day}/></Col><Col><Day value={dayValues[26].day}/></Col><Col><Day value={dayValues[27].day}/></Col> */}
                    {daysOfJSX(21, 7)}
                </Row>
                <Row>
                    {/* <Col><Day className={dayValues[].color} value={dayValues[28].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[29].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[30].day}/></Col><Col><Day value={dayValues[31].day}/></Col><Col><Day value={dayValues[32].day}/></Col><Col><Day value={dayValues[33].day}/></Col><Col><Day value={dayValues[34].day}/></Col> */}
                    {daysOfJSX(28, 7)}
                </Row>
                <Row>
                    {/* <Col><Day className={dayValues[].color} value={dayValues[28].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[29].day}/></Col><Col><Day className={dayValues[].color} value={dayValues[30].day}/></Col><Col><Day value={dayValues[31].day}/></Col><Col><Day value={dayValues[32].day}/></Col><Col><Day value={dayValues[33].day}/></Col><Col><Day value={dayValues[34].day}/></Col> */}
                    {daysOfJSX(35, 7)}
                </Row>
            </Container>
        </Card>
    );
}

export default Month;