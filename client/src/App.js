import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import Login from './components/Login';
// import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path ="/">
            <Login />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
