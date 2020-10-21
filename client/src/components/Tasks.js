import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Accordion, Popover, InputGroup, FormLabel, FormControl, ButtonGroup, OverlayTrigger } from 'react-bootstrap';
import Task from './Task';
import { executeQuery, categoryMap } from '../utilities';

function Tasks() {
    const [query, setQuery] = useState(null);
    const [tasks, setTasks] = useState({});
    const [activeKey, setActiveKey] = useState("-1");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newName, setNewName] = useState("");

    useEffect(executeQuery(query, {path: "/tasks/getTasks", data: {}, onResponse: res => {setTasks(res.data)}}), [query]);

    function tasksJSX() {
        let jsx = [];
        let i = 0;
        for (let name in tasks) {
            jsx.push(<Task setQuery={setQuery} setActiveKey={setActiveKey} getActiveKey={() => {return activeKey}} category={tasks[name]} name={name} number={i} />);
            i++;
        }
        return jsx;
    }

    function handleAddTask() {
        let newCategory = selectedCategory;
        if (newCategory === "") {
            newCategory = null;
        }
        else {
            newCategory = categoryMap[selectedCategory];
        }
        setQuery({
            path: "/tasks/addTask",
            data: {name: newName, category: newCategory}
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