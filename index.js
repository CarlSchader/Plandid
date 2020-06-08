const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config');

app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
// app.use(express.static(config.clientBuildPath));

app.get('/', function(req, res) {
    console.log('works/get');
    res.sendFile(config.indexHTMLPath);
});

app.get('*', function(req, res) {
    console.log('works/c');
    res.sendFile(path.join(config.clientBuildPath, req.url));
});

app.post('/signUp', function(req, res) {
    console.log('works/signup');
    console.log(req.body);
    res.send({'hi': 'hi'});
});

app.post('*', function(req, res) {
    console.log('works/signup');
    console.log(req.body);
    res.send({'hi': 'hi'});
});

app.listen(config.port, console.log(`Server running on port ${config.port}.`));