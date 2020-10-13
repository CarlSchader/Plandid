import React, { useState } from 'react';
import { Navbar, Nav, Button, Form, FormControl, Dropdown } from 'react-bootstrap';
import config from '../config';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import momentTZ from 'moment-timezone';
import { sendRequest } from '../utilities';

function AppNav({updateApp=(() => {}), currentSchedule={}}) { // currentSchedule updateApp
    const [renaming, setRenaming] = useState(false);
    let history = useHistory();

    function renameProject() {
        axios.post('/appNav/renameSchedule', {currentSchedule: currentSchedule, name: document.getElementById("AppNav-name").value}, {baseURL: config.url, withCredentials: true})
        .then(function(response) {
            if (response.data !== null) window.alert(response.data);
            setRenaming(false);
            updateApp();
        });
    }

    function onResponse(response) {
        if (response.data !== null) window.alert(response.data);
        updateApp();
    }

    function renamingJSX() {
        if (renaming) return <FormControl onBlur={renameProject} type="text" defaultValue={currentSchedule.name} className="mr-sm-2" id="AppNav-name" />;
        else return <Button onClick={() => {setRenaming(true)}} variant="info" size="lg">{currentSchedule.name}</Button>;
    }

    function timezoneJSX() {
        let jsx = [];
        let timezones = momentTZ.tz.names();
        for (let i = 0; i < timezones.length; i++) {
            jsx.push(<Dropdown.Item onClick={() => {sendRequest("/appNav/changeTimezone", {currentSchedule: currentSchedule, timezone: timezones[i]}, onResponse)}}>{timezones[i]}</Dropdown.Item>);
        }
        return (
            <Dropdown>
                <Dropdown.Toggle variant="info">
                    Timezone: {currentSchedule.timezone}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {jsx}
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    function planOnClick() {
        sendRequest('/appNav/planSchedule', {currentSchedule: currentSchedule}, onResponse);
    }

    function plannable() {
        let bool = false;
        for (let i = 0; i < currentSchedule.weekly.length; i++) {
            bool = bool || currentSchedule.weekly[i].length > 0;
        }
        return bool && currentSchedule.people.length > 0 && currentSchedule.tasks.length > 0;
    }

    return (
        <Navbar bg="light" variant="light">
            <Form onSubmit={(event) => {event.preventDefault()}} inline>
                {renamingJSX()}
            </Form>
            <Nav className="mr-auto">
                <Nav.Link>+</Nav.Link>
                {timezoneJSX()}
                <Button onClick={planOnClick} variant="primary" disabled={!plannable()}>Plan It</Button>
            </Nav>
            <Form onSubmit={(event) => {event.preventDefault()}} inline>
                {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
                <Button variant="outline-info" active={history.location.pathname === "/Calendar"} onClick={() => {history.push('/Calendar')}}>Calendar</Button>
                <Button variant="outline-danger" active={history.location.pathname === "/People"} onClick={() => {history.push('/People')}}>People</Button>
                <Button variant="outline-success" active={history.location.pathname === "/Tasks"} onClick={() => {history.push('/Tasks')}}>Tasks</Button>
                <Button variant="outline-primary" active={history.location.pathname === "/Week"} onClick={() => {history.push('/Week')}}>Week</Button>
                <Button variant="outline-warning" active={history.location.pathname === "/Exceptions"} onClick={() => {history.push('/Exceptions')}}>Exceptions</Button>
            </Form>
        </Navbar>
    );
}

export default AppNav;