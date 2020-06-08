import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import EmailAndPassword from './EmailAndPassword';
import config from '../config';

const api = axios.create({
    baseURL: config.url
});

function Landing() {
    async function signUpSubmit(email, password) {
        let response = await api.post('/signUp', {'email': email, 'password': password});
        console.log(response);
            
        // const response = await fetch(config.url + '/signUp', {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({'email': email, 'password': password})
        // });
        // // const data = await response.json();
        // console.log(await response.json());

        // let xmlhttp = new XMLHttpRequest();
        // xmlhttp.open("POST", config.url + '/signUp', true);
        // xmlhttp.setRequestHeader("Content-Type", "application/json");
        // xmlhttp.send(JSON.stringify({'email': email, 'password': password}));
    }
    
    async function loginSubmit(email, password) {
        let response = await api.post('/login', {'email': email, 'password': password});
        console.log(response);
        
        // const response = await fetch(config.url + '/login', {
        //     method: 'POST',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({'email': email, 'password': password})
        // });
        // // const data = await response.json();
        // console.log(await response.json());

        // let xmlhttp = new XMLHttpRequest();
        // xmlhttp.open("POST", config.url + '/signUp');
        // xmlhttp.setRequestHeader("Content-Type", "application/json");
        // xmlhttp.send(JSON.stringify({'email': email, 'password': password}));
    }

    return (
        <div>
            <h1>Scheduler</h1>
            <Container>
                <Row>
                    <Col><EmailAndPassword handleSubmit={signUpSubmit} buttonTitle="Sign up"/></Col>
                    <Col><EmailAndPassword handleSubmit={loginSubmit} buttonTitle="Login"/></Col>
                </Row>
            </Container>
        </div>
    );
}

export default Landing;