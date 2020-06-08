import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

// props: (int)passwordMinLength, (function(email, password))handleSubmit, (string)buttonTitle
function EmailAndPassword({passwordMinLength= 8, handleSubmit= function(email, password) {console.log(email, password)}, buttonTitle = 'Submit'}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function emailValid() {
        return email.length > 0 && /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
    }

    function passwordValid() {
        return password.length >= passwordMinLength;
    }

    function handleEmailChange(userInput) {
        setEmail(userInput.target.value);
    }

    function handlePasswordChange(userInput) {
        setPassword(userInput.target.value);
    }

    let emailErrorJSX = <div></div>;
    let PasswordErrorJSX = <div></div>;

    if (email.length !== 0 && !emailValid()) {
        emailErrorJSX = (
            <Form.Text className="text-muted">
                Email is invalid.
            </Form.Text>
        );
    }

    if (password.length !== 0 && !passwordValid()) {
        PasswordErrorJSX = (
            <Form.Text className="text-muted">
                Password must be at least {passwordMinLength} charcters long.
            </Form.Text>
        );
    }

    return (
        <form>
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" value={email} onChange={handleEmailChange} isInvalid={email.length !== 0 && !emailValid()} />
                {emailErrorJSX}
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" value={password} onChange={handlePasswordChange} isInvalid={password.length !== 0 && !passwordValid()}/>
                {PasswordErrorJSX}
            </Form.Group>
            <Button onClick={function() {handleSubmit(email, password)}} variant="primary" type="submit" disabled={!emailValid() || !passwordValid()}>
                {buttonTitle}
            </Button>
        </form>
    );
}

export default EmailAndPassword;