import React from 'react';
import { useHistory } from 'react-router-dom';
import { Jumbotron, Button } from 'react-bootstrap';

import config from '../config';

function Landing() {
    let history = useHistory();
    return (
        <Jumbotron>
            <h1>{config.appName}</h1>
            <p>
                This is the landing page. Needs work lol.
            </p>
            <p>
                <Button onClick={function() {history.push('/Login')}} variant="primary">Login</Button>
            </p>
        </Jumbotron>
    );
}

export default Landing;