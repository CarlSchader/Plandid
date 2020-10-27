const { nextTick } = require('process');

(async function() {
    const express = require('express');
    const path = require('path');
    const cors = require('cors');
    const session = require('express-session');
    const config = require('./config');
    const db = require('./database');

    // Connect to database
    await db.connect();

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
        maxAge: 6 * 60 * 60 * 1000,
        sameSite: true
        }
    }));
    // Routes
    app.use('/publicPost', require('./routes/publicPost'));

    app.post('*', async function(req, res, next) {
        if (req.session && req.session.sessionID) {
            let userID = await db.userIDfromSessionID(req.session.sessionID);
            if (userID !== null) {
                let userData = await db.readUserDataRecordFromID(userID);
                let scheduleName = userData.lastUsedSchedule;
                if (await db.readScheduleRecord(userID, scheduleName) === null) {
                    scheduleName = (await db.readRandomScheduleRecord(userID)).scheduleName;
                    await db.changeUserDataLastUsedSchedule(userID, scheduleName);
                }
                req.body.userID = userID;
                req.body.scheduleName = scheduleName;
                req.body.tier = userData.tier;
                return next();
            }
            else {
                return res.json(-1);
            }
        }
        else {
            return res.json(-1);
        }
    })

    app.use("/userData", require("./routes/userData"));
    app.use('/schedule', require('./routes/schedule'));
    app.use('/people', require('./routes/people'));
    app.use('/tasks', require('./routes/tasks'));
    app.use('/week', require('./routes/week'));
    app.use('/exceptions', require('./routes/exceptions'));
    app.use('/plans', require('./routes/plans'));

    app.get('/', function(req, res) {
        return res.sendFile(config.indexHTMLPath);
    });

    app.get('*', function(req, res) {
        res.sendFile(path.join(config.clientBuildPath, req.url), function(error) {
            if (error) {
                return res.sendFile(config.indexHTMLPath);
            }
        });
    });

    // Listen on a port
    app.listen(config.port, console.log(`Server running on port ${config.port}.`));
})();
