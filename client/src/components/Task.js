import React from 'react';
import { Card, Accordion, Button, Form, ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import config from '../config';

function Task({updateApp=(() => {}), setActiveKey=(() => {}), getActiveKey=(() => {}), currentSchedule={}, data={}, number=-1}) {
    function sendRequest(path, input) {
        axios.post(path, {currentSchedule: currentSchedule, task: data, input: input}, {baseURL: config.url, withCredentials: true})
        .then(function(response) {
            if (response.data !== null) window.alert(response.data);
            updateApp();
        });
    }

    function handleNameChange() {
        sendRequest('/tasks/changeName', {name: document.getElementById("task-name").value, taskNumber: number});
    }

    function handleCategoryChange(category) {
        return function() {
            if (data.category === category) sendRequest('/tasks/changeCategory', {category: ""});
            else sendRequest('/tasks/changeCategory', {category: category});
        };
    }

    function handleRemoveTask() {
        sendRequest('/tasks/removeTask', {});
        setActiveKey("-1")
    }

    function buttonVariant() {
        if (data.category === "") {
            return "light";
        }
        else {
            return "outline-" + data.category;
        }
    }

    function accordionToggleOnClick() {
        if (getActiveKey() === number.toString()) setActiveKey("-1");
        else setActiveKey(number.toString());
    }

    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle onClick={accordionToggleOnClick} as={Card.Header} eventKey={number.toString()}>
                    <Button variant={buttonVariant()} type="button" block>
                        <h2>{data.name}</h2>
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
                                    <Form.Control type="text" defaultValue={data.name} onBlur={handleNameChange} id="task-name" />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                        <ButtonGroup className="mr-2" aria-label="First group">
                                            <Button onClick={handleCategoryChange("primary")} active={data.category === "primary"} variant="outline-primary" type="button"></Button>
                                            <Button onClick={handleCategoryChange("secondary")} active={data.category === "secondary"} variant="outline-secondary" type="button"></Button>
                                            <Button onClick={handleCategoryChange("success")} active={data.category === "success"} variant="outline-success" type="button"></Button>
                                            <Button onClick={handleCategoryChange("warning")} active={data.category === "warning"} variant="outline-warning" type="button"></Button>
                                            <Button onClick={handleCategoryChange("danger")} active={data.category === "danger"} variant="outline-danger" type="button"></Button>
                                            <Button onClick={handleCategoryChange("info")} active={data.category === "info"} variant="outline-info" type="button"></Button>
                                            <Button onClick={handleCategoryChange("dark")} active={data.category === "dark"} variant="outline-dark" type="button"></Button>
                                        </ButtonGroup>
                                </Form.Group>
                                <Button onClick={handleRemoveTask} variant="danger" size="lg" type="button" block>Delete</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

export default Task;