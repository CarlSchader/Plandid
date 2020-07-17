import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

import Landing from './Landing';
import Login from './Login';
import Calendar from './Calendar';
import People from './People';
import Tasks from './Tasks';
import AppNav from './AppNav';

let placeHolderSchedule = {
    email: 'john@doe.mail',
    password: 'password',
    name: 'Schedule 1'
};

function Basis() {
    const [currentSchedule, setCurrentSchedule] = useState(placeHolderSchedule);
    const [loggedIn, setLoggedIn] = useState(false);
    const [update, setUpdate] = useState(false);

    function updateApp() {
        setUpdate(!update);
    }

    // Handle session
    let history = useHistory();
    let location = useLocation();
    useEffect(function() {
        if (location.pathname !== '/Landing' && location.pathname !== '/Login') {
            axios.post('/session', {}, {baseURL: config.url, withCredentials: true}) // withCredentials allows axios to send cookies
            .then(function(response) {
                if (response.data === false) {
                    history.push('/Landing');
                }
                else {
                    setCurrentSchedule(response.data);
                    setLoggedIn(true);
                }
            });
        }
    }, [location.pathname, history, update]);

    if (loggedIn) {
        return (
            <div>
                <AppNav currentSchedule={currentSchedule} updateApp={updateApp}/>
                <Switch>
                    <Route exact path="/Tasks">
                        <Tasks updateApp={updateApp} currentSchedule={currentSchedule}/>
                    </Route>
                    <Route exact path="/People">
                        <People updateApp={updateApp} currentSchedule={currentSchedule}/>
                    </Route>
                    <Route exact path="/Calendar">
                        <Calendar />
                    </Route>
                    <Route exact path ="/Login">
                        <Login />
                    </Route>
                    <Route exact path="/*">
                        <Landing />
                    </Route>
                </Switch>
            </div>
        );
    }
    else {
        return (
            <Switch>
                <Route exact path ="/Login">
                    <Login />
                </Route>
                <Route exact path="/*">
                    <Landing />
                </Route>
            </Switch>
        );
    }
}

export default Basis;