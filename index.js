(async function() {
    const express = require('express');
    const path = require('path');
    // const cors = require('cors');
    const config = require('./config');
    // const database = require('./database');

    // await database.connect(); // Turn off unless you can connect to the database.

    app = express();

    // app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    // CORS OPTIONS request handling

    app.use(function(req, res, next) {
        // CORS headers
        // res.header("Access-Control-Allow-Origin", config.url); // restrict it to the required domain
        res.header("Access-Control-Allow-Origin", '*');
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        // Set custom headers for CORS
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

        if (req.method === "OPTIONS") {
            console.log('OPTIONS')
            return res.sendStatus(200).end();
        }

        return next();
    });

    app.use('/login', require('./routes/login'));

    app.get('/', function(req, res) {
        res.sendFile(config.indexHTMLPath);
    });

    app.get('*', function(req, res) {
        res.sendFile(path.join(config.clientBuildPath, req.url));
    });

    app.listen(config.port, console.log(`Server running on port ${config.port}.`));
})();
