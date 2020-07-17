const express = require('express');
const { mongodbConfig } = require('../config');
const database = require('../database');

const router = express.Router();

router.post('/addTask', async function(req, res) {
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number}, {$push: {tasks: req.body.task}});
    res.json(0);
});

router.post('/changeTask', async function(req, res) {
    // await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number}, {$pull: {people: req.body.currentPerson}});
    await database.update(mongodbConfig.schedulesCollectionName, {email: req.body.email, password: req.body.password, number: req.body.number, tasks: req.body.currentTask}, {$set: {"tasks.$": req.body.updatedTask}});
    res.json(0);
});

module.exports = router;