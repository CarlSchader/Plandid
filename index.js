(async function() {
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const session = require('express-session');
    const config = require('./config');
    const database = require('./database');

    // Connect to database
    await database.connect();

    app = express();

    // Middleware
    app.use(cors({
        origin: true,
        credentials: true
    })); // These cors options are necessary to recieve cookies from axios. 
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false,
        maxAge: 3 * 60 * 60 * 1000,
        sameSite: true
        }
    }));

    // Routes
    app.use('/login', require('./routes/login'));
    app.use('/appNav', require('./routes/appNav'));
    app.use('/people', require('./routes/people'));
    app.use('/tasks', require('./routes/tasks'));

    app.get('/', function(req, res) {
        res.sendFile(config.indexHTMLPath);
    });

    app.get('*', function(req, res) {
        res.sendFile(path.join(config.clientBuildPath, req.url), function(error) {
            if (error) {
                res.sendFile(config.indexHTMLPath);
            }
        });
    });

    app.post('/session', async function(req, res) {
        if (req.session && req.session.user) {
            res.json(await database.read(config.mongodbConfig.schedulesCollectionName, {email: req.session.user.email, password: req.session.user.password, number: 1}));
        }
        else {
            res.json(false);
        }
    });

    // Listen on a port
    app.listen(config.port, console.log(`Server running on port ${config.port}.`));
})();
