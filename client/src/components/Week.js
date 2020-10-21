import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Dropdown, Popover, Form, OverlayTrigger, Tab ,Tabs } from 'react-bootstrap';
import { executeQuery, localDateFromValues, localWeekTime, variantFromCategory } from '../utilities';

function Week() {
    const [query, setQuery] = useState(null);
    const [week, setWeek] = useState([]);
    const [tasks, setTasks] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(executeQuery(query, [
        {path: "/week/getWeek", data: {}, onResponse: res => {setWeek(res.data)}},
        {path: "/tasks/getTasks", data: {}, onResponse: res => {setTasks(res.data)}}
    ]), [query]);

    function handleRemoveJob(index) {
        return function() {
            setQuery({
                path: "/week/removeJob",
                data: {index: index}
            });
        };
    }

    function handleAddJob(dayInt) {
        return function() {
            const [startHour, startMinute] = document.getElementById(`addTask-${dayInt}-start-time`).value.split(':');
            const [endHour, endMinute] = document.getElementById(`addTask-${dayInt}-end-time`).value.split(':');
            const utcStart = localDateFromValues({weekday: dayInt + 1, hour: parseInt(startHour), minute: parseInt(startMinute)}).toMillis();
            const utcEnd = localDateFromValues({weekday: dayInt + 1, hour: parseInt(endHour), minute: parseInt(endMinute)}).toMillis();
            setQuery({
                path: "/week/addJob",
                data: {utcStart: utcStart, utcEnd: utcEnd, taskName: selectedTask}
            });
        };
    }

    function renderTasks(dayJobs, indexes) {
        let listItems = [];
        if (dayJobs.length < 1) listItems.push(<ListGroup.Item>No tasks added yet.</ListGroup.Item>);
        else {
            for (let i = 0; i < dayJobs.length; i++) {
                listItems.push(
                    <ListGroup.Item variant={variantFromCategory(dayJobs[i].category)}>
                        <Row>
                            <Col>
                                <h2><Button onClick={handleRemoveJob(indexes[i])} variant="danger" type="button">x</Button></h2>
                            </Col>
                            <Col>
                                <h2><Badge >{`${dayJobs[i].taskName}: ${dayJobs[i].start.toLocaleString(DateTime.TIME_SIMPLE)} to ${dayJobs[i].end.toLocaleString(DateTime.TIME_SIMPLE)}`}</Badge></h2>
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

    function renderDayCards() {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let jobsArrays = [[], [], [], [], [], [], []];
        let indexesArray = [[], [], [], [], [], [], []];
        for (let i = 0; i < week.length; i++) {
            let wtStart = localWeekTime(week[i].start);
            let wtEnd = localWeekTime(week[i].end);
            jobsArrays[wtStart.weekday() - 1].push({start: wtStart, end: wtEnd, taskName: week[i].taskName, category: week[i].category});
            indexesArray[wtStart.weekday() - 1].push(i);
        }
        let jsx = [];
        for (let i = 0; i < 7; i++) {
            const popover = (
                <Popover id="popover-basic">
                    <Popover.Title as="h3">New Task</Popover.Title>
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
                                        <Dropdown.Toggle variant={variantFromCategory(tasks[selectedTask])}>
                                            {(() => {if (selectedTask === null) return "Select Task"; else return selectedTask})()}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {renderAddTaskList()}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Row>
                            </Col>
                        </Form>
                    <Button variant="primary" type="button" onClick={handleAddJob(i)}>Add</Button>
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
                            {renderTasks(jobsArrays[i], indexesArray[i])}
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
        </div>
    );
}

export default Week;