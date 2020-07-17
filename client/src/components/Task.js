import React, { useState } from 'react';
import { Card, Accordion, Button, Form, ButtonGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import config from '../config';

function taskSchema(name, category) {
    return {
        name: name,
        category: category
    };
}

function Task({updateApp=(() => {}), currentSchedule={}, data={}, number=-1}) {
    const [newName, setNewName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(data.category);

    function selectCategoryClick(category) {
        if (selectedCategory === category) {
            setSelectedCategory("");
        }
        else {
            setSelectedCategory(category);
        }
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
        for (let i = 0; i < currentSchedule.tasks.length; i++) {
            if (currentSchedule.tasks[i].name === nextName && nextName !== data.name) {
                window.alert("Name already being used.");
                return;
            }
        }
        axios.post('/tasks/changeTask', {email: currentSchedule.email, password: currentSchedule.password, number: currentSchedule.number, currentTask: data, updatedTask: taskSchema(nextName, selectedCategory)}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
                updateApp();
                setNewName("");
                setSelectedCategory(selectedCategory);
            });
    }

    function buttonVariant() {
        if (data.category === "") {
            return "light";
        }
        else {
            return "outline-" + data.category;
        }
    }

    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle as={Card.Header} eventKey={number.toString()}>
                    <Button variant={buttonVariant()} type="button" block>
                        <h2>{data.name}</h2>
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
                                    <Form.Label>Category</Form.Label>
                                        <ButtonGroup className="mr-2" aria-label="First group">
                                            <Button onClick={() => {selectCategoryClick("primary")}} active={selectedCategory === "primary"} variant="outline-primary" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("secondary")}} active={selectedCategory === "secondary"} variant="outline-secondary" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("success")}} active={selectedCategory === "success"} variant="outline-success" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("warning")}} active={selectedCategory === "warning"} variant="outline-warning" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("danger")}} active={selectedCategory === "danger"} variant="outline-danger" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("info")}} active={selectedCategory === "info"} variant="outline-info" type="button"></Button>
                                            <Button onClick={() => {selectCategoryClick("dark")}} active={selectedCategory === "dark"} variant="outline-dark" type="button"></Button>
                                        </ButtonGroup>
                                </Form.Group>
                            </Form>
                            <Button variant="primary" type="button" onClick={handleSubmitChanges}>Submit Changes</Button>
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

export default Task;