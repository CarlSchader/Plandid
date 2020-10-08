import React, { useState } from 'react';
import { Navbar, Nav, Button, Form, FormControl } from 'react-bootstrap';
import config from '../config';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { sendRequest } from '../utilities';

function AppNav(props) { // currentSchedule updateApp
    const [renaming, setRenaming] = useState(false);
    let history = useHistory();

    function renameProject() {
        axios.post('/appNav/renameSchedule', {currentSchedule: props.currentSchedule, name: document.getElementById("AppNav-name").value}, {baseURL: config.url, withCredentials: true})
        .then(function(response) {
            if (response.data !== null) window.alert(response.data);
            setRenaming(false);
            props.updateApp();
        });
    }

    function onResponse(response) {
        if (response.data !== null) window.alert(response.data);
        props.updateApp();
    }

    function renamingJSX() {
        if (renaming) return <FormControl onBlur={renameProject} type="text" defaultValue={props.currentSchedule.name} className="mr-sm-2" id="AppNav-name" />;
        else return <Button onClick={() => {setRenaming(true)}} variant="info" size="lg">{props.currentSchedule.name}</Button>;
    }

    function plannable() {
        let bool = false;
        for (let i = 0; i < props.currentSchedule.weekly.length; i++) {
            bool = bool || props.currentSchedule.weekly[i].length > 0;
        }
        return bool && props.currentSchedule.people.length > 0 && props.currentSchedule.tasks.length > 0;
    }

    return (
        <Navbar bg="light" variant="light">
            <Form onSubmit={(event) => {event.preventDefault()}} inline>
                {renamingJSX()}
            </Form>
            <Nav className="mr-auto">
                <Nav.Link>+</Nav.Link>
                <Button onClick={sendRequest('/appNav/planSchedule', {currentSchedule: currentSchedule}, onResponse)} variant="primary" disabled={!plannable()}>Plan It</Button>
            </Nav>
            <Form onSubmit={(event) => {event.preventDefault()}} inline>
                {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
                <Button variant="outline-info" active={history.location.pathname === "/Calendar"} onClick={() => {history.push('/Calendar')}}>Calendar</Button>
                <Button variant="outline-danger" active={history.location.pathname === "/People"} onClick={() => {history.push('/People')}}>People</Button>
                <Button variant="outline-success" active={history.location.pathname === "/Tasks"} onClick={() => {history.push('/Tasks')}}>Tasks</Button>
                <Button variant="outline-primary" active={history.location.pathname === "/Week"} onClick={() => {history.push('/Week')}}>Week</Button>
            </Form>
        </Navbar>
    );
}

export default AppNav;