import React from "react";
import {Card, Button} from "react-bootstrap";

function ClickableCard({color="primary", header=null, title=null, children=[], onClick=() => {}}) {

    return (
        <Button variant={color} className={`m-5`} onClick={onClick}>
                {header ? <Card.Header>{header}</Card.Header> : <></>}
                <Card.Body>
                    {title ? <Card.Title>{title}</Card.Title> : <></>}
                    {children}
                </Card.Body>
        </Button>
    );
}

export default ClickableCard;