(async function() {
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const config = require('./config');
    const database = require('./database');

    // Connect to database
    await database.connect();

    app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    // Routes
    app.use('/login', require('./routes/login'));

    app.get('/', function(req, res) {
        res.sendFile(config.indexHTMLPath);
    });

    app.get('*', function(req, res) {
        res.sendFile(path.join(config.clientBuildPath, req.url));
    });

    // Listen on a port
    app.listen(config.port, console.log(`Server running on port ${config.port}.`));
})();
