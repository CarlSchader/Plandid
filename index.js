(async function() {
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const config = require('./config');
    const database = require('./database');

    await database.connect();

    app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    // CORS OPTIONS request handling

    app.options('/', cors());
    app.use('/login', require('./routes/login'));

    app.use(function(req, res, next) {
        // res.header("Access-Control-Allow-Origin", '*');
        res.header("Access-Control-Allow-Origin", config.url); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
      });

    app.get('/', function(req, res) {
        res.sendFile(config.indexHTMLPath);
    });

    app.get('*', function(req, res) {
        res.sendFile(path.join(config.clientBuildPath, req.url));
    });

    app.listen(config.port, console.log(`Server running on port ${config.port}.`));
})();
