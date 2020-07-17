import React, { useState } from 'react';
import { Navbar, Nav, Button, Form, FormControl } from 'react-bootstrap';
import config from '../config';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function AppNav(props) { // currentSchedule updateApp
    const [renamingProject, setRenamingProject] = useState(false);
    const [renamingString, setRenamingString] = useState('');
    let history = useHistory();

    function renameProject() {
        axios.post('/appNav/renameSchedule', {email: props.currentSchedule.email, password: props.currentSchedule.password, oldName: props.currentSchedule.name, newName: renamingString}, {baseURL: config.url, withCredentials: true})
            .then(function(response) {
                if (!response.data) {
                    window.alert('Name already in use.');
                }
                else {
                    document.removeEventListener("mousedown", handleMouseDown);
                    setRenamingProject(false);
                    props.updateApp();
                }
            });
    }

    function handleMouseDown() {
        document.removeEventListener("mousedown", handleMouseDown);
        setRenamingProject(false);
    }

    if (renamingProject) {
        return (
            <Navbar bg="light" variant="light">
                <Form onMouseOver={() => {document.removeEventListener("mousedown", handleMouseDown)}} onMouseOut={() => {document.addEventListener("mousedown", handleMouseDown)}} inline>
                    <FormControl onChange={event => {setRenamingString(event.target.value)}} type="text" placeholder={props.currentSchedule.name} className="mr-sm-2" />
                    <Button disabled={renamingString === ''} onClick={renameProject} variant="outline-info">Rename</Button>
                </Form>
                <Nav className="mr-auto">
                    <Nav.Link>+</Nav.Link>
                </Nav>
                <Form inline>
                    {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
                    <Button variant="outline-primary" onClick={() => {history.push('/People')}}>People</Button>
                    <Button variant="outline-success">Tasks</Button>
                    <Button variant="outline-danger">Week</Button>
                </Form>
            </Navbar>
        );
    }
    else {
        return (
            <Navbar bg="light" variant="light">
                <Navbar.Brand onClick={() => {setRenamingProject(true); setRenamingString('');}}><Button size="lg" variant="info">{props.currentSchedule.name}</Button></Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link>+</Nav.Link>
                </Nav>
                <Form inline>
                    {/* <FormControl type="text" placeholder="Search" className="mr-sm-2" /> */}
                    <Button variant="outline-primary" onClick={() => {history.push('/People')}}>People</Button>
                    <Button variant="outline-success" onClick={() => {history.push('/Tasks')}}>Tasks</Button>
                    <Button variant="outline-danger" onClick={() => {history.push('/Week')}}>Week</Button>
                </Form>
            </Navbar>
        );
    }
}

export default AppNav;