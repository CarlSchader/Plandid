import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

function Day(props) { // value
    return (
        <Card className={`${props.color} text-left`}>
            <Card.Header>{props.value}</Card.Header>
            <ListGroup variant="flush">
            {/* <ListGroup.Item>Cras justo odio</ListGroup.Item>
            <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
            <ListGroup.Item>Vestibulum at eros</ListGroup.Item> */}
            </ListGroup>
        </Card>
    );
}

export default Day;