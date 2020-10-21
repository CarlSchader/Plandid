import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import config from './config';

import Basis from './components/Basis';
// import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

document.title = config.appName;

function App() {
  return (
    <Router>
      <Basis />
    </Router>
  );
}

export default App;
