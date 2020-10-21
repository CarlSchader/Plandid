import React from 'react';
import { DateTime } from 'luxon';
import { localDate, localDateFromValues, localWeekTime } from '../utilities';
import { Card, Accordion, Button, Form, ButtonGroup, Badge, Tabs, Tab, ListGroup, Popover, OverlayTrigger, Row, Col } from 'react-bootstrap';

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
};

function Person({setQuery=() => {}, setActiveKey=(() => {}), getActiveKey=(() => {}), data={}, number=-1, name=""}) {
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
        setQuery({
            path: "/people/changeName",
            data: {oldName: name, newName: event.target.value}
        });
    }

    function handleCategoryClick(category) {
        let newArray = JSON.parse(JSON.stringify(data.categories));
        let index = data.categories.findIndex(x => x === categoryMap[category]);
        if (index === -1) {
            newArray.push(categoryMap[category]);
        }
        else {
            newArray.splice(index, 1);
        }
        setQuery({
            path: "/people/changeCategories",
            data: {name: name, categories: newArray}
        });
    }
    
    function handleAddAvailability(dayInt) {
        return function() {
            const [startHour, startMinute] = document.getElementById("availability-start-time").value.split(':');
            const [endHour, endMinute] = document.getElementById("availability-end-time").value.split(':');
            let dtStart = localDateFromValues({weekday: dayInt + 1, hour: parseInt(startHour), minute: parseInt(startMinute)});
            let dtEnd = localDateFromValues({weekday: dayInt + 1, hour: parseInt(endHour), minute: parseInt(endMinute)});
            if (dtStart >= dtEnd) {
                window.alert("Start time must be before end time.");
            }
            else {
                setQuery({
                    path: "/people/addAvailability",
                    data: {name: name, utcStart: dtStart.toMillis(), utcEnd: dtEnd.toMillis()}
                });
            }
        };
    }

    function handleRemoveAvailability(elementNum) {
        return function() {
            setQuery({
                path: "/people/removeAvailability",
                data: {name: name, index: elementNum}
            });
        };
    }

    function handleRemovePerson() {
        setQuery({
            path: "people/removePerson",
            data: {name: name}
        });
        setActiveKey("-1");
        return false;
    }

    function handleAddException() {
        let startDate = document.getElementById("exception-date").value.split('-').map(x => parseInt(x));
        let startTime = document.getElementById("exception-start-time").value.split(':').map(x => parseInt(x));
        let endDate = document.getElementById("exception-date").value.split('-').map(x => parseInt(x));
        let endTime = document.getElementById("exception-end-time").value.split(':').map(x => parseInt(x));
        let isAvailable = document.getElementById("isAvailable-switch").checked;
        let description = document.getElementById("exception-description").value;
        if (startDate.length !== 3 || endDate.length !== 3) {
            window.alert("No date given.");
            return;
        }
        if (startTime.length !== 2 || endTime.length !== 2) {
            window.alert("Invalid times.")
            return;
        }

        let dtStart = localDateFromValues({year: startDate[0], month: startDate[1], day: startDate[2], hour: startTime[0], minute: startTime[1]});
        let dtEnd = localDateFromValues({year: endDate[0], month: endDate[1], day: endDate[2], hour: endTime[0], minute: endTime[1]});
        if (dtStart >= dtEnd) {
            window.alert("Start time must be before end time.");
        }
        else {
            setQuery({
                path: "/people/addException",
                data: {name: name, utcStart: dtStart.toMillis(), utcEnd: dtEnd.toMillis(), available: isAvailable, description: description}
            });
        }
    }

    function handleRemoveException(elementNum) {
        return function() {
            setQuery({
                path: "/people/removeException",
                data: {name: name, index: elementNum}
            });
        };
    }

    function renderWeek() {
        let avails = [[], [], [], [], [], [], []];
        let indexesArray = [[], [], [], [], [], [], []];
        for (let i = 0; i < data.week.length; i++) {
            let wtStart = localWeekTime(data.week[i].start);
            let wtEnd = localWeekTime(data.week[i].end);
            avails[wtStart.weekday() - 1].push({start: wtStart, end: wtEnd});
            indexesArray[wtStart.weekday() - 1].push(i);
        }
        let jsx = [];
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        for (let i = 0; i < 7; i++) {
            jsx.push(
                <Tab eventKey={daysOfWeek[i]} title={daysOfWeek[i]}>
                    {renderWeekDay(daysOfWeek[i], i, avails[i], indexesArray[i])}
                </Tab>
            );
        }
        return (
            <Tabs defaultActiveKey="Monday">
                {jsx}
            </Tabs>
        );
    }

    function renderWeekDay(dayString, dayInt, dataArray, indexes) {
        let jsx = []
        if (dataArray.length === 0) {
            jsx.push(<ListGroup.Item>No available time.</ListGroup.Item>)
        }
        else {
            for (let i = 0; i < dataArray.length; i++) {
                let startTime = dataArray[i].start.toLocaleString(DateTime.TIME_SIMPLE);
                let endTime = dataArray[i].end.toLocaleString(DateTime.TIME_SIMPLE);
                jsx.push(<ListGroup.Item><Button onClick={handleRemoveAvailability(indexes[i])} variant="danger" type="button">x</Button>{`${startTime} to ${endTime}`}</ListGroup.Item>);
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
                            <Form.Control defaultValue={localDateFromValues().toFormat("yyyy-MM-dd")} type="date" placeholder="Date" id="exception-date"/>
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
                if (!data.exceptions[i].available) {
                    variant = "warning"
                }
                let startDate = localDate(data.exceptions[i].start).toLocaleString(DateTime.DATETIME_MED);
                let endDate = localDate(data.exceptions[i].end).toLocaleString(DateTime.DATETIME_MED);
                listItems.push(
                    <ListGroup.Item variant={variant} action href={`#exceptionLink${i}`}>
                        <Button onClick={handleRemoveException(i)} variant="danger" type="button">x</Button>{`${startDate} to ${endDate}`}
                    </ListGroup.Item>
                );
                tabItems.push(
                    <Tab.Pane eventKey={`#exceptionLink${i}`}>
                        {data.exceptions[i].description}
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

    function renderCategoryButtons() {
        return (
            <ButtonGroup className="mr-2" aria-label="First group">
                <Button onClick={() => {handleCategoryClick("primary")}} active={data.categories.includes(categoryMap["primary"])} variant="outline-primary" type="button"></Button>
                <Button onClick={() => {handleCategoryClick("secondary")}} active={data.categories.includes(categoryMap["secondary"])} variant="outline-secondary" type="button"></Button>
                <Button onClick={() => {handleCategoryClick("success")}} active={data.categories.includes(categoryMap["success"])} variant="outline-success" type="button"></Button>
                <Button onClick={() => {handleCategoryClick("warning")}} active={data.categories.includes(categoryMap["warning"])} variant="outline-warning" type="button"></Button>
                <Button onClick={() => {handleCategoryClick("danger")}} active={data.categories.includes(categoryMap["danger"])} variant="outline-danger" type="button"></Button>
                <Button onClick={() => {handleCategoryClick("info")}} active={data.categories.includes(categoryMap["info"])} variant="outline-info" type="button"></Button>
                <Button onClick={() => {handleCategoryClick("dark")}} active={data.categories.includes(categoryMap["dark"])} variant="outline-dark" type="button"></Button>
            </ButtonGroup>
        );
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
                        <h2>{name}</h2>{categoryBadges()}
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
                                    <Form.Control type="text" defaultValue={name} onBlur={handleNameChange} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Categories</Form.Label>
                                        {renderCategoryButtons()}
                                </Form.Group>
                            </Form>
                            {renderWeek()}
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