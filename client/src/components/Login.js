import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import EmailAndPassword from './EmailAndPassword';
import config from '../config';

function Login() {
    function createSubmitHandler(clientUrl) {
        return async function submitHandler(email, password) {
            let response = await axios.post(clientUrl, {'email': email, 'password': password}, {baseURL: config.url});
            console.log(response);
        }
    }

    return (
        <div>
            <h1>Scheduler</h1>
            <Container>
                <Row>
                    <Col><EmailAndPassword handleSubmit={createSubmitHandler('/login/signUp')} buttonTitle="Sign up"/></Col>
                    <Col><EmailAndPassword handleSubmit={createSubmitHandler('/login/login')} buttonTitle="Login"/></Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;