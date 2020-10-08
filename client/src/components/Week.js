import React, { useState } from 'react';
import { Container, Row, Col, CardGroup, Card, ListGroup, Badge, Button, Dropdown, Popover, Form, OverlayTrigger, Tab ,Tabs } from 'react-bootstrap';
import { sendRequest, secondsToString } from '../utilities';

function Week({updateApp=(() => {}), currentSchedule={}}) {
    const [selectedTask, setSelectedTask] = useState(null);

    function onResponse(response) {
        if (response.data !== null) window.alert(response.data);
        updateApp();
    }

    function renderDayCards() {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let jsx = [];

        function renderTasks(dayNum) {
            let listItems = [];
            if (currentSchedule.weekly[dayNum].length < 1) listItems.push(<ListGroup.Item>No tasks added yet.</ListGroup.Item>);
            else {
                for (let i = 0; i < currentSchedule.weekly[dayNum].length; i++) {
                    listItems.push(
                        <ListGroup.Item>
                            <Row>
                                <Col>
                                    <h2><Button onClick={() => {sendRequest('/week/removeTask', {currentSchedule: currentSchedule, dayNum: dayNum, elementNum: i}, onResponse)}} variant="danger" type="button">x</Button></h2>
                                </Col>
                                <Col>
                                    <h2><Badge variant={currentSchedule.weekly[dayNum][i][2].category}>{`${currentSchedule.weekly[dayNum][i][2].name}: ${secondsToString(currentSchedule.weekly[dayNum][i][0])} to ${secondsToString(currentSchedule.weekly[dayNum][i][1])}`}</Badge></h2>
                                </Col>
                                <Col>
                                
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    );
                }
            }
            return listItems;
        }

        function renderAddTaskList(i) {
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

        for (let i = 0; i < 7; i++) {
            function addTaskOnClick() {
                let splitArrayStart = document.getElementById(`addTask-${i}-start-time`).value.split(':');
                let splitArrayEnd = document.getElementById(`addTask-${i}-end-time`).value.split(':');
                let startSecs = (parseInt(splitArrayStart[0]) * 3600) + (parseInt(splitArrayStart[1]) * 60);
                let endSecs = (parseInt(splitArrayEnd[0]) * 3600) + (parseInt(splitArrayEnd[1]) * 60);
                sendRequest("/week/addTask", {currentSchedule: currentSchedule, dayNum: i, newElement: [startSecs, endSecs, selectedTask]}, onResponse);
            }
            const popover = (
                <Popover id="popover-basic">
                    <Popover.Title as="h3">Add Available Time</Popover.Title>
                    <Popover.Content>
                        <Form onSubmit={(event) => {event.preventDefault()}}> {/* preventDefault stops enter key from reloading page. */}
                            <Col>
                                <Row>
                                    <Form.Label>Start time</Form.Label>
                                    <Form.Control defaultValue="12:00" type="time" placeholder="Start time" id={`addTask-${i}-start-time`}/>
                                </Row>
                                <Row>
                                    <Form.Label>End time</Form.Label>
                                    <Form.Control defaultValue="13:00" type="time" placeholder="End time" id={`addTask-${i}-end-time`}/>
                                </Row>
                                <Row>
                                    {/* <Form.Label>Task</Form.Label> */}
                                    <Dropdown>
                                        <Dropdown.Toggle variant={`outline-dark`}>
                                            {() => {if (selectedTask === null) return "Select Task"; else return selectedTask}}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {renderAddTaskList(i)}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Row>
                            </Col>
                        </Form>
                    <Button variant="primary" type="button" onClick={addTaskOnClick}>Add</Button>
                    </Popover.Content>
                </Popover>
            );
            jsx.push(
                <Card variant="top" className="text-center" style={{display: 'flex', flexDirection: 'row'}}>
                    <Card.Body>
                        <Card.Title>
                            <Row>
                                <Col>

                                </Col>
                                <Col>
                                    <h1>{days[i]}</h1>
                                </Col>
                                <Col>
                                    <h2><OverlayTrigger onToggle={() => {setSelectedTask(null)}} rootClose trigger="click" placement="bottom" overlay={popover}>
                                        <Button variant="primary" type="button">
                                            Add Task
                                        </Button>
                                    </OverlayTrigger></h2>
                                </Col>
                            </Row>
                        </Card.Title>
                        <ListGroup>
                            {renderTasks(i)}
                        </ListGroup>
                    </Card.Body>
                </Card>
            );
        }
        return jsx;
    }

    function renderTabs() {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let jsx = [];
        let dayCards = renderDayCards();
        for (let i = 0; i < dayCards.length; i++) {
            jsx.push(
                <Tab eventKey={days[i]} title={days[i]}>
                    {dayCards[i]}
                </Tab>
            );
        }
        return jsx;
    }
    
    return (
        <div>
            <Container>
                <Row>
                    <Col className="text-center">
                        <h1>Week</h1>
                    </Col>
                </Row>
            </Container>
            <Tabs defaultActiveKey="Monday">
                {renderTabs()}
            </Tabs>
            {/* <CardGroup style={{flex: 1}}>
                {renderDayCards()}
            </CardGroup> */}
        </div>
    );
}

export default Week;