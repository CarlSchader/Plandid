import React, { useState } from 'react';
import { Card, Accordion, Button, Form, ListGroup, Row, Col, Badge, Dropdown, Popover, FormLabel, OverlayTrigger } from 'react-bootstrap';
import { sendRequest, secondsToString } from '../utilities';

function Exception({updateApp=(() => {}), setActiveKey=(() => {}), getActiveKey=(() => {}), currentSchedule={}, data={}, number=-1}) {
    const [selectedTask, setSelectedTask] = useState(null);

    function onResponse(response) {
        if (response.data !== null) window.alert(response.data);
        updateApp();
    }

    function handleDateChange() {
        sendRequest('/exceptions/changeDate', {currentSchedule: currentSchedule, date: document.getElementById("exception-date").value, exceptionNumber: number}, onResponse);
    }

    function handleDescriptionChange() {
        sendRequest('/exceptions/changeDescription', {currentSchedule: currentSchedule, description: document.getElementById("exception-description").value, exceptionNumber: number}, onResponse);
    }

    function handleRemoveException() {
        sendRequest('/exceptions/removeException', {currentSchedule: currentSchedule, exceptionNumber: number}, onResponse);
        setActiveKey("-1")
    }

    function handleRemoveJob(elementNum) {
        return function() {
            sendRequest('/exceptions/removeJob', {currentSchedule: currentSchedule, exceptionNumber: number, elementNum: elementNum}, onResponse);
        };
    }

    function handleAddJob() {
        let splitArrayStart = document.getElementById(`addTask-start-time`).value.split(':');
        let splitArrayEnd = document.getElementById(`addTask-end-time`).value.split(':');
        let startSecs = (parseInt(splitArrayStart[0]) * 3600) + (parseInt(splitArrayStart[1]) * 60);
        let endSecs = (parseInt(splitArrayEnd[0]) * 3600) + (parseInt(splitArrayEnd[1]) * 60);
        sendRequest("/exceptions/addjob", {currentSchedule: currentSchedule, job: [startSecs, endSecs, selectedTask], exceptionNumber: number}, onResponse);
    }

    function accordionToggleOnClick() {
        if (getActiveKey() === number.toString()) setActiveKey("-1");
        else setActiveKey(number.toString());
    }

    function renderJobs() {
        let jsx = []
        if (currentSchedule.exceptions[number].jobs.length < 1) jsx.push(<ListGroup.Item>No tasks added yet.</ListGroup.Item>);
        else {
            for (let i = 0; i < data.jobs.length; i++) {
                jsx.push(
                    <ListGroup.Item>
                        <Row>
                            <Col>
                                <h2><Button onClick={handleRemoveJob(i)} variant="danger" type="button">x</Button></h2>
                            </Col>
                            <Col>
                                <h2><Badge variant={data.jobs[i][2].category}>{`${data.jobs[i][2].name}: ${secondsToString(data.jobs[i][0])} to ${secondsToString(data.jobs[i][1])}`}</Badge></h2>
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
        for (let i = 0; i < currentSchedule.tasks.length; i++) {
            jsx.push(
                <Dropdown.Item onSelect={() => {setSelectedTask(currentSchedule.tasks[i])}}>
                    <h1><Badge variant={currentSchedule.tasks[i].category}>{currentSchedule.tasks[i].name}</Badge></h1>
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
                                <Dropdown.Toggle variant={(() => {if (selectedTask === null) return "outline-dark"; else return selectedTask.category})()}>
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
                        <h2>{data.date}</h2>
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
                                    <Form.Control type="date" defaultValue={data.date} onBlur={handleDateChange} id="exception-date" />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control type="text" defaultValue={data.description} onBlur={handleDescriptionChange} id="exception-description" />
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