import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';

import Landing from './Landing';
import Login from './Login';
import Calendar from './Calendar';
import People from './People';
import Tasks from './Tasks';
import Week from './Week';
import Exceptions from './Exceptions';
import AppNav from './AppNav';
import { executeQuery } from '../utilities';

function Basis() {
    const [loggedIn, setLoggedIn] = useState(false);

    let history = useHistory();

    useEffect(executeQuery(null, {path: "/publicPost/isLoggedIn", data: {}, onResponse: (res) => {
        if (res.data) {
            setLoggedIn(true);
        }
        else {
            setLoggedIn(false);
            history.push('/Landing');
        }
    }}), [loggedIn]);

    if (loggedIn) {
        return (
            <div>
                <AppNav />
                <Switch>
                    <Route exact path="/Calendar">
                        <Calendar />
                    </Route>
                    <Route exact path="/People">
                        <People />
                    </Route>
                    <Route exact path="/Tasks">
                        <Tasks />
                    </Route>
                    <Route exact path="/Week">
                        <Week />
                    </Route>
                    <Route exact path="/Exceptions">
                        <Exceptions />
                    </Route>
                    <Route exact path ="/Login">
                        <Login setLoggedIn={setLoggedIn}/>
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
                    <Login setLoggedIn={setLoggedIn}/>
                </Route>
                <Route exact path="/*">
                    <Landing />
                </Route>
            </Switch>
        );
    }
}

export default Basis;