import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import momentTZ from 'moment-timezone';
import EmailAndPassword from './EmailAndPassword';
import { useHistory } from 'react-router-dom';
import config from '../config';

function Login() {
    let history = useHistory();

    function signUpHandler(email, password) {
        axios.post('/login/signUp', {'email': email, 'password': password, timezone: momentTZ.tz.guess()}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
        .then(function(response) {
            if (response.data === 0) {
                window.alert(`Email verification sent to ${email}`);
            }
            else if (response.data === 1) {
                window.alert('Account already exists.');
            }
            else {
                window.alert('Error creating account.');
            }
        })
        .catch(function() {
            window.alert('Client error.');
        });
    }

    function loginHandler(email, password) {
        axios.post('/login/login', {'email': email, 'password': password}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
        .then(function(response) {
            if (response.data === 0) {
                history.push("/Calendar");
            }
            else if (response.data === 1) {
                window.alert('Email or password is incorrect.');
            }
            else {
                window.alert('Error logging in.');
            }
        })
        .catch(function() {
            window.alert('Client error.');
        });
    }

    return (
        <div>
            <h1>{config.appName}</h1>
            <Container>
                <Row>
                    <Col><EmailAndPassword handleSubmit={signUpHandler} buttonTitle="Sign up"/></Col>
                    <Col><EmailAndPassword handleSubmit={loginHandler} buttonTitle="Login"/></Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;
