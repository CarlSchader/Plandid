import React from 'react';
import { Card, Accordion, Button, Form, ButtonGroup, Badge, Tabs, Tab, ListGroup, Popover, OverlayTrigger, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import config from '../config';

function secondsToString(seconds) {
    let suffix = "AM";
    let hours = Math.floor(seconds / 3600);
    if (hours > 11) suffix = "PM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    let minutes = `${Math.floor((seconds % 3600) / 60)}`
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hours}:${minutes} ${suffix}`;
}

function militaryToNormal(string) {
    let splitString = string.split(':');
    let hours = parseInt(splitString[0]);
    let suffix = "AM";
    if (hours > 11) suffix = "PM";
    hours = hours%12;
    if (hours === 0) hours = 12;
    let minutes = parseInt(splitString[1]);
    if (minutes < 10) minutes = `0${minutes}`;
    return `${hours}:${minutes} ${suffix}`;
}

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
};

function Person({updateApp=(() => {}), setActiveKey=(() => {}), getActiveKey=(() => {}), currentSchedule={}, data={}, number=-1}) {

    function submitChanges(updatedPerson, dayInt=-1, newException=false, removePerson=false) {
        axios.post('/people/changePerson', {currentSchedule: currentSchedule, personNumber: number, person: data, updatedPerson: updatedPerson, dayInt: dayInt, newException: newException, removePerson: removePerson}, {baseURL: config.url, withCredentials: true})
        .then(function(response) {
            if (response.data !== null) window.alert(response.data);
            updateApp();
        });
    }

    function categoryBadges() {
        let array = [];
        for (let i = 0; i < data.categories.length; i++) {
            if (data.categories[i]) {
                array.push(<Badge variant={data.categories[i]}> </Badge>);
            }
        }
        return array;
    }

    function handleNameChange(event) {
        let updatedPerson = JSON.parse(JSON.stringify(data));
        updatedPerson.name = event.target.value;
        submitChanges(updatedPerson);
    }

    function handleCategoryClick(category) {
        let newArray = JSON.parse(JSON.stringify(data.categories));
        if (newArray[categoryMap[category]]) {
            newArray[categoryMap[category]] = null;
        }
        else {
            newArray[categoryMap[category]] = category;
        }
        let updatedPerson = JSON.parse(JSON.stringify(data));
        updatedPerson.categories = newArray;
        submitChanges(updatedPerson);
    }
    
    function handleAddAvailability(dayInt) {
        return function() {
            let splitArrayStart = document.getElementById("availability-start-time").value.split(':');
            let splitArrayEnd = document.getElementById("availability-end-time").value.split(':');
            let startSecs = (parseInt(splitArrayStart[0]) * 3600) + (parseInt(splitArrayStart[1]) * 60);
            let endSecs = (parseInt(splitArrayEnd[0]) * 3600) + (parseInt(splitArrayEnd[1]) * 60);

            let updatedPerson = JSON.parse(JSON.stringify(data));
            updatedPerson.weekly[dayInt].push([startSecs, endSecs]);
            submitChanges(updatedPerson, dayInt);
        };
    }

    function handleRemoveAvailability(dayInt, elementNum) {
        return function() {
            let updatedPerson = JSON.parse(JSON.stringify(data));
            updatedPerson.weekly[dayInt].splice(elementNum, 1);
            submitChanges(updatedPerson);
        };
    }

    function handleRemovePerson() {
        submitChanges(JSON.parse(JSON.stringify(data)), -1, false ,true);
        setActiveKey("-1");
        return false;
    }

    function handleAddException() {
        let start = `${document.getElementById("exception-date").value} ${document.getElementById("exception-start-time").value}`;
        let end = `${document.getElementById("exception-date").value} ${document.getElementById("exception-end-time").value}`;
        let isAvailable = document.getElementById("isAvailable-switch").checked;
        let description = document.getElementById("exception-description").value;
        let updatedPerson = JSON.parse(JSON.stringify(data));
        updatedPerson.exceptions.push([start, end, description, isAvailable]);
        submitChanges(updatedPerson, -1, true);
    }

    function handleRemoveException(elementNum) {
        return function() {
            let updatedPerson = JSON.parse(JSON.stringify(data));
            updatedPerson.exceptions.splice(elementNum, 1);
            submitChanges(updatedPerson);
        };
    }

    function renderWeekDay(dayString, dayInt) {
        let jsx = []
        if (data.weekly[dayInt].length === 0) {
            jsx.push(<ListGroup.Item>No available time.</ListGroup.Item>)
        }
        else {
            for (let i = 0; i < data.weekly[dayInt].length; i++) {
                jsx.push(<ListGroup.Item><Button onClick={handleRemoveAvailability(dayInt, i)} variant="danger" type="button">x</Button>{`${secondsToString(data.weekly[dayInt][i][0])} to ${secondsToString(data.weekly[dayInt][i][1])}`}</ListGroup.Item>);
            }
        }

        const popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">Add Available Time</Popover.Title>
                <Popover.Content>
                <Form onSubmit={(event) => {event.preventDefault()}}> {/* preventDefault stops enter key from reloading page. */}
                    <Col>
                        <Row>
                            <Form.Label>Start time</Form.Label>
                            <Form.Control defaultValue="12:00" type="time" placeholder="Start time" id="availability-start-time"/>
                        </Row>
                        <Row>
                            <Form.Label>End time</Form.Label>
                            <Form.Control defaultValue="13:00" type="time" placeholder="End time" id="availability-end-time"/>
                        </Row>
                    </Col>
                </Form>
                <Button variant="primary" type="button" onClick={handleAddAvailability(dayInt)}>Add</Button>
                </Popover.Content>
            </Popover>
        );

        return (
            <Card>
                <Card.Header className="text-center"><h4>{`${dayString}: Available Time`}   
                    <OverlayTrigger rootClose trigger="click" placement="right" overlay={popover}>
                        <Button variant="primary" size="lg" type="button">
                            +
                        </Button>
                    </OverlayTrigger></h4>
                </Card.Header>
                <ListGroup variant="flush">
                    {jsx}
                </ListGroup>
            </Card>
        );
    }

    function renderExceptions() {
        const popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">Add Exception</Popover.Title>
                <Popover.Content>
                <Form onSubmit={(event) => {event.preventDefault()}}> {/* preventDefault stops enter key from reloading page. */}
                    <Col>
                        <Row>
                            <Form.Check type="switch" id="isAvailable-switch" label="Unavailable/Available"/>
                        </Row>
                        <Row>
                            <Form.Label>Date</Form.Label>
                            <Form.Control type="date" placeholder="Date" id="exception-date"/>
                        </Row>
                        <Row>
                            <Form.Label>Start time</Form.Label>
                            <Form.Control defaultValue="12:00" type="time" placeholder="Start time" id="exception-start-time"/>
                        </Row>
                        <Row>
                            <Form.Label>End time</Form.Label>
                            <Form.Control defaultValue="13:00" type="time" placeholder="End time" id="exception-end-time"/>
                        </Row>
                        <Row>
                            <Form.Label>Description (optional)</Form.Label>
                            <Form.Control as="textarea" rows="3" id="exception-description"/>
                        </Row>
                    </Col>
                </Form>
                <Button variant="primary" type="button" onClick={handleAddException}>Add</Button>
                </Popover.Content>
            </Popover>
        );

        let jsx = [];
        jsx.push(
            <Card.Header className="text-center">
                <h4>Exceptions
                    <OverlayTrigger rootClose trigger="click" placement="right" overlay={popover}>
                        <Button variant="primary" size="lg" type="button">
                            +
                        </Button>
                    </OverlayTrigger></h4>
            </Card.Header>
        );

        if (data.exceptions.length === 0) jsx.push(<ListGroup.Item>No exceptions.</ListGroup.Item>);
        else {
            let listItems = [];
            let tabItems = [];
            for (let i = 0; i < data.exceptions.length; i++) {
                let variant = "success";
                if (!data.exceptions[i][3]) {
                    variant = "warning"
                }
                listItems.push(
                    <ListGroup.Item variant={variant} action href={`#exceptionLink${i}`}>
                        <Button onClick={handleRemoveException(i)} variant="danger" type="button">x</Button>{`${data.exceptions[i][0].split(' ')[0]}: ${militaryToNormal(data.exceptions[i][0].split(' ')[1])} to ${militaryToNormal(data.exceptions[i][1].split(' ')[1])}`}
                    </ListGroup.Item>
                );
                tabItems.push(
                    <Tab.Pane eventKey={`#exceptionLink${i}`}>
                        {data.exceptions[i][2]}
                    </Tab.Pane>
                );
            }
            jsx.push(
                <Tab.Container>
                    <Row>
                        <Col sm={4}>
                        <ListGroup>
                            {listItems}
                        </ListGroup>
                        </Col>
                        <Col sm={8}>
                        <Tab.Content>
                            {tabItems}
                        </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            );
        }
        return jsx;
    }

    function accordionToggleOnClick() {
        if (getActiveKey() === number.toString()) setActiveKey("-1");
        else setActiveKey(number.toString());
    }

    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle onClick={accordionToggleOnClick} as={Card.Header} eventKey={number.toString()}>
                    <Button variant="light" type="button" block>
                        <h2>{data.name}</h2>{categoryBadges()}
                    </Button>    
                </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={number.toString()}>
                <Card.Body>
                    <Card>
                        <Card.Body>
                            <Form onSubmit={(event) => {event.preventDefault()}}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" defaultValue={data.name} onBlur={handleNameChange} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Categories</Form.Label>
                                        <ButtonGroup className="mr-2" aria-label="First group">
                                            <Button onClick={() => {handleCategoryClick("primary")}} active={data.categories[categoryMap["primary"]]} variant="outline-primary" type="button"></Button>
                                            <Button onClick={() => {handleCategoryClick("secondary")}} active={data.categories[categoryMap["secondary"]]} variant="outline-secondary" type="button"></Button>
                                            <Button onClick={() => {handleCategoryClick("success")}} active={data.categories[categoryMap["success"]]} variant="outline-success" type="button"></Button>
                                            <Button onClick={() => {handleCategoryClick("warning")}} active={data.categories[categoryMap["warning"]]} variant="outline-warning" type="button"></Button>
                                            <Button onClick={() => {handleCategoryClick("danger")}} active={data.categories[categoryMap["danger"]]} variant="outline-danger" type="button"></Button>
                                            <Button onClick={() => {handleCategoryClick("info")}} active={data.categories[categoryMap["info"]]} variant="outline-info" type="button"></Button>
                                            <Button onClick={() => {handleCategoryClick("dark")}} active={data.categories[categoryMap["dark"]]} variant="outline-dark" type="button"></Button>
                                        </ButtonGroup>
                                </Form.Group>
                            </Form>
                            <Tabs defaultActiveKey="Monday">
                                <Tab eventKey="Monday" title="Monday">
                                    {renderWeekDay("Monday", 0)}
                                </Tab>
                                <Tab eventKey="Tuesday" title="Tuesday">
                                    {renderWeekDay("Tuesday", 1)}
                                </Tab>
                                <Tab eventKey="Wednesday" title="Wednesday">
                                    {renderWeekDay("Wednesday", 2)}
                                </Tab>
                                <Tab eventKey="Thursday" title="Thursday">
                                    {renderWeekDay("Thursday", 3)}
                                </Tab>
                                <Tab eventKey="Friday" title="Friday">
                                    {renderWeekDay("Friday", 4)}
                                </Tab>
                                <Tab eventKey="Saturday" title="Saturday">
                                    {renderWeekDay("Saturday", 5)}
                                </Tab>
                                <Tab eventKey="Sunday" title="Sunday">
                                    {renderWeekDay("Sunday", 6)}
                                </Tab>
                            </Tabs>
                            {renderExceptions()}
                        </Card.Body>
                    </Card>
                    <Button onClick={handleRemovePerson} variant="danger" size="lg" type="button" block>Delete</Button>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

export default Person;