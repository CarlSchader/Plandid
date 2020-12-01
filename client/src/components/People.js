import React, { useState, useEffect } from 'react';
// import { Button, Container, Row, Col, Accordion, Popover, InputGroup, FormLabel, FormControl, ButtonGroup, OverlayTrigger } from 'react-bootstrap';
import Person from './Person';
import { executeQuery } from '../utilities';

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
};

function People() {
    const [query, setQuery] = useState(null);
    const [people, setPeople] = useState({});
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newName, setNewName] = useState("");
    const [activeKey, setActiveKey] = useState("-1");

    // eslint-disable-next-line
    useEffect(executeQuery(query, {path: "/people/getPeople", data: {}, onResponse: (res) => {
        setPeople(res.data);
    }}), [query]);

    // function peopleJSX() {
    //     let jsx = [];
    //     let i = 0;
    //     for (let name in people) {
    //         jsx.push(<Person name={name} setQuery={setQuery} setActiveKey={setActiveKey} getActiveKey={() => {return activeKey}} data={people[name]} number={i} />);
    //         i++;
    //     }
    //     return jsx;
    // }

    // function handleAddPerson() {
    //     setQuery({
    //         path: "people/addPerson",
    //         data: {name: newName, categories: selectedCategories}
    //     });
    //     setNewName("");
    //     setSelectedCategories([]);
    // }

    // function selectCategoryClick(category) {
    //     let newArray = JSON.parse(JSON.stringify(selectedCategories));
    //     let index = selectedCategories.findIndex(x => x === categoryMap[category]);
    //     if (index === -1) {
    //         newArray.push(categoryMap[category]);
    //     }
    //     else {
    //         newArray.splice(index, 1);
    //     }
    //     setSelectedCategories(newArray);
    // }

    // const popover = (
    //     <Popover id="popover-basic">
    //         <Popover.Title as="h3">New Person</Popover.Title>
    //         <Popover.Content>
    //         <InputGroup className="mb-3">
    //             <InputGroup.Prepend>
    //             <InputGroup.Text id="inputGroup-sizing-sm">Name</InputGroup.Text>
    //             </InputGroup.Prepend>
    //             <FormControl onChange={(event) => {setNewName(event.target.value.replace(/^\s+|\s+$/g, ''))}} aria-label="Small" aria-describedby="inputGroup-sizing-sm" />
    //         </InputGroup>    
    //         <FormLabel>Categories</FormLabel>
    //         <ButtonGroup className="mr-2" aria-label="First group">
    //             <Button onClick={() => {selectCategoryClick("primary")}} active={selectedCategories.includes(categoryMap["primary"])} variant="outline-primary" type="button"></Button>
    //             <Button onClick={() => {selectCategoryClick("secondary")}} active={selectedCategories.includes(categoryMap["secondary"])} variant="outline-secondary" type="button"></Button>
    //             <Button onClick={() => {selectCategoryClick("success")}} active={selectedCategories.includes(categoryMap["success"])} variant="outline-success" type="button"></Button>
    //             <Button onClick={() => {selectCategoryClick("warning")}} active={selectedCategories.includes(categoryMap["warning"])} variant="outline-warning" type="button"></Button>
    //             <Button onClick={() => {selectCategoryClick("danger")}} active={selectedCategories.includes(categoryMap["danger"])} variant="outline-danger" type="button"></Button>
    //             <Button onClick={() => {selectCategoryClick("info")}} active={selectedCategories.includes(categoryMap["info"])} variant="outline-info" type="button"></Button>
    //             <Button onClick={() => {selectCategoryClick("dark")}} active={selectedCategories.includes(categoryMap["dark"])} variant="outline-dark" type="button"></Button>
    //         </ButtonGroup>
    //         <Button variant="primary" type="button" onClick={handleAddPerson}>Add</Button>
    //         </Popover.Content>
    //     </Popover>
    // );

    return (
        <div>
            {/* <Container>
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
            </Accordion> */}
        </div>
    );
}

export default People;