import React from 'react';
import { Container, Col, Card, Row } from 'react-bootstrap';
import { localDateFromValues, rangesOverlap, copyObject } from '../utilities';
import Day from './Day';

function Month({year=localDateFromValues().year, month=localDateFromValues().month, plans=[], tier=""}) {

    function getDayPlans(day) {
        let dayPlans = []
        let utcStart = localDateFromValues({year: year, month: month, day: day}).toMillis();
        let utcEnd = localDateFromValues({year: year, month: month, day: day + 1}).toMillis() - 1;
        for (let i = 0; i < plans.length; i++) {
            if (rangesOverlap(plans[i], {start: utcStart, end: utcEnd})) {
                dayPlans.push(copyObject(plans[i]));
            }
            else if (plans[i].start >= utcEnd) {
                break;
            }
        }
        return dayPlans;
    }

    function daysJSX() {
        let jsx = [];
        let weeks = [[]];
        let weekIndex = 0;
        let dt = localDateFromValues({year: year, month: month, day: 1});
        for (let i = 0; i < dt.weekday - 1; i++) {
            weeks[weekIndex].push(<Col></Col>)
        }
        while (dt.month === month) {
            weeks[weekIndex].push(<Col><Day tier={tier} dateTime={localDateFromValues({year: year, month: month, day: dt.day})} plans={getDayPlans(dt.day)}/></Col>);
            dt = dt.set({day: dt.day + 1});
            if (dt.weekday === 1) {
                weeks.push([]);
                weekIndex++;
            }
        }
        if (dt.weekday !== 1) {
            for (let i = 0; i < 7 - dt.weekday + 1; i++) {
                weeks[weekIndex].push(<Col></Col>)
            }
        }
        
        for (let i = 0; i < weeks.length; i++) {
            jsx.push(
                <Row>
                    {weeks[i]}
                </Row>
            );
        }
        return jsx;
    }

    return (
        <Card className="text-center">
            <Card.Header>{localDateFromValues({year: year, month: month}).monthLong} {localDateFromValues({year: year, month: month}).year}</Card.Header>
            <Container fluid>
                <Row>
                    <Col>Monday</Col><Col>Tuesday</Col><Col>Wednesday</Col><Col>Thursday</Col><Col>Friday</Col><Col>Saturday</Col><Col>Sunday</Col>
                </Row>
                {daysJSX()}
            </Container>
        </Card>
    );
}

export default Month;