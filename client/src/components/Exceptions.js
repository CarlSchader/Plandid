import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Button, Popover, Form, OverlayTrigger } from 'react-bootstrap';
import { sendRequest } from '../utilities';
import Exception from './Exception';

function Exceptions({updateApp=(() => {}), currentSchedule={}}) {
    const [activeKey, setActiveKey] = useState("-1");

    function onResponse(response) {
        if (response.data !== null) window.alert(response.data);
        updateApp();
    }

    function handleAddException() {
        let date = document.getElementById("exception-date").value;
        let description = document.getElementById("exception-description").value;
        let exception = {date: date, description: description, jobs: []};
        sendRequest("/exceptions/addException", {currentSchedule: currentSchedule, exception: exception}, onResponse);
    }

    function exceptionsJSX() {
        let jsx = [];
        for (let i = 0; i < currentSchedule.exceptions.length; i++) {
            jsx.push(<Exception setActiveKey={setActiveKey} getActiveKey={() => {return activeKey}} updateApp={updateApp} currentSchedule={currentSchedule} data={currentSchedule.exceptions[i]} number={i} />);
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
                            <Form.Control type="date" placeholder="Date" id="exception-date"/>
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