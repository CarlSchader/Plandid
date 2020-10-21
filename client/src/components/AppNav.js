import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Navbar, Nav, Button, Form, FormControl, Badge } from 'react-bootstrap';
import { useHistory, useLocation } from 'react-router-dom';
import { executeQuery } from '../utilities';

function AppNav() {
    const [query, setQuery] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [renaming, setRenaming] = useState(false);
    
    let history = useHistory();
    let location = useLocation();

    useEffect(executeQuery(query, {path: "/schedule/getSchedule", data: {}, onResponse: (res) => {
        setSchedule(res.data);
    }}), [query]);

    function renameSchedule() {
        let newName = document.getElementById("AppNav-name").value;
        if (newName !== schedule.scheduleName) {
            setQuery({
                path: "/schedule/renameSchedule", 
                data: {oldScheduleName: schedule.scheduleName, newScheduleName: newName}
            });
        }
        setRenaming(false);
    }

    function renamingJSX() {
        if (renaming) return <FormControl onBlur={renameSchedule} type="text" defaultValue={schedule.scheduleName} className="mr-sm-2" id="AppNav-name" />;
        else return <Button onClick={() => {setRenaming(true)}} variant="info" size="lg">{schedule.scheduleName}</Button>;
    }

    function timezoneJSX() {
        return (
            <h5>
                <Badge variant="warning">
                    Timezone: {DateTime.local().zoneName}
                </Badge>
            </h5>
        );
    }

    function planOnClick() {
        
    }

    return (
        <Navbar bg="light" variant="light">
            <Form onSubmit={(event) => {event.preventDefault()}} inline>
                {renamingJSX()}
            </Form>
            <Nav className="mr-auto">
                <Nav.Link>+</Nav.Link>
                {timezoneJSX()}
                <Button onClick={planOnClick} variant="primary">Plan It</Button>
            </Nav>
            <Form onSubmit={(event) => {event.preventDefault()}} inline>
                <Button variant="outline-info" active={location.pathname === "/Calendar"} onClick={() => {history.push('/Calendar')}}>Calendar</Button>
                <Button variant="outline-danger" active={location.pathname === "/People"} onClick={() => {history.push('/People')}}>People</Button>
                <Button variant="outline-success" active={location.pathname === "/Tasks"} onClick={() => {history.push('/Tasks')}}>Tasks</Button>
                <Button variant="outline-primary" active={location.pathname === "/Week"} onClick={() => {history.push('/Week')}}>Week</Button>
                <Button variant="outline-warning" active={location.pathname === "/Exceptions"} onClick={() => {history.push('/Exceptions')}}>Exceptions</Button>
            </Form>
        </Navbar>
    );
}

export default AppNav;