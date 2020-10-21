import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Accordion, Button, Popover, Form, OverlayTrigger } from 'react-bootstrap';
import { executeQuery, localDateFromValues } from '../utilities';
import Exception from './Exception';

function Exceptions() {
    const [query, setQuery] = useState(null);
    const [exceptions, setExceptions] = useState([]);
    const [tasks, setTasks] = useState({});
    const [activeKey, setActiveKey] = useState("-1");

    useEffect(executeQuery(query, [
        {path: "/exceptions/getExceptions", data: {}, onResponse: res => {setExceptions(res.data)}},
        {path: "/tasks/getTasks", data: {}, onResponse: res => {setTasks(res.data)}}
    ]), [query]);

    function handleAddException() {
        let date = document.getElementById("exception-date").value.split('-').map(x => parseInt(x));
        let description = document.getElementById("exception-description").value;
        let dtStart = localDateFromValues({year: date[0], month: date[1], day: date[2]});
        let dtEnd = dtStart.set({hour: 23, minute: 59, second: 69, millisecond: 999});
        setQuery({
            path: "/exceptions/addException", 
            data: {utcStart: dtStart.toMillis(), utcEnd: dtEnd.toMillis(), description: description}
        });
    }

    function exceptionsJSX() {
        let jsx = [];
        for (let i = 0; i < exceptions.length; i++) {
            jsx.push(<Exception setQuery={setQuery} setActiveKey={setActiveKey} getActiveKey={() => {return activeKey}} exception={exceptions[i]} tasks={tasks} number={i} />);
        }
        return jsx;
    }

    const popover = (
        <Popover id="popover-basic">
            <Popover.Title as="h3">Add Exception</Popover.Title>
            <Popover.Content>
                <Form onSubmit={(event) => {event.preventDefault()}}> {/* preventDefault stops enter key from reloading page. */}
                    <Col>
                        <Row>
                            <Form.Label>Date</Form.Label>
                            <Form.Control defaultValue={localDateFromValues().toFormat("yyyy-MM-dd")} type="date" placeholder="Date" id="exception-date"/>
                        </Row>
                        <Row>
                            <Form.Label>Description (optional)</Form.Label>
                            <Form.Control as="textarea" rows="3" id="exception-description"/>
                        </Row>
                    </Col>
                </Form>
                <Button variant="primary" type="button" onClick={handleAddException}>Add</Button>
            </Popover.Content>
        </Popover>
    );
    
    return (
        <div>
            <Container>
                <Row>
                    <Col className="text-center">
                        <h1>Exceptions</h1>
                    </Col>
                    <Col className="text-right">
                        <OverlayTrigger rootClose trigger="click" placement="left" overlay={popover}>
                            <Button variant="primary" size="lg" type="button">
                                Add Exception
                            </Button>
                        </OverlayTrigger>
                    </Col>
                </Row>
            </Container>
            <Accordion activeKey={activeKey}>
                {exceptionsJSX()}
            </Accordion>
        </div>
    );
}

export default Exceptions;