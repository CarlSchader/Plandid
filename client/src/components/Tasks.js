import React, { useState } from 'react';
import { Button, Container, Row, Col, Accordion, Popover, InputGroup, FormLabel, FormControl, ButtonGroup, OverlayTrigger } from 'react-bootstrap';
import Task from './Task';
import axios from 'axios';
import config from '../config';

function taskSchema(name, category) {
    return {
        name: name,
        category: category
    };
}

function Tasks({updateApp=(() => {}), currentSchedule={}}) {
    const [activeKey, setActiveKey] = useState("-1");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newName, setNewName] = useState("");

    function tasksJSX() {
        let jsx = [];
        for (let i = 0; i < currentSchedule.tasks.length; i++) {
            jsx.push(<Task setActiveKey={setActiveKey} getActiveKey={() => {return activeKey}} updateApp={updateApp} currentSchedule={currentSchedule} data={currentSchedule.tasks[i]} number={i} />);
        }
        return jsx;
    }

    function handleAddTask() {
        axios.post('/tasks/addTask', {currentSchedule: currentSchedule, task: taskSchema(newName, selectedCategory)}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
                if (response.data !== null) window.alert(response.data);
                updateApp();
            });
    }

    function selectCategoryClick(category) {
        if (selectedCategory === category) {
            setSelectedCategory("");
        }
        else {
            setSelectedCategory(category);
        }
    }

    const popover = (
        <Popover id="popover-basic">
            <Popover.Title as="h3">New Task</Popover.Title>
            <Popover.Content>
            <InputGroup className="mb-3">
                <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-sm">Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onChange={(event) => {setNewName(event.target.value.replace(/^\s+|\s+$/g, ''))}} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
            </InputGroup>    
            <FormLabel>Category</FormLabel>
            <ButtonGroup className="mr-2" aria-label="First group">
                <Button onClick={() => {selectCategoryClick("primary")}} active={selectedCategory === "primary"} variant="outline-primary" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("secondary")}} active={selectedCategory === "secondary"} variant="outline-secondary" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("success")}} active={selectedCategory === "success"} variant="outline-success" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("warning")}} active={selectedCategory === "warning"} variant="outline-warning" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("danger")}} active={selectedCategory === "danger"} variant="outline-danger" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("info")}} active={selectedCategory === "info"} variant="outline-info" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("dark")}} active={selectedCategory === "dark"} variant="outline-dark" type="button"></Button>
            </ButtonGroup>
            <Button variant="primary" type="button" onClick={handleAddTask}>Add</Button>
            </Popover.Content>
        </Popover>
    );

    return (
        <div>
            <Container>
                <Row>
                    <Col>
                        
                    </Col>
                    <Col className="text-center">
                        <h1>Tasks</h1>
                    </Col>
                    <Col className="text-right">
                    <OverlayTrigger rootClose trigger="click" placement="left" overlay={popover}>
                        <Button variant="primary" size="lg" type="button">
                            Add Task
                        </Button>
                    </OverlayTrigger>
                    </Col>
                </Row>
            </Container>
            <Accordion activeKey={activeKey}>
                {tasksJSX()}
            </Accordion>
        </div>
    );
}

export default Tasks;