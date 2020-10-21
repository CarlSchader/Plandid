import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { Card, Accordion, Button, Form, ListGroup, Row, Col, Badge, Dropdown, Popover, FormLabel, OverlayTrigger } from 'react-bootstrap';
import { localDate, localDateFromValues, variantFromCategory } from '../utilities';

function Exception({setQuery=_ => {}, setActiveKey=_ => {}, getActiveKey=_ => {}, exception={}, tasks={}, number=-1}) {
    const [selectedTask, setSelectedTask] = useState(null);

    function handleDateChange() {
        let date = document.getElementById("exception-date").value.split('-').map(x => parseInt(x));
        let utcStart = localDateFromValues({year: date[0], month: date[1], day: date[2]}).toMillis();
        setQuery({
            path: "/exceptions/changeStartDate", 
            data: {index: number, utcStart: utcStart}
        });
    }

    function handleDescriptionChange() {
        setQuery({
            path: "/exceptions/changeDescription",
            data: {index: number, newDescription: document.getElementById("exception-description").value}
        });
    }

    function handleRemoveException() {
        setQuery({
            path: "/exceptions/removeException",
            data: {index: number}
        });
        setActiveKey("-1");
    }

    function handleRemoveJob(elementNum) {
        return function() {
            setQuery({
                path: "/exceptions/removeJob",
                data: {index: number, jobIndex: elementNum}
            });
        };
    }

    function handleAddJob() {
        let startTime = document.getElementById(`addTask-start-time`).value.split(':').map(x => parseInt(x));
        let endTime = document.getElementById(`addTask-end-time`).value.split(':').map(x => parseInt(x));
        let dt = localDate(exception.start);
        let utcStart = localDateFromValues({year: dt.year, month: dt.month, day: dt.day, hour: startTime[0], minute: startTime[1]}).toMillis();
        let utcEnd = localDateFromValues({year: dt.year, month: dt.month, day: dt.day, hour: endTime[0], minute: endTime[1]}).toMillis();
        setQuery({
            path: "/exceptions/addJob",
            data: {index: number, utcStart: utcStart, utcEnd: utcEnd, taskName: selectedTask}
        });
    }

    function accordionToggleOnClick() {
        if (getActiveKey() === number.toString()) setActiveKey("-1");
        else setActiveKey(number.toString());
    }

    function renderJobs() {
        let jsx = []
        if (exception.jobs.length < 1) jsx.push(<ListGroup.Item>No tasks added yet.</ListGroup.Item>);
        else {
            for (let i = 0; i < exception.jobs.length; i++) {
                let job = exception.jobs[i];
                jsx.push(
                    <ListGroup.Item>
                        <Row>
                            <Col>
                                <h2><Button onClick={handleRemoveJob(i)} variant="danger" type="button">x</Button></h2>
                            </Col>
                            <Col>
                                <h2><Badge variant={variantFromCategory(job.category)}>{`${job.taskName}: ${localDate(job.start).toLocaleString(DateTime.TIME_SIMPLE)} to ${localDate(job.end).toLocaleString(DateTime.TIME_SIMPLE)}`}</Badge></h2>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                );
            }
        }
        return jsx;
    }

    function renderAddTaskList() {
        let jsx = [];
        for (let taskName in tasks) {
            jsx.push(
                <Dropdown.Item onSelect={() => {setSelectedTask(taskName)}}>
                    <h1><Badge variant={variantFromCategory(tasks[taskName])}>{taskName}</Badge></h1>
                </Dropdown.Item>
            );
        }
        return jsx;
    }

    const popover = (
        <Popover id="popover-basic">
            <Popover.Title as="h3">New Task</Popover.Title>
            <Popover.Content>
                <Form onSubmit={(event) => {event.preventDefault()}}> {/* preventDefault stops enter key from reloading page. */}
                    <Col>
                        <Row>
                            <Form.Label>Start time</Form.Label>
                            <Form.Control defaultValue="12:00" type="time" placeholder="Start time" id={`addTask-start-time`}/>
                        </Row>
                        <Row>
                            <Form.Label>End time</Form.Label>
                            <Form.Control defaultValue="13:00" type="time" placeholder="End time" id={`addTask-end-time`}/>
                        </Row>
                        <Row>
                            {/* <Form.Label>Task</Form.Label> */}
                            <Dropdown>
                                <Dropdown.Toggle variant={variantFromCategory(tasks[selectedTask])}>
                                    {(() => {if (selectedTask === null) return "Select Task"; else return selectedTask.name})()}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {renderAddTaskList()}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Row>
                    </Col>
                </Form>
            <Button variant="primary" type="button" onClick={handleAddJob}>Add</Button>
            </Popover.Content>
        </Popover>
    );

    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle onClick={accordionToggleOnClick} as={Card.Header} eventKey={number.toString()}>
                    <Button variant="light" type="button" block>
                        <h2>{localDate(exception.start).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}</h2>
                    </Button>    
                </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={number.toString()}>
                <Card.Body>
                    <Card>
                        <Card.Body>
                            <Form onSubmit={(event) => {event.preventDefault()}}>
                                <Form.Group>
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="date" defaultValue={localDate(exception.start).toFormat("yyyy-MM-dd")} onBlur={handleDateChange} id="exception-date" />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control type="text" defaultValue={exception.description} onBlur={handleDescriptionChange} id="exception-description" />
                                </Form.Group>
                                <Form.Group>
                                    <FormLabel>
                                        Tasks
                                        <OverlayTrigger rootClose trigger="click" placement="right" overlay={popover}>
                                            <Button variant="primary" size="lg" type="button">
                                                +
                                            </Button>
                                        </OverlayTrigger>
                                    </FormLabel>
                                </Form.Group>
                                <ListGroup>
                                    {renderJobs()}
                                </ListGroup>
                                <Button onClick={handleRemoveException} variant="danger" size="lg" type="button" block>Delete</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

export default Exception;