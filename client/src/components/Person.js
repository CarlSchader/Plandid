import React, { useState } from 'react';
import { Card, Accordion, Button, Form, ButtonGroup, Badge, Tabs, Tab } from 'react-bootstrap';
import TimePicker from 'react-bootstrap-time-picker';
import axios from 'axios';
import config from '../config';

function secondsToString(seconds) {
    let suffix = "AM";
    let hours = Math.floor(seconds, 3600);
    if (hours > 11) suffix = "PM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${Math.floor(seconds % 3600, 60)} ${suffix}`;
}

function personSchema(name, categories=new Array(7), weekly=[[], [], [], [], [], [], []], exceptions={}) {
    return {
        name: name,
        categories: categories,
        weekly: weekly,
        exceptions: exceptions
    };
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

function Person({updateApp=(() => {}), currentSchedule={}, data={}, number=-1}) {
    const [newName, setNewName] = useState("");
    const [selectedCategories, setSelectedCategories] = useState(JSON.parse(JSON.stringify(data.categories)));
    const [availability, setAvailability] = useState([0, (23 * 3600) + (59 * 60) + 59]);
    const [selectedExceptions, setSelectedExceptions] = useState(data.exceptions);

    function categoryBadges() {
        let array = [];
        for (let i = 0; i < data.categories.length; i++) {
            if (data.categories[i]) {
                array.push(<Badge variant={data.categories[i]}> </Badge>);
            }
        }
        return array;
    }

    function selectCategoryClick(category) {
        let newArray = JSON.parse(JSON.stringify(selectedCategories));
        if (newArray[categoryMap[category]]) {
            newArray[categoryMap[category]] = false;
        }
        else {
            newArray[categoryMap[category]] = category;
        }
        setSelectedCategories(newArray);
    }

    function handleSubmitChanges() {
        let nextName = newName;
        if (newName.length < 1) {
            nextName = data.name;
        }
        else if (nextName.replace(/\s/g, '').length < 1) {
            window.alert("Name must contain characters.");
            return;
        }
        for (let i = 0; i < currentSchedule.people.length; i++) {
            if (currentSchedule.people[i].name === nextName && nextName !== data.name) {
                window.alert("Name already being used.");
                return;
            }
        }
        axios.post('/people/changePerson', {email: currentSchedule.email, password: currentSchedule.password, number: currentSchedule.number, currentPerson: data, updatedPerson: personSchema(nextName, selectedCategories)}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
                updateApp();
                setNewName("");
                setSelectedCategories(selectedCategories);
            });
    }
    
    function handleAddAvailability(dayInt) {
        return function() {
            axios.post('/people/addAvailability', {email: currentSchedule.email, password: currentSchedule.password, number: currentSchedule.number, personNumber: number, dayInt: dayInt, availability: availability}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
                updateApp();
                setAvailability([0, (23 * 3600) + (59 * 60) + 59]);
            });
        }
    }

    function renderWeekDay(dayInt) {
        let jsx = []
        if (data.weekly[dayInt].length === 0) {
            jsx.push(<ListGroup.Item>No available time.</ListGroup.Item>)
        }
        else {
            for (let i = 0; i < data.weekly[dayInt].length; i++) {
                jsx.push(<ListGroup.Item>{`${secondsToString(data.weekly[dayInt][i][0])} to ${secondsToString(data.weekly[dayInt][i][1])}`}</ListGroup.Item>);
            }
        }

        const popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">Add Available Time</Popover.Title>
                <Popover.Content>
                    <TimePicker onChange={(time) => {setAvailability([time, availability[1]])}} start="0:00" end="23:59" step={1} value={{time: availability[0]}} />
                    <TimePicker onChange={(time) => {setAvailability([availability[0], time])}} start="0:00" end="23:59" step={1} value={{time: availability[1]}} />
                    <Button variant="primary" type="button" onClick={handleAddAvailability}>Add</Button>
                </Popover.Content>
            </Popover>
        );

        return (
            <Card>
                <Card.Header>Available Time 
                    <OverlayTrigger trigger="click" placement="left" overlay={popover}>
                        <Button variant="primary" size="lg" type="button">
                            +
                        </Button>
                    </OverlayTrigger>
                </Card.Header>
                <ListGroup variant="flush">
                    {jsx}
                </ListGroup>
            </Card>
        );
    }

    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle as={Card.Header} eventKey={number.toString()}>
                    <Button variant="light" type="button" block>
                        <h2>{data.name}</h2>{categoryBadges()}
                    </Button>    
                </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={number.toString()}>
                <Card.Body>
                    <Card>
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" placeholder={data.name} onChange={(event) => {setNewName(event.target.value.replace(/^\s+|\s+$/g, ''))}} value={newName} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Categories</Form.Label>
                                        <ButtonGroup className="mr-2" aria-label="First group">
                                            <Button onClick={() => {selectCategoryClick("primary")}} active={selectedCategories[categoryMap["primary"]]} variant="outline-primary" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("secondary")}} active={selectedCategories[categoryMap["secondary"]]} variant="outline-secondary" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("success")}} active={selectedCategories[categoryMap["success"]]} variant="outline-success" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("warning")}} active={selectedCategories[categoryMap["warning"]]} variant="outline-warning" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("danger")}} active={selectedCategories[categoryMap["danger"]]} variant="outline-danger" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("info")}} active={selectedCategories[categoryMap["info"]]} variant="outline-info" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("dark")}} active={selectedCategories[categoryMap["dark"]]} variant="outline-dark" type="button"></Button>
                                        </ButtonGroup>
                                </Form.Group>
                            </Form>
                            <Tabs defaultActiveKey="Monday">
                                <Tab eventKey="Monday" title="Monday">
                                    {renderWeekDay(0)}
                                </Tab>
                                <Tab eventKey="Tuesday" title="Tuesday">
                                    {renderWeekDay(1)}
                                </Tab>
                                <Tab eventKey="Wednesday" title="Wednesday">
                                    {renderWeekDay(2)}
                                </Tab>
                                <Tab eventKey="Thursday" title="Thursday">
                                    {renderWeekDay(3)}
                                </Tab>
                                <Tab eventKey="Friday" title="Friday">
                                    {renderWeekDay(4)}
                                </Tab>
                                <Tab eventKey="Saturday" title="Saturday">
                                    {renderWeekDay(5)}
                                </Tab>
                                <Tab eventKey="Sunday" title="Sunday">
                                    {renderWeekDay(6)}
                                </Tab>
                            </Tabs>
                            <Button variant="primary" type="button" onClick={handleSubmitChanges}>Submit Changes</Button>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

export default Person;