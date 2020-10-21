import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EmailAndPassword from './EmailAndPassword';
import { useHistory } from 'react-router-dom';
import config from '../config';
import { executeQuery } from '../utilities';

function Login({setLoggedIn=() => {}}) {
    const [query, setQuery] = useState(null);

    let history = useHistory();

    useEffect(executeQuery(query), [query]);

    function signUpHandler(email, password) {
        setQuery({
            path: "/publicPost/signUp",
            data: {email: email, password: password},
            onResponse: (res) => {
                switch(res.data) {
                    case 0:
                        window.alert(`Email verification sent to ${email}`);
                        break;
                    case 1:
                        window.alert('Account already exists.');
                        break;
                    case 2:
                        window.alert('Verification already sent to this email.');
                        break;
                    default:
                        window.alert(res.data);
                        break;
                }
            }
        });
    }

    function loginHandler(email, password) {
        setQuery({
            path: "/publicPost/login",
            data: {email: email, password: password},
            onResponse: (res) => {
                switch(res.data) {
                    case 0:
                        setLoggedIn(true);
                        history.push("/Calendar");
                        break;
                    case 1:
                        window.alert('Email or password is incorrect.');
                        break;
                    default:
                        window.alert(res.data);
                        break;
                }
            }
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
