import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Jumbotron } from 'react-bootstrap';
import EmailAndPassword from './EmailAndPassword';
import { useHistory } from 'react-router-dom';
import { executeQuery } from '../utilities';

function Login({setLoggedIn=() => {}}) {
    const [query, setQuery] = useState(null);
    let history = useHistory();

    // eslint-disable-next-line
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
                        history.push("/Calendar")
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
            <Jumbotron className="bg-light">
                <h1><img src={"/logo-primary.png"} alt="logo" /></h1>
            </Jumbotron>
            <Container>
                <Row>
                    <Col><EmailAndPassword bg="light" handleSubmit={signUpHandler} title="New user" buttonTitle="Sign up"/></Col>
                    <Col><EmailAndPassword bg="light" handleSubmit={loginHandler} title="Existing user" buttonTitle="Login"/></Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;
