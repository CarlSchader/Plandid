import React, { useState } from 'react';
import { Button, Container, Row, Col, Accordion, Popover, InputGroup, FormLabel, FormControl, ButtonGroup, OverlayTrigger } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
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
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newName, setNewName] = useState("");
    let history = useHistory();

    function tasksJSX() {
        let jsx = [];
        for (let i = 0; i < currentSchedule.tasks.length; i++) {
            jsx.push(<Task updateApp={updateApp} currentSchedule={currentSchedule} data={currentSchedule.tasks[i]} number={i} />);
        }
        return jsx;
    }

    function handleAddTask() {
        if (newName.length < 1) {
            window.alert("No name given.");
            return;
        }
        else if (newName.replace(/\s/g, '').length < 1) {
            window.alert("Name must contain characters.");
            return;
        }
        for (let i = 0; i < currentSchedule.tasks.length; i++) {
            if (currentSchedule.tasks[i].name === newName) {
                window.alert("Name already being used.");
                return;
            }
        }
        axios.post('/tasks/addTask', {email: currentSchedule.email, password: currentSchedule.password, number: currentSchedule.number, task: taskSchema(newName, selectedCategory)}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
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
                    <Col className="text-left">
                        <Button onClick={() => {history.push('/Calendar')}} variant="success" size="lg" type="button">
                            Back
                        </Button>
                    </Col>
                    <Col className="text-center">
                        <h1>Tasks</h1>
                    </Col>
                    <Col className="text-right">
                    <OverlayTrigger trigger="click" placement="left" overlay={popover}>
                        <Button variant="primary" size="lg" type="button">
                            +
                        </Button>
                    </OverlayTrigger>
                    </Col>
                </Row>
            </Container>
            <Accordion>
                {tasksJSX()}
            </Accordion>
        </div>
    );
}

export default Tasks;