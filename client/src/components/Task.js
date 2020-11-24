import React from 'react';
import { Card, Accordion, Button, Form, ButtonGroup } from 'react-bootstrap';
import { categoryMap, variants } from '../utilities';

function Task({setQuery=_ => {}, setActiveKey=(() => {}), getActiveKey=(() => {}), category=null, name="", number=-1}) {
    function handleNameChange() {
        setQuery({
            path: "/tasks/changeName",
            data: {oldName: name, newName: document.getElementById(`task-${number}-name`).value}
        });
    }

    function handleCategoryChange(newCategory) {
        return function() {
            newCategory = categoryMap[newCategory]
            if (category === newCategory) {
                newCategory = null;
            }
            setQuery({
                path: "/tasks/changeCategory",
                data: {name: name, category: newCategory}
            });
        };
    }

    function handleRemoveTask() {
        setQuery({
            path: "/tasks/removeTask",
            data: {name: name}
        });
        setActiveKey("-1")
    }

    function buttonVariant() {
        if (category === null) {
            return "light";
        }
        else {
            return "outline-" + variants[category];
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
                        <h2>{name}</h2>
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
                                    <Form.Control type="text" defaultValue={name} onBlur={handleNameChange} id={`task-${number}-name`} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                        <ButtonGroup className="mr-2" aria-label="First group">
                                            <Button onClick={handleCategoryChange("primary")} active={category === 0} variant="outline-primary" type="button"></Button>
                                            <Button onClick={handleCategoryChange("secondary")} active={category === 1} variant="outline-secondary" type="button"></Button>
                                            <Button onClick={handleCategoryChange("success")} active={category === 2} variant="outline-success" type="button"></Button>
                                            <Button onClick={handleCategoryChange("warning")} active={category === 3} variant="outline-warning" type="button"></Button>
                                            <Button onClick={handleCategoryChange("danger")} active={category === 4} variant="outline-danger" type="button"></Button>
                                            <Button onClick={handleCategoryChange("info")} active={category === 5} variant="outline-info" type="button"></Button>
                                            <Button onClick={handleCategoryChange("dark")} active={category === 6} variant="outline-dark" type="button"></Button>
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