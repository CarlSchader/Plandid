import React from 'react';
import { useHistory } from 'react-router-dom';
import { Jumbotron, Button } from 'react-bootstrap';

function Landing() {
    let history = useHistory();
    return (
        <Jumbotron className="bg-light text-primary">
            <h1><img src={"/logo-primary.png"} alt="logo" /></h1>
            <h3>
                Make scheduling simple.
            </h3>
            <p>
                <Button onClick={function() {history.push('/Login')}} variant="primary">Login</Button>
            </p>
        </Jumbotron>
    );
}

export default Landing;