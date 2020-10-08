import React, { useState } from 'react';
import { Button, Container, Row, Col, Accordion, Popover, InputGroup, FormLabel, FormControl, ButtonGroup, OverlayTrigger } from 'react-bootstrap';
import Person from './Person';
import axios from 'axios';
import config from '../config';

function personSchema(name, categories=new Array(7), weekly=[[], [], [], [], [], [], []], exceptions=[]) {
    return {
        name: name,
        categories: categories,
        weekly: weekly,
        exceptions: exceptions
    };
}

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
};

function People({updateApp=(() => {}), currentSchedule={}}) {
    const [selectedCategories, setSelectedCategories] = useState(new Array(7));
    const [newName, setNewName] = useState("");
    const [activeKey, setActiveKey] = useState("-1");

    function peopleJSX() {
        let jsx = [];
        for (let i = 0; i < currentSchedule.people.length; i++) {
            jsx.push(<Person updateApp={updateApp} setActiveKey={setActiveKey} getActiveKey={() => {return activeKey}} currentSchedule={currentSchedule} data={currentSchedule.people[i]} number={i} />);
        }
        return jsx;
    }

    function handleAddPerson() {
        axios.post('/people/addPerson', {currentSchedule: currentSchedule, person: personSchema(newName, selectedCategories)}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
                if (response.data !== null) window.alert(response.data);
                updateApp();
            });
    }

    function selectCategoryClick(category) {
        let newArray = JSON.parse(JSON.stringify(selectedCategories));
        if (newArray[categoryMap[category]]) {
            newArray[categoryMap[category]] = false;
        }
        else {
            newArray[categoryMap[category]] = category;
        }
        setSelectedCategories(newArray);
    }

    const popover = (
        <Popover id="popover-basic">
            <Popover.Title as="h3">New Person</Popover.Title>
            <Popover.Content>
            <InputGroup className="mb-3">
                <InputGroup.Prepend>
                <InputGroup.Text id="inputGroup-sizing-sm">Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onChange={(event) => {setNewName(event.target.value.replace(/^\s+|\s+$/g, ''))}} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
            </InputGroup>    
            <FormLabel>Categories</FormLabel>
            <ButtonGroup className="mr-2" aria-label="First group">
                <Button onClick={() => {selectCategoryClick("primary")}} active={selectedCategories[categoryMap["primary"]]} variant="outline-primary" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("secondary")}} active={selectedCategories[categoryMap["secondary"]]} variant="outline-secondary" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("success")}} active={selectedCategories[categoryMap["success"]]} variant="outline-success" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("warning")}} active={selectedCategories[categoryMap["warning"]]} variant="outline-warning" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("danger")}} active={selectedCategories[categoryMap["danger"]]} variant="outline-danger" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("info")}} active={selectedCategories[categoryMap["info"]]} variant="outline-info" type="button"></Button>
                <Button onClick={() => {selectCategoryClick("dark")}} active={selectedCategories[categoryMap["dark"]]} variant="outline-dark" type="button"></Button>
            </ButtonGroup>
            <Button variant="primary" type="button" onClick={handleAddPerson}>Add</Button>
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
                        <h1>People</h1>
                    </Col>
                    <Col className="text-right">
                    <OverlayTrigger rootClose trigger="click" placement="left" overlay={popover}>
                        <Button variant="primary" size="lg" type="button">
                            Add Person
                        </Button>
                    </OverlayTrigger>
                    </Col>
                </Row>
            </Container>
            <Accordion activeKey={activeKey}>
                {peopleJSX()}
            </Accordion>
        </div>
    );
}

export default People;