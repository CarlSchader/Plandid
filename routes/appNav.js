const express = require('express');
const database = require('../database')
const { mongodbConfig } = require('../config');

const router = express.Router();

router.post('/renameSchedule', async function(req, res) {
    let schedule = await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, name: req.body.oldName});
    if (await database.read(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, name: req.body.newName}) !== null) {
        res.json(false);
    }
    else {
        await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, name: req.body.oldName}, {name: req.body.newName});
        res.json(true);
    }
});

module.exports = router;